#!/usr/bin/env node

const API_BASE_URL = 'http://localhost:3001';

async function testHealthEndpoint() {
  console.log('🔍 Testing health endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check passed:', data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testGetEntries() {
  console.log('🔍 Testing GET /entries...');
  try {
    const response = await fetch(`${API_BASE_URL}/entries`);
    const data = await response.json();
    console.log('✅ GET /entries passed:', data);
    return data;
  } catch (error) {
    console.error('❌ GET /entries failed:', error.message);
    return [];
  }
}

async function testCreateEntry() {
  console.log('🔍 Testing POST /entry...');
  
  const testEntry = {
    type: 'text',
    content: 'This is a test entry from the API test script!',
    author: 'Test Bot',
    position: { x: 50, y: 50 }
  };

  try {
    const response = await fetch(`${API_BASE_URL}/entry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEntry),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ POST /entry passed:', data);
    return data;
  } catch (error) {
    console.error('❌ POST /entry failed:', error.message);
    return null;
  }
}

async function testInvalidEntry() {
  console.log('🔍 Testing POST /entry with invalid data...');
  
  const invalidEntry = {
    type: 'invalid',
    content: '',
    author: '',
  };

  try {
    const response = await fetch(`${API_BASE_URL}/entry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidEntry),
    });

    if (response.ok) {
      console.log('❌ Expected validation error but request succeeded');
      return false;
    }

    const errorData = await response.json();
    console.log('✅ Validation working correctly:', errorData.error);
    return true;
  } catch (error) {
    console.error('❌ Error testing validation:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting API tests...\n');

  // Test health endpoint first
  const healthOk = await testHealthEndpoint();
  if (!healthOk) {
    console.log('\n💡 Make sure the server is running with: npm run server');
    process.exit(1);
  }

  console.log('');

  // Test getting entries (should be empty initially)
  const initialEntries = await testGetEntries();
  console.log('');

  // Test creating a valid entry
  const createdEntry = await testCreateEntry();
  console.log('');

  // Test validation with invalid entry
  await testInvalidEntry();
  console.log('');

  // Test getting entries again (should have our new entry)
  console.log('🔍 Testing GET /entries after creating entry...');
  const finalEntries = await testGetEntries();
  
  console.log('\n📊 Test Summary:');
  console.log(`- Initial entries: ${initialEntries.length}`);
  console.log(`- Final entries: ${finalEntries.length}`);
  
  if (createdEntry && finalEntries.length === initialEntries.length + 1) {
    console.log('✅ All tests passed! API is working correctly.');
  } else {
    console.log('❌ Some tests may have failed. Check the output above.');
  }
}

runAllTests().catch(console.error);