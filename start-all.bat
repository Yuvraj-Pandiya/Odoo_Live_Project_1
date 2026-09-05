@echo off
echo ===================================================
echo   Launching DealFlow360 Full Stack
echo   - Backend:  http://localhost:8080
echo   - Frontend: http://localhost:3000
echo ===================================================

start "DealFlow360 Backend" cmd /c "%~dp0run-backend.bat"
start "DealFlow360 Frontend" cmd /c "%~dp0run-frontend.bat"

echo.
echo Both servers are starting up in separate windows!
echo Backend will be ready at http://localhost:8080/api
echo Frontend will be ready at http://localhost:3000
echo.
pause
