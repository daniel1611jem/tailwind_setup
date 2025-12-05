@echo off
chcp 65001 >nul
title MMO Account Manager - Khởi động
color 0A

echo ========================================
echo   MMO ACCOUNT MANAGER - AUTO START
echo ========================================
echo.

REM Kiểm tra Node.js
echo [1/6] Kiểm tra Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ❌ KHÔNG TÌM THẤY NODE.JS!
    echo.
    echo Vui lòng cài đặt Node.js từ: https://nodejs.org
    echo.
    pause
    exit /b 1
)
echo ✓ Node.js đã được cài đặt
node --version
echo.

REM Kiểm tra npm
echo [2/6] Kiểm tra npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ❌ KHÔNG TÌM THẤY NPM!
    pause
    exit /b 1
)
echo ✓ npm đã được cài đặt
npm --version
echo.

REM Kiểm tra thư mục backend
if not exist "backend\" (
    color 0C
    echo ❌ KHÔNG TÌM THẤY THƯ MỤC BACKEND!
    echo.
    echo Đảm bảo bạn đang chạy script từ thư mục gốc của project
    echo.
    pause
    exit /b 1
)

REM Cài đặt dependencies cho Backend
echo [3/6] Kiểm tra và cài đặt Backend dependencies...
cd backend
if not exist "node_modules\" (
    echo ⏳ Đang cài đặt Backend packages...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo ❌ Lỗi khi cài đặt Backend dependencies!
        cd ..
        pause
        exit /b 1
    )
    echo ✓ Backend dependencies đã được cài đặt
) else (
    echo ✓ Backend dependencies đã tồn tại
)
cd ..
echo.

REM Cài đặt dependencies cho Frontend
echo [4/6] Kiểm tra và cài đặt Frontend dependencies...
if not exist "node_modules\" (
    echo ⏳ Đang cài đặt Frontend packages...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo ❌ Lỗi khi cài đặt Frontend dependencies!
        pause
        exit /b 1
    )
    echo ✓ Frontend dependencies đã được cài đặt
) else (
    echo ✓ Frontend dependencies đã tồn tại
)
echo.

REM Khởi động Backend
echo [5/6] Khởi động Backend server...
cd backend
start "MMO Backend" cmd /k "title MMO Backend Server && color 0B && npm start"
cd ..
echo ✓ Backend server đang khởi động...
echo   URL: http://localhost:5000
echo.

REM Đợi Backend khởi động
echo ⏳ Đợi Backend khởi động (3 giây)...
timeout /t 3 /nobreak >nul
echo.

REM Khởi động Frontend
echo [6/6] Khởi động Frontend...
start "MMO Frontend" cmd /k "title MMO Frontend Dev Server && color 0E && npm run dev"
echo ✓ Frontend dev server đang khởi động...
echo   URL: http://localhost:3000 hoặc http://localhost:5173
echo.

REM Đợi Frontend khởi động
echo ⏳ Đợi Frontend khởi động (5 giây)...
timeout /t 5 /nobreak >nul
echo.

REM Mở trình duyệt
echo 🌐 Mở trình duyệt...
timeout /t 2 /nobreak >nul

REM Thử mở cổng Vite trước (5173), nếu không thì thử 3000
start http://localhost:5173
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo   ✅ KHỞI ĐỘNG HOÀN TẤT!
echo ========================================
echo.
echo 📝 Thông tin:
echo   - Backend:  http://localhost:5000
echo   - Frontend: http://localhost:3000 hoặc :5173
echo   - 2 cửa sổ terminal đã mở
echo.
echo 💡 Để dừng server:
echo   - Đóng 2 cửa sổ terminal Backend và Frontend
echo   - Hoặc nhấn Ctrl+C trong mỗi cửa sổ
echo.
echo 🎉 Chúc bạn sử dụng vui vẻ!
echo.
pause
