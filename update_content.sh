#!/bin/bash
#
# Holt neue Commits von GitHub und baut den Astro-Container neu.
#
# Der Server ist reiner Empfaenger: sowohl Decap-CMS-Beitraege als auch
# Aenderungen per git push landen zuerst auf GitHub. Deshalb wird hier hart
# auf origin/main zurueckgesetzt, statt lokale Aenderungen wegzustashen und
# hinterher zurueckzulegen — genau daran ist die frueherer Version dauerhaft
# gescheitert (kollidierendes "git stash pop" auf einer getrackten Logdatei,
# das Skript brach danach vor dem Build ab).
#
# Konsequenz: Uncommittete Aenderungen in diesem Verzeichnis werden verworfen.
# Sie werden vor dem Verwerfen protokolliert, damit es nicht still passiert.
# Untrackte Dateien (actions-runner/, node_modules/, dist/) bleiben unberuehrt.

set -uo pipefail

REPO_DIR="/home/admin/gemini/projekte/alexandergraf.de"
BRANCH="main"

cd "$REPO_DIR" || exit 1

log() { echo "$(date): $*"; }

if ! git fetch origin "$BRANCH" --quiet; then
    log "FEHLER: git fetch fehlgeschlagen."
    exit 1
fi

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
    # Kein Logeintrag im Normalfall — sonst waechst das Log alle 5 Minuten.
    exit 0
fi

log "Neue Commits auf GitHub gefunden ($(git rev-parse --short HEAD) -> $(git rev-parse --short "origin/$BRANCH")). Aktualisiere ..."
git --no-pager log --oneline "HEAD..origin/$BRANCH" | sed 's/^/  /'

# Uncommittete Aenderungen sichtbar machen, bevor sie verworfen werden.
DIRTY=$(git status --porcelain --untracked-files=no)
if [ -n "$DIRTY" ]; then
    log "WARNUNG: Uncommittete Aenderungen werden verworfen:"
    echo "$DIRTY" | sed 's/^/  /'
fi

if ! git reset --hard "origin/$BRANCH" --quiet; then
    log "FEHLER: git reset --hard fehlgeschlagen. Kein Rebuild."
    exit 1
fi

log "Baue Astro-Container neu ..."
if docker compose up -d --build astro; then
    log "Update abgeschlossen (jetzt auf $(git rev-parse --short HEAD))."
else
    log "FEHLER: Rebuild fehlgeschlagen. Der Container laeuft weiter auf dem alten Stand."
    exit 1
fi
