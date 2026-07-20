---
title: Claude Code installieren
date: 2026-07-20T14:43:00.000+02:00
summary: >-
  ## Zusammenfassung


  Auf **Linux und macOS** genügen in der Regel drei Zeilen: Node.js 22+ prüfen, optional `npm install -g npm@latest`, dann `npm install -g @anthropic-ai/claude-code`. Statt `sudo` bei `EACCES` besser [nvm](https://github.com/nvm-sh/nvm) verwenden.


  Auf frischem **Windows 10/11** lohnt sich die Vorbereitung: Skriptausführung per `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` freigeben, Windows-Version und 64-Bit-System prüfen, Node.js 22+ und optional Git for Windows installieren — und den npm-Befehl dann aus einer **neuen** PowerShell starten. [youtube](https://www.youtube.com/watch?v=s3jzIklr1UA)


  Der wichtigste Nacharbeitsschritt ist der PATH: Für Node.js muss `C:\\Program Files\\nodejs\\` erreichbar sein, und für `claude` gehört `%USERPROFILE%\\.local\\bin` in den Benutzer-PATH; danach Terminal schließen und neu öffnen. [code.claude](https://code.claude.com/docs/en/setup)


  Typische Fehler, die man vorher abfangen sollte, sind `npm is not recognized`, falsche Shell-Kommandos, ein 32-Bit-PowerShell-Fenster, Netzwerk-/Proxy-Blockaden und mehrere konkurrierende Claude-Installationen. [code.claude](https://code.claude.com/docs/en/setup)


  Zum Schluss immer testen mit `node -v`, `npm -v`, `claude --version` und bei Problemen `claude doctor`. 
tags:
  - claude
draft: false
---

# Claude Code per npm installieren — Windows 10/11, Linux und macOS

Diese Anleitung beschreibt eine saubere Installation von Claude Code über npm, mit Fokus auf Vorbereitung, typische Fehlerquellen und ein korrekt gesetztes PATH. Der Schwerpunkt liegt auf **Windows**, weil dort die meiste Nacharbeit anfällt; für **Linux und macOS** gibt es gleich im Anschluss eine Kurzfassung, die in der Regel ohne Umwege durchläuft.

Claude Code unterstützt Windows 10 ab Version 1809 und Windows 11, benötigt eine Internetverbindung und läuft auf x64- oder ARM64-Systemen mit mindestens 4 GB RAM.

> Alle Befehle dieser Anleitung gibt es auch als kompakten Spickzettel auf GitHub: [alexander-graf/claude-code-windows-guide](https://github.com/alexander-graf/claude-code-windows-guide)

## Kurzfassung für Linux und macOS

Auf Unix-Systemen ist die Installation dank nativer Bash-Integration meist unspektakulär:

```bash
# 1) Node.js (Version 22+) prüfen
node -v
npm -v

# 2) Optional: npm aktualisieren — vermeidet lästige Update-Warnungen
npm install -g npm@latest

# 3) Claude Code global installieren
npm install -g @anthropic-ai/claude-code

# 4) Prüfen und starten
claude --version
claude doctor
```

Ein Hinweis zu Rechten: Vermeide `sudo npm install -g`. Wenn du dabei auf `EACCES`-Fehler stößt, ist das ein Zeichen dafür, dass npm global in ein Systemverzeichnis schreiben will, für das dein Benutzer keine Rechte hat. Die saubere Lösung ist nicht `sudo`, sondern ein Node-Versionsmanager wie [nvm](https://github.com/nvm-sh/nvm), der Node und die globalen Pakete im Home-Verzeichnis ablegt.

Wenn das durchgelaufen ist, bist du fertig — der Rest dieser Anleitung betrifft Windows.

## Zielbild

Am Ende dieser Anleitung funktionieren diese Befehle in einem **neu geöffneten** PowerShell-Fenster ohne Administratorrechte:

```powershell
node -v
npm -v
claude --version
```

Claude Code kann unter Windows nativ laufen; Git for Windows ist dabei optional. Ohne Git for Windows nutzt Claude Code PowerShell als Shell-Werkzeug, mit Git for Windows kann zusätzlich Git Bash verwendet werden.

## Vorbereitung vor der Installation

### 1. Windows-Version und Architektur prüfen

Claude Code benötigt auf Windows mindestens Windows 10 Version 1809 oder neuer; unterstützt werden außerdem x64 und ARM64. Ein 32-Bit-Windows wird nicht unterstützt, und auch das versehentliche Starten von „Windows PowerShell (x86)“ kann zu einem falschen 32-Bit-Fehler führen.

In **Windows PowerShell** prüfen:

```powershell
winver
[Environment]::Is64BitOperatingSystem
$env:PROCESSOR_ARCHITECTURE
```

Erwartung:

- `winver` zeigt Windows 10/11 in einer aktuellen Build-Version.
- `[Environment]::Is64BitOperatingSystem` sollte `True` liefern.[^2]
- `$env:PROCESSOR_ARCHITECTURE` ist typischerweise `AMD64` oder `ARM64`.


### 2. PowerShell das Ausführen von Skripten erlauben

Windows blockiert standardmäßig das Ausführen von Skripten. Das äußert sich in roten Fehlermeldungen, die wie ein defektes Paket aussehen, aber nur die Ausführungsrichtlinie sind. Einmalig pro Benutzer setzen:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

`RemoteSigned` erlaubt lokale Skripte und verlangt für heruntergeladene eine Signatur — das ist der übliche Kompromiss für Entwicklungsrechner. Der Scope `CurrentUser` kommt ohne Administratorrechte aus.

### 3. Das richtige Terminal öffnen

Für diese Anleitung wird **Windows PowerShell** oder **PowerShell 7** empfohlen, nicht CMD und nicht „Windows PowerShell (x86)“. Die Claude-Dokumentation weist ausdrücklich darauf hin, dass unter Windows je nach Shell unterschiedliche Installationsbefehle gelten und falsche Shells typische Syntaxfehler auslösen.


So erkennst du die richtige Shell:

- PowerShell-Prompt beginnt typischerweise mit `PS C:\Users\DeinName>`.
- CMD zeigt eher `C:\Users\DeinName>` ohne `PS`.[^1]
- Wenn du versehentlich die x86-Variante gestartet hast, kann Claude Code melden, dass 32-Bit-Windows nicht unterstützt wird, obwohl dein System 64-Bit ist.


### 4. Node.js bewusst vorab installieren

Für die npm-Installation von Claude Code wird Node.js benötigt. Die offizielle Claude-Code-Dokumentation nennt für die npm-Methode inzwischen **Node.js 22 oder neuer**. Auf älteren Node-Versionen meldet npm zwar oft nur `EBADENGINE`, die Installation kann aber trotzdem durchlaufen; für einen sauberen Ablauf auf einem frischen System sollte direkt eine aktuelle Node-22-oder-neuer-LTS-Version installiert werden.

Vorgehen:

1. Öffne die offizielle Node.js-Downloadseite: [nodejs.org](https://nodejs.org/en/download).
2. Lade die aktuelle **LTS-Version** für Windows herunter, vorzugsweise als 64-Bit-Installer.
3. Starte den Installer.
4. Achte im Setup darauf, dass Node.js in den PATH aufgenommen wird; genau das verhindert später `node is not recognized` oder `npm is not recognized`. Allgemein ist `C:\Program Files\nodejs\` der relevante Standardpfad für Node und npm unter Windows.
5. Installation abschließen.

### 5. Terminal komplett schließen und neu öffnen

Nach einer Node.js-Installation übernimmt ein bereits offenes Terminal neue PATH-Einträge oft noch nicht. Genau deshalb tauchen bei frischen Installationen häufig die Fehler `node is not recognized` oder `npm is not recognized` auf, obwohl Node korrekt installiert wurde. Ein neues Terminalfenster ist deshalb Teil der Vorbereitung und kein optionaler Schritt.

Danach prüfen:

```powershell
node -v
npm -v
where.exe node
where.exe npm
```

Erwartung:

- `node -v` und `npm -v` geben Versionsnummern aus.[^3]
- `where.exe node` und `where.exe npm` sollten auf `C:\Program Files\nodejs\...` oder einen anderen gültigen Node-Installationspfad zeigen.


### 6. PATH für Node.js manuell kontrollieren

Wenn `node` oder `npm` nach der Neuinstallation trotzdem nicht gefunden werden, ist fast immer der PATH unvollständig oder das Terminal wurde nicht neu gestartet. Die Claude-Dokumentation empfiehlt bei PATH-Problemen generell, die Einträge explizit zu prüfen und danach ein neues Terminal zu öffnen.

#### So öffnest du die PATH-Einstellungen haarklein

1. Drücke `Win`.
2. Tippe `Umgebungsvariablen`.
3. Öffne **Systemumgebungsvariablen bearbeiten**.
4. Im Fenster **Systemeigenschaften** auf **Umgebungsvariablen...** klicken.
5. Im unteren oder oberen Bereich den Eintrag **Path** markieren.
6. Auf **Bearbeiten...** klicken.
7. Prüfen, ob ein Eintrag wie `C:\Program Files\nodejs\` vorhanden ist.

#### Wenn der Eintrag fehlt

1. Auf **Neu** klicken.
2. Diesen Pfad eintragen:
```text
C:\Program Files\nodejs\
```

3. Mit **OK** bestätigen.
4. Alle PowerShell- und CMD-Fenster schließen.
5. Neues PowerShell-Fenster öffnen.
6. Erneut testen:
```powershell
node -v
npm -v
```

Wenn Node.js an einem anderen Ort installiert wurde, muss **dieser tatsächliche Installationspfad** in den PATH. `where.exe node` hilft beim Gegencheck, sobald Node erreichbar ist.

### 7. Optional, aber sinnvoll: Git for Windows vorbereiten

Git for Windows ist für die npm-Installation nicht zwingend erforderlich, wird unter Windows aber empfohlen, damit Claude Code zusätzlich Git Bash für Bash-basierte Werkzeuge verwenden kann. Ohne Git for Windows nutzt Claude Code PowerShell als Shell-Tool.

Empfehlung für ein frisches Entwickler-System:

1. Git für Windows von [git-scm.com/downloads/win](https://git-scm.com/downloads/win) laden.
2. Im Setup darauf achten, dass Git zum PATH hinzugefügt wird. Die Claude-Dokumentation nennt das explizit als relevanten Punkt, damit Claude Code Git Bash finden kann.
3. Terminal nach der Installation neu starten.

Prüfen:

```powershell
git --version
where.exe git
```

Wenn Git installiert ist, aber Claude Code Git Bash später nicht findet, kann in `settings.json` explizit `C:\\Program Files\\Git\\bin\\bash.exe` als Git-Bash-Pfad gesetzt werden.

## Saubere npm-Installation

Wenn `node -v` und `npm -v` sauber funktionieren, erst **dann** kommt der eigentliche Installationsschritt.

Optional, aber empfehlenswert: npm vorher selbst aktualisieren. Der mit Node ausgelieferte npm-Stand ist oft älter und meldet sich später mit Update-Hinweisen mitten in der Ausgabe.

```powershell
npm install -g npm@latest
```

Die offizielle npm-Installation lautet:

```powershell
npm install -g @anthropic-ai/claude-code
```

Wichtiger Hinweis: Die Claude-Dokumentation warnt ausdrücklich davor, unter Windows oder allgemein `sudo npm install -g` zu verwenden; unter Windows ist `sudo` ohnehin unüblich. Ziel ist eine normale Benutzerinstallation in einer korrekt konfigurierten Umgebung.[^1]

Nach erfolgreicher Installation prüfen:

```powershell
claude --version
where.exe claude
```

Die npm-Version installiert letztlich dieselbe native Binary wie die Standalone-Variante; npm zieht sie über plattformspezifische optionale Dependencies nach. Deshalb müssen optionale Dependencies erlaubt sein, sonst kann die Binary nach der Installation fehlen.[^2][^1]

## PATH für `claude` haarklein setzen

Wenn `npm install -g @anthropic-ai/claude-code` erfolgreich war, aber `claude --version` mit „not recognized“ oder „The term 'claude' is not recognized“ scheitert, liegt das fast immer an einem fehlenden PATH-Eintrag oder an mehreren konkurrierenden Installationen. Die Troubleshooting-Doku nennt das als Standardursache.[^2]

### 1. Erst prüfen, ob `claude` schon im PATH ist

```powershell
$env:PATH -split ';' | Select-String '\.local\\bin'
where.exe claude
Test-Path "$env:USERPROFILE\.local\bin\claude.exe"
```

Die Claude-Dokumentation nennt `%USERPROFILE%\.local\bin\claude.exe` als empfohlenen Windows-Pfad für die native Installation. Genau derselbe Pfad ist auch ein guter Referenzpunkt, wenn Windows den `claude`-Befehl nicht findet.[^2]

### 2. User-PATH per GUI setzen

So setzt du den Pfad grafisch, Schritt für Schritt:

1. `Win` drücken.
2. `Umgebungsvariablen` eintippen.
3. **Systemumgebungsvariablen bearbeiten** öffnen.
4. **Umgebungsvariablen...** anklicken.
5. Im Bereich **Benutzervariablen für <DeinName>** den Eintrag **Path** auswählen.
6. **Bearbeiten...** anklicken.
7. **Neu** wählen.
8. Diesen Eintrag hinzufügen:
```text
%USERPROFILE%\.local\bin
```

9. Mit **OK** alle Fenster schließen.
10. PowerShell komplett schließen.
11. Eine **neue** PowerShell öffnen.
12. Testen:
```powershell
claude --version
```

Genau diesen Pfad nennt die Claude-Dokumentation als Benutzer-PATH-Eintrag, wenn `claude` nach erfolgreicher Installation nicht gefunden wird.[^2]

### 3. User-PATH per PowerShell setzen

Alternativ direkt in PowerShell:

```powershell
$currentPath = [Environment]::GetEnvironmentVariable('PATH', 'User')
[Environment]::SetEnvironmentVariable('PATH', "$currentPath;$env:USERPROFILE\.local\bin", 'User')
```

Danach **Terminal neu starten** und erneut prüfen:

```powershell
claude --version
```

Die Claude-Dokumentation nennt genau diesen Ablauf für Windows PowerShell.[^2]

## Fehler vermeiden, bevor sie auftreten

### Falscher Installationsbefehl in der falschen Shell

Ein sehr häufiger Fehler auf frischen Windows-Systemen ist das Kopieren eines Befehls für die falsche Shell. Die offizielle Troubleshooting-Seite nennt dafür typische Symptome: `irm is not recognized`, `&& is not valid`, `A parameter cannot be found that matches parameter name 'fsSL'` oder `bash is not recognized`. Diese Fehler bedeuten nicht, dass Claude Code defekt ist, sondern dass der Befehl nicht zur geöffneten Shell passt.[^2]

Für diese Anleitung gilt nur dieser npm-Befehl in **PowerShell**:

```powershell
npm install -g @anthropic-ai/claude-code
```

Node.js muss vorher installiert sein; andernfalls schlägt schon der npm-Aufruf fehl.

### `npm is not recognized`

Das bedeutet typischerweise:

- Node.js ist noch gar nicht installiert.[^1]
- Node.js wurde installiert, aber das Terminal war noch offen und hat den neuen PATH nicht übernommen.[^3]
- `C:\Program Files\nodejs\` fehlt im PATH.[^3]

Abhilfe:

1. Node.js LTS installieren.[^1]
2. Terminal schließen und neu öffnen.[^3]
3. PATH-Eintrag `C:\Program Files\nodejs\` prüfen oder ergänzen.[^3]

### `EBADENGINE` bei npm

Die npm-Dokumentation von Claude Code sagt, dass das Paket ab Version 2.1.198 Node.js 22 oder neuer verlangt. Auf älteren Node-Versionen erscheint oft nur eine `EBADENGINE`-Warnung statt eines harten Fehlers; die Installation kann zwar dennoch enden, für einen sauberen Neuaufbau sollte aber direkt Node 22+ eingesetzt werden.[^1]

### `claude` wird nach npm-Installation nicht gefunden

Die Claude-Doku nennt als Hauptursache einen fehlenden PATH-Eintrag. Deshalb zuerst PATH prüfen und `%USERPROFILE%\.local\bin` zur Benutzer-Variable `Path` hinzufügen, danach ein neues Terminalfenster öffnen.[^2]

Zusätzlich prüfen:

```powershell
where.exe claude
npm -g ls @anthropic-ai/claude-code
```

Wenn mehrere Installationen existieren, können Versionskonflikte oder falsche Treffer im PATH entstehen. Die Troubleshooting-Seite empfiehlt dann, nur eine Installation zu behalten.[^2]

### Mehrere `claude`-Installationen kollidieren

Die Troubleshooting-Dokumentation warnt ausdrücklich vor mehreren Installationen, weil dadurch unerwartete Versionen oder ein falscher `claude`-Treffer im PATH entstehen können. Unter Windows hilft dieser Befehl beim Finden aller Treffer:[^2]

```powershell
where.exe claude
```

Wenn du sowohl eine WinGet-, eine native oder eine npm-Installation gemischt hast, sollte nur **eine** Variante übrig bleiben. Die Doku empfiehlt bevorzugt die native Installation unter `%USERPROFILE%\.local\bin\claude.exe`; wenn du aber bewusst npm verwenden willst, dann entferne konkurrierende Installationen vor dem finalen Test.[^2]

### Git Bash fehlt oder wird nicht gefunden

Wenn Claude Code meldet, dass unter Windows entweder Git for Windows oder PowerShell erforderlich ist, heißt das laut offizieller Troubleshooting-Seite, dass weder Git Bash noch PowerShell korrekt gefunden wurde. Standardmäßig ist PowerShell auf Windows vorhanden; fehlt sie im PATH, kann ihr Standardpfad `C:\Windows\System32\WindowsPowerShell\v1.0\` manuell ergänzt oder PowerShell 7 installiert werden.[^2]

Wenn Git installiert ist, aber nicht erkannt wird:

1. `where.exe git` ausführen.[^2]
2. Prüfen, ob `C:\Program Files\Git\bin\bash.exe` existiert.[^2]
3. Falls nötig, in `settings.json` setzen:
```json
{
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"
  }
}
```

Diese Konfiguration wird direkt in der offiziellen Doku beschrieben.[^1][^2]

### Netzwerk-, Proxy- und TLS-Probleme

Die Troubleshooting-Seite nennt als typische Ursachen für Installationsfehler blockierte Verbindungen zu `downloads.claude.ai`, Proxys, Firewalls oder TLS-Probleme. Auch wenn du npm nutzt, können Firmenumgebungen oder Security-Software Paketdownloads und Binärdownloads blockieren.[^2]

Ein schneller Netzwerkcheck aus PowerShell:

```powershell
curl.exe -sI https://downloads.claude.ai/claude-code-releases/latest
```

Laut Doku zeigt `HTTP/2 200`, dass der Server erreichbar ist; `403` weist oft auf Proxy- oder Netzwerkfilter hin. In Unternehmensnetzen müssen gegebenenfalls `HTTP_PROXY` und `HTTPS_PROXY` gesetzt werden.[^2]

### Antivirus oder gesperrte Dateien

Die Windows-Troubleshooting-Seite beschreibt einen Fehler, bei dem eine Datei in `%USERPROFILE%\.claude\downloads` von einem anderen Prozess benutzt wird. Häufig steckt eine vorherige Installation oder Antivirus-Scanning dahinter. Dann hilft es, andere Installer-Fenster zu schließen, den Downloads-Ordner zu löschen und den Installationsversuch zu wiederholen.[^2]

Befehl dafür:

```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\downloads"
```


## Abschlussprüfung

Wenn alles sauber eingerichtet ist, sollte diese Reihenfolge in einer **neu geöffneten** PowerShell funktionieren:

```powershell
node -v
npm -v
where.exe npm
npm install -g @anthropic-ai/claude-code
claude --version
where.exe claude
```

Für eine weitergehende Diagnose empfiehlt die offizielle Doku zusätzlich `claude doctor`, das Installations- und Konfigurationsprobleme prüft, ohne direkt eine Sitzung zu starten.[^1]

```powershell
claude doctor
```


## Minimaler Spickzettel

```powershell
# 0) Einmalig: Skriptausführung erlauben
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force

# 1) Nach Node.js-Installation prüfen
node -v
npm -v

# 2) Optional: npm aktualisieren, dann Claude Code global installieren
npm install -g npm@latest
npm install -g @anthropic-ai/claude-code

# 3) Falls claude nicht gefunden wird: User-PATH setzen
$currentPath = [Environment]::GetEnvironmentVariable('PATH', 'User')
[Environment]::SetEnvironmentVariable('PATH', "$currentPath;$env:USERPROFILE\.local\bin", 'User')

# 4) Neues Terminal öffnen und prüfen
claude --version
claude doctor
```

Die eigentliche Erfolgsbedingung ist nicht nur, dass `npm install -g @anthropic-ai/claude-code` einmal durchläuft, sondern dass `node`, `npm` und `claude` anschließend in einem **frisch geöffneten** Terminal sofort funktionieren. Genau dafür sind die Vorbereitungs- und PATH-Schritte in dieser Anleitung vorgeschaltet.



