#!/bin/bash
# Download public domain Rider-Waite-Smith tarot card images
# Source: laban.lysator.liu.se (Public Domain scans)
# These scans are of the original 1909 RWS deck - copyright expired worldwide

BASE="http://laban.lysator.liu.se/pub/magick/Tarot/Riderwaite_jpg"
OUT="public/card-images"
mkdir -p "$OUT"

echo "Downloading 78 Rider-Waite-Smith tarot cards..."
echo "Source: $BASE"
echo ""

# ─── Major Arcana (22 cards, IDs 0-21) ───
echo "--- Major Arcana ---"
for i in $(seq -w 0 21); do
  id=$((10#$i))
  url="$BASE/Majors/maj${i}.jpg"
  out="$OUT/rws-major-$(printf '%02d' $id).jpg"
  echo "  [$((id+1))/78] Major #$id → $(basename $out)"
  curl -sL "$url" -o "$out"
done

# ─── Minor Arcana: Wands (IDs 22-35) ───
echo "--- Wands ---"
for i in $(seq -w 1 14); do
  id=$((21 + 10#$i))
  url="$BASE/Minors/Wands/wands${i}.jpg"
  out="$OUT/rws-minor-wands-$(printf '%02d' $i).jpg"
  echo "  [$((id+1))/78] Wands #$i → $(basename $out)"
  curl -sL "$url" -o "$out"
done

# ─── Minor Arcana: Cups (IDs 36-49) ───
echo "--- Cups ---"
for i in $(seq -w 1 14); do
  id=$((35 + 10#$i))
  url="$BASE/Minors/Cups/cups${i}.jpg"
  out="$OUT/rws-minor-cups-$(printf '%02d' $i).jpg"
  echo "  [$((id+1))/78] Cups #$i → $(basename $out)"
  curl -sL "$url" -o "$out"
done

# ─── Minor Arcana: Swords (IDs 50-63) ───
echo "--- Swords ---"
for i in $(seq -w 1 14); do
  id=$((49 + 10#$i))
  url="$BASE/Minors/Swords/swords${i}.jpg"
  out="$OUT/rws-minor-swords-$(printf '%02d' $i).jpg"
  echo "  [$((id+1))/78] Swords #$i → $(basename $out)"
  curl -sL "$url" -o "$out"
done

# ─── Minor Arcana: Pentacles (IDs 64-77) ───
echo "--- Pentacles ---"
for i in $(seq -w 1 14); do
  id=$((63 + 10#$i))
  url="$BASE/Minors/Pentacles/pentacles${i}.jpg"
  out="$OUT/rws-minor-pentacles-$(printf '%02d' $i).jpg"
  echo "  [$((id+1))/78] Pentacles #$i → $(basename $out)"
  curl -sL "$url" -o "$out"
done

echo ""
echo "Done! 78 cards downloaded to $OUT/"
ls -la "$OUT/" | tail -5
echo "Total files: $(ls "$OUT/" | wc -l)"
