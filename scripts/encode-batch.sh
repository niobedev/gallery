#!/bin/bash

# encode-batch.sh - Encode all files in a directory
# Usage: ./encode-batch.sh <directory_path>

set -e

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <directory_path>"
    exit 1
fi

DIR_PATH="$1"

if [ ! -d "$DIR_PATH" ]; then
    echo "Error: Directory not found: $DIR_PATH"
    exit 1
fi

echo "Encoding all files in: $DIR_PATH"
echo ""

COUNT=0

for FILE in "$DIR_PATH"/*; do
    if [ -f "$FILE" ]; then
        FILENAME=$(basename "$FILE")
        if [[ ! "$FILENAME" =~ \.enc$ ]] && [[ ! "$FILENAME" =~ \.thumb\.(jpg|png)$ ]]; then
            ./scripts/encode-file.sh "$FILE"
            
            # Check if it's a video file
            FILEEXT="${FILENAME##*.}"
            FILEEXT_LOWER=$(echo "$FILEEXT" | tr '[:upper:]' '[:lower:]')
            VIDEO_EXTENSIONS=("mp4" "webm" "mov" "avi" "mkv" "flv" "wmv")
            
            if [[ " ${VIDEO_EXTENSIONS[@]} " =~ " ${FILEEXT_LOWER} " ]]; then
                ./scripts/generate-video-thumb.sh "$FILE"
            fi
            
            COUNT=$((COUNT + 1))
            echo ""
        fi
    fi
done

echo "Encoded $COUNT file(s)"
echo ""
echo "Manifest will be auto-generated on commit"