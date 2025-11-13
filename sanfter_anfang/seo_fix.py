#!/usr/bin/env python3
import os, re, sys, argparse, datetime
from html.parser import HTMLParser

HEAD_CLOSE_RE = re.compile(r"</\s*head\s*>", re.I)
HTML_OPEN_RE  = re.compile(r"<\s*html\b[^>]*>", re.I)
ABS_PATH_RE   = re.compile(r'(?P<attr>\b(?:href|src)\s*=\s*")[/](?!/)(?P<rest>[^"]+)"', re.I)

VIEWPORT_TAG = '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
def meta_desc_tag(text): return f'<meta name="description" content="{text}">'

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_p = False
        self.in_h1 = False
        self.first_p = []
        self.first_h1 = []
        self.got_p = False
        self.got_h1 = False
    def handle_starttag(self, tag, attrs):
        t = tag.lower()
        if t == "p" and not self.got_p: self.in_p = True
        if t == "h1" and not self.got_h1: self.in_h1 = True
    def handle_endtag(self, tag):
        t = tag.lower()
        if t == "p" and self.in_p:
            self.in_p = False; self.got_p = True
        if t == "h1" and self.in_h1:
            self.in_h1 = False; self.got_h1 = True
    def handle_data(self, data):
        if self.in_p and not self.got_p: self.first_p.append(data)
        if self.in_h1 and not self.got_h1: self.first_h1.append(data)

def smart_excerpt(html_text, limit=160):
    parser = TextExtractor()
    try: parser.feed(html_text)
    except Exception: pass
    text = " ".join("".join(parser.first_p).split())
    if not text:
        text = " ".join("".join(parser.first_h1).split())
    text = text.strip()
    if not text: return ""
    if len(text) <= limit: return text
    cut = text[:limit]
    cut = re.sub(r"\s+\S*$", "", cut).strip()
    if len(cut) < 40: cut = text[:limit].strip()
    return cut

def ensure_lang(html, lang):
    if re.search(r'<\s*html\b[^>]*\blang\s*=\s*["\']', html, re.I):
        return html, False
    m = HTML_OPEN_RE.search(html)
    if not m: return html, False
    start, end = m.span()
    tag = html[start:end]
    if tag.endswith(">"):
        new_tag = re.sub(r">$", f' lang="{lang}">', tag)
        return html[:start] + new_tag + html[end:], True
    return html, False

def ensure_viewport(html):
    if re.search(r'<\s*meta[^>]*\bname\s*=\s*["\']viewport["\']', html, re.I):
        return html, False
    m = HEAD_CLOSE_RE.search(html)
    if m:
        i = m.start()
        return html[:i] + "  " + VIEWPORT_TAG + "\n" + html[i:], True
    else:
        return VIEWPORT_TAG + "\n" + html, True

def ensure_meta_description(html, placeholder=""):
    """Gibt (html, did_change, used_text) zurück."""
    if re.search(r'<\s*meta[^>]*\bname\s*=\s*["\']description["\']', html, re.I):
        return html, False, None
    desc = smart_excerpt(html, 160) or placeholder or "justthisspace — sanfter Anfang."
    m = HEAD_CLOSE_RE.search(html)
    tag = meta_desc_tag(desc.replace('"', "'"))
    if m:
        i = m.start()
        return html[:i] + "  " + tag + "\n" + html[i:], True, desc
    else:
        return tag + "\n" + html, True, desc

def fix_abs_paths(html):
    def _repl(m): return f'{m.group("attr")}{m.group("rest")}"'
    return ABS_PATH_RE.sub(_repl, html)

def process_file(path, args):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        orig = f.read()
    changed = False
    report = []
    previews = []   # ← hier sammeln wir Vorschau-Zeilen
    new = orig

    new2 = fix_abs_paths(new)
    if new2 != new:
        changed = True
        report.append("abs-paths→relative")
        new = new2

    if args.ensure_lang:
        new2, did = ensure_lang(new, args.lang)
        if did:
            changed = True
            report.append(f'lang="{args.lang}"')
            new = new2

    if args.ensure_viewport:
        new2, did = ensure_viewport(new)
        if did:
            changed = True
            report.append("add-viewport")
            new = new2

    desc_used = None
    if args.ensure_description:
        new2, did, desc_used = ensure_meta_description(new, args.desc_placeholder)
        if did:
            changed = True
            report.append("add-description")
            new = new2
            if args.show_desc:
                previews.append(f'   · meta description → "{desc_used}"')

    return orig, new, changed, report, previews

def main():
    p = argparse.ArgumentParser(description="SEO Auto-Fix (konservativ, ohne externe Libs)")
    p.add_argument("dir", nargs="?", default=os.path.expanduser("~/jts/sanfter_anfang"),
                   help="Ordner mit HTML (Default: ~/jts/sanfter_anfang)")
    p.add_argument("--apply", action="store_true", help="Änderungen schreiben (ohne: Dry-Run)")
    p.add_argument("--lang", default="de", help='Fallback für <html lang="…"> (Default: de)')
    p.add_argument("--no-lang", dest="ensure_lang", action="store_false", help="lang nicht erzwingen")
    p.add_argument("--no-viewport", dest="ensure_viewport", action="store_false", help="viewport nicht erzwingen")
    p.add_argument("--no-description", dest="ensure_description", action="store_false", help="description nicht ergänzen")
    p.add_argument("--desc-placeholder", default="", help="Platzhalter, falls kein Text extrahierbar")
    p.add_argument("--show-desc", action="store_true", help="geplanten Description-Text anzeigen")
    args = p.parse_args()

    root = os.path.abspath(os.path.expanduser(args.dir))
    print(f"🛠️ SEO-Autofix in: {root}  ({'APPLY' if args.apply else 'Dry-Run'})")

    if not os.path.isdir(root):
        print("❌ Ordner nicht gefunden.")
        sys.exit(1)

    files = [os.path.join(root, f) for f in os.listdir(root)
             if os.path.isfile(os.path.join(root, f)) and f.lower().endswith((".html",".htm"))]
    files.sort()
    if not files:
        print("⚠️  Keine .html/.htm-Dateien gefunden.")
        return

    total_changed = 0
    for path in files:
        orig, new, changed, report, previews = process_file(path, args)
        base = os.path.basename(path)
        if changed:
            print(f"— {base}: " + ", ".join(report))
            for line in previews:
                print(line)
            if args.apply:
                stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
                bak = f"{path}.bak.{stamp}"
                try:
                    with open(bak, "w", encoding="utf-8") as b: b.write(orig)
                except Exception as e:
                    print(f"   ⚠️ Backup fehlgeschlagen: {e}")
                with open(path, "w", encoding="utf-8") as w: w.write(new)
                total_changed += 1
        else:
            print(f"— {base}: ok")

    if args.apply:
        print(f"✅ Fertig. Geändert: {total_changed} / {len(files)} Datei(en). Backups: *.bak.<timestamp>")
    else:
        print("👀 Dry-Run abgeschlossen. Nichts geschrieben.")

if __name__ == "__main__":
    main()
