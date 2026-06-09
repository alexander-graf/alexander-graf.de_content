---
title: "Erstelle ein Bash-Script, das den aktuellen Ordner automatisch als tar.gz-Datei mit Zeitstempel im übergeordneten Backup-Verzeichnis sichert."
summary: "Erstelle ein Bash-Script, das den aktuellen Ordner automatisch als tar.gz-Datei mit Zeitstempel im übergeordneten Backup-Verzeichnis sichert. 🤔 Frage Erstelle e"
date: "2024-12-25"
tags:
- Allgemein
- AI
- KI-Antwort
draft: false
---

Erstelle ein Bash-Script, das den aktuellen Ordner automatisch als tar.gz-Datei mit Zeitstempel im übergeordneten Backup-Verzeichnis sichert.







🤔 Frage



Erstelle ein Bash-Script, das den aktuellen Ordner automatisch als tar.gz-Datei mit Zeitstempel im übergeordneten Backup-Verzeichnis sichert.





🤖 Antwort



# Finale Antwort

**Zeitstempel:** 2024-12-25_00-47-20


Um ein Bash-Script zu erstellen, das den aktuellen Ordner automatisch als tar.gz-Datei mit einem Zeitstempel im übergeordneten Backup-Verzeichnis sichert, können Sie das folgende Beispiel verwenden:


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


### Erklärung des Scripts:



**Backup-Verzeichnis festlegen**: Das Script legt das Verzeichnis fest, in dem die Backups gespeichert werden. In diesem Fall ist es das übergeordnete Verzeichnis (../backup).




**Zeitstempel generieren**: Der Zeitstempel wird im Format YYYY-MM-DD_HH-MM-SS erstellt, um eine eindeutige Identifikation der Backup-Datei zu gewährleisten.




**Backup-Dateiname definieren**: Der Name der Backup-Datei wird unter Verwendung des Zeitstempels generiert.




**Verzeichnis erstellen**: Mit mkdir -p wird sichergestellt, dass das Backup-Verzeichnis existiert; falls nicht, wird es erstellt.




**Daten sichern**: Der Befehl tar -czf wird verwendet, um alle Dateien im aktuellen Verzeichnis in eine komprimierte tar.gz-Datei zu packen.




**Bestätigung ausgeben**: Am Ende gibt das Script eine Bestätigung aus, dass das Backup erfolgreich erstellt wurde.




### Verwendung:

Um das Script auszuführen, speichern Sie es in einer Datei, z.B. backup.sh, und geben Sie ihm Ausführungsrechte mit:


chmod +x backup.sh


Führen Sie dann das Script aus:


./backup.sh


Das Script erstellt ein Backup des aktuellen Ordners im angegebenen Backup-Verzeichnis mit einem Zeitstempel im Dateinamen.









Generiert mit KI am 25.12.2024 um 00:47 Uhr
