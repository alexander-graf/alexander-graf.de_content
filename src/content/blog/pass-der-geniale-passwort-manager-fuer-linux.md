---
title: "Der genialste Passwort-Manager für Linux: pass"
description: "Ein detaillierter Einsteiger-Guide für den Standard Unix Password Manager 'pass'. Erfahre, warum er so genial ist und wie du ihn auf Ubuntu, Arch und Fedora installierst und einrichtest."
date: 2026-06-09
tags:
  - Linux
  - Sicherheit
  - Passwort-Manager
  - Open-Source
  - Tutorial
draft: false
---

Wer unter Linux nach einem sicheren, flexiblen und minimalistischen Passwort-Manager sucht, kommt an **pass** (dem *Standard Unix Password Manager*) kaum vorbei. Im Gegensatz zu kommerziellen Cloud-Diensten oder monolithischen Desktop-Anwendungen folgt `pass` der klassischen Unix-Philosophie: **Schreibe Programme, die eine Aufgabe gut erledigen.**

In diesem Beitrag zeige ich dir, warum `pass` so genial ist, und führe dich Schritt für Schritt durch die Installation und Einrichtung auf **Ubuntu**, **Arch Linux** und **Fedora** – komplett anfängertauglich erklärt!

---

## Warum ist `pass` so genial?

Das Prinzip hinter `pass` ist extrem simpel und gerade deshalb so sicher und mächtig:

1. **Keine proprietäre Datenbank:** Jedes Passwort wird als einzelne, mit GnuPG (GPG) verschlüsselte Textdatei abgespeichert. Diese Dateien liegen in einer ganz normalen Ordnerstruktur auf deiner Festplatte (standardmäßig in `~/.password-store`).
2. **Git-Integration eingebaut:** Du kannst deinen Passwort-Speicher mit einem einzigen Befehl als Git-Repository initialisieren. Jede Änderung (Passwort hinzugefügt, geändert, gelöscht) wird automatisch versioniert. Du kannst es auf dein privates GitHub/GitLab-Repository pushen, um es zwischen deinen Geräten zu synchronisieren.
3. **Volle Kontrolle:** Deine Passwörter gehören dir. Es gibt keine Cloud-Firma, die gehackt werden kann, und kein proprietäres Format, aus dem du deine Daten nicht mehr exportieren kannst.
4. **Erweiterbarkeit:** Es gibt geniale Browser-Erweiterungen (wie *PassFF* für Firefox und Chrome), dmenu/rofi-Skripte für Linux-Window-Manager und hervorragende Smartphone-Apps (wie *Password Store* für Android und iOS).

---

## Schritt 1: Die Installation

Die Installation von `pass` ist auf allen großen Linux-Distributionen extrem einfach, da es in den offiziellen Paketquellen enthalten ist. Öffne dein Terminal und führe den passenden Befehl für deine Distribution aus:

### Für Ubuntu / Debian / Pop!_OS
Aktualisiere zuerst deine Paketquellen und installiere dann das Paket `pass`:
```bash
sudo apt update
sudo apt install pass
```

### Für Arch Linux / Manjaro / EndeavourOS
Unter Arch kannst du `pass` direkt über `pacman` installieren:
```bash
sudo pacman -S pass
```

### Für Fedora / Nobara
Unter Fedora nutzt du den Paketmanager `dnf`:
```bash
sudo dnf install pass
```

---

## Schritt 2: Einen GPG-Schlüssel erstellen (Voraussetzung)

Da `pass` deine Passwörter mit **GnuPG (GPG)** verschlüsselt, benötigst du einen GPG-Schlüssel auf deinem System. Wenn du noch keinen hast, ist das gar kein Problem. Wir erstellen jetzt ganz einfach einen.

Gib folgenden Befehl in dein Terminal ein:
```bash
gpg --full-generate-key
```

Das Programm stellt dir nun ein paar Fragen. Für Anfänger empfehlen wir folgende Auswahl:
1. **Art des Schlüssels:** Wähle `1` (RSA und RSA) oder drücke einfach Enter für die Standardeinstellung.
2. **Schlüssellänge:** Gib `4096` ein (das bietet maximale Sicherheit).
3. **Gültigkeit:** Drücke Enter (der Schlüssel läuft nie ab) und bestätige mit `y`.
4. **Name & E-Mail:** Gib deinen echten Namen und deine E-Mail-Adresse ein. Diese Daten werden lokal auf deinem PC mit dem Schlüssel verknüpft.
5. **Passphrase:** Du wirst nun aufgefordert, eine *Passphrase* (ein sicheres Passwort) für deinen GPG-Schlüssel einzugeben. **Wichtig:** Dieses Passwort musst du dir gut merken! Es ist dein neues "Master-Passwort". Jedes Mal, wenn du ein Passwort abrufen willst, entschlüsselt dein GPG-Schlüssel die Datei mithilfe dieser Passphrase.

Nachdem der Schlüssel generiert wurde, zeigt dir das Terminal die Details an. Wir benötigen nun die **GPG-Key-ID**. Du findest sie in der Ausgabe, sie sieht aus wie eine lange Kette aus Zahlen und Buchstaben. Alternativ kannst du sie jederzeit mit folgendem Befehl anzeigen lassen:
```bash
gpg --list-secret-keys --keyid-format LONG
```

Suche nach der Zeile, die mit `sec` beginnt. Dort steht etwas wie:
```text
sec   rsa4096/ABC123XYZ789 2026-06-09 [SC]
```
In diesem Fall ist **`ABC123XYZ789`** deine GPG-Key-ID. Kopiere dir diesen Wert.

---

## Schritt 3: Den Passwort-Store initialisieren

Jetzt verknüpfen wir deinen neuen GPG-Schlüssel mit `pass`. Ersetze `DEINE_KEY_ID` im folgenden Befehl mit der ID, die du im vorherigen Schritt kopiert hast:

```bash
pass init DEINE_KEY_ID
```

*Ergebnis:* `pass` hat nun einen versteckten Ordner unter `~/.password-store` angelegt. Ab jetzt ist dein Passwort-Manager einsatzbereit!

---

## Schritt 4: Optionale Git-Versionierung aktivieren (Sehr empfohlen!)

Eines der coolsten Features von `pass` ist die Git-Anbindung. Damit kannst du jede Änderung protokollieren und deinen Passwort-Store sichern.

Initialisiere Git mit:
```bash
pass git init
```

Ab jetzt wird jedes Mal, wenn du ein Passwort hinzufügst oder änderst, automatisch ein Git-Commit im Hintergrund erstellt. Du kannst später ein Remote-Repository hinzufügen (z. B. auf einem eigenen Server oder einem privaten GitLab/GitHub-Repo):
```bash
pass git remote add origin git@github.com:deinname/dein-passwort-repo.git
```
Und deine Passwörter verschlüsselt dorthin pushen:
```bash
pass git push -u origin master
```
*(Da alle Dateien mit deinem privaten GPG-Schlüssel auf deinem PC verschlüsselt werden, bevor sie hochgeladen werden, kann niemand auf GitHub deine Passwörter lesen, selbst wenn sie das Repository sehen könnten!)*

---

## Schritt 5: Passwörter verwalten (Spickzettel für den Alltag)

Hier sind die wichtigsten Befehle, die du im Alltag brauchst:

### 1. Ein neues Passwort hinzufügen
Nehmen wir an, du möchtest dein Passwort für deinen Gmail-Account speichern. Wir können Ordnerstrukturen nutzen, um Ordnung zu halten:
```bash
pass insert email/gmail
```
Du wirst nun aufgefordert, das Passwort einzugeben (und zur Bestätigung noch einmal). Das war's!

### 2. Ein sicheres Passwort generieren lassen
Du registrierst dich auf einer neuen Website und brauchst ein starkes Passwort mit z. B. 20 Zeichen? `pass` erledigt das für dich:
```bash
pass generate social/github 20
```
Das Passwort wird generiert, verschlüsselt abgespeichert und dir im Terminal angezeigt.

### 3. Alle gespeicherten Passwörter anzeigen (Struktur)
Gib einfach `pass` ein:
```bash
pass
```
*Ausgabe:*
```text
Password Store
├── email
│   └── gmail
└── social
    └── github
```

### 4. Ein Passwort abrufen
Um das Passwort im Terminal anzuzeigen:
```bash
pass email/gmail
```
*(Hier wirst du nach der Passphrase deines GPG-Schlüssels gefragt, um die Datei zu entschlüsseln).*

**Tipp für den Alltag:** Wenn du das Passwort nicht im Klartext auf dem Bildschirm anzeigen, sondern direkt in deine Zwischenablage kopieren möchtest (wo es nach 45 Sekunden automatisch wieder gelöscht wird), nutze die Option `-c`:
```bash
pass -c email/gmail
```

### 5. Ein Passwort löschen
```bash
pass rm email/gmail
```

---

## Fazit

Herzlichen Glückwunsch! Du hast nun einen der sichersten, flexibelsten und ressourcenschonendsten Passwort-Manager eingerichtet, den es gibt. Durch die Verwendung von GPG-Verschlüsselung und einfachen Dateien hast du die volle Kontrolle über deine sensiblen Daten zurückgewonnen. 

Probier als nächsten Schritt am besten die Browser-Erweiterung **PassFF** aus – damit lassen sich die Logins im Browser genauso komfortabel ausfüllen wie bei Bitwarden oder 1Password, nur eben komplett unter deiner eigenen Flagge.

Viel Spaß beim Ausprobieren! Wenn du Fragen zur Einrichtung hast, hinterlasse mir gerne einen Kommentar oder schreibe mir über das [Kontaktformular](/kontakt).
