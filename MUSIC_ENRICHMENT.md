# Music Entry Enrichment Guide

## Overview

The guestbook now collects YouTube URLs from users without processing them. You can process all music entries later using the `enrich-music.js` script.

## How It Works

1. **User submits entry**: YouTube URL is stored as-is with `processed: false`
2. **Before going live**: You run the enrichment script to download MP3s and metadata
3. **Script updates entries**: Adds `audioPath`, `title`, `artist`, `duration`, and sets `processed: true`

## Running the Script

### Locally (for development/testing)

```bash
npm run enrich-music
# or
node enrich-music.js
```

This will process entries in `./storage/2026/entries/`

### On Production Server (via SSH)

```bash
# SSH into your server
ssh your-server

# Navigate to the project directory
cd /opt/render/project/src

# Run the script with production storage path
node enrich-music.js /var/storage

# Or if you've downloaded the storage directory locally:
node enrich-music.js /path/to/downloaded/storage
```

### Custom Storage Path

```bash
node enrich-music.js /custom/path/to/storage
```

## What the Script Does

For each entry with music content:

1. ✅ **Downloads MP3 audio** (required - will fail if this doesn't work)
2. 📋 **Extracts metadata** (optional - uses defaults if it fails)
   - Song title
   - Artist name
   - Duration
3. 🖼️ **Downloads thumbnail** (optional - skips if it fails)

## Output

The script provides detailed logging:

```
🎵 Processing entry: abc-123-def
   Author: John Doe
   URL: https://www.youtube.com/watch?v=R9miRFaYbWo
  📥 Downloading audio: R9miRFaYbWo
  ✓ Audio downloaded
  📋 Extracting metadata...
  ✓ Metadata: Artist Name - Song Title
  🖼️  Downloading thumbnail...
  ✓ Thumbnail downloaded
  ✅ Entry enriched successfully
```

## Summary Report

After processing all entries:

```
📊 Summary:
   ✅ Processed: 15
   ⏭️  Skipped: 3
   ❌ Errors: 1
```

## Before Going Live

1. Collect submissions with YouTube URLs
2. SSH into the server or download the storage directory
3. Run `node enrich-music.js /var/storage`
4. Verify MP3s are in `/var/storage/2026/music/`
5. Check entry files are updated with `processed: true`
6. Upload music files back to server if processed locally

## Troubleshooting

### "yt-dlp: command not found"

Install yt-dlp:
```bash
# macOS
brew install yt-dlp

# Linux
pip install yt-dlp
```

### Script skips already processed entries

This is intentional! Entries with `processed: true` are skipped. To reprocess, edit the entry JSON and set `processed: false`.

### Some entries fail to process

The script continues even if individual entries fail. Check the error messages and try processing those URLs manually with yt-dlp.

## Entry Structure

### Before Processing
```json
{
  "type": "music",
  "content": {
    "youtubeUrl": "https://www.youtube.com/watch?v=...",
    "youtubeId": "...",
    "songTitle": "Pending",
    "artist": "Processing...",
    "audioPath": null,
    "processed": false
  }
}
```

### After Processing
```json
{
  "type": "music",
  "content": {
    "youtubeUrl": "https://www.youtube.com/watch?v=...",
    "youtubeId": "...",
    "songTitle": "Actual Song Name",
    "artist": "Actual Artist",
    "albumArtUrl": "/music/xyz.jpg",
    "audioPath": "/music/xyz.mp3",
    "duration": 234,
    "processed": true
  }
}
```
