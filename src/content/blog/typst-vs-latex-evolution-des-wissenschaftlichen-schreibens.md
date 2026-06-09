---
title: "Typst vs. LaTeX: Die Evolution des wissenschaftlichen Schreibens"
description: "Erfahre, was Typst ist, wie es sich im Vergleich zum Klassiker LaTeX schlägt und warum es das Potenzial hat, das wissenschaftliche Arbeiten zu revolutionieren."
date: 2026-06-09
tags:
  - Typst
  - LaTeX
  - Wissenschaft
  - Open-Source
  - Schreibwerkzeuge
draft: false
---

Wer eine wissenschaftliche Arbeit, ein Buch oder ein mathematisches Dokument schreiben möchte, landet fast unweigerlich bei **LaTeX**. Seit fast 40 Jahren ist es der absolute Goldstandard für professionelles Typesetting (Buchdruck-Layouts). Doch trotz seiner unbestreitbaren Stärken schleppt LaTeX tonnenweise Altlasten mit sich herum.

Seit Kurzem gibt es einen neuen Herausforderer, der angetreten ist, um LaTeX abzulösen: **Typst**. 

In diesem Beitrag schauen wir uns an, was Typst so besonders macht, wie es zu LaTeX steht und warum du für dein nächstes Dokument vielleicht auf den neuen Herausforderer setzen solltest.

---

## Das Problem mit LaTeX

Um zu verstehen, warum Typst überhaupt entwickelt wurde, muss man einen Blick auf die Schwachstellen von LaTeX werfen:

1. **Kryptische Syntax:** Ein einfaches Dokument erfordert seitenweise "Präambel"-Code. Befehle wie `\begin{itemize}` und `\item` machen den Text schwer lesbar.
2. **Endlose Installationszeiten:** Eine vollständige LaTeX-Installation (wie TeX Live oder MacTeX) ist oft **4 bis 5 Gigabyte** groß und das Herunterladen dauert Ewigkeiten.
3. **Extrem langsamer Build-Prozess:** Wenn du dein Dokument in ein PDF konvertieren willst, rattert der TeX-Compiler im Schneckentempo. Bei großen Dokumenten wartest du gerne mal 5 bis 10 Sekunden auf das Ergebnis.
4. **Alptraumhafte Fehlermeldungen:** Wenn in LaTeX ein Fehler auftritt, spuckt der Compiler Fehlermeldungen aus den 1980er-Jahren aus, die selbst Profis oft ratlos zurücklassen.
5. **Schwieriges Paket-System:** LaTeX basiert auf TeX, einer Makrosprache. Das Schreiben eigener Formatierungen oder Tabellendesigns ist extrem kompliziert.

---

## Was ist Typst?

**Typst** ist ein modernes, in **Rust** geschriebenes Open-Source-Textsatzsystem. Es wurde von Grund auf neu entwickelt mit dem Ziel, die Mächtigkeit und Layout-Qualität von LaTeX mit der Einfachheit von Markdown und der Geschwindigkeit moderner Software zu verbinden.

Hier sind die wichtigsten Unterschiede und Stärken von Typst im Vergleich zu LaTeX:

### 1. Eine Syntax, die Spaß macht
Typst verwendet eine extrem clevere, von Markdown inspirierte Markup-Syntax. 
* Statt `\textbf{fetter Text}` schreibst du einfach `*fetter Text*`.
* Statt `\begin{itemize} \item Punkt \end{itemize}` schreibst du `- Punkt`.
* Mathematische Formeln sind intuitiv: Statt `$\sum_{i=1}^n i$` schreibst du in Typst `$sum_(i=1)^n i$`.

Das Dokument bleibt dadurch auch im Quelltext extrem lesbar.

### 2. Live-Vorschau in Echtzeit (Instant Compilation)
Dank des in Rust geschriebenen Compilers kompiliert Typst Dokumente in **Millisekunden** statt Sekunden. 
Wenn du im Editor ein Wort tippst, wird das fertige PDF im Vorschaufenster praktisch in Echtzeit aktualisiert. Es gibt kein langes Warten mehr.

### 3. Keine riesige Installation
Die Installation von Typst besteht aus einer einzigen, winzigen ausführbaren Datei (CLI-Tool), die wenige Megabyte groß ist. Alternativ gibt es eine kostenlose Web-App im Browser, bei der du überhaupt nichts installieren musst.

### 4. Ein echtes Layout- und Programmiersystem
Während LaTeX auf Makros basiert, ist Typst im Kern eine moderne funktionale Programmiersprache. 
* Du willst ein Grid-Layout? Nutze die Funktion `#grid(...)`.
* Du willst eine eigene Formatierung für Überschriften? Definiere sie mit einer simplen Funktion: `#show heading: set text(fill: blue)`.
* Schleifen, Variablen und Bedingungen sind nativ integriert.

---

## Direktvergleich: LaTeX vs. Typst

Schauen wir uns ein einfaches Hallo-Welt-Dokument mit einer mathematischen Formel im Vergleich an:

### In LaTeX:
```latex
\documentclass{article}
\usepackage[utf8]{inputenc}
\usepackage{amsmath}

\title{Hallo Welt}
\author{Alexander Graf}
\date{Juni 2026}

\begin{document}
\maketitle

Dies ist ein Testdokument mit einer Formel:
\begin{equation}
E = m \cdot c^2
\end{equation}

\end{document}
```

### In Typst:
```typst
#show: doc => {
  set document(title: "Hallo Welt", author: "Alexander Graf")
  set page(paper: "a4", margin: 2.5cm)
  doc
}

= Hallo Welt

Dies ist ein Testdokument mit einer Formel:

$ E = m dot c^2 $
```

In Typst ist kein Setup von Paketen für mathematische Zeichen nötig – es funktioniert einfach direkt.

---

## Warum wurde Typst überhaupt entwickelt?

Typst wurde nicht erschaffen, um LaTeX einfach nur nachzuahmen, sondern um das wissenschaftliche Schreiben ins 21. Jahrhundert zu holen. 

TeX (die Basis von LaTeX) wurde 1978 von Donald Knuth entwickelt. Damals gab es keine Multikern-Prozessoren, keine modernen Benutzeroberflächen und keine modernen Programmiersprachen-Konzepte. LaTeX hat hervorragende mathematische Satzqualitäten, aber es wurde um ein System herumgebaut, das für die Computertechnik von vor 40 Jahren optimiert war.

Typst nutzt moderne Algorithmen für den Zeilenumbruch, das Spaltenlayout und den Formelsatz. Es vereint die typografische Perfektion von LaTeX mit dem Workflow, den wir heute von modernen Web-Technologien und Programmiersprachen gewohnt sind.

---

## Fazit: Solltest du umsteigen?

* **Wann du bei LaTeX bleiben solltest:** Wenn du eine Doktorarbeit an einer Universität schreibst, die eine sehr strikte, 500 Zeilen lange LaTeX-Vorlage vorschreibt und keine Alternativen zulässt. Auch sehr spezielle wissenschaftliche Nischen-Pakete sind in LaTeX nach wie vor unschlagbar.
* **Wann du Typst nutzen solltest:** Für Hausarbeiten, Berichte, Lebensläufe, Präsentationsfolien, Briefe und überall dort, wo du die volle Kontrolle über das Design haben und schnell zum Ziel kommen willst. 

Typst ist frisch, extrem schnell und macht beim Schreiben einfach unglaublich viel Spaß. Der Einstieg ist so leicht, dass du innerhalb von 15 Minuten startklar bist. Probier es am besten direkt in der Web-App aus!
