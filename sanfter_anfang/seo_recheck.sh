#!/data/data/com.termux/files/usr/bin/bash
# ~/jts/sanfter_anfang/seo_recheck.sh
set -euo pipefail

DIR="${1:-$HOME/jts/sanfter_anfang}"
CHECK="$DIR/seo_check.py"

GRN=$'\e[32m'; YEL=$'\e[33m'; DIM=$'\e[2m'; RST=$'\e[0m'

[ -d "$DIR" ] || { echo "❌ Ordner nicht gefunden: $DIR"; exit 1; }
[ -x "$CHECK" ] || [ -f "$CHECK" ] || { echo "❌ seo_check.py nicht gefunden unter: $CHECK"; exit 1; }

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

echo "🔎 Re-Check in: $DIR"
python3 "$CHECK" > "$tmp"

echo
# komplette Ausgabe zeigen (optional einklappbar, hier kurz & knackig)
sed -n '1,999p' "$tmp"

echo
echo "${DIM}— Zusammenfassung —${RST}"

desc_line="$(grep -F 'fehlende Descriptions:' "$tmp" || true)"
abs_line="$(grep -F 'absolute Root-Pfade (gesamt):' "$tmp" || true)"
h1_line="$(grep -F 'ohne <h1>:' "$tmp" || true)"

desc_num="$(printf '%s' "$desc_line" | awk '{print $NF}')"
abs_num="$(printf '%s' "$abs_line" | awk '{print $NF}')"
h1_num="$(printf '%s' "$h1_line" | awk '{print $NF}')"

# Fallbacks falls awk nichts findet
desc_num="${desc_num:-999}"
abs_num="${abs_num:-999}"
h1_num="${h1_num:-999}"

printf "  • Descriptions fehlen: %s%s%s\n" "$([ "$desc_num" = "0" ] && echo "$GRN" || echo "$YEL")" "$desc_num" "$RST"
printf "  • Absolute Root-Pfade: %s%s%s\n" "$([ "$abs_num" = "0" ] && echo "$GRN" || echo "$YEL")" "$abs_num" "$RST"
printf "  • Seiten ohne <h1>:   %s%s%s\n" "$([ "$h1_num" = "0" ] && echo "$GRN" || echo "$YEL")" "$h1_num" "$RST"

echo
if [ "$desc_num" = "0" ] && [ "$abs_num" = "0" ] && [ "$h1_num" = "0" ]; then
  echo "✅ Sieht gut aus! (Descriptions ok, keine Root-Pfade, <h1> vorhanden)"
else
  echo "ℹ️  Da ist noch etwas zu tun (siehe Werte oben)."
fi
