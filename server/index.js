import express from 'express'
import * as fs from 'fs'
import path from 'path'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' })) // Increased limit for image uploads
app.use(express.urlencoded({ extended: true }))

const isProd = process.env.NODE_ENV === 'production'
// Storage directories
const STORAGE_DIR = path.join(isProd ? '/var/storage' : process.cwd(), 'storage')
const ENTRIES_DIR = path.join(STORAGE_DIR, 'entries')
const IMAGES_DIR = path.join(STORAGE_DIR, 'images')

// Ensure storage directories exist
const ensureDirectories = () => {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
  }
  if (!fs.existsSync(ENTRIES_DIR)) {
    fs.mkdirSync(ENTRIES_DIR, { recursive: true })
  }
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true })
  }
}

// Initialize storage directories
ensureDirectories()

// Load entries from disk
const loadEntries = () => {
  try {
    const entryFiles = fs.readdirSync(ENTRIES_DIR).filter(file => file.endsWith('.json'))
    const entries = entryFiles.map(file => {
      const filePath = path.join(ENTRIES_DIR, file)
      const data = fs.readFileSync(filePath, 'utf8')
      const entry = JSON.parse(data)
      // Add backward compatibility: set approved to true for existing entries without the field
      if (entry.approved === undefined) {
        entry.approved = true
      }
      return entry
    })
    return entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  } catch (error) {
    console.error('Error loading entries:', error)
    return []
  }
}

// Save entry to disk
const saveEntry = (entry) => {
  try {
    const filePath = path.join(ENTRIES_DIR, `${entry.id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(entry, null, 2))
    return true
  } catch (error) {
    console.error('Error saving entry:', error)
    return false
  }
}

// Save image to disk and return filename
const saveImage = (base64Data, entryId) => {
  try {
    // Extract image format from base64 data
    const matches = base64Data.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid base64 image format')
    }

    const imageType = matches[1]
    const imageData = matches[2]

    // Check file size (base64 is ~33% larger than original, so we check the base64 size)
    const sizeInBytes = (imageData.length * 3) / 4
    const maxSizeInBytes = 50 * 1024 * 1024 // 50MB

    if (sizeInBytes > maxSizeInBytes) {
      throw new Error('Image size exceeds 50MB limit')
    }

    const filename = `${entryId}.${imageType}`
    const filePath = path.join(IMAGES_DIR, filename)

    // Write image file
    fs.writeFileSync(filePath, Buffer.from(imageData, 'base64'))
    return filename
  } catch (error) {
    console.error('Error saving image:', error)
    return null
  }
}

// Cache for entries (reload from disk on startup)
let entries = loadEntries()

// GET /entries - Get all entries (approved only by default)
app.get('/entries', (req, res) => {
  try {
    // Reload entries from disk to ensure freshness
    entries = loadEntries()

    // Check if admin password is provided to show all entries
    const password = req.query.pw
    if (password === '20250514') {
      // Admin view: return all entries with approval status
      console.log(`Admin access: returning ${entries.length} total entries`)
      res.json(entries)
    } else {
      // Public view: return only approved entries
      const approvedEntries = entries.filter(entry => entry.approved === true)
      console.log(`Public access: returning ${approvedEntries.length} approved entries out of ${entries.length} total`)
      res.json(approvedEntries)
    }
  } catch (error) {
    console.error('Error fetching entries:', error)
    res.status(500).json({ error: 'Failed to fetch entries' })
  }
})

// DELETE /entry/:id - Delete an entry and associated files
app.delete('/entry/:id', (req, res) => {
  try {
    const entryId = req.params.id

    // Validation
    if (!entryId) {
      return res.status(400).json({ error: 'Entry ID is required' })
    }

    // Check if entry exists
    const entryFilePath = path.join(ENTRIES_DIR, `${entryId}.json`)
    if (!fs.existsSync(entryFilePath)) {
      return res.status(404).json({ error: 'Entry not found' })
    }

    // Read entry to check if it has associated images
    let entryData
    try {
      const entryContent = fs.readFileSync(entryFilePath, 'utf8')
      entryData = JSON.parse(entryContent)
    } catch (error) {
      console.error('Error reading entry file:', error)
      return res.status(500).json({ error: 'Failed to read entry' })
    }

    // Delete associated image files if they exist
    if (entryData.content && Array.isArray(entryData.content)) {
      for (const item of entryData.content) {
        if (item.type === 'image' && item.content) {
          const imageFilePath = path.join(IMAGES_DIR, item.content)
          if (fs.existsSync(imageFilePath)) {
            try {
              fs.unlinkSync(imageFilePath)
              console.log('Deleted image file:', item.content)
            } catch (error) {
              console.error('Error deleting image file:', error)
              // Continue with deletion even if image file deletion fails
            }
          }
        }
      }
    }

    // Delete entry file
    try {
      fs.unlinkSync(entryFilePath)
      console.log('Deleted entry file:', entryId)
    } catch (error) {
      console.error('Error deleting entry file:', error)
      return res.status(500).json({ error: 'Failed to delete entry' })
    }

    // Remove from in-memory cache
    entries = entries.filter(entry => entry.id !== entryId)

    console.log('Entry deleted:', entryId)
    res.json({ success: true, message: 'Entry deleted successfully' })

  } catch (error) {
    console.error('Error deleting entry:', error)
    res.status(500).json({ error: 'Failed to delete entry' })
  }
})

// POST /entry - Create a new entry
app.post('/entry', (req, res) => {
  try {
    const { content, author, position } = req.body

    // Validation
    if (!content || !author || !position) {
      return res.status(400).json({
        error: 'Missing required fields: content, author, position'
      })
    }

    if (!Array.isArray(content) || content.length === 0) {
      return res.status(400).json({
        error: 'Content must be a non-empty array of items'
      })
    }

    // Validate each content item
    for (const item of content) {
      if (!item.type || !item.content) {
        return res.status(400).json({
          error: 'Each content item must have type and content fields'
        })
      }
      if (!['text', 'image'].includes(item.type)) {
        return res.status(400).json({
          error: 'Each content item type must be either "text" or "image"'
        })
      }
    }

    if (!position.x || !position.y || typeof position.x !== 'number' || typeof position.y !== 'number') {
      return res.status(400).json({
        error: 'Position must have valid x and y coordinates as numbers'
      })
    }

    // Reload entries to get current count
    entries = loadEntries()

    // Calculate page number based on current entries count
    const entriesPerPage = 2
    const pageNumber = Math.ceil((entries.length + 1) / entriesPerPage)

    // Generate entry ID
    const entryId = uuidv4()

    // Process content items
    const processedContent = []
    for (let i = 0; i < content.length; i++) {
      const item = content[i]
      if (item.type === 'image') {
        try {
          const imageFilename = saveImage(item.content, `${entryId}_${i}`)
          if (!imageFilename) {
            return res.status(500).json({ error: 'Failed to save image' })
          }
          processedContent.push({
            type: 'image',
            content: imageFilename
          })
        } catch (error) {
          if (error.message === 'Image size exceeds 50MB limit') {
            return res.status(400).json({ error: 'Image size exceeds 50MB limit. Please choose a smaller image.' })
          }
          return res.status(500).json({ error: 'Failed to process image: ' + error.message })
        }
      } else {
        processedContent.push({
          type: 'text',
          content: item.content
        })
      }
    }

    // Create new entry
    const entry = {
      id: entryId,
      content: processedContent,
      author,
      timestamp: new Date().toISOString(),
      pageNumber,
      position,
      approved: false
    }

    console.log(`Creating new entry for review: ${entryId} by ${author}`)

    // Save entry to disk
    if (!saveEntry(entry)) {
      return res.status(500).json({ error: 'Failed to save entry' })
    }

    // Add to in-memory cache
    entries.push(entry)

    console.log('New entry created:', entry)
    res.status(201).json(entry)

  } catch (error) {
    console.error('Error creating entry:', error)
    res.status(500).json({ error: 'Failed to create entry' })
  }
})

// Serve images from storage
app.get('/storage/images/:filename', (req, res) => {
  try {
    const filename = req.params.filename
    const imagePath = path.join(IMAGES_DIR, filename)

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' })
    }

    // Set appropriate content type based on file extension
    const ext = path.extname(filename).toLowerCase()
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }[ext] || 'application/octet-stream'

    res.setHeader('Content-Type', contentType)
    res.sendFile(imagePath)
  } catch (error) {
    console.error('Error serving image:', error)
    res.status(500).json({ error: 'Failed to serve image' })
  }
})

// PUT /entry/:id/approve - Approve an entry (admin only)
app.put('/entry/:id/approve', (req, res) => {
  try {
    const entryId = req.params.id
    const { password } = req.body

    // Validation
    if (!entryId) {
      return res.status(400).json({ error: 'Entry ID is required' })
    }

    if (password !== '20250514') {
      return res.status(401).json({ error: 'Invalid password' })
    }

    // Check if entry exists
    const entryFilePath = path.join(ENTRIES_DIR, `${entryId}.json`)
    if (!fs.existsSync(entryFilePath)) {
      return res.status(404).json({ error: 'Entry not found' })
    }

    // Read and update entry
    let entryData
    try {
      const entryContent = fs.readFileSync(entryFilePath, 'utf8')
      entryData = JSON.parse(entryContent)
    } catch (error) {
      console.error('Error reading entry file:', error)
      return res.status(500).json({ error: 'Failed to read entry' })
    }

    // Update approval status
    entryData.approved = true

    // Save updated entry
    if (!saveEntry(entryData)) {
      return res.status(500).json({ error: 'Failed to update entry' })
    }

    // Update in-memory cache
    const entryIndex = entries.findIndex(entry => entry.id === entryId)
    if (entryIndex !== -1) {
      entries[entryIndex] = entryData
    }

    console.log(`Entry approved: ${entryId} by ${entryData.author}`)
    res.json({ success: true, message: 'Entry approved successfully', entry: entryData })

  } catch (error) {
    console.error('Error approving entry:', error)
    res.status(500).json({ error: 'Failed to approve entry' })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  const entryCount = entries.length
  const approvedCount = entries.filter(entry => entry.approved === true).length
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    entryCount,
    approvedCount,
    storageDir: STORAGE_DIR
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'dist')))
}

// Start server
app.listen(PORT, () => {
  console.log(`Guestbook server running on port ${PORT}`)
  console.log(`Storage directory: ${STORAGE_DIR}`)
  console.log(`Loaded ${entries.length} existing entries`)
  console.log(`API endpoints:`)
  console.log(`  GET    http://localhost:${PORT}/entries`)
  console.log(`  POST   http://localhost:${PORT}/entry`)
  console.log(`  PUT    http://localhost:${PORT}/entry/:id/approve`)
  console.log(`  DELETE http://localhost:${PORT}/entry/:id`)
  console.log(`  GET    http://localhost:${PORT}/images/:filename`)
  console.log(`  GET    http://localhost:${PORT}/health`)
})

export default app
