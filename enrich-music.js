#!/usr/bin/env node

/**
 * Music Entry Enrichment Script
 *
 * This script processes all guestbook entries that contain music (YouTube URLs)
 * and enriches them with:
 * - Downloaded MP3 audio files
 * - Extracted metadata (title, artist, duration)
 * - Thumbnail images
 *
 * Usage:
 *   node enrich-music.js [storage-dir]
 *
 * Example:
 *   node enrich-music.js ./storage
 *   node enrich-music.js /var/storage  # for production data
 */

import * as fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Get storage directory from command line or use default
const STORAGE_DIR = process.argv[2] || path.join(process.cwd(), 'storage')
const YEAR_DIR = path.join(STORAGE_DIR, '2026')
const ENTRIES_DIR = path.join(YEAR_DIR, 'entries')
const MUSIC_DIR = path.join(YEAR_DIR, 'music')

// yt-dlp path - adjust if needed
const YTDLP_PATH = process.platform === 'darwin'
  ? '/opt/homebrew/bin/yt-dlp'
  : 'yt-dlp' // Use system yt-dlp on Linux

console.log('🎵 Music Entry Enrichment Script')
console.log('=================================')
console.log(`Storage directory: ${STORAGE_DIR}`)
console.log(`Entries directory: ${ENTRIES_DIR}`)
console.log(`Music directory: ${MUSIC_DIR}`)
console.log(`yt-dlp path: ${YTDLP_PATH}`)
console.log('')

// Ensure music directory exists
if (!fs.existsSync(MUSIC_DIR)) {
  console.log(`Creating music directory: ${MUSIC_DIR}`)
  fs.mkdirSync(MUSIC_DIR, { recursive: true })
}

// Process a single YouTube URL
async function processYouTubeAudio(youtubeUrl, youtubeId) {
  const outputPath = path.join(MUSIC_DIR, `${youtubeId}.mp3`)
  const thumbnailPath = path.join(MUSIC_DIR, `${youtubeId}.jpg`)

  let title = 'Unknown Song'
  let artist = 'Unknown Artist'
  let duration = 0

  console.log(`  📥 Downloading audio: ${youtubeId}`)

  // Step 1: Download audio
  try {
    if (fs.existsSync(outputPath)) {
      console.log(`  ✓ Audio already exists, skipping download`)
    } else {
      const downloadCmd = `"${YTDLP_PATH}" --extract-audio --audio-format mp3 --audio-quality 0 -o "${outputPath.replace('.mp3', '.%(ext)s')}" "${youtubeUrl}"`
      await execAsync(downloadCmd, { timeout: 120000 }) // 2 minute timeout
      console.log(`  ✓ Audio downloaded`)
    }
  } catch (error) {
    console.error(`  ✗ Failed to download audio:`, error.message)
    throw new Error('Audio download failed')
  }

  // Step 2: Extract metadata
  try {
    console.log(`  📋 Extracting metadata...`)
    const metadataCmd = `"${YTDLP_PATH}" --dump-json --no-download "${youtubeUrl}"`
    const { stdout } = await execAsync(metadataCmd, { timeout: 30000 })
    const metadata = JSON.parse(stdout)

    title = metadata.title || title
    artist = metadata.uploader || metadata.channel || artist
    duration = metadata.duration || duration

    // Try to parse "Artist - Song" format
    if (title.includes(' - ')) {
      const parts = title.split(' - ')
      artist = parts[0].trim()
      title = parts.slice(1).join(' - ').trim()
    }

    console.log(`  ✓ Metadata: ${artist} - ${title}`)
  } catch (error) {
    console.warn(`  ⚠ Failed to extract metadata, using defaults`)
  }

  // Step 3: Download thumbnail
  try {
    if (fs.existsSync(thumbnailPath)) {
      console.log(`  ✓ Thumbnail already exists`)
    } else {
      console.log(`  🖼️  Downloading thumbnail...`)
      const thumbnailCmd = `"${YTDLP_PATH}" --write-thumbnail --skip-download --convert-thumbnails jpg -o "${thumbnailPath.replace('.jpg', '')}" "${youtubeUrl}"`
      await execAsync(thumbnailCmd, { timeout: 30000 })
      console.log(`  ✓ Thumbnail downloaded`)
    }
  } catch (error) {
    console.warn(`  ⚠ Failed to download thumbnail`)
  }

  return {
    audioPath: `/music/${youtubeId}.mp3`,
    thumbnailPath: fs.existsSync(thumbnailPath) ? `/music/${youtubeId}.jpg` : null,
    title,
    artist,
    duration
  }
}

// Main processing function
async function enrichAllEntries() {
  if (!fs.existsSync(ENTRIES_DIR)) {
    console.error(`❌ Entries directory not found: ${ENTRIES_DIR}`)
    process.exit(1)
  }

  const entryFiles = fs.readdirSync(ENTRIES_DIR).filter(file => file.endsWith('.json'))
  console.log(`Found ${entryFiles.length} entries\n`)

  let processedCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const filename of entryFiles) {
    const filePath = path.join(ENTRIES_DIR, filename)

    try {
      const data = fs.readFileSync(filePath, 'utf8')
      const entry = JSON.parse(data)

      let needsUpdate = false

      // Check if entry has music content that needs processing
      for (let i = 0; i < entry.content.length; i++) {
        const item = entry.content[i]

        if (item.type === 'music' && item.content.youtubeUrl) {
          const music = item.content

          // Skip if already processed
          if (music.processed === true && music.audioPath) {
            console.log(`⏭️  Skipping ${entry.id} - already processed`)
            skippedCount++
            continue
          }

          console.log(`\n🎵 Processing entry: ${entry.id}`)
          console.log(`   Author: ${entry.author}`)
          console.log(`   URL: ${music.youtubeUrl}`)

          try {
            const result = await processYouTubeAudio(music.youtubeUrl, music.youtubeId)

            // Update the entry with processed data
            entry.content[i].content = {
              ...music,
              songTitle: result.title,
              artist: result.artist,
              albumArtUrl: result.thumbnailPath || music.albumArtUrl,
              audioPath: result.audioPath,
              duration: result.duration,
              processed: true
            }

            needsUpdate = true
            processedCount++
            console.log(`  ✅ Entry enriched successfully\n`)

          } catch (error) {
            console.error(`  ❌ Failed to process: ${error.message}\n`)
            errorCount++
          }
        }
      }

      // Save updated entry
      if (needsUpdate) {
        fs.writeFileSync(filePath, JSON.stringify(entry, null, 2))
        console.log(`  💾 Entry saved: ${filename}`)
      }

    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error.message)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary:')
  console.log(`   ✅ Processed: ${processedCount}`)
  console.log(`   ⏭️  Skipped: ${skippedCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log('='.repeat(50))
}

// Run the script
enrichAllEntries().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
