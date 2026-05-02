#!/bin/bash

# generate-video-thumb.sh - Generate thumbnail from video and encode it
# Usage: ./generate-video-thumb.sh <video_file_path>

set -e

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <video_file_path>"
    exit 1
fi

VIDEO_PATH="$1"

if [ ! -f "$VIDEO_PATH" ]; then
    echo "Error: Video file not found: $VIDEO_PATH"
    exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed"
    echo "Install with: brew install ffmpeg (macOS) or apt install ffmpeg (Linux)"
    exit 1
fi

FILENAME=$(basename "$VIDEO_PATH")
BASENAME="${FILENAME%.*}"
TEMP_DIR=$(mktemp -d)
THUMB_PATH="$TEMP_DIR/$BASENAME-thumb.jpg"

echo "Generating thumbnail for: $FILENAME"

ffmpeg -i "$VIDEO_PATH" -ss 00:00:01 -vframes 1 -vf "scale=300:300:force_original_aspect_ratio=decrease,pad=300:300:(ow-iw)/2:(oh-ih)/2" -y "$THUMB_PATH" 2>/dev/null

if [ ! -f "$THUMB_PATH" ]; then
    echo "Error: Failed to generate thumbnail"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "Thumbnail generated: $THUMB_PATH"

MONTH=$(date +"%Y-%m")

# Encode the thumbnail manually to ensure it goes to videos directory
THUMB_FILENAME="$BASENAME-thumb.enc"
THUMB_OUTPUT_DIR="public/encoded/videos/$MONTH"
THUMB_OUTPUT_PATH="$THUMB_OUTPUT_DIR/$THUMB_FILENAME"

mkdir -p "$THUMB_OUTPUT_DIR"

# Generate metadata for thumbnail
THUMB_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
THUMBSIZE=$(stat -f%z "$THUMB_PATH" 2>/dev/null || stat -c%s "$THUMB_PATH" 2>/dev/null)

THUMB_METADATA=$(cat <<EOF
{
  "originalName": "$BASENAME-thumb.jpg",
  "type": "image",
  "size": $THUMBSIZE,
  "timestamp": "$THUMB_TIMESTAMP",
  "width": 300,
  "height": 300
}
EOF
)

# Encode thumbnail
base64 -i "$THUMB_PATH" > "$THUMB_OUTPUT_PATH"
echo "METADATA:$THUMB_METADATA" >> "$THUMB_OUTPUT_PATH"

echo ""
echo "Thumbnail encoded to: $THUMB_OUTPUT_PATH"

rm -rf "$TEMP_DIR"