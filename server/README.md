# Guestbook Server

A Node.js Express server for the Guestbook application that provides REST API endpoints for managing guestbook entries.

## Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies from the project root:
```bash
npm install
```

2. Start the server:
```bash
npm run server
```

The server will start on port 3001 by default.

### Development

To run both the frontend and backend simultaneously:
```bash
npm run dev:full
```

This will start:
- Frontend (Vite dev server) on http://localhost:5173
- Backend (Express server) on http://localhost:3001

## API Endpoints

### GET /entries
Retrieves all guestbook entries.

**Response:**
```json
[
  {
    "id": "uuid-string",
    "type": "text|image",
    "content": "Entry content or image data",
    "author": "Author name",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "pageNumber": 1,
    "position": { "x": 100, "y": 200 }
  }
]
```

### POST /entry
Creates a new guestbook entry.

**Request Body:**
```json
{
  "type": "text|image",
  "content": "Entry content or image data",
  "author": "Author name", 
  "position": { "x": 100, "y": 200 }
}
```

**Response:**
```json
{
  "id": "generated-uuid",
  "type": "text|image",
  "content": "Entry content or image data",
  "author": "Author name",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "pageNumber": 1,
  "position": { "x": 100, "y": 200 }
}
```

**Validation:**
- All fields (type, content, author, position) are required
- `type` must be either "text" or "image"
- `position.x` and `position.y` must be numbers
- Maximum request size: 50MB (for image uploads)

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 201: Created (for POST /entry)
- 400: Bad Request (validation errors)
- 404: Not Found
- 500: Internal Server Error

Error responses include a message:
```json
{
  "error": "Error description"
}
```

## Data Storage

Currently uses in-memory storage for development. In production, this should be replaced with a persistent database solution like:
- PostgreSQL
- MongoDB
- SQLite

## CORS

The server is configured to accept requests from any origin for development purposes. In production, configure CORS to only allow requests from your frontend domain.

## Environment Variables

- `PORT`: Server port (default: 3001)

## Architecture

The server follows a simple REST API pattern:
- Express.js for the web framework
- UUID for generating unique entry IDs
- CORS middleware for cross-origin requests
- JSON body parsing with increased size limits for image uploads

## Future Enhancements

- Add database persistence
- Implement authentication
- Add image upload to cloud storage
- Add rate limiting
- Add request validation middleware
- Add logging
- Add tests