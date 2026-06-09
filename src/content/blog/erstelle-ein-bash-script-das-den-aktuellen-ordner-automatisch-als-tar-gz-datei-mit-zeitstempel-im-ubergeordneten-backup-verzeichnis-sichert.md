---
title: "Ordner per Bash-Skript automatisch als tar.gz sichern"
description: "Erfahre, wie du ein einfaches Bash-Skript schreibst, um das aktuelle Verzeichnis als tar.gz-Archiv mit Zeitstempel in einem Backup-Ordner zu sichern."
date: 2024-12-25
tags:
  - Allgemein
  - AI
  - KI-Antwort
draft: false
---

Um ein Bash-Skript zu erstellen, das den aktuellen Ordner automatisch als `.tar.gz`-Datei mit einem Zeitstempel im übergeordneten Backup-Verzeichnis sichert, kannst du das folgende Beispiel verwenden:

```bash
#!/bin/bash

# Verzeichnis für Backups festlegen
BACKUP_DIR="../backup"

# Aktuelles Datum und Uhrzeit für den Zeitstempel
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

# Name der Backup-Datei
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

# Sicherstellen, dass das Backup-Verzeichnis existiert
mkdir -p "$BACKUP_DIR"

# Aktuellen Ordner sichern
tar -czf "$BACKUP_FILE" .

# Bestätigung ausgeben
echo "Backup wurde erfolgreich erstellt: $BACKUP_FILE"
```

## Erklärung des Skripts

* **Backup-Verzeichnis festlegen**: Das Skript legt das Verzeichnis fest, in dem die Backups gespeichert werden. In diesem Fall ist es das übergeordnete Verzeichnis (`../backup`).
* **Zeitstempel generieren**: Der Zeitstempel wird im Format `YYYY-MM-DD_HH-MM-SS` erstellt, um eine eindeutige Identifikation der Backup-Datei zu gewährleisten.
* **Backup-Dateiname definieren**: Der Name der Backup-Datei wird unter Verwendung des Zeitstempels generiert.
* **Verzeichnis erstellen**: Mit `mkdir -p` wird sichergestellt, dass das Backup-Verzeichnis existiert; falls nicht, wird es erstellt.
* **Daten sichern**: Der Befehl `tar -czf` wird verwendet, um alle Dateien im aktuellen Verzeichnis in eine komprimierte `.tar.gz`-Datei zu packen.
* **Bestätigung ausgeben**: Am Ende gibt das Skript eine Bestätigung aus, dass das Backup erfolgreich erstellt wurde.

## Verwendung

Um das Skript auszuführen, speichere es in einer Datei (z. B. `backup.sh`) und gib ihr Ausführungsrechte:

```bash
chmod +x backup.sh
```

Führe dann das Skript aus:

```bash
./backup.sh
```

Das Skript erstellt ein Backup des aktuellen Ordners im angegebenen Backup-Verzeichnis mit einem Zeitstempel im Dateinamen.
