#!/bin/bash
# make_icons.sh
# Aus einer großen PNG (z. B. 1024x1024) alle Web-Icons generieren
# Voraussetzung: ImageMagick installiert (convert)

SRC="icon.png"
OUTDIR="icons"

mkdir -p "$OUTDIR"

# Klassische Favicons
convert "$SRC" -resize 16x16  "$OUTDIR/favicon-16.png"
convert "$SRC" -resize 32x32  "$OUTDIR/favicon-32.png"
convert "$SRC" -resize 48x48  "$OUTDIR/favicon-48.png"
# Multi-Size ICO
convert "$OUTDIR/favicon-16.png" "$OUTDIR/favicon-32.png" "$OUTDIR/favicon-48.png" "$OUTDIR/favicon.ico"

# PWA / Android
convert "$SRC" -resize 72x72   "$OUTDIR/icon-72.png"
convert "$SRC" -resize 96x96   "$OUTDIR/icon-96.png"
convert "$SRC" -resize 128x128 "$OUTDIR/icon-128.png"
convert "$SRC" -resize 144x144 "$OUTDIR/icon-144.png"
convert "$SRC" -resize 152x152 "$OUTDIR/icon-152.png"
convert "$SRC" -resize 192x192 "$OUTDIR/icon-192.png"
convert "$SRC" -resize 384x384 "$OUTDIR/icon-384.png"
convert "$SRC" -resize 512x512 "$OUTDIR/icon-512.png"

# Apple Touch Icons
convert "$SRC" -resize 180x180 "$OUTDIR/apple-touch-icon.png"
convert "$SRC" -resize 167x167 "$OUTDIR/apple-touch-icon-ipad.png"
convert "$SRC" -resize 152x152 "$OUTDIR/apple-touch-icon-152.png"

echo "✅ Icon-Set erstellt im Ordner $OUTDIR"
