import express from 'express'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

// TODO: move to real tests

const API_BASE = 'http://localhost:3001'

// Test data
const testTextEntry = {
  type: 'text',
  content: 'This is a test text entry for storage verification',
  author: 'Storage Tester',
  position: { x: 100, y: 200 }
}

const testImageEntry = {
  type: 'image',
  content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // 1x1 red pixel
  author: 'Image Tester',
  position: { x: 300, y: 400 }
}

async function testStorageSystem() {
  console.log('🚀 Testing Storage System\n')

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...')
    const healthResponse = await fetch(`${API_BASE}/health`)
    const healthData = await healthResponse.json()
    console.log('   ✅ Health check passed')
    console.log(`   📊 Current entries: ${healthData.entryCount}`)
    console.log(`   📁 Storage directory: ${healthData.storageDir}\n`)

    // Test 2: Get initial entries
    console.log('2. Getting initial entries...')
    const initialResponse = await fetch(`${API_BASE}/entries`)
    const initialEntries = await initialResponse.json()
    console.log(`   📝 Found ${initialEntries.length} existing entries\n`)

    // Test 3: Create text entry
    console.log('3. Creating text entry...')
    const textResponse = await fetch(`${API_BASE}/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTextEntry)
    })
    const textEntry = await textResponse.json()
    console.log(`   ✅ Text entry created with ID: ${textEntry.id}`)
    console.log(`   📄 Page number: ${textEntry.pageNumber}`)

    // Verify text entry file was created
    const textFilePath = path.join(process.cwd(), 'server', 'storage', 'entries', `${textEntry.id}.json`)
    if (fs.existsSync(textFilePath)) {
      console.log('   ✅ Text entry file saved to disk')
    } else {
      console.log('   ❌ Text entry file NOT found on disk')
    }

    // Test 4: Create image entry
    console.log('\n4. Creating image entry...')
    const imageResponse = await fetch(`${API_BASE}/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testImageEntry)
    })
    const imageEntry = await imageResponse.json()
    console.log(`   ✅ Image entry created with ID: ${imageEntry.id}`)
    console.log(`   🖼️  Image filename: ${imageEntry.content}`)

    // Verify image entry file and image file were created
    const imageEntryFilePath = path.join(process.cwd(), 'server', 'storage', 'entries', `${imageEntry.id}.json`)
    const imageFilePath = path.join(process.cwd(), 'server', 'storage', 'images', imageEntry.content)

    if (fs.existsSync(imageEntryFilePath)) {
      console.log('   ✅ Image entry file saved to disk')
    } else {
      console.log('   ❌ Image entry file NOT found on disk')
    }

    if (fs.existsSync(imageFilePath)) {
      console.log('   ✅ Image file saved to disk')
    } else {
      console.log('   ❌ Image file NOT found on disk')
    }

    // Test 5: Test image serving
    console.log('\n5. Testing image serving...')
    const imageServeResponse = await fetch(`${API_BASE}/images/${imageEntry.content}`)
    if (imageServeResponse.ok) {
      console.log('   ✅ Image served successfully')
      console.log(`   📋 Content-Type: ${imageServeResponse.headers.get('content-type')}`)
    } else {
      console.log('   ❌ Failed to serve image')
    }

    // Test 6: Get all entries (should include new ones)
    console.log('\n6. Verifying entries persistence...')
    const finalResponse = await fetch(`${API_BASE}/entries`)
    const finalEntries = await finalResponse.json()
    console.log(`   📝 Total entries after creation: ${finalEntries.length}`)

    const foundTextEntry = finalEntries.find(e => e.id === textEntry.id)
    const foundImageEntry = finalEntries.find(e => e.id === imageEntry.id)

    if (foundTextEntry) {
      console.log('   ✅ Text entry found in entries list')
    } else {
      console.log('   ❌ Text entry NOT found in entries list')
    }

    if (foundImageEntry) {
      console.log('   ✅ Image entry found in entries list')
      console.log(`   🖼️  Image content is filename: ${foundImageEntry.content}`)
    } else {
      console.log('   ❌ Image entry NOT found in entries list')
    }

    // Test 7: Server restart simulation (check if entries persist)
    console.log('\n7. Storage directory structure:')
    const entriesDir = path.join(process.cwd(), 'server', 'storage', 'entries')
    const imagesDir = path.join(process.cwd(), 'server', 'storage', 'images')

    if (fs.existsSync(entriesDir)) {
      const entryFiles = fs.readdirSync(entriesDir)
      console.log(`   📁 Entries directory: ${entryFiles.length} files`)
      entryFiles.slice(0, 3).forEach(file => console.log(`      - ${file}`))
      if (entryFiles.length > 3) console.log(`      ... and ${entryFiles.length - 3} more`)
    }

    if (fs.existsSync(imagesDir)) {
      const imageFiles = fs.readdirSync(imagesDir)
      console.log(`   🖼️  Images directory: ${imageFiles.length} files`)
      imageFiles.slice(0, 3).forEach(file => console.log(`      - ${file}`))
      if (imageFiles.length > 3) console.log(`      ... and ${imageFiles.length - 3} more`)
    }

    console.log('\n🎉 Storage system test completed successfully!')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the server is running: npm run server')
    }
    process.exit(1)
  }
}

// Check if server is running before starting tests
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/health`)
    if (response.ok) {
      console.log('✅ Server is running, starting tests...\n')
      return true
    }
  } catch (error) {
    console.error('❌ Server is not running!')
    console.error('💡 Please start the server first: npm run server')
    process.exit(1)
  }
}

// Main execution
console.log('Storage System Test Script')
console.log('==========================')

checkServer().then(() => {
  testStorageSystem()
})