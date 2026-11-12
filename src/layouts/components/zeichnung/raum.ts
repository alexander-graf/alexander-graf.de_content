// Gemeinsames Zeichnen ueber einen Raum-Link.
//
// Der Link sieht aus wie /zeichnung#room=<raum-id>,<schluessel>. Alles nach
// dem # bleibt im Browser — der Schluessel erreicht nie einen Server. Der
// Raum-Server (excalidraw-room, docker-compose.yml) reicht nur verschluesselte
// Pakete an die anderen im selben Raum weiter und speichert nichts.
//
// Wer den Link hat, kann mitlesen und mitzeichnen. Der Link ist also das
// Passwort.
import type { BinaryFileData } from "@excalidraw/excalidraw/types";
import { io, type Socket } from "socket.io-client";

// Gleicher Host wie die Seite; Traefik leitet /zeichnung-sync an den
// Raum-Server weiter. Im Dev-Server erledigt das der Vite-Proxy.
const SYNC_PATH = "/zeichnung-sync/socket.io";

export type RaumLink = { roomId: string; key: string };

export type Nachricht =
  | { type: "SZENE"; elements: unknown[] }
  | { type: "DATEI"; file: BinaryFileData }
  | {
      type: "ZEIGER";
      socketId: string;
      pointer: { x: number; y: number; tool: "pointer" | "laser" };
      button: "up" | "down";
      username: string;
      selectedElementIds: Record<string, true>;
    };

const ROOM_RE = /^#room=([a-f0-9]{20}),([A-Za-z0-9_-]{22})$/;

export const parseRaumHash = (hash = window.location.hash): RaumLink | null => {
  const m = hash.match(ROOM_RE);
  return m ? { roomId: m[1], key: m[2] } : null;
};

export const raumUrl = ({ roomId, key }: RaumLink) =>
  `${window.location.origin}${window.location.pathname}#room=${roomId},${key}`;

export const neuerRaum = async (): Promise<RaumLink> => {
  const roomId = Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 128 },
    true,
    ["encrypt", "decrypt"],
  );
  const jwk = await crypto.subtle.exportKey("jwk", key);
  return { roomId, key: jwk.k! };
};

const importKey = (k: string) =>
  crypto.subtle.importKey(
    "jwk",
    { alg: "A128GCM", ext: true, k, key_ops: ["encrypt", "decrypt"], kty: "oct" },
    { name: "AES-GCM", length: 128 },
    false,
    ["encrypt", "decrypt"],
  );

type Handler = {
  onNachricht: (n: Nachricht) => void;
  // Jemand ist neu dazugekommen und braucht die ganze Szene.
  onNeuerTeilnehmer: () => void;
  onTeilnehmer: (socketIds: string[]) => void;
  onVerbindung: (verbunden: boolean) => void;
};

export class Raum {
  private socket: Socket;
  private key: Promise<CryptoKey>;

  constructor(
    readonly link: RaumLink,
    handler: Handler,
  ) {
    this.key = importKey(link.key);
    this.socket = io({ path: SYNC_PATH, transports: ["websocket"] });
    const s = this.socket;

    // Der Server schickt init-room bei jeder (Wieder-)Verbindung.
    s.on("init-room", () => s.emit("join-room", link.roomId));
    s.on("new-user", () => handler.onNeuerTeilnehmer());
    s.on("room-user-change", (ids: string[]) => handler.onTeilnehmer(ids));
    s.on("connect", () => handler.onVerbindung(true));
    s.on("disconnect", () => handler.onVerbindung(false));
    s.on("client-broadcast", async (data: ArrayBuffer, iv: ArrayBuffer) => {
      try {
        const klar = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: new Uint8Array(iv) },
          await this.key,
          data,
        );
        handler.onNachricht(JSON.parse(new TextDecoder().decode(klar)));
      } catch {
        // Falscher Schluessel oder kaputtes Paket — ignorieren.
      }
    });
  }

  get socketId() {
    return this.socket.id;
  }

  // fluechtig: darf verloren gehen (Mauszeiger), der Server puffert es nicht.
  async senden(n: Nachricht, fluechtig = false) {
    if (!this.socket.connected) return;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      await this.key,
      new TextEncoder().encode(JSON.stringify(n)),
    );
    this.socket.emit(
      fluechtig ? "server-volatile-broadcast" : "server-broadcast",
      this.link.roomId,
      data,
      iv,
    );
  }

  verlassen() {
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }
}
