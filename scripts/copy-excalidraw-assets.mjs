// Kopiert die Excalidraw-Schriften nach dist/excalidraw-assets/, damit
// /zeichnung sie selbst ausliefert statt sie von esm.sh zu holen.
// Laeuft als "postbuild" automatisch nach `npm run build`.
import { cpSync } from "node:fs";

cpSync(
  "node_modules/@excalidraw/excalidraw/dist/prod/fonts",
  "dist/excalidraw-assets/fonts",
  { recursive: true },
);
