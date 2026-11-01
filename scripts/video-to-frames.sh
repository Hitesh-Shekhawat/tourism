#!/usr/bin/env bash
# Owner footage → graded WebP frame sequence in both sizes (§5, §9).
#
#   scripts/video-to-frames.sh <clip.mp4> <sequence-name> [count]
#   e.g. scripts/video-to-frames.sh drone-amer-dawn.mp4 hero-aerial 150
#
# Writes public/frames/<name>/desktop/0001.webp … (1920×1080, cover crop) and mobile/ (900×1600, centre crop),
# applying the site's warm grade at export (never as a CSS filter). Then set the sequence's
# "status" to "ready" in content/day.json and update its "credit". Needs ffmpeg + ffprobe on PATH
# (or FFMPEG / FFPROBE env vars pointing at the binaries).
set -euo pipefail

clip="${1:?usage: video-to-frames.sh <clip> <sequence-name> [count]}"
name="${2:?sequence name, e.g. hero-aerial}"
count="${3:-150}"
FFMPEG="${FFMPEG:-ffmpeg}"
FFPROBE="${FFPROBE:-ffprobe}"

dur=$("$FFPROBE" -v error -show_entries format=duration -of default=nw=1:nk=1 "$clip")
fps=$(awk -v n="$count" -v d="$dur" 'BEGIN { printf "%.6f", n / d }')

# The brand warm grade: slightly lifted warm highlights, cooler-neutral shadows, gentle contrast.
grade="colorbalance=rs=0.03:gs=0.01:bs=-0.04:rh=0.05:gh=0.02:bh=-0.05,eq=contrast=1.04:saturation=1.05:gamma=0.98"

out="public/frames/$name"
mkdir -p "$out/desktop" "$out/mobile"

"$FFMPEG" -hide_banner -loglevel error -y -i "$clip" \
  -vf "fps=$fps,$grade,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" \
  -frames:v "$count" -c:v libwebp -quality 78 -compression_level 5 "$out/desktop/%04d.webp"

"$FFMPEG" -hide_banner -loglevel error -y -i "$clip" \
  -vf "fps=$fps,$grade,scale=900:1600:force_original_aspect_ratio=increase,crop=900:1600" \
  -frames:v "$count" -c:v libwebp -quality 72 -compression_level 5 "$out/mobile/%04d.webp"

echo "Wrote $(ls "$out/desktop" | wc -l) desktop and $(ls "$out/mobile" | wc -l) mobile frames to $out"
du -sh "$out/desktop" "$out/mobile"
echo "Now set frameSequences[\"$name\"].status to \"ready\" in content/day.json (and the credit line)."
