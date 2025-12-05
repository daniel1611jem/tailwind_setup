# MMO Account Manager - Auto Start Script
# PowerShell Script

$Host.UI.RawUI.WindowTitle = "MMO Account Manager - Khởi động"
Clear-Host

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MMO ACCOUNT MANAGER - AUTO START" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Function to check if port is in use
function Test-Port {
    param($Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connections
}

# [1/6] Check Node.js
Write-Host "[1/6] Kiểm tra Node.js..." -ForegroundColor Yellow
if (-not (Test-Command "node")) {
    Write-Host "❌ KHÔNG TÌM THẤY NODE.JS!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vui lòng cài đặt Node.js từ: https://nodejs.org" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Nhấn Enter để thoát"
    exit 1
}
Write-Host "✓ Node.js đã được cài đặt" -ForegroundColor Green
$nodeVersion = node --version
Write-Host "  Version: $nodeVersion" -ForegroundColor Gray
Write-Host ""

# [2/6] Check npm
Write-Host "[2/6] Kiểm tra npm..." -ForegroundColor Yellow
if (-not (Test-Command "npm")) {
    Write-Host "❌ KHÔNG TÌM THẤY NPM!" -ForegroundColor Red
    Read-Host "Nhấn Enter để thoát"
    exit 1
}
Write-Host "✓ npm đã được cài đặt" -ForegroundColor Green
$npmVersion = npm --version
Write-Host "  Version: $npmVersion" -ForegroundColor Gray
Write-Host ""

# [3/6] Install Backend dependencies
Write-Host "[3/6] Kiểm tra Backend dependencies..." -ForegroundColor Yellow
Push-Location backend
if (-not (Test-Path "node_modules")) {
    Write-Host "⏳ Đang cài đặt Backend packages..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Lỗi khi cài đặt Backend dependencies!" -ForegroundColor Red
        Pop-Location
        Read-Host "Nhấn Enter để thoát"
        exit 1
    }
    Write-Host "✓ Backend dependencies đã được cài đặt" -ForegroundColor Green
} else {
    Write-Host "✓ Backend dependencies đã tồn tại" -ForegroundColor Green
}
Pop-Location
Write-Host ""

# [4/6] Install Frontend dependencies
Write-Host "[4/6] Kiểm tra Frontend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "⏳ Đang cài đặt Frontend packages..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Lỗi khi cài đặt Frontend dependencies!" -ForegroundColor Red
        Read-Host "Nhấn Enter để thoát"
        exit 1
    }
    Write-Host "✓ Frontend dependencies đã được cài đặt" -ForegroundColor Green
} else {
    Write-Host "✓ Frontend dependencies đã tồn tại" -ForegroundColor Green
}
Write-Host ""

# [5/6] Start Backend
Write-Host "[5/6] Khởi động Backend server..." -ForegroundColor Yellow
if (Test-Port 5000) {
    Write-Host "⚠️  Port 5000 đã được sử dụng. Backend có thể đang chạy." -ForegroundColor Yellow
} else {
    $backendPath = Join-Path $PSScriptRoot "backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; `$Host.UI.RawUI.WindowTitle='MMO Backend Server'; Write-Host 'Backend Server' -ForegroundColor Blue; npm start"
    Write-Host "✓ Backend server đang khởi động..." -ForegroundColor Green
}
Write-Host "  URL: http://localhost:5000" -ForegroundColor Gray
Write-Host ""

# Wait for Backend
Write-Host "⏳ Đợi Backend khởi động (3 giây)..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
Write-Host ""

# [6/6] Start Frontend
Write-Host "[6/6] Khởi động Frontend..." -ForegroundColor Yellow
if (Test-Port 3000) {
    Write-Host "⚠️  Port 3000 đã được sử dụng. Thử port 5173..." -ForegroundColor Yellow
}
if (Test-Port 5173) {
    Write-Host "⚠️  Port 5173 đã được sử dụng. Frontend có thể đang chạy." -ForegroundColor Yellow
} else {
    $frontendPath = $PSScriptRoot
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; `$Host.UI.RawUI.WindowTitle='MMO Frontend Dev Server'; Write-Host 'Frontend Dev Server' -ForegroundColor Magenta; npm run dev"
    Write-Host "✓ Frontend dev server đang khởi động..." -ForegroundColor Green
}
Write-Host "  URL: http://localhost:3000 hoặc http://localhost:5173" -ForegroundColor Gray
Write-Host ""

# Wait for Frontend
Write-Host "⏳ Đợi Frontend khởi động (5 giây)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
Write-Host ""

# Open Browser
Write-Host "🌐 Mở trình duyệt..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

# Try Vite port first (5173), then fallback to 3000
try {
    Start-Process "http://localhost:5173"
} catch {
    Start-Process "http://localhost:3000"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ KHỞI ĐỘNG HOÀN TẤT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Thông tin:" -ForegroundColor Cyan
Write-Host "  - Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "  - Frontend: http://localhost:3000 hoặc :5173" -ForegroundColor White
Write-Host "  - 2 cửa sổ PowerShell đã mở" -ForegroundColor White
Write-Host ""
Write-Host "💡 Để dừng server:" -ForegroundColor Yellow
Write-Host "  - Đóng 2 cửa sổ PowerShell Backend và Frontend" -ForegroundColor White
Write-Host "  - Hoặc nhấn Ctrl+C trong mỗi cửa sổ" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Chúc bạn sử dụng vui vẻ!" -ForegroundColor Cyan
Write-Host ""
Read-Host "Nhấn Enter để đóng cửa sổ này"
