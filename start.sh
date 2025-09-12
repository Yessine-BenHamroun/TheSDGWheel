#!/bin/bash

# Railway deployment script for SDG Wheel application
# This script builds and starts both the client and server

echo "🚀 Starting SDG Wheel deployment..."

# Set default port if not provided
export PORT=${PORT:-3001}

# Check if we're in development or production
if [ "$NODE_ENV" = "production" ]; then
    echo "📦 Production build starting..."
    
    # Install server dependencies
    echo "Installing server dependencies..."
    cd Server
    npm ci --only=production
    
    # Install client dependencies and build
    echo "Installing client dependencies and building..."
    cd ../Client
    npm ci
    npm run build
    
    # Copy built client files to server public directory (if needed)
    if [ -d "dist" ]; then
        echo "Copying built client files..."
        mkdir -p ../Server/public
        cp -r dist/* ../Server/public/
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
    
    # In Railway, even in dev mode, we should run production-like setup
    if [ "$RAILWAY_ENVIRONMENT" ]; then
        echo "🚂 Railway environment detected, running production setup..."
        npm run build
        cd ../Server
        npm start
    else
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
fi