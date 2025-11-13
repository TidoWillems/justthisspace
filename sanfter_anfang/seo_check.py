#!/usr/bin/env python3
import os, sys, re, argparse
from html.parser import HTMLParser

class SEOParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title = ""
        self.meta_description = None
        self.h1_count = 0
        self.h1_texts = []
        self.in_h1 = False
        self.imgs_total = 0
        self.imgs_missing_alt = 0
        self.abs_paths = 0
        self.html_lang = None
        self.has_viewport = False

    def handle_starttag(self, tag, attrs):
        attrs = dict((k.lower(), v if v is not None else "") for k,v in attrs)
        t = tag.lower()

        if t == "html":
            lang = attrs.get("lang")
            if lang:
                self.html_lang = lang.strip()

        if t == "title":
            self.in_title = True

        if t == "meta":
            name = (attrs.get("name") or "").lower()
            if name == "description":
                self.meta_description = (attrs.get("content") or "").strip()
            if name == "viewport":
                self.has_viewport = True

        if t == "h1":
            self.in_h1 = True
            self.h1_count += 1

        if t == "img":
            self.imgs_total += 1
            alt = attrs.get("alt")
            if alt is None or alt.strip() == "":
                self.imgs_missing_alt += 1

        # absolute Root-Pfade zählen
        for attr in ("href", "src"):
            v = attrs.get(attr)
            if v and isinstance(v, str) and v.startswith("/") and not v.startswith("//"):
                self.abs_paths += 1

    def handle_endtag(self, tag):
        if tag.lower() == "title":
            self.in_title = False
        if tag.lower() == "h1":
            self.in_h1 = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_h1:
            self.h1_texts.append(data)

def analyze_file(path):
    parser = SEOParser()
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            parser.feed(f.read())
    except Exception as e:
        return {"file": path, "error": str(e)}

    title = (parser.title or "").strip()
    h1_text = " ".join(parser.h1_texts).strip()

    return {
        "file": path,
        "title": title,
        "title_len": len(title),
        "meta_description": parser.meta_description or "",
        "meta_description_len": len(parser.meta_description or ""),
        "h1_count": parser.h1_count,
        "h1_text": h1_text,
        "imgs_total": parser.imgs_total,
        "imgs_missing_alt": parser.imgs_missing_alt,
        "abs_paths": parser.abs_paths,
        "html_lang": parser.html_lang or "",
        "has_viewport": parser.has_viewport,
        "error": None,
    }

def main():
    ap = argparse.ArgumentParser(description="SEO Quick Check (ohne externe Libs)")
    ap.add_argument("dir", nargs="?", default=os.path.expanduser("~/jts/sanfter_anfang"),
                    help="Ordner mit HTML-Dateien (Default: ~/jts/sanfter_anfang)")
    args = ap.parse_args()

    root = os.path.abspath(os.path.expanduser(args.dir))
    print(f"🔎 Prüfe HTML-Dateien in: {root}\n")

    if not os.path.isdir(root):
        print("❌ Ordner nicht gefunden.")
        sys.exit(1)

    files = [os.path.join(root, f) for f in os.listdir(root)
             if os.path.isfile(os.path.join(root, f)) and f.lower().endswith((".html",".htm"))]
    files.sort()

    if not files:
        print("⚠️  Keine .html/.htm-Dateien gefunden.")
        return

    totals = {
        "files": 0,
        "missing_desc": 0,
        "short_title": 0,
        "no_h1": 0,
        "imgs_missing_alt_total": 0,
        "abs_paths_total": 0,
        "missing_lang_total": 0,
        "missing_viewport_total": 0,
    }

    for f in files:
        res = analyze_file(f)
        totals["files"] += 1

        if res["error"]:
            print(f"📄 {os.path.basename(f)}")
            print(f"   • Fehler beim Parsen: {res['error']}\n")
            continue

        title = res["title"]
        desc = res["meta_description"]
        h1c  = res["h1_count"]
        imgs_missing = res["imgs_missing_alt"]
        abs_paths = res["abs_paths"]
        lang = res["html_lang"]
        has_viewport = res["has_viewport"]

        if not desc: totals["missing_desc"] += 1
        if res["title_len"] < 10: totals["short_title"] += 1
        if h1c == 0: totals["no_h1"] += 1
        if not lang: totals["missing_lang_total"] += 1
        if not has_viewport: totals["missing_viewport_total"] += 1
        totals["imgs_missing_alt_total"] += imgs_missing
        totals["abs_paths_total"] += abs_paths

        print(f"📄 {os.path.basename(f)}")
        print(f"   • Title: {'✅' if res['title_len']>=10 else '⚠️'} “{title or '<leer>'}” ({res['title_len']} Zeichen)")
        print(f"   • Description: {'✅' if desc else '⚠️'} ({res['meta_description_len']} Zeichen)")
        print(f"   • <h1>: {'✅' if h1c>0 else '⚠️'} (Anzahl: {h1c})  —  erster Text: {res['h1_text'] or '-'}")
        print(f"   • IMG ohne alt: {'⚠️' if imgs_missing>0 else '✅'}  {imgs_missing} / {res['imgs_total']}")
        print(f"   • Absolute Root-Pfade: {'⚠️' if abs_paths>0 else '✅'}  {abs_paths}")
        print(f"   • html@lang: {'✅' if lang else '⚠️'}  {lang or '<fehlt>'}")
        print(f"   • viewport: {'✅' if has_viewport else '⚠️'}")
        print("")

    print(f"\nErgebnis für {totals['files']} Datei(en):")
    print(f"  • fehlende Descriptions: {totals['missing_desc']}")
    print(f"  • sehr kurze Titles (<10): {totals['short_title']}")
    print(f"  • ohne <h1>: {totals['no_h1']}")
    print(f"  • Bilder ohne alt (gesamt): {totals['imgs_missing_alt_total']}")
    print(f"  • absolute Root-Pfade (gesamt): {totals['abs_paths_total']}")
    print(f"  • fehlendes html@lang: {totals['missing_lang_total']}")
    print(f"  • fehlende viewport-Meta: {totals['missing_viewport_total']}")
    print("\n💡 Hinweise:")
    print("  - Description pro Seite ~140–160 Zeichen, unique.")
    print("  - Genau 1 <h1> pro Seite, sprechend.")
    print("  - IMG immer mit aussagekräftigem alt.")
    print("  - Root-Pfade (/) innerhalb /sanfter_anfang zu relativen machen.")
    print('  - <html lang="de"> (oder en/fr) & <meta name="viewport" ...> setzen.')
if __name__ == "__main__":
    main()
