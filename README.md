# Secret Gallery

An encrypted media gallery for pictures and videos, deployed to GitHub Pages.

## Features

- **Base64 encoded files** - Media files are stored as encoded .enc files in the repository
- **Automatic decoding** - Files are decoded in the browser when viewed
- **Monthly organization** - Media organized by month in separate directories
- **Video thumbnails** - Automatic thumbnail generation for videos
- **Shareable links** - Direct links to individual files
- **Responsive design** - Works on mobile and desktop
- **GitHub Pages deployment** - Automatic deployment via GitHub Actions

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Enable git hooks:**
   ```bash
   chmod +x .git-hooks/pre-commit
   ln -sf ../../.git-hooks/pre-commit .git/hooks/pre-commit
   ```

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: GitHub Actions

## Usage

### Adding New Media Files

1. **Encode a single file:**
   ```bash
   ./scripts/encode-file.sh /path/to/photo.jpg pictures 2025-05
   ./scripts/encode-file.sh /path/to/video.mp4 videos 2025-05
   ```

2. **Encode multiple files at once:**
   ```bash
   ./scripts/encode-batch.sh /path/to/directory
   ```

   The directory structure should be:
   ```
   /path/to/media/pictures/2025-05/
   /path/to/media/videos/2025-05/
   ```

3. **Commit changes:**
   ```bash
   git add public/encoded/
   git commit -m "Add new media for May 2025"
   git push
   ```

   The pre-commit hook will automatically regenerate `manifest.json`.

### Viewing the Gallery

- Development: `npm run dev` (runs on http://localhost:3000)
- Production: Deployed to `https://niobedev.github.io/gallery/`

### Shareable Links

Format: `https://niobedev.github.io/gallery/#/file/{fileId}`

Example: `https://niobedev.github.io/gallery/#/file/v-2025-05-001`

## Project Structure

```
secret-gallery/
├── public/encoded/          # Encoded .enc files
│   ├── videos/             # Videos organized by month
│   └── pictures/           # Pictures organized by month
├── scripts/                # Encoding and utility scripts
│   ├── encode-file.sh      # Encode single file
│   ├── generate-video-thumb.sh  # Generate video thumbnail
│   └── generate-manifest.js     # Generate manifest.json
├── src/                    # React application
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   └── utils/              # Utility functions
├── manifest.json           # File metadata (auto-generated)
└── .github/workflows/      # GitHub Actions for deployment
```

## Technical Details

- **Framework:** React + Vite + TypeScript
- **Routing:** React Router with hash routing
- **Styling:** CSS modules
- **Encoding:** Base64 with metadata
- **Video thumbnails:** FFmpeg (first frame at 00:00:01, 300x300)
- **Deployment:** GitHub Pages via GitHub Actions

## Requirements

- Node.js 20+
- FFmpeg (for video thumbnail generation)

### Installing FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

## License

MIT