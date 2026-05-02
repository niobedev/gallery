#!/bin/bash

# encode-file.sh - Encode a file to Base64 with metadata
# Usage: ./encode-file.sh <file_path> <type> <month>
# Example: ./encode-file.sh /path/to/photo.jpg pictures 2025-05

set -e

if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <file_path> <type> <month>"
    echo "Type: 'pictures' or 'videos'"
    echo "Month: YYYY-MM format"
    exit 1
fi

FILE_PATH="$1"
TYPE="$2"
MONTH="$3"

if [ ! -f "$FILE_PATH" ]; then
    echo "Error: File not found: $FILE_PATH"
    exit 1
fi

if [ "$TYPE" != "pictures" ] && [ "$TYPE" != "videos" ]; then
    echo "Error: Type must be 'pictures' or 'videos'"
    exit 1
fi

if [[ ! "$MONTH" =~ ^[0-9]{4}-[0-9]{2}$ ]]; then
    echo "Error: Month must be in YYYY-MM format"
    exit 1
fi

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