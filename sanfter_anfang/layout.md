Layout.md – Dokumentation der HTML-Struktur (justthisspace)

Diese Datei dokumentiert die exakte Struktur und Funktion jedes HTML-Elements einer typischen justthisspace-Seite – vollständig von <!DOCTYPE html> bis </html>, abgestimmt auf eine konsistente, wartbare Gestaltung. Sie dient als Referenz für Bearbeitungen per Skript oder manuelle Weiterentwicklung.


---

<!DOCTYPE html>

Position: Ganz oben, zwingend.

Zweck: Definiert das Dokument als HTML5.


<html lang="...">

Sprache wird dynamisch gesetzt über sprachlogik.js (document.documentElement.lang).

Unterstützt: de, en, fr.


<head>

Enthält:

<meta charset> UTF-8

<meta name="viewport"> für responsive Design

<title>: Seitentitel (z. B. ○ justthisspace)

<link href="/tailwind.min.css">: Tailwind CSS CDN

<link rel="stylesheet" href="/style.css">: Eigenes globales CSS (Pflicht)



Ausgelagerte Styles

Alle Styles (z. B. .animate-pulse-slow, .frage, .antwort, .section-border) befinden sich ausschließlich in /style.css.



---

<body>

Klassenzuweisung: bg-gray-100 text-gray-800 font-serif flex flex-col min-h-screen



---

Header: #site-title, #symbol-row, Toggle

Struktur

<header class="bg-black text-white p-4 shadow-md relative z-50">
  <div id="site-title">justthisspace ○</div>
  <div id="symbol-row" class="hidden ...">[Symbole mit Links]</div>
  <button id="toggle-menu">○●</button>
</header>

Beschreibung

Fixiert oben (relative z-50)

#site-title: zentriert, sichtbar

#symbol-row: zentriertes Icon-Menü (● ☆ ☀ ∞ ○ +), sichtbar nach Klick auf Toggle

#toggle-menu: oben rechts, Symbol wechselt zw. ○● und ●○

Bei aktivem Menü wird #site-title ausgeblendet und #symbol-row eingeblendet


Navigation mit ID

Alle <a>-Links im Symbol-Menü besitzen eine eindeutige id, z. B. id="nav-fragen", id="nav-kinder" etc., zur Sprachumschaltung über sprachlogik.js.



---

Tropfenlinie (visuelle Trennung)

Besteht aus zwei übereinanderliegenden <svg>-Pfaden

Sichtbar unterhalb des Headers

Klassen: .animate-pulse-slow und .animate-pulse-slower

Wechselt Farbe bei Klick über .border-clickable-Mechanismus (JS in sprachlogik.js)



---

<main>

<main class="flex-grow p-6 max-w-2xl mx-auto space-y-16 text-center">
  <h1 class="text-3xl font-bold text-center ...">...</h1>
  <section>
    <h2 class="text-xl font-semibold text-purple-700 ...">...</h2>
    <p class="text-gray-700 leading-relaxed whitespace-pre-line">...</p>
  </section>
</main>

Struktur

H1: Zentrale Überschrift der Seite

Mehrere section-Elemente, jeweils mit optionalem h2, .frage, .antwort, p, hr

.frage-Elemente farblich violett (#9333ea), bei Klick Farbumschaltung via JS

section-Rahmen (border-left) bei .border-clickable klickbar: Farbschema wechselt zwischen Aquarelltönen



---

Footer

<footer class="text-center p-4 text-gray-500 text-sm relative">
  <div id="footer-title">justthisspace ○</div>
</footer>

Besonderheiten

Kein Toggle-Menü oder Symbolzeile im Footer (minimalistisch)

Footer wird nicht versteckt



---

Sprachlogik und JS

Sprachlogik über <script src="/sprachlogik.js"></script> am Ende jeder Datei

Script erkennt per localStorage.lang oder ?lang=-Parameter die Sprache und setzt Textinhalte sowie Attribute um

toggle-menu funktioniert ohne externe Libs – Zustand wird über .hidden getoggelt



---

Interaktive Farblogik (neu)

section.border-clickable, .frage-Texte, .text-purple-700, .stroke-purple etc. reagieren auf Klick:

Neue Farbe aus Aquarellpalette wird zugewiesen (Zyklus), gespeichert in localStorage

Einheitliche, komponentenübergreifende visuelle Resonanz




---

Vereinbarte Stilregeln

Keine Inline-Styles (außer in <svg> erlaubt)

Kein doppeltes Vorkommen von Styles in <style>

Kein <footer-toggle>, keine wechselnden Fußleisten

Einheitliche IDs für Navigation und sprachabhängige Umschaltungen

Strukturierte Kommentare wie <!-- Tropfenlinie --> oder <!-- Hauptinhalt -->



---

Ende des Templates für Layout.md



Die vollständige Layout.md wurde jetzt aktualisiert – präzise, durchgängig und ab der ersten Zeile bis zum Ende jeder Seite. Alle Layoutentscheidungen, IDs, Klassen, JS-Verhalten und visuelle Resonanzlogiken sind enthalten.

Möchtest du im nächsten Schritt auch eine einheitliche template.html-Datei daraus generieren, auf der alle Seiten künftig basieren können?


