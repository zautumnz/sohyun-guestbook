import express from 'express'
import * as fs from 'fs'
import path from 'path'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' })) // Reduced from 90mb - no images in v2.0
app.use(express.urlencoded({ extended: true }))

const isProd = process.env.NODE_ENV === 'production'
// Storage directories - v2.0 uses 2026 subdirectory
const STORAGE_DIR = path.join(isProd ? '/var/storage' : process.cwd(), 'storage')
const YEAR_DIR = path.join(STORAGE_DIR, '2026')
const ENTRIES_DIR = path.join(YEAR_DIR, 'entries')
const REMOVED_DIR = path.join(YEAR_DIR, 'removed')
const REMOVED_ENTRIES_DIR = path.join(REMOVED_DIR, 'entries')

// Ensure storage directories exist
const ensureDirectories = () => {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
  }
  if (!fs.existsSync(YEAR_DIR)) {
    fs.mkdirSync(YEAR_DIR, { recursive: true })
  }
  if (!fs.existsSync(ENTRIES_DIR)) {
    fs.mkdirSync(ENTRIES_DIR, { recursive: true })
  }
  if (!fs.existsSync(REMOVED_DIR)) {
    fs.mkdirSync(REMOVED_DIR, { recursive: true })
  }
  if (!fs.existsSync(REMOVED_ENTRIES_DIR)) {
    fs.mkdirSync(REMOVED_ENTRIES_DIR, { recursive: true })
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

// Helper function to validate YouTube URL and extract video ID
const extractYouTubeId = (url) => {
  try {
    // Support various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  } catch (error) {
    console.error('Error extracting YouTube ID:', error)
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
    if (password === 'uVSM3L4LZ29vLlRMsM5u1jxPTPX1FYU') {
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

// DELETE /entry/:id - Delete an entry (disabled for public use)
app.delete('/entry/:id', (req, res) => {
  // Disabled - use reject endpoint instead
  return res.status(401).json({ error: 'Delete disabled - use admin reject endpoint' })
})

// POST /entry - Create a new entry (v2.0: music + text, no images)
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

    // v2.0: Validate that entry has at least music OR text (cannot be blank)
    const hasMusic = content.some(item => item.type === 'music')
    const hasText = content.some(item => item.type === 'text')

    if (!hasMusic && !hasText) {
      return res.status(400).json({
        error: 'Entry must have at least one music or text item'
      })
    }

    // Validate each content item
    const processedContent = []
    for (const item of content) {
      if (!item.type || !item.content) {
        return res.status(400).json({
          error: 'Each content item must have type and content fields'
        })
      }

      // v2.0: Only 'text' and 'music' allowed (no images)
      if (!['text', 'music'].includes(item.type)) {
        return res.status(400).json({
          error: 'Each content item type must be either "text" or "music"'
        })
      }

      if (item.type === 'music') {
        // Validate music content structure
        if (typeof item.content !== 'object') {
          return res.status(400).json({
            error: 'Music content must be an object with song details'
          })
        }

        const { youtubeUrl, songTitle, artist, albumArtUrl } = item.content

        // YouTube URL is required for music entries
        if (!youtubeUrl) {
          return res.status(400).json({
            error: 'Music entries must have a YouTube URL'
          })
        }

        // Extract and validate YouTube video ID
        const youtubeId = extractYouTubeId(youtubeUrl)
        if (!youtubeId) {
          return res.status(400).json({
            error: 'Invalid YouTube URL format'
          })
        }

        // Store music metadata
        processedContent.push({
          type: 'music',
          content: {
            youtubeUrl,
            youtubeId,
            songTitle: songTitle || '',
            artist: artist || '',
            albumArtUrl: albumArtUrl || ''
          }
        })
      } else {
        // Text content
        if (typeof item.content !== 'string' || !item.content.trim()) {
          return res.status(400).json({
            error: 'Text content must be a non-empty string'
          })
        }
        processedContent.push({
          type: 'text',
          content: item.content
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

    // Create new entry (v2.0: starts as unapproved)
    const entry = {
      id: entryId,
      content: processedContent,
      author,
      timestamp: new Date().toISOString(),
      pageNumber,
      position,
      approved: false  // v2.0: requires admin approval
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

// v2.0: Image serving removed - no images in v2

// PUT /entry/:id/approve - Approve an entry (admin only)
app.put('/entry/:id/approve', (req, res) => {
  try {
    const entryId = req.params.id
    const { password } = req.body

    // Validation
    if (!entryId) {
      return res.status(400).json({ error: 'Entry ID is required' })
    }

    if (password !== 'uVSM3L4LZ29vLlRMsM5u1jxPTPX1FYU') {
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

// PUT /entry/:id/reject - Reject an entry and move to removed directory (admin only)
app.put('/entry/:id/reject', (req, res) => {
  try {
    const entryId = req.params.id
    const { password } = req.body

    // Validation
    if (!entryId) {
      return res.status(400).json({ error: 'Entry ID is required' })
    }

    if (password !== 'uVSM3L4LZ29vLlRMsM5u1jxPTPX1FYU') {
      return res.status(401).json({ error: 'Invalid password' })
    }

    // Check if entry exists
    const entryFilePath = path.join(ENTRIES_DIR, `${entryId}.json`)
    if (!fs.existsSync(entryFilePath)) {
      return res.status(404).json({ error: 'Entry not found' })
    }

    // Read entry data for logging
    let entryData
    try {
      const entryContent = fs.readFileSync(entryFilePath, 'utf8')
      entryData = JSON.parse(entryContent)
    } catch (error) {
      console.error('Error reading entry file:', error)
      return res.status(500).json({ error: 'Failed to read entry' })
    }

    // v2.0: No image cleanup needed - only moving entry JSON file

    // Move entry file to removed directory
    const removedEntryPath = path.join(REMOVED_ENTRIES_DIR, `${entryId}.json`)
    try {
      fs.renameSync(entryFilePath, removedEntryPath)
      console.log('Moved entry file to removed:', entryId)
    } catch (error) {
      console.error('Error moving entry file:', error)
      return res.status(500).json({ error: 'Failed to move entry' })
    }

    // Remove from in-memory cache
    entries = entries.filter(entry => entry.id !== entryId)

    console.log(`Entry rejected and moved to removed: ${entryId} by ${entryData.author}`)
    res.json({ success: true, message: 'Entry rejected and moved to removed directory' })

  } catch (error) {
    console.error('Error rejecting entry:', error)
    res.status(500).json({ error: 'Failed to reject entry' })
  }
})

// GET /removed/entries - Get all removed entries (admin only)
app.get('/removed/entries', (req, res) => {
  try {
    const password = req.query.pw
    if (password !== 'uVSM3L4LZ29vLlRMsM5u1jxPTPX1FYU') {
      return res.status(401).json({ error: 'Invalid password' })
    }

    // Load removed entries from disk
    const removedEntryFiles = fs.readdirSync(REMOVED_ENTRIES_DIR).filter(file => file.endsWith('.json'))
    const removedEntries = removedEntryFiles.map(file => {
      const filePath = path.join(REMOVED_ENTRIES_DIR, file)
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    console.log(`Admin access: returning ${removedEntries.length} removed entries`)
    res.json(removedEntries)
  } catch (error) {
    console.error('Error fetching removed entries:', error)
    res.status(500).json({ error: 'Failed to fetch removed entries' })
  }
})

// PUT /removed/entry/:id/restore - Restore a removed entry (admin only)
app.put('/removed/entry/:id/restore', (req, res) => {
  try {
    const entryId = req.params.id
    const { password } = req.body

    // Validation
    if (!entryId) {
      return res.status(400).json({ error: 'Entry ID is required' })
    }

    if (password !== 'uVSM3L4LZ29vLlRMsM5u1jxPTPX1FYU') {
      return res.status(401).json({ error: 'Invalid password' })
    }

    // Check if removed entry exists
    const removedEntryPath = path.join(REMOVED_ENTRIES_DIR, `${entryId}.json`)
    if (!fs.existsSync(removedEntryPath)) {
      return res.status(404).json({ error: 'Removed entry not found' })
    }

    // Read removed entry
    let entryData
    try {
      const entryContent = fs.readFileSync(removedEntryPath, 'utf8')
      entryData = JSON.parse(entryContent)
    } catch (error) {
      console.error('Error reading removed entry file:', error)
      return res.status(500).json({ error: 'Failed to read removed entry' })
    }

    // v2.0: No image restoration needed - only moving entry JSON file

    // Restore entry file from removed directory
    const entryFilePath = path.join(ENTRIES_DIR, `${entryId}.json`)
    try {
      fs.renameSync(removedEntryPath, entryFilePath)
      console.log('Restored entry file from removed:', entryId)
    } catch (error) {
      console.error('Error restoring entry file:', error)
      return res.status(500).json({ error: 'Failed to restore entry' })
    }

    // Add back to in-memory cache
    entries.push(entryData)
    entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    console.log(`Entry restored from removed: ${entryId} by ${entryData.author}`)
    res.json({ success: true, message: 'Entry restored successfully', entry: entryData })

  } catch (error) {
    console.error('Error restoring entry:', error)
    res.status(500).json({ error: 'Failed to restore entry' })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  const entryCount = entries.length
  const approvedCount = entries.filter(entry => entry.approved === true).length

  // Count removed entries
  let removedCount = 0
  try {
    removedCount = fs.readdirSync(REMOVED_ENTRIES_DIR).filter(file => file.endsWith('.json')).length
  } catch (error) {
    // Directory might not exist yet
    removedCount = 0
  }

  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    entryCount,
    approvedCount,
    removedCount,
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
  console.log(`Guestbook v2.0 server running on port ${PORT}`)
  console.log(`Storage directory: ${YEAR_DIR}`)
  console.log(`Loaded ${entries.length} existing entries`)
  console.log(`API endpoints:`)
  console.log(`  GET    http://localhost:${PORT}/entries (public - approved only)`)
  console.log(`  GET    http://localhost:${PORT}/entries?pw=PASSWORD (admin - all entries)`)
  console.log(`  POST   http://localhost:${PORT}/entry`)
  console.log(`  PUT    http://localhost:${PORT}/entry/:id/approve`)
  console.log(`  PUT    http://localhost:${PORT}/entry/:id/reject`)
  console.log(`  DELETE http://localhost:${PORT}/entry/:id`)
  console.log(`  GET    http://localhost:${PORT}/removed/entries?pw=PASSWORD`)
  console.log(`  PUT    http://localhost:${PORT}/removed/entry/:id/restore`)
  console.log(`  GET    http://localhost:${PORT}/health`)
})

export default app
