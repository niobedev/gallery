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

TYPE=$(basename "$(dirname "$DIR_PATH")")
MONTH=$(basename "$DIR_PATH")

if [ "$TYPE" != "pictures" ] && [ "$TYPE" != "videos" ]; then
    echo "Error: Parent directory must be 'pictures' or 'videos'"
    exit 1
fi

echo "Encoding all files in: $DIR_PATH"
echo "Type: $TYPE, Month: $MONTH"
echo ""

COUNT=0

for FILE in "$DIR_PATH"/*; do
    if [ -f "$FILE" ]; then
        FILENAME=$(basename "$FILE")
        if [[ ! "$FILENAME" =~ \.enc$ ]] && [[ ! "$FILENAME" =~ \.thumb\.(jpg|png)$ ]]; then
            ./scripts/encode-file.sh "$FILE" "$TYPE" "$MONTH"
            
            if [ "$TYPE" = "videos" ]; then
                ./scripts/generate-video-thumb.sh "$FILE"
            fi
            
            COUNT=$((COUNT + 1))
            echo ""
        fi
    fi
done

echo "Encoded $COUNT file(s)"
echo ""
echo "Run 'node scripts/generate-manifest.js' to update manifest.json"