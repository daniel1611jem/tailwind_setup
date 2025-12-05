@echo off
title MMO Account Manager - SIMPLE START
color 0A

echo.
echo ============================================
echo   MMO ACCOUNT MANAGER - SIMPLE START
echo ============================================
echo.
echo Dang khoi dong Backend va Frontend...
echo.

REM Start Backend
echo [1/2] Khoi dong Backend...
start "MMO Backend" cmd /k "cd backend && npm start"
echo OK - Backend dang chay
echo.

REM Wait 3s
timeout /t 3 /nobreak >nul

REM Start Frontend  
echo [2/2] Khoi dong Frontend...
start "MMO Frontend" cmd /k "npm run dev"
echo OK - Frontend dang chay
echo.

REM Wait 5s
timeout /t 5 /nobreak >nul

REM Open browser
echo Mo trinh duyet...
@REM start http://localhost:5173
@REM timeout /t 1 /nobreak >nul
start http://localhost:3000

echo.
echo ============================================
echo   HOAN TAT!
echo ============================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173 hoac :3000
echo.
echo Dong cua so nay de tiep tuc...
echo.
pause
