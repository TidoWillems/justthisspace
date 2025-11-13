#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os, re, sys, time, argparse
from pathlib import Path

DESC = {
    "eie.html": 'Nie war da ein Wesen. Nur Klang – ohne Träger.',
    "frage.html": 'Welche Bedeutung hat Bedeutung bloß? Weiß sie von sich – ob groß, ob groß? Oder ist sie nur ein stiller Schein, formt aus dem Nichts ein Etwas – klein?',
    "intro.html": 'justthisspace — sanfter Anfang.',
    "kinder.html": 'Wenn Kinder nicht alles glauben',
    "mini-viewer.html": 'justthisspace — sanfter Anfang.',
    "nichts.html": 'Und selbst das ist schon zu viel. Schon „es ist“ ist Echo – eines, das nie verklang, weil es nie begann. Kein Sprecher. Kein Hörer. Kein Zwischen. Nur das:',
    "pure.html": 'Grundlos. Zeitlos. Formlos. Klanglos. Bedeutungsfrei. Keine Rückkehr nötig. Kein Ziel, keine Herkunft. Einfach da.',
    "resonanz.html": 'Du kannst mir schreiben – ohne Ziel. Alles ist Resonanz.',
    "sinn.html": 'Das, was ist, kennt keine Ausnahme. Kein Ort, kein Moment, kein Gefühl, keine Tat. Alles, was erscheint, ist schon das Eine. Keine Ausnahme. Niemals. Jetzt.',
    "start.html": 'Kein Streben nach Besonderheit. Kein Werden zu etwas. Zeitlos, grenzenlos – ein stilles Erinnern an das, was bereits vollkommen ist. Und doch: für niemanden.',
    "stufe3_5.html": 'justthisspace — sanfter Anfang.',
    "suchvollmacht.html": 'Für den Erschöpften. Für die Zweifelnde. Für den Verlorenen, die Haltlose, den Hoffnungslosen. Für alle, die suchen: nach Sinn, nach Stille, nach Zuhause.',
}

META_RE = re.compile(r'<meta\b[^>]*\bname=["\']description["\'][^>]*>', re.I)
CONTENT_RE = re.compile(r'(\bcontent=["\'])([^"\']*)(["\'])', re.I)
HEAD_RE = re.compile(r'<head[^>]*>', re.I)
TITLE_RE = re.compile(r'</title\s*>', re.I)
VIEWPORT_RE = re.compile(r'<meta\b[^>]*\bname=["\']viewport["\'][^>]*>', re.I)

def set_description(html: str, desc: str) -> str:
    tag = f'<meta name="description" content="{desc}">'
    if META_RE.search(html):
        # Wenn es schon einen description-Tag gibt: gesamten Tag auf saubere Variante normalisieren
        def repl(m):
            s = m.group(0)
            if CONTENT_RE.search(s):
                s = CONTENT_RE.sub(rf'\1{desc}\3', s)
            else:
                # kein content= → ersetze gesamten Tag
                s = tag
            return s
        return META_RE.sub(repl, html, count=1)
    # sonst einfügen: bevorzugt nach viewport, dann nach </title>, dann direkt nach <head>
    if VIEWPORT_RE.search(html):
        return VIEWPORT_RE.sub(lambda m: m.group(0) + "\n  " + tag, html, count=1)
    if TITLE_RE.search(html):
        return TITLE_RE.sub(lambda m: m.group(0) + "\n  " + tag, html, count=1)
    if HEAD_RE.search(html):
        return HEAD_RE.sub(lambda m: m.group(0) + "\n  " + tag, html, count=1)
    # Fallback: an den Anfang setzen
    return tag + "\n" + html

def fix_abs_paths(filename: str, html: str) -> str:
    # Laut Check gab es 1 absoluten Pfad in eie.html → auf relativen Link drehen
    if os.path.basename(filename).lower() == "eie.html":
        html = html.replace('href="/index.html"', 'href="index.html"')
    return html

def main():
    ap = argparse.ArgumentParser(description="Apply meta descriptions + small path fix")
    ap.add_argument("dir", nargs="?", default=str(Path.home() / "jts" / "sanfter_anfang"))
    ap.add_argument("--dry-run", action="store_true", help="nur anzeigen, nichts schreiben")
    args = ap.parse_args()

    d = Path(args.dir)
    if not d.is_dir():
        print(f"❌ Ordner nicht gefunden: {d}")
        sys.exit(1)

    html_files = sorted(p for p in d.iterdir() if p.suffix.lower() in (".html", ".htm"))
    print(f"🛠️ SEO-Apply in: {d}  ({'Dry-Run' if args.dry_run else 'WRITE'})")

    changed = 0
    for f in html_files:
        name = f.name
        desc = DESC.get(name)
        if not desc:
            # keine vordefinierte Beschreibung → überspringen, aber könnte man hier Default setzen
            continue

        raw = f.read_text(encoding="utf-8", errors="ignore")
        new = set_description(raw, desc)
        new = fix_abs_paths(name, new)

        if new != raw:
            print(f"— {name}: set-description{', fix-abs-paths' if name=='eie.html' else ''}")
            if not args.dry_run:
                backup = f.with_suffix(f.suffix + f".bak.{time.strftime('%Y%m%d-%H%M%S')}")
                backup.write_text(raw, encoding="utf-8")
                f.write_text(new, encoding="utf-8")
            changed += 1

    if args.dry_run:
        print("👀 Dry-Run abgeschlossen. Nichts geschrieben.")
    else:
        print(f"✅ Fertig. Geänderte Dateien: {changed}")

if __name__ == "__main__":
    main()
