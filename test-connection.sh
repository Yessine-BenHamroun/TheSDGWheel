#!/bin/bash

# Test script to verify frontend-backend connection

echo "🔍 Testing Frontend-Backend Connection..."

# Test if backend is running
echo "📡 Testing backend health check..."
response=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3001/api/health)

if [ "$response" = "200" ]; then
    echo "✅ Backend is running correctly on port 3001"
else
    echo "❌ Backend is not responding (HTTP $response)"
    echo "   Make sure to run 'npm run dev' in the Server directory"
    exit 1
fi

# Test if frontend is running
echo "🖥️  Testing frontend..."
frontend_response=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000)

if [ "$frontend_response" = "200" ]; then
    echo "✅ Frontend is running correctly on port 3000"
else
    echo "❌ Frontend is not responding (HTTP $frontend_response)"
    echo "   Make sure to run 'npm run dev' in the Client directory"
    exit 1
fi

echo "🎉 All systems are working correctly!"
echo ""
echo "📋 Next steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Try registering a new user"
echo "   3. Login and access the dashboard"
