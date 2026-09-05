@echo off
title DealFlow360 - Spring Boot Backend (Port 8080)
cd /d "%~dp0backend"

set DB_URL=jdbc:postgresql://localhost:5432/dealflow360?stringtype=unspecified
set DB_USERNAME=postgres
set DB_PASSWORD=1301
set JWT_SECRET=dealflow360-super-secret-key-must-be-at-least-32-chars-long!
set SERVER_PORT=8080

echo ===================================================
echo   DealFlow360 - Starting Spring Boot Backend...
echo   Port: 8080 ^| Database: postgresql://localhost:5432/dealflow360
echo ===================================================

if exist "%USERPROFILE%\maven\apache-maven-3.9.9\bin\mvn.cmd" (
    "%USERPROFILE%\maven\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
) else (
    mvn spring-boot:run
)
pause
