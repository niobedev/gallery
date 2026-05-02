#!/bin/bash

# encode-file.sh - Encode a file to Base64 with metadata
# Usage: ./encode-file.sh <file_path>
# Example: ./encode-file.sh /path/to/photo.jpg

set -e

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <file_path>"
    exit 1
fi

FILE_PATH="$1"

if [ ! -f "$FILE_PATH" ]; then
    echo "Error: File not found: $FILE_PATH"
    exit 1
fi

# Auto-detect type based on file extension
FILENAME=$(basename "$FILE_PATH")
FILEEXT="${FILENAME##*.}"
FILEEXT_LOWER=$(echo "$FILEEXT" | tr '[:upper:]' '[:lower:]')

VIDEO_EXTENSIONS=("mp4" "webm" "mov" "avi" "mkv" "flv" "wmv")
IMAGE_EXTENSIONS=("jpg" "jpeg" "png" "gif" "webp" "bmp" "tiff")

if [[ " ${VIDEO_EXTENSIONS[@]} " =~ " ${FILEEXT_LOWER} " ]]; then
    TYPE="videos"
elif [[ " ${IMAGE_EXTENSIONS[@]} " =~ " ${FILEEXT_LOWER} " ]]; then
    TYPE="pictures"
else
    echo "Error: Unsupported file type: $FILEEXT"
    echo "Supported images: jpg, jpeg, png, gif, webp, bmp, tiff"
    echo "Supported videos: mp4, webm, mov, avi, mkv, flv, wmv"
    exit 1
fi

# Use current date for month
MONTH=$(date +"%Y-%m")

FILENAME=$(basename "$FILE_PATH")
FILEEXT="${FILENAME##*.}"
BASENAME="${FILENAME%.*}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
FILESIZE=$(stat -f%z "$FILE_PATH" 2>/dev/null || stat -c%s "$FILE_PATH" 2>/dev/null)

OUTPUT_DIR="public/encoded/$TYPE/$MONTH"
mkdir -p "$OUTPUT_DIR"

METADATA=""

if [ "$TYPE" = "videos" ]; then
    if command -v ffprobe &> /dev/null; then
        VIDEO_INFO=$(ffprobe -v quiet -print_format json -show_format -show_streams "$FILE_PATH")
        DURATION=$(echo "$VIDEO_INFO" | grep -o '"duration":[0-9.]*' | head -1 | cut -d: -f2)
        WIDTH=$(echo "$VIDEO_INFO" | grep -o '"width":[0-9]*' | head -1 | cut -d: -f2)
        HEIGHT=$(echo "$VIDEO_INFO" | grep -o '"height":[0-9]*' | head -1 | cut -d: -f2)
        
        if [ -n "$WIDTH" ] && [ -n "$HEIGHT" ]; then
            if [ "$HEIGHT" -gt "$WIDTH" ]; then
                ORIENTATION="vertical"
            else
                ORIENTATION="horizontal"
            fi
        else
            ORIENTATION="horizontal"
        fi
        
        METADATA=$(cat <<EOF
{
  "originalName": "$FILENAME",
  "type": "video",
  "size": $FILESIZE,
  "timestamp": "$TIMESTAMP",
  "duration": ${DURATION:-0},
  "width": ${WIDTH:-0},
  "height": ${HEIGHT:-0},
  "orientation": "$ORIENTATION"
}
EOF
)
    else
        METADATA=$(cat <<EOF
{
  "originalName": "$FILENAME",
  "type": "video",
  "size": $FILESIZE,
  "timestamp": "$TIMESTAMP",
  "duration": 0,
  "width": 0,
  "height": 0,
  "orientation": "horizontal"
}
EOF
)
    fi
    
    echo "Encoding video: $FILENAME"
else
    if command -v identify &> /dev/null; then
        DIMENSIONS=$(identify -format "%w %h" "$FILE_PATH" 2>/dev/null)
        WIDTH=$(echo "$DIMENSIONS" | cut -d' ' -f1)
        HEIGHT=$(echo "$DIMENSIONS" | cut -d' ' -f2)
        
        METADATA=$(cat <<EOF
{
  "originalName": "$FILENAME",
  "type": "image",
  "size": $FILESIZE,
  "timestamp": "$TIMESTAMP",
  "width": ${WIDTH:-0},
  "height": ${HEIGHT:-0}
}
EOF
)
    else
        METADATA=$(cat <<EOF
{
  "originalName": "$FILENAME",
  "type": "image",
  "size": $FILESIZE,
  "timestamp": "$TIMESTAMP",
  "width": 0,
  "height": 0
}
EOF
)
    fi
    
    echo "Encoding image: $FILENAME"
fi

OUTPUT_FILE="$OUTPUT_DIR/$BASENAME.enc"

base64 "$FILE_PATH" > "$OUTPUT_FILE"
echo "METADATA:$METADATA" >> "$OUTPUT_FILE"

echo "Created: $OUTPUT_FILE"
echo "Encoded file size: $(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null) bytes"