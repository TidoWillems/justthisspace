#!/data/data/com.termux/files/usr/bin/bash
DIR="${1:-$HOME/jts/sanfter_anfang}"
add_h1() {
  local file="$1" h1="$2"
  [ -f "$file" ] || { echo "skip: $file fehlt"; return; }
  if grep -qi '<h1[^>]*>' "$file"; then echo "✓ $file hat bereits ein <h1> — übersprungen."; return; fi
  cp "$file" "$file.bak.$(date +%Y%m%d-%H%M%S)"
  if grep -qi '<main[^>]*>' "$file"; then
    awk -v H="$h1" 'BEGIN{IGNORECASE=1}{print}/<main[^>]*>/ && !ins {print "    <h1>" H "</h1>"; ins=1}' "$file" > "$file.tmp"
  elif grep -qi '<body[^>]*>' "$file"; then
    awk -v H="$h1" 'BEGIN{IGNORECASE=1}{print}/<body[^>]*>/ && !ins {print "  <h1>" H "</h1>"; ins=1}' "$file" > "$file.tmp"
  else
    awk -v H="$h1" 'BEGIN{IGNORECASE=1}{print}/<\/head>/ && !ins {print "<body>\n  <h1>" H "</h1>"; ins=1}' "$file" > "$file.tmp"
  fi
  mv "$file.tmp" "$file"
  echo "✅ $file — <h1> eingefügt: \"$h1\""
}
add_h1 "$DIR/intro.html"        "Illusionen entladen"
add_h1 "$DIR/mini-viewer.html"  "Mini-Viewer"
add_h1 "$DIR/stufe3_5.html"     "Stufe 3.5 – Tiefenraum mit Berührung"
echo "— fertig. Jetzt erneut prüfen mit:  $DIR/seo_recheck.sh"
