import {
  CaptureUpdateAction,
  Excalidraw,
  LiveCollaborationTrigger,
  reconcileElements,
  restoreElements,
  useHandleLibrary,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type {
  AppState,
  BinaryFiles,
  Collaborator,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  SocketId,
} from "@excalidraw/excalidraw/types";
import type { LibraryPersistenceAdapter } from "@excalidraw/excalidraw/data/library";
import type { RemoteExcalidrawElement } from "@excalidraw/excalidraw/data/reconcile";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  neuerRaum,
  parseRaumHash,
  Raum,
  raumUrl,
  type Nachricht,
  type RaumLink,
} from "./zeichnung/raum";

// Im Build liegen die Schriften unter /excalidraw-assets/ (kopiert von
// scripts/copy-excalidraw-assets.mjs). Im Dev-Server fehlen sie dort, dann
// laedt Excalidraw sie wie gewohnt vom CDN.
if (import.meta.env.PROD) {
  (window as any).EXCALIDRAW_ASSET_PATH = "/excalidraw-assets/";
}

// Die eigene Zeichnung. Ein Raum hat einen eigenen Schluessel, damit ein
// fremder Raum (Link von jemand anderem) sie nie ueberschreibt.
const STORAGE_KEY = "zeichnung:szene";
const LIBRARY_KEY = "zeichnung:bibliothek";
const NAME_KEY = "zeichnung:name";
const raumKey = (roomId: string) => `zeichnung:raum:${roomId}`;

// socket.io nimmt Pakete bis 1 MB; groessere Bilder gehen nicht durch.
const MAX_DATEI = 900_000;

// Bibliothek getrennt von der Szene sichern. useHandleLibrary laedt sie beim
// Start und nimmt auch Bibliotheken entgegen, die libraries.excalidraw.com
// per "Add to Excalidraw" an diese Seite zurueckschickt (#addLibrary=...).
const libraryAdapter: LibraryPersistenceAdapter = {
  load() {
    try {
      const raw = localStorage.getItem(LIBRARY_KEY);
      return raw ? { libraryItems: JSON.parse(raw) } : null;
    } catch {
      return null;
    }
  },
  save({ libraryItems }) {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(libraryItems));
  },
};

// Nur das Noetigste vom AppState sichern; der Rest (Auswahl, offene Dialoge,
// Fenstergroesse) soll beim naechsten Oeffnen nicht wieder auftauchen.
const persistedAppState = (appState: AppState) => ({
  viewBackgroundColor: appState.viewBackgroundColor,
  theme: appState.theme,
  gridModeEnabled: appState.gridModeEnabled,
  scrollX: appState.scrollX,
  scrollY: appState.scrollY,
  zoom: appState.zoom,
});

const loadScene = (key: string): ExcalidrawInitialDataState | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveScene = (
  key: string,
  elements: readonly OrderedExcalidrawElement[],
  appState: AppState,
  files: BinaryFiles,
) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        elements: elements.filter((el) => !el.isDeleted),
        appState: persistedAppState(appState),
        files,
      }),
    );
  } catch {
    // Speicher voll (grosse eingefuegte Bilder) oder blockiert —
    // Zeichnen geht trotzdem weiter, nur ohne Sicherung.
  }
};

const ladeName = () => {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
};

const Zeichenflaeche = () => {
  const startRaum = useMemo(() => parseRaumHash(), []);
  const initialData = useMemo(
    () => loadScene(startRaum ? raumKey(startRaum.roomId) : STORAGE_KEY),
    [startRaum],
  );
  const saveTimer = useRef<number | undefined>(undefined);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  useHandleLibrary({ excalidrawAPI, adapter: libraryAdapter });

  const [raum, setRaum] = useState<Raum | null>(null);
  const [verbunden, setVerbunden] = useState(false);
  const [anzahl, setAnzahl] = useState(1);
  const [dialog, setDialog] = useState<"zu" | "offen" | "verlassen">(
    startRaum && !ladeName() ? "offen" : "zu",
  );
  const [name, setName] = useState(ladeName);
  const [kopiert, setKopiert] = useState(false);

  // Zustand, den die Socket-Handler brauchen, ohne bei jedem Render neu
  // gebunden zu werden.
  const raumRef = useRef<Raum | null>(null);
  const nameRef = useRef(name);
  const speicherKey = useRef(STORAGE_KEY);
  // Version je Element, die die anderen schon kennen — so geht nur raus,
  // was sich wirklich geaendert hat, und Empfangenes nicht als Echo zurueck.
  const bekannt = useRef(new Map<string, number>());
  const dateienBekannt = useRef(new Set<string>());
  const collaborators = useRef(new Map<SocketId, Collaborator>());
  const sendeTimer = useRef<number | undefined>(undefined);
  const zeigerZeit = useRef(0);

  nameRef.current = name;

  const zeigeCollaborators = () =>
    excalidrawAPI?.updateScene({
      collaborators: new Map(collaborators.current),
    });

  const sendeAenderungen = (alles = false) => {
    const r = raumRef.current;
    if (!r || !excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElementsIncludingDeleted();
    const neu = alles
      ? elements
      : elements.filter((el) => (bekannt.current.get(el.id) ?? -1) < el.version);
    if (neu.length) {
      for (const el of neu) bekannt.current.set(el.id, el.version);
      r.senden({ type: "SZENE", elements: [...neu] });
    }
    const files = excalidrawAPI.getFiles();
    for (const file of Object.values(files)) {
      if (!alles && dateienBekannt.current.has(file.id)) continue;
      dateienBekannt.current.add(file.id);
      if (file.dataURL.length > MAX_DATEI) {
        excalidrawAPI.setToast({
          message: "Ein Bild ist zu groß für den Raum und wird nicht geteilt.",
        });
        continue;
      }
      r.senden({ type: "DATEI", file });
    }
  };

  const empfange = (n: Nachricht) => {
    if (!excalidrawAPI) return;
    if (n.type === "SZENE") {
      const remote = restoreElements(
        n.elements as any,
        null,
      ) as RemoteExcalidrawElement[];
      const zusammen = reconcileElements(
        excalidrawAPI.getSceneElementsIncludingDeleted(),
        remote,
        excalidrawAPI.getAppState(),
      );
      for (const el of remote) {
        bekannt.current.set(
          el.id,
          Math.max(el.version, bekannt.current.get(el.id) ?? -1),
        );
      }
      excalidrawAPI.updateScene({
        elements: zusammen,
        captureUpdate: CaptureUpdateAction.NEVER,
      });
    } else if (n.type === "DATEI") {
      dateienBekannt.current.add(n.file.id);
      excalidrawAPI.addFiles([n.file]);
    } else if (n.type === "ZEIGER") {
      const id = n.socketId as SocketId;
      collaborators.current.set(id, {
        ...collaborators.current.get(id),
        pointer: n.pointer,
        button: n.button,
        username: n.username,
        selectedElementIds: n.selectedElementIds,
        socketId: id,
      });
      zeigeCollaborators();
    }
  };

  const betreten = (link: RaumLink) => {
    bekannt.current = new Map();
    dateienBekannt.current = new Set();
    collaborators.current = new Map();
    speicherKey.current = raumKey(link.roomId);
    const r = new Raum(link, {
      onNachricht: empfange,
      onNeuerTeilnehmer: () => sendeAenderungen(true),
      onVerbindung: setVerbunden,
      onTeilnehmer: (ids) => {
        setAnzahl(ids.length);
        for (const id of collaborators.current.keys()) {
          if (!ids.includes(id)) collaborators.current.delete(id);
        }
        zeigeCollaborators();
      },
    });
    raumRef.current = r;
    setRaum(r);
  };

  // Raum aus dem Link betreten, sobald Excalidraw bereit ist.
  useEffect(() => {
    if (excalidrawAPI && startRaum && !raumRef.current) betreten(startRaum);
  }, [excalidrawAPI]);

  // Ein anderer Raum-Link in diesem Tab: neu laden statt umzubauen.
  useEffect(() => {
    const onHash = () => {
      const neu = parseRaumHash();
      if (neu && neu.roomId !== raumRef.current?.link.roomId) {
        window.location.reload();
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("hashchange", onHash);
      raumRef.current?.verlassen();
    };
  }, []);

  const raumStarten = async () => {
    if (!excalidrawAPI) return;
    const link = await neuerRaum();
    // replaceState loest kein hashchange aus.
    history.replaceState(null, "", raumUrl(link));
    saveScene(
      raumKey(link.roomId),
      excalidrawAPI.getSceneElementsIncludingDeleted(),
      excalidrawAPI.getAppState(),
      excalidrawAPI.getFiles(),
    );
    betreten(link);
  };

  const raumVerlassen = (behalten: boolean) => {
    const r = raumRef.current;
    if (!r || !excalidrawAPI) return;
    r.verlassen();
    raumRef.current = null;
    setRaum(null);
    setVerbunden(false);
    collaborators.current = new Map();
    try {
      localStorage.removeItem(raumKey(r.link.roomId));
    } catch {}
    speicherKey.current = STORAGE_KEY;
    history.replaceState(null, "", window.location.pathname);
    excalidrawAPI.updateScene({ collaborators: new Map() });
    if (behalten) {
      saveScene(
        STORAGE_KEY,
        excalidrawAPI.getSceneElementsIncludingDeleted(),
        excalidrawAPI.getAppState(),
        excalidrawAPI.getFiles(),
      );
    } else {
      const eigene = loadScene(STORAGE_KEY);
      if (eigene?.files) excalidrawAPI.addFiles(Object.values(eigene.files));
      excalidrawAPI.updateScene({
        elements: restoreElements(eigene?.elements ?? [], null),
        captureUpdate: CaptureUpdateAction.NEVER,
      });
      excalidrawAPI.history.clear();
    }
    setDialog("zu");
  };

  const handleChange = (
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => {
    // onChange feuert bei jeder Mausbewegung — gespeichert wird erst,
    // wenn kurz Ruhe ist, gesendet hoechstens alle 50 ms.
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(
      () => saveScene(speicherKey.current, elements, appState, files),
      500,
    );
    if (raumRef.current && sendeTimer.current === undefined) {
      sendeTimer.current = window.setTimeout(() => {
        sendeTimer.current = undefined;
        sendeAenderungen();
      }, 50);
    }
  };

  const handlePointer: NonNullable<
    ComponentProps<typeof Excalidraw>["onPointerUpdate"]
  > = ({ pointer, button }) => {
    const r = raumRef.current;
    const jetzt = performance.now();
    if (!r?.socketId || !excalidrawAPI || jetzt - zeigerZeit.current < 33) return;
    zeigerZeit.current = jetzt;
    r.senden(
      {
        type: "ZEIGER",
        socketId: r.socketId,
        pointer,
        button,
        username: nameRef.current || "Gast",
        selectedElementIds: excalidrawAPI.getAppState().selectedElementIds,
      },
      true,
    );
  };

  const nameAendern = (wert: string) => {
    setName(wert);
    try {
      localStorage.setItem(NAME_KEY, wert);
    } catch {}
  };

  const kopieren = async () => {
    if (!raum) return;
    try {
      await navigator.clipboard.writeText(raumUrl(raum.link));
      setKopiert(true);
      window.setTimeout(() => setKopiert(false), 1500);
    } catch {}
  };

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Excalidraw
        excalidrawAPI={setExcalidrawAPI}
        initialData={initialData}
        onChange={handleChange}
        onPointerUpdate={handlePointer}
        isCollaborating={!!raum}
        langCode="de-DE"
        renderTopRightUI={() => (
          <LiveCollaborationTrigger
            isCollaborating={!!raum}
            onSelect={() => setDialog("offen")}
          />
        )}
      />
      {dialog !== "zu" && (
        <RaumDialog
          dunkel={excalidrawAPI?.getAppState().theme === "dark"}
          onSchliessen={() => setDialog("zu")}
        >
          {dialog === "verlassen" && raum ? (
            <>
              <h2 style={titel}>Raum verlassen</h2>
              <p style={text}>Was soll danach auf deiner Fläche liegen?</p>
              <button style={knopf} onClick={() => raumVerlassen(true)}>
                Diese Zeichnung behalten
              </button>
              <button style={knopfLeise} onClick={() => raumVerlassen(false)}>
                Zurück zu meiner eigenen Zeichnung
              </button>
              <p style={klein}>
                „Behalten“ ersetzt deine eigene Zeichnung durch die aus dem Raum.
              </p>
            </>
          ) : (
            <>
              <h2 style={titel}>Gemeinsam zeichnen</h2>
              <label style={klein}>
                Dein Name
                <input
                  style={feld}
                  value={name}
                  placeholder="Gast"
                  onChange={(e) => nameAendern(e.target.value)}
                />
              </label>
              {raum ? (
                <>
                  <p style={text}>
                    {verbunden
                      ? anzahl > 1
                        ? `Verbunden · ${anzahl} im Raum`
                        : "Verbunden · noch allein im Raum"
                      : "Verbinde …"}
                  </p>
                  <input
                    style={feld}
                    readOnly
                    value={raumUrl(raum.link)}
                    onFocus={(e) => e.target.select()}
                  />
                  <button style={knopf} onClick={kopieren}>
                    {kopiert ? "Kopiert" : "Link kopieren"}
                  </button>
                  <button style={knopfLeise} onClick={() => setDialog("verlassen")}>
                    Raum verlassen
                  </button>
                </>
              ) : (
                <>
                  <p style={text}>
                    Startet einen Raum mit deiner aktuellen Zeichnung. Wer den
                    Link hat, kann live mitzeichnen.
                  </p>
                  <button style={knopf} onClick={raumStarten}>
                    Raum starten
                  </button>
                </>
              )}
              <p style={klein}>
                Ende-zu-Ende verschlüsselt: Der Schlüssel steht nur im Link, der
                Server sieht keine Inhalte und speichert nichts.
              </p>
            </>
          )}
        </RaumDialog>
      )}
    </div>
  );
};

const RaumDialog = ({
  dunkel,
  onSchliessen,
  children,
}: {
  dunkel: boolean;
  onSchliessen: () => void;
  children: ReactNode;
}) => (
  <div
    onClick={onSchliessen}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 10,
      display: "grid",
      placeItems: "center",
      padding: 16,
      background: "rgba(0,0,0,0.3)",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 24,
        borderRadius: 12,
        fontFamily: "system-ui, sans-serif",
        background: dunkel ? "#232329" : "#ffffff",
        color: dunkel ? "#e3e3e8" : "#1b1b1f",
        boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
      }}
    >
      {children}
    </div>
  </div>
);

const titel: CSSProperties = { margin: 0, fontSize: 20 };
const text: CSSProperties = { margin: 0, fontSize: 15, lineHeight: 1.4 };
const klein: CSSProperties = {
  margin: 0,
  fontSize: 13,
  opacity: 0.75,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};
const feld: CSSProperties = {
  font: "inherit",
  fontSize: 14,
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(127,127,127,0.4)",
  background: "transparent",
  color: "inherit",
  width: "100%",
  boxSizing: "border-box",
};
const knopf: CSSProperties = {
  font: "inherit",
  fontSize: 15,
  padding: "10px 14px",
  borderRadius: 8,
  border: "none",
  background: "#6965db",
  color: "#fff",
  cursor: "pointer",
};
const knopfLeise: CSSProperties = {
  ...knopf,
  background: "transparent",
  color: "inherit",
  border: "1px solid rgba(127,127,127,0.4)",
};

export default Zeichenflaeche;
