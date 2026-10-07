#!/bin/bash
# Render delivery masters: SUPERSAMPLED.
#
# Every composition is rendered at --scale=2 from PNG frames and downscaled to
# delivery size with a Lanczos filter, which antialiases every edge the browser
# draws with stair steps at 1x: rotated elements, CSS clips, thin strokes,
# WebGL bezels and type. The 1x renders look "rough around the edges" in a way
# that reads as cheap without the viewer being able to name it.
#
# Usage:
#   scripts/render-supersampled.sh                     # every edition below
#   scripts/render-supersampled.sh Grammar             # one from the table
#   scripts/render-supersampled.sh MyFilm 1080:1920    # one not in the table
#
# A composition that is not in the table REQUIRES an explicit size. Guessing
# 1920:1080 for a portrait composition silently ships a squashed master.
#
# For a composition with a WebGL canvas (a 3D device stage) add BOTH flags to
# the render line below:
#   --gl=angle       or the canvas renders blank, with no error saying why
#   --concurrency=2  ANGLE contexts are expensive and the per-frame advance
#                    handshake gets flaky at high worker counts. 2 is the
#                    number that renders a 3D device stage reliably.
set -e
cd "$(dirname "$0")/.."

command -v ffmpeg >/dev/null || {
  echo "error: ffmpeg is not on PATH. Install it (brew install ffmpeg) and retry." >&2
  exit 1
}

# "<CompositionId> <outputName> <width:height>"
EDITIONS=(
  "Example example-16x9 1920:1080"
  "ExampleVertical example-9x16 1080:1920"
  "Grammar grammar-16x9 1920:1080"
  "GrammarVertical grammar-9x16 1080:1920"
  "GrammarLight grammar-light-16x9 1920:1080"
  "GrammarLightVertical grammar-light-9x16 1080:1920"
  "GrammarMixed grammar-mixed-16x9 1920:1080"
  "GrammarMixedVertical grammar-mixed-9x16 1080:1920"
)

if [ -n "$1" ]; then
  FOUND=""
  for edition in "${EDITIONS[@]}"; do
    read -r id name size <<< "$edition"
    if [ "$id" = "$1" ]; then FOUND="$id $name ${2:-$size}"; fi
  done
  if [ -z "$FOUND" ]; then
    if [ -z "$2" ]; then
      echo "error: '$1' is not in the edition table, so its delivery size is unknown." >&2
      echo "       Pass one explicitly, e.g. $0 $1 1080:1920" >&2
      exit 1
    fi
    FOUND="$1 $(echo "$1" | tr '[:upper:]' '[:lower:]') $2"
  fi
  EDITIONS=("$FOUND")
fi

mkdir -p out/masters

for edition in "${EDITIONS[@]}"; do
  read -r id name size <<< "$edition"
  echo "rendering $id at 2x..."
  # --image-format=png overrides remotion.config.ts's jpeg default: a
  # supersampled master encoded from jpeg frames throws away the quality this
  # whole script exists to buy.
  npx remotion render "$id" "out/masters/$name-2x.mp4" \
    --scale=2 --crf=14 --image-format=png --color-space=bt709 \
    --pixel-format=yuv420p --overwrite \
    > "out/masters/render-$name.log" 2>&1 ||
    { echo "render failed for $id:" >&2; cat "out/masters/render-$name.log" >&2; exit 1; }

  echo "downscaling $name to $size..."
  ffmpeg -y -v error -i "out/masters/$name-2x.mp4" \
    -vf "scale=$size:flags=lanczos" \
    -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p \
    -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
    -movflags +faststart -c:a copy "out/masters/$name.mp4"

  rm -f "out/masters/$name-2x.mp4"
  echo "done  out/masters/$name.mp4"
done
