# Projekt Dokumentation: alexander-graf.de (Astro 6 + Decap CMS + CI/CD)

Dieses Dokument dient als technisches Gedächtnis für die Wiederherstellung oder Erweiterung der Website.

## 1. Architektur Übersicht
- **Framework:** Astro 6.2 (Statisches Site-Generierung)
- **Content:** Markdown-Dateien in `src/content/blog` verwaltet über Decap CMS.
- **Hosting:** Docker-basiert auf einem Ubuntu 24 VPS.
- **Routing:** Traefik v2 als Reverse Proxy (SSL via Let's Encrypt).
- **CMS Auth:** Eigener Node.js OAuth-Proxy im Unterordner `oauth-proxy`.
- **Formular-Handling:** Kontaktformular sendet Daten via POST an einen n8n-Webhook.

## 2. Docker Setup
Das Projekt besteht aus zwei Containern (definiert in `docker-compose.yml`):
1. **astro:** Serviert die statischen Dateien via Nginx.
   - Nutzt ein Multi-Stage Dockerfile (Build & Serve).
   - Port: 80 (intern), Traefik leitet Domain-Traffic weiter.
2. **cms-auth:** Node.js Proxy für GitHub OAuth (Decap CMS).
   - Port: 3000 (intern).
   - Verarbeitet `/auth` und `/callback`.

### Wichtige Traefik-Labels
- `traefik.docker.network=proxy`: Zwingend erforderlich, damit Traefik das richtige interne Netzwerk nutzt.
- `Host(\`${DOMAIN}\`)`: Steuerung über `.env` Variable.

## 3. CI/CD Pipeline (Auto-Deploy)
Ein **Self-hosted GitHub Actions Runner** sorgt für automatische Updates.

- **Runner-Standort:** `/home/admin/actions-runner-alex-graf` (Außerhalb des Projektverzeichnisses!).
- **Workflow:** `.github/workflows/deploy.yml`
- **Besonderheiten:**
  - Kopiert vor dem Build die lokale `.env` Datei in den Runner-Workspace.
  - Erzwingt das Löschen alter Container per Name (`docker stop/rm`), um Namenskonflikte zu vermeiden, falls manuelle Container existieren.
  - Setzt `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` für Kompatibilität.

## 4. Blog & Filter-System
- **Schema:** Definiert in `src/content.config.ts` (Astro 5+ Content Layer API).
- **Tag-Filterung:** Sidebar mit Checkboxen in `src/pages/blog/index.astro`.
- **Live-Filter:** JavaScript-basierte Filterung ohne Seiten-Reload.
- **Stolperfalle:** Dateinamen der Markdown-Dateien dürfen **keine Sonderzeichen oder Leerzeichen** enthalten, sonst werden sie von Astro beim Build ignoriert.

## 5. Kontaktformular & n8n
- **Komponente:** `src/components/ContactForm.astro`.
- **Endpoint:** `https://n8n.alexandergraf.de/webhook/ruf-mich-an`.
- **CORS:** In n8n muss `N8N_CORS_ALLOWED_ORIGINS=https://alexander-graf.de` gesetzt sein.
- **n8n Workflow:** Muss auf **Active** stehen und Webhook auf **POST** konfiguriert sein.

## 6. Wiederherstellung (Quick Start)
1. Repo klonen: `git clone <repo_url>`
2. `.env` erstellen (Vorlage `.env.example`).
3. GitHub OAuth App erstellen (Callback: `https://alexander-graf.de/callback`).
4. Falls manuell: `docker compose up -d --build`.
5. Falls automatisch: GitHub Runner im neuen Ordner registrieren und als Dienst starten.

---
**Status vom 04.05.2026:** System ist stabil, Astro 6.2 ist aktiv, Auto-Deploy läuft.
