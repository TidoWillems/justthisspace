# 🌌 Kaleidoskop der Anfangsbilder

Ein poetisch-technisches Projekt: Mythen, Wissenschaft und Projektionen
als **scheinbare Anfänge** – in einer Web-App erlebbar.

## 🗂️ Projektstruktur

- **index.html** – fertige, live-fähige HTML-Seite (früher `kalanf_fine.html`)
- **assets/**
  - `css/kalanf.css` – Styles
  - `js/app.js` – Interaktivität (Service Worker, TOC, Controls, etc.)
- **icons/** – Favicons / App-Icons
- **manifest.webmanifest** – PWA-Manifest
- **sw.js** – Service Worker zum Cachen der Assets
- **impulse/** – poetische Resonanz-Texte (z. B. `echo_die_fassade.md`)
- **tools/** – Quellen & Build-Tools (Segment-HTMLs, Skripte, Dedupe-Reports, …)

## 🚀 Starten (lokal)

```bash
cd kaleidoskop
python3 -m http.server 8088

Dann http://localhost:8088 im Browser öffnen.

📝 Bearbeiten / Bauen

Neue Segmente: in tools/kalanf_segment*.html ablegen

Skripte zur Deduplizierung / TOC-Erzeugung: tools/kalanf_*

Fertige Seite: index.html (kann jederzeit ersetzt oder aktualisiert werden)


✨ Philosophie

> „Alles Gesagte verweist nur auf das, was nie begann.“



Das Kaleidoskop zeigt Erzählungen ohne Substanz – Mythen, Wissenschaft, Gedanken, alle als Projektionen derselben Illusion.

