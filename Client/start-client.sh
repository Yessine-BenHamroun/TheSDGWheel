#!/bin/bash

echo "🚀 Starting ODD Wheel Frontend Client..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🌐 Client will be available at: http://localhost:3000"
echo "🔗 Make sure the backend is running at: http://localhost:3001"
echo ""

npm run dev
