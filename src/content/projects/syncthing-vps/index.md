---
title: "Syncthing auf eigenem VPS"
summary: "Selbst gehostete Dateisynchronisation zwischen VPS, Windows-PC und Produktionsserver — vollständig über WireGuard verschlüsselt und per API steuerbar."
date: "2026-04-19"
tags:
- Linux
- Docker
- Syncthing
- WireGuard
- Self-Hosting
draft: false
---

## Idee

Dropbox, Google Drive, OneDrive — alles praktisch, alles in fremder Hand. Für Konfigurationsdateien, Skripte und sensible Projektdaten wollte ich eine Lösung die **ich kontrolliere**: kein Cloud-Anbieter, keine monatlichen Kosten, keine unklare Datenhaltung.

Die Antwort: [Syncthing](https://syncthing.net/) — dezentrale, Ende-zu-Ende verschlüsselte Dateisynchronisation, selbst gehostet auf meinem Hetzner VPS.

## Aufbau

Syncthing läuft als Docker-Container auf dem VPS und ist über WireGuard mit allen Geräten verbunden:

| Gerät | Rolle |
|---|---|
| Hetzner VPS | Zentrale Instanz, immer online |
| Windows-PC (Heimnetz) | Arbeitsgerät, sync über pfsense |
| prod-bso-01 | Produktionsserver, geteilte Projektordner |

Da alle Verbindungen durch das WireGuard-Netz laufen, ist der Syncthing-Traffic **vollständig verschlüsselt** — auch innerhalb des Heimnetzes.

## Transfer-Ordner

Ein zentraler `~/transfer`-Ordner dient als schneller Austauschkanal zwischen VPS und PC. Datei auf dem PC ablegen → sofort auf dem VPS verfügbar. Kein `scp`, kein manuelles Kopieren.

## API-Steuerung

Statt die Web-GUI zu nutzen, wird Syncthing vollständig über die REST-API verwaltet — eine kleine **Toolbox** (`st.sh`) macht die häufigsten Operationen zu Einzeilern:

```bash
./st.sh status          # Sync-Status aller Ordner
./st.sh devices         # Alle bekannten Geräte
./st.sh apply-ignores   # Universelle Ignoriermuster setzen
./st.sh rescan          # Neu scannen
```

## Universelle Ignoriermuster

Für alle Sync-Ordner gilt eine gemeinsame `.stignore`-Vorlage — `node_modules`, Build-Artefakte, OS-Dateien und Lock-Files werden automatisch ausgeschlossen. Ein Befehl, alle Ordner sauber.

## Fazit

Komplette Datenkontrolle, läuft seit Monaten stabil, kein externer Dienst involviert. Wer ohnehin einen VPS betreibt, hat hier eine vollwertige Dropbox-Alternative — ohne Abo.
