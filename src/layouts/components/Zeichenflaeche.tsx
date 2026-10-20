import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { useMemo, useRef } from "react";

// Im Build liegen die Schriften unter /excalidraw-assets/ (kopiert von
// scripts/copy-excalidraw-assets.mjs). Im Dev-Server fehlen sie dort, dann
// laedt Excalidraw sie wie gewohnt vom CDN.
if (import.meta.env.PROD) {
  (window as any).EXCALIDRAW_ASSET_PATH = "/excalidraw-assets/";
}

const STORAGE_KEY = "zeichnung:szene";

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

const loadScene = (): ExcalidrawInitialDataState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const Zeichenflaeche = () => {
  const initialData = useMemo(loadScene, []);
  const saveTimer = useRef<number>();

  const handleChange = (
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => {
    // onChange feuert bei jeder Mausbewegung — gespeichert wird erst,
    // wenn kurz Ruhe ist.
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
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
    }, 500);
  };

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Excalidraw
        initialData={initialData}
        onChange={handleChange}
        langCode="de-DE"
      />
    </div>
  );
};

export default Zeichenflaeche;
