# AI Handover: alexandergraf.de_website

Dieses Dokument fasst den aktuellen Projektstand, die Architektur und den Workflow zusammen. Übergib dies (oder weise die KI an, es zu lesen) zu Beginn einer neuen Sitzung, um den Kontext sofort herzustellen.

## Projektübersicht
- **Projekt:** Persönliche Website / Blog (alexandergraf.de)
- **Framework:** Astro (basierend auf dem Theme "Bigspring Light Astro")
- **CMS:** Decap CMS (für Blog, Projekte, berufliche Stationen)
- **Styling:** TailwindCSS
- **Lokaler Pfad:** `/home/alex/Projekte/alexandergraf.de_website`
- **GitHub Repository:** `alexander-graf/alexander-graf.de_content`

## Deployment & Infrastruktur (VPS)
- Die Website wird auf einem Hetzner VPS (`graf`) gehostet und läuft in einem Docker-Container (`astro`).
- **Automatisches Deployment:** Es gibt einen Cronjob auf dem VPS, der alle 5 Minuten das Skript `/home/admin/gemini/projekte/alexandergraf.de/update_content.sh` ausführt.
- Das Skript macht einen `git fetch` und `git reset --hard origin/main` und baut anschließend den Container via `docker compose up -d --build astro` neu, falls es Änderungen gab.
- **Konsequenz:** Der VPS ist "read-only". Es darf und muss nicht manuell per SSH auf dem VPS gearbeitet werden. Alles wird lokal oder über das CMS entwickelt und nach GitHub gepusht.

## CMS (Decap CMS)
- Erreichbar unter: `https://alexandergraf.de/admin`
- Speichert Content-Änderungen (Markdown-Dateien) als direkte Commits in den `main` Branch auf GitHub.
- **Wichtig:** Beim Aufruf des Live-CMS erscheint im Browser oft eine Warnung (PNA - Private Network Access), dass die Website auf `localhost:8081` zugreifen möchte. Das ist **normal**: Decap CMS prüft hierbei lediglich, ob ein lokaler Entwicklungsserver (Local Backend) läuft. Die Anfrage kann im Browser sicher blockiert werden.

## Entwickler-Workflow (Lokal)
Da das CMS direkt auf GitHub pusht, ist folgender Ablauf bei der lokalen Entwicklung kritisch, um Konflikte zu vermeiden:

1. **Starten:** IMMER zuerst `git pull` ausführen, um eventuelle CMS-Änderungen auf den lokalen Rechner zu ziehen.
2. **Entwickeln:** Server starten mit `npm run dev` (läuft auf `http://localhost:4321`).
3. **Pushen:** Änderungen committen und mit `git push` auf GitHub laden.
4. **Live-Gang:** Der VPS zieht die Änderungen automatisch innerhalb der nächsten 5 Minuten.

## Zuletzt erledigte Aufgaben (Letzte Session)
- Lokales Repository via GitHub CLI (`gh`) geklont.
- Produktions-`.env` Datei vom VPS in das lokale Verzeichnis kopiert.
- Kaffeebohne-Manifest formatiert (Frontmatter für Astro hinzugefügt) und als Blogpost veröffentlicht.
- Ursache des Decap-CMS `localhost` Popups identifiziert und erklärt.
