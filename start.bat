@echo off
title EduStack - Student Analytics Dashboard
color 0A

echo ========================================================
echo        WELCOME TO EDUSTACK DATA & ANALYTICS DASHBOARD
echo ========================================================
echo.
echo Starting EduStack development server...
echo Project Location: %~dp0
echo.

cd /d "%~dp0"

echo Opening EduStack Dashboard in your browser (http://localhost:3000)...
start http://localhost:3000

echo.
echo Running Next.js server (npm run dev)...
echo Press Ctrl+C at any time to stop the server.
echo --------------------------------------------------------
npm run dev

pause
