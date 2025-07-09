@echo off
echo 🚀 Starting ODD Wheel Frontend Client...

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

echo 🌐 Client will be available at: http://localhost:3000
echo 🔗 Make sure the backend is running at: http://localhost:3001
echo.

npm run dev
