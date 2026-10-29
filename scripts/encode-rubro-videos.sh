#!/usr/bin/env bash
# Re-encodes the rubro demo videos (rendered elsewhere) into the light web assets under public/media/demos/.
# Usage: scripts/encode-rubro-videos.sh [source-dir]   (default: /workspace/campaigns/demos-video)
# Needs ffmpeg with libvpx-vp9, libx264, libopus, libwebp. It never renders anything: it only compresses the given masters.
set -euo pipefail
SRC="${1:-/workspace/campaigns/demos-video}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media/demos"
mkdir -p "$OUT"
for slug in estudios-contables estudios-juridicos productores-de-seguros inmobiliarias clinicas-y-consultorios; do
  # Poster frame (seconds): a frame with the demo UI. The clinics master opens on the old headline, so it uses a later one.
  POSTER_AT=6; [ "$slug" = clinicas-y-consultorios ] && POSTER_AT=12
  for shape in 16x9 9x16; do
    in="$SRC/$slug/$slug-$shape.mp4"
    if [ "$shape" = 16x9 ]; then scale="scale=1280:720:flags=lanczos"; else scale="scale=720:1280:flags=lanczos"; fi
    base="$OUT/rubro-$slug-$shape"
    ffmpeg -v error -y -i "$in" -vf "$scale" -c:v libx264 -preset slow -crf 33 -profile:v high -pix_fmt yuv420p \
      -movflags +faststart -c:a aac -b:a 64k -ac 2 "$base.mp4"
    ffmpeg -v error -y -i "$in" -vf "$scale" -c:v libvpx-vp9 -crf 42 -b:v 0 -row-mt 1 -cpu-used 2 -pix_fmt yuv420p \
      -c:a libopus -b:a 56k "$base.webm"
    ffmpeg -v error -y -ss "$POSTER_AT" -i "$in" -frames:v 1 -vf "$scale" -c:v libwebp -quality 74 "$base.webp"
  done
done
ls -l "$OUT" | grep rubro-

# Convenio Multilateral walkthrough (the CM demo page and the accounting page): already 1280x720 / 720x1280 masters in
# $CM_SRC (default /workspace/guidara-app/video/site). Posters are shipped with the masters (copied as they are).
CM_SRC="${CM_SRC:-/workspace/guidara-app/video/site}"
for shape in 16x9 9x16; do
  in="$CM_SRC/convenio-multilateral-$shape.mp4"
  base="$OUT/convenio-multilateral-$shape"
  ffmpeg -v error -y -i "$in" -c:v libx264 -preset slow -crf 33 -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 64k -ac 2 "$base.mp4"
  ffmpeg -v error -y -i "$in" -c:v libvpx-vp9 -crf 42 -b:v 0 -row-mt 1 -cpu-used 2 -pix_fmt yuv420p -c:a libopus -b:a 56k "$base.webm"
  cp "$CM_SRC/convenio-multilateral-$shape.webp" "$base.webp"
done
ls -l "$OUT" | grep convenio-multilateral
