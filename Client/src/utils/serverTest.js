// Test script to check if the server is running
// Run this in the browser console or create a simple HTML file

async function testServerConnection() {
  try {
    console.log('Testing server connection...')
    
    const response = await fetch('http://localhost:3001/api/health')
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Server is running!', data)
      return true
    } else {
      console.log('❌ Server responded with error:', response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message)
    console.log('🔧 Make sure to:')
    console.log('1. Start MongoDB: mongod')
    console.log('2. Start the backend server: cd Server && npm run dev')
    return false
  }
}

// Run the test
testServerConnection()

export default testServerConnection
