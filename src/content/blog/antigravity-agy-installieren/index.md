---
title: Antigravity CLI (agy) installieren
date: 2026-07-20T18:15:00.000+02:00
description: >-
  Google Antigravity (agy) sauber installieren auf Linux, macOS und Windows —
  mit dem offiziellen Bootstrapper, den echten Installationspfaden und einer
  Warnung vor dem falschen npm-Paket.
summary: >-
  ## Zusammenfassung


  Antigravity installiert man über den offiziellen Bootstrapper: auf Linux und macOS mit `curl -sSL https://antigravity.google/cli/install.sh | bash`, auf Windows mit `irm https://antigravity.google/cli/install.ps1 | iex` aus einer PowerShell.


  Der Installer erkennt Plattform und Architektur selbst, lädt die passende native Binary und richtet den PATH anschließend über `agy install` ein. Ziel ist `~/.local/bin/agy` unter Unix und `%LOCALAPPDATA%\agy\bin\agy.exe` unter Windows.


  **Nicht** über npm installieren: Das Paket `antigravity-cli` in der npm-Registry ist ein Platzhalter in Version 0.0.1 und stammt nicht von Google.


  Nach der Installation `agy` starten, im Browser authentifizieren, fertig. Updates laufen über `agy update`.
tags:
  - antigravity
  - cli
  - google
categories:
  - tutorials
draft: false
---

# Antigravity CLI (`agy`) installieren

Google Antigravity ist eine agentische Kommandozeilen-Umgebung, die als **native Binary** ausgeliefert wird — kein Node, kein Python, keine Laufzeitumgebung drumherum. Das macht die Installation angenehm unkompliziert, hat aber eine Konsequenz, die man kennen sollte: Es gibt keinen Paketmanager-Weg, und wer trotzdem einen sucht, landet schnell beim falschen Paket. Dazu unten mehr.

Diese Anleitung beschreibt den offiziellen Weg für Linux, macOS und Windows und erklärt, was der Installer dabei tatsächlich tut.

## Installation unter Linux und macOS

```bash
curl -sSL https://antigravity.google/cli/install.sh | bash
```

Voraussetzung ist lediglich `curl` oder `wget` — das Skript prüft beides und bricht ab, wenn keins vorhanden ist.

Unterstützt werden ausschließlich 64-Bit-Systeme:

- **macOS** auf `amd64` (Intel) und `arm64` (Apple Silicon)
- **Linux** auf `amd64` und `arm64`, jeweils in einer glibc- und einer musl-Variante

Die musl-Erkennung ist ein nettes Detail: Das Skript prüft auf `libc.musl-*.so.1` beziehungsweise wertet `ldd` aus und wählt dann automatisch den passenden Build. Auf Alpine Linux funktioniert die Installation also ohne Zutun.

Die Binary landet standardmäßig unter:

```text
~/.local/bin/agy
```

Wenn dieses Verzeichnis nicht beschreibbar ist, bricht der Installer mit einer klaren Meldung ab und verweist auf `--dir`:

```bash
curl -sSL https://antigravity.google/cli/install.sh | bash -s -- --dir /opt/agy/bin
```

Auf macOS entfernt das Skript zusätzlich das Quarantäne-Attribut (`xattr -d com.apple.quarantine`), damit Gatekeeper die frisch heruntergeladene Binary nicht blockiert.

## Installation unter Windows 10/11

```powershell
irm https://antigravity.google/cli/install.ps1 | iex
```

`irm` ist der Kurzname für `Invoke-RestMethod`, `iex` für `Invoke-Expression`. Der Befehl lädt das Bootstrapper-Skript und führt es direkt aus.

Zielverzeichnis unter Windows ist:

```text
%LOCALAPPDATA%\agy\bin\agy.exe
```

Das ist ein häufiger Stolperstein, wenn man Anleitungen von anderen CLI-Werkzeugen überträgt: Antigravity nutzt **nicht** `%USERPROFILE%\.local\bin`, wie es etwa Claude Code tut. Wer dort nach `agy.exe` sucht oder diesen Pfad in den PATH aufnimmt, sucht am falschen Ort.

Auch hier gibt es `--dir` für ein abweichendes Ziel:

```powershell
& ([scriptblock]::Create((irm https://antigravity.google/cli/install.ps1))) --dir "D:\tools\agy"
```

### Wenn PowerShell die Ausführung blockiert

Windows verweigert standardmäßig das Ausführen von Skripten. Die roten Fehlermeldungen sehen dramatisch aus, sind aber nur die Ausführungsrichtlinie. Einmalig pro Benutzer, ohne Administratorrechte:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

Das Installationsskript setzt außerdem selbst TLS 1.2, damit der Download auf älteren Windows-Ständen nicht an der Aushandlung scheitert.

## Was der Installer tatsächlich macht

Es lohnt sich zu wissen, was da durchläuft — gerade wenn man ein Skript aus dem Netz in die Shell pipet:

1. **Plattform erkennen** — Betriebssystem und Architektur aus `uname`, unter Linux zusätzlich glibc oder musl.
2. **Manifest abfragen** — für die erkannte Plattform wird eine JSON-Beschreibung vom Release-Server geladen (`antigravity-cli-auto-updater-…run.app`).
3. **Binary herunterladen und prüfen**, dann ins Zielverzeichnis kopieren und ausführbar machen.
4. **`agy install` aufrufen** — die Binary richtet ihre PATH- und Shell-Einstellungen anschließend **selbst** ein.

Punkt 4 ist der Grund, warum man den PATH normalerweise nicht von Hand anfassen muss. Sollte `agy` nach der Installation trotzdem nicht gefunden werden, ist der Befehl dafür:

```bash
agy install
```

Und danach ein **neu geöffnetes** Terminal — geänderte PATH-Einträge erreichen laufende Shells nicht.

Ein weiteres Detail: Ist bereits ein `agy` am Zielort vorhanden, installiert das Skript **nicht** darüber, sondern meldet den Fund und nennt den Pfad. Für Updates ist ohnehin ein anderer Weg vorgesehen:

```bash
agy update
```

## ⚠️ Nicht über npm installieren

In einigen Anleitungen kursiert dieser Befehl:

```bash
npm install -g antigravity-cli   # NICHT ausführen
```

Das Paket `antigravity-cli` existiert zwar in der npm-Registry, ist aber **kein offizielles Google-Paket**. Ein Blick in die Registry zeigt: Version `0.0.1`, Beschreibung wörtlich *„Antigravity CLI - placeholder"*, kein Autor hinterlegt.

Antigravity wird als native Binary verteilt und hat gar kein npm-Paket. Prüfen kann man das selbst:

```bash
curl -s https://registry.npmjs.org/antigravity-cli | head -c 200
```

Reservierte Platzhalternamen sind ein bekanntes Einfallstor: Übernimmt jemand so ein Paket, führt jeder, der der Anleitung folgt, fremden Code mit den eigenen Rechten aus. Für ein global installiertes CLI-Werkzeug ist das eine denkbar unangenehme Angriffsfläche.

## Erster Start und Authentifizierung

Sobald `agy` im PATH liegt, startet ein Aufruf ohne Argumente die interaktive Sitzung:

```bash
agy
```

Beim ersten Start läuft ein Onboarding: Es öffnet sich der Browser zur Google-Authentifizierung, danach ist die CLI einsatzbereit. Das OAuth-Token wird lokal abgelegt unter `~/.gemini/antigravity-cli/`, dort liegen auch Logs, Cache und die Konfiguration.

## Die wichtigsten Befehle

Antigravity bringt eine Reihe von Unterbefehlen mit:

| Befehl | Zweck |
|---|---|
| `agy install` | PATH- und Shell-Einstellungen einrichten |
| `agy update` | CLI aktualisieren |
| `agy models` | verfügbare Modelle auflisten |
| `agy agents` | verfügbare Agenten auflisten |
| `agy plugin` | Plugins verwalten (install, uninstall, list, enable, disable) |
| `agy changelog` | Änderungen und Release Notes anzeigen |
| `agy help` | Hilfe zu den Unterbefehlen |

Für den Alltag nützliche Flags:

```bash
# Einen einzelnen Prompt nicht-interaktiv ausführen und ausgeben
agy --print "Fasse die README zusammen"

# Letzte Unterhaltung fortsetzen
agy --continue

# Mit einem Prompt starten, danach interaktiv weiterarbeiten
agy --prompt-interactive "Wir refactoren gleich das Auth-Modul"

# Nur planen, nicht ändern
agy --mode plan

# In einer Sandbox mit eingeschränktem Terminal laufen
agy --sandbox

# Zusätzliches Verzeichnis in den Arbeitsbereich aufnehmen
agy --add-dir ../shared-lib
```

Innerhalb der laufenden Sitzung führt `/help` durch die verfügbaren Slash-Befehle, `/exit` oder zweimal `Strg+D` beenden sie.

Ein Wort zu `--dangerously-skip-permissions`: Das Flag genehmigt sämtliche Werkzeugaufrufe automatisch. Der Name ist Programm — sinnvoll höchstens in einem Container oder einer Wegwerf-VM, nicht auf dem Arbeitsrechner.

## Spickzettel

```bash
# Linux / macOS
curl -sSL https://antigravity.google/cli/install.sh | bash

# Windows (PowerShell)
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
irm https://antigravity.google/cli/install.ps1 | iex

# Prüfen
agy --version

# Falls nicht gefunden: PATH einrichten, neues Terminal öffnen
agy install

# Starten, aktualisieren
agy
agy update
```

Die vollständige und stets aktuelle Dokumentation steht unter [antigravity.google/docs](https://antigravity.google/docs). Eine Kurzfassung dieser Anleitung liegt auch als Spickzettel auf GitHub: [alexander-graf/agy-install-guide](https://github.com/alexander-graf/agy-install-guide).
