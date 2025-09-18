# Storage Directory

This directory contains the disk-based storage for the guestbook application.

## Directory Structure

```
storage/
├── README.md          # This documentation file
├── .gitignore         # Excludes storage contents from version control
├── entries/           # JSON files for guestbook entries
│   └── {uuid}.json    # Individual entry files named by UUID
└── images/            # Image files uploaded by users
    └── {uuid}.{ext}   # Image files named by entry UUID with original extension
```

## Entry Storage Format

Each guestbook entry is stored as a separate JSON file in the `entries/` directory:

**File naming:** `{entry-id}.json`

**File content example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "text",
  "content": "Hello world!",
  "author": "John Doe",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "pageNumber": 1,
  "position": {
    "x": 100,
    "y": 200
  }
}
```

## Image Storage

Images are processed and stored separately:

1. **Base64 to File:** When an image entry is created, the base64 image data is extracted and saved as a binary file
2. **File Naming:** `{entry-id}.{extension}` (e.g., `550e8400-e29b-41d4-a716-446655440000.png`)
3. **Entry Reference:** The entry's `content` field stores the filename instead of the base64 data
4. **Serving:** Images are served via the `/images/:filename` endpoint

**Supported image formats:**
- PNG (.png)
- JPEG (.jpg, .jpeg)
- GIF (.gif)
- WebP (.webp)

## Data Persistence

- **Startup:** Server loads all entries from disk on startup
- **Real-time:** New entries are immediately written to disk
- **Caching:** Entries are cached in memory for fast retrieval
- **Consistency:** Each write operation creates/updates the corresponding file

## Storage Benefits

1. **Persistence:** Data survives server restarts
2. **Simplicity:** No database setup required
3. **Backup-friendly:** Easy to backup/restore by copying the directory
4. **Human-readable:** JSON files can be inspected directly
5. **Scalability:** Can be easily migrated to a database later

## Maintenance

### Backup
```bash
cp -r storage/ backup-$(date +%Y%m%d)/
```

### Cleanup (if needed)
```bash
# Remove all entries and images
rm -rf storage/entries/* storage/images/*
```

### Migration
To migrate to a database:
1. Read all JSON files from `entries/`
2. Insert into database
3. Update image references to use new storage solution
4. Update server code to use database instead of file system

## Security Considerations

- **File Validation:** Server validates image formats before saving
- **Path Traversal:** Filename handling prevents directory traversal attacks
- **Size Limits:** 50MB request limit prevents oversized uploads
- **Access Control:** Images are served publicly once uploaded

## Development Notes

- Directory structure is created automatically on server startup
- `.gitignore` prevents user data from being committed to version control
- Files are written synchronously for data consistency
- Error handling ensures partial writes don't corrupt data