@echo off
title Open Prisma Studio - EduStack Database Browser
color 0B

echo ========================================================
echo        OPENING PRISMA STUDIO (DATABASE BROWSER)
echo ========================================================
echo.
cd /d "%~dp0"

echo Opening visual database GUI...
echo You can view and edit all Student, Semester, and Upload tables visually.
echo.

npx prisma studio

pause
