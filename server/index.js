import express from 'express'
import * as fs from 'fs'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' })) // Increased limit for image uploads
app.use(express.urlencoded({ extended: true }))

// TODO: sync to a directory on disk is fine
// In-memory storage for entries (replace with database in production)
let entries = []

// GET /entries - Get all entries
app.get('/entries', (req, res) => {
  try {
    // Sort entries by timestamp (oldest first)
    const sortedEntries = entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    res.json(sortedEntries)
  } catch (error) {
    console.error('Error fetching entries:', error)
    res.status(500).json({ error: 'Failed to fetch entries' })
  }
})

// POST /entry - Create a new entry
app.post('/entry', (req, res) => {
  try {
    const { type, content, author, position } = req.body

    // Validation
    if (!type || !content || !author || !position) {
      return res.status(400).json({
        error: 'Missing required fields: type, content, author, position'
      })
    }

    if (!['text', 'image'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid type. Must be either "text" or "image"'
      })
    }

    if (!position.x || !position.y || typeof position.x !== 'number' || typeof position.y !== 'number') {
      return res.status(400).json({
        error: 'Position must have valid x and y coordinates as numbers'
      })
    }

    // Calculate page number based on current entries count
    const entriesPerPage = 6
    const pageNumber = Math.ceil((entries.length + 1) / entriesPerPage)

    // Create new entry
    const entry = {
      id: uuidv4(),
      type,
      content,
      author,
      timestamp: new Date().toISOString(),
      pageNumber,
      position
    }

    // Add to entries array
    entries.push(entry)

    console.log('New entry created:', entry)
    res.status(201).json(entry)

  } catch (error) {
    console.error('Error creating entry:', error)
    res.status(500).json({ error: 'Failed to create entry' })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Guestbook server running on port ${PORT}`)
  console.log(`API endpoints:`)
  console.log(`  GET  http://localhost:${PORT}/entries`)
  console.log(`  POST http://localhost:${PORT}/entry`)
  console.log(`  GET  http://localhost:${PORT}/health`)
})

export default app
