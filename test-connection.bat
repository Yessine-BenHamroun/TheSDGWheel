@echo off
REM Test script to verify frontend-backend connection

echo 🔍 Testing Frontend-Backend Connection...

REM Test if backend is running
echo 📡 Testing backend health check...
curl -s -w "%%{http_code}" -o nul http://localhost:3001/api/health > temp_response.txt
set /p response=<temp_response.txt
del temp_response.txt

if "%response%"=="200" (
    echo ✅ Backend is running correctly on port 3001
) else (
    echo ❌ Backend is not responding ^(HTTP %response%^)
    echo    Make sure to run 'npm run dev' in the Server directory
    pause
    exit /b 1
)

REM Test if frontend is running
echo 🖥️  Testing frontend...
curl -s -w "%%{http_code}" -o nul http://localhost:3000 > temp_response2.txt
set /p frontend_response=<temp_response2.txt
del temp_response2.txt

if "%frontend_response%"=="200" (
    echo ✅ Frontend is running correctly on port 3000
) else (
    echo ❌ Frontend is not responding ^(HTTP %frontend_response%^)
    echo    Make sure to run 'npm run dev' in the Client directory
    pause
    exit /b 1
)

echo 🎉 All systems are working correctly!
echo.
echo 📋 Next steps:
echo    1. Open http://localhost:3000 in your browser
echo    2. Try registering a new user
echo    3. Login and access the dashboard
pause
