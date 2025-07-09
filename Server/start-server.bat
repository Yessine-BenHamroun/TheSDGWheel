@echo off
echo 🚀 Starting ODD Wheel Backend Server...

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

echo 🌐 Server will be available at: http://localhost:3001
echo 📊 Health check: http://localhost:3001/api/health
echo 📖 API Info: http://localhost:3001/api
echo.

npm run dev
