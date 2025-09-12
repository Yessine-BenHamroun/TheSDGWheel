#!/bin/bash

# Railway deployment script for SDG Wheel application
# This script builds and starts both the client and server

echo "🚀 Starting SDG Wheel deployment..."

# Set default port if not provided
export PORT=${PORT:-3001}

# Always treat Railway as production
if [ "$RAILWAY_ENVIRONMENT" ] || [ "$NODE_ENV" = "production" ]; then
    echo "📦 Production build starting..."
    
    # Install server dependencies
    echo "Installing server dependencies..."
    cd Server
    npm install --omit=dev
    
    # Install client dependencies and build
    echo "Installing client dependencies and building..."
    cd ../Client
    npm install
    
    # Build the client
    echo "Building client application..."
    npm run build
    
    # Copy built client files to server public directory
    if [ -d "dist" ]; then
        echo "Copying built client files..."
        mkdir -p ../Server/public
        cp -r dist/* ../Server/public/
    elif [ -d "build" ]; then
        echo "Copying built client files..."
        mkdir -p ../Server/public
        cp -r build/* ../Server/public/
    fi
    
    # Start the server (client will be served as static files)
    echo "🎯 Starting production server on port $PORT..."
    cd ../Server
    npm start
    
else
    echo "🔧 Development mode starting..."
    
    # Install dependencies for both client and server
    echo "Installing server dependencies..."
    cd Server
    npm install
    
    echo "Installing client dependencies..."
    cd ../Client
    npm install
    
    echo "🎯 Starting development servers..."
    
    # Start server in background
    cd ../Server
    npm run dev &
    SERVER_PID=$!
    
    # Start client
    cd ../Client
    npm run dev &
    CLIENT_PID=$!
    
    # Wait for both processes
    wait $SERVER_PID $CLIENT_PID
fi