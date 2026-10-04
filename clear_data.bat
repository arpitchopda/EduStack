@echo off
title Clear EduStack Database Data
color 0C

echo ========================================================
echo         CLEARING ALL EDUSTACK DATABASE RECORDS
echo ========================================================
echo.
cd /d "%~dp0"

node clear_db.js

echo.
echo Complete! You can now test fresh file uploads on your dashboard.
pause
