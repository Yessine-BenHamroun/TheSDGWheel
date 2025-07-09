#!/bin/bash

echo "🚀 Starting ODD Wheel Backend Server..."

# Check if MongoDB is running
if ! pgrep mongod > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   - Windows: Start MongoDB as a service or run 'mongod' command"
    echo "   - macOS: brew services start mongodb-community"
    echo "   - Linux: sudo systemctl start mongod"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🌐 Server will be available at: http://localhost:3001"
echo "📊 Health check: http://localhost:3001/api/health"
echo "📖 API Info: http://localhost:3001/api"
echo ""

npm run dev
