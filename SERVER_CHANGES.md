# Server-Side Changes Summary (v2.0)

## What Changed

### ✅ Storage Structure
- **New directory**: `storage/2026/entries/` (instead of `storage/entries/`)
- **New directory**: `storage/2026/removed/entries/` (instead of `storage/removed/entries/`)
- **Removed**: `storage/images/` directory (no image uploads in v2)
- 2025 entries remain in `storage/entries/` but are no longer loaded

### ✅ Data Model
**New content types accepted:**
```json
{
  "type": "text",
  "content": "Birthday message here..."
}
```

```json
{
  "type": "music",
  "content": {
    "youtubeUrl": "https://youtube.com/watch?v=...",
    "youtubeId": "extracted-id",
    "songTitle": "Song Name",
    "artist": "Artist Name",
    "albumArtUrl": "thumbnail-url"
  }
}
```

**Removed content type:**
- `"type": "image"` - No longer accepted

### ✅ Validation Rules
1. **Entry must have at least one of:**
   - Music content (with valid YouTube URL)
   - Text content (non-empty string)
   - Or both
   - Cannot submit empty entry

2. **Music validation:**
   - YouTube URL required
   - Video ID must be extractable
   - Other fields optional (can be auto-fetched client-side)

3. **All entries start as unapproved** (`approved: false`)

### ✅ API Endpoints Status

#### Enabled & Updated:
- `GET /entries` - Returns only approved entries (public)
- `GET /entries?pw=PASSWORD` - Returns all entries (admin)
- `POST /entry` - Creates unapproved entry (music/text validation)
- `PUT /entry/:id/approve` - Approve entry (admin)
- `PUT /entry/:id/reject` - Reject and move to removed (admin)
- `GET /removed/entries?pw=PASSWORD` - List removed entries (admin)
- `PUT /removed/entry/:id/restore` - Restore removed entry (admin)
- `GET /health` - Health check

#### Disabled:
- `DELETE /entry/:id` - Returns 401 (use reject instead)
- `GET /storage/images/:filename` - Removed (no images)

### ✅ Code Removed
1. `saveImage()` function - No image processing
2. Image file cleanup in reject/restore endpoints
3. Image serving endpoint
4. Image upload validation

### ✅ Code Added
1. `extractYouTubeId()` function - Parses YouTube URLs
2. Music content validation
3. "At least one of music OR text" validation

## Testing

Server starts successfully:
```bash
npm run server
```

Output:
```
Guestbook v2.0 server running on port 3001
Storage directory: /Users/z/Downloads/sohyun-guestbook-2/storage/2026
Loaded 0 existing entries
```

## Example Request

### Valid music + text entry:
```json
POST /entry
{
  "content": [
    {
      "type": "music",
      "content": {
        "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "songTitle": "Never Gonna Give You Up",
        "artist": "Rick Astley",
        "albumArtUrl": ""
      }
    },
    {
      "type": "text",
      "content": "Happy Birthday! This song reminds me of you 🎂"
    }
  ],
  "author": "Friend Name",
  "position": { "x": 50, "y": 50 }
}
```

### Valid text-only entry:
```json
POST /entry
{
  "content": [
    {
      "type": "text",
      "content": "Happy Birthday! Hope you have an amazing day! 🎉"
    }
  ],
  "author": "Friend Name",
  "position": { "x": 50, "y": 50 }
}
```

### Invalid (will be rejected):
```json
// Empty content array
{ "content": [], "author": "Name", "position": {...} }

// Image type (no longer supported)
{ "content": [{ "type": "image", "content": "..." }], ... }

// Music without YouTube URL
{ "content": [{ "type": "music", "content": {} }], ... }
```

## Next Steps

Client-side still needs:
1. Update TypeScript interfaces to match new data model
2. Remove image upload UI
3. Add music input UI (YouTube URL field)
4. Build music player component
5. Fetch YouTube metadata (title, artist, thumbnail)
6. Apply vinyl theme

**Server is complete and ready for client development.**
