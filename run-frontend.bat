@echo off
title DealFlow360 - Next.js Frontend (Port 3000)
cd /d "%~dp0frontend"

echo ===================================================
echo   DealFlow360 - Starting Next.js Frontend...
echo   URL: http://localhost:3000
echo ===================================================

npm run dev
pause
