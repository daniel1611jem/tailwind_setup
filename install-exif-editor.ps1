# EXIF Editor - Installation Script for Windows
# Chạy script này để cài đặt tất cả dependencies

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  EXIF EDITOR - INSTALLATION     " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = "\\vmware-host\Shared Folders\CODE\MMO"

# Kiểm tra npm
Write-Host "Kiểm tra npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm -v
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm không được cài đặt!" -ForegroundColor Red
    Write-Host "Vui lòng cài Node.js từ: https://nodejs.org/" -ForegroundColor Yellow
    exit
}

# Cài đặt frontend dependencies
Write-Host ""
Write-Host "Cài đặt Frontend dependencies..." -ForegroundColor Yellow
Set-Location $projectPath
npm install exifreader --save

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies đã cài đặt" -ForegroundColor Green
} else {
    Write-Host "✗ Lỗi khi cài đặt frontend dependencies" -ForegroundColor Red
}

# Cài đặt backend dependencies
Write-Host ""
Write-Host "Cài đặt Backend dependencies..." -ForegroundColor Yellow
Set-Location "$projectPath\backend"
npm install exiftool-vendored multer --save

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies đã cài đặt" -ForegroundColor Green
} else {
    Write-Host "✗ Lỗi khi cài đặt backend dependencies" -ForegroundColor Red
}

# Tạo thư mục temp
Write-Host ""
Write-Host "Tạo thư mục temp..." -ForegroundColor Yellow
$tempDir = "$projectPath\backend\temp"
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force
    Write-Host "✓ Đã tạo thư mục temp" -ForegroundColor Green
} else {
    Write-Host "✓ Thư mục temp đã tồn tại" -ForegroundColor Green
}

# Kiểm tra ExifTool
Write-Host ""
Write-Host "Kiểm tra ExifTool..." -ForegroundColor Yellow
try {
    $exiftoolVersion = exiftool -ver
    Write-Host "✓ ExifTool version: $exiftoolVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ExifTool chưa được cài đặt!" -ForegroundColor Red
    Write-Host ""
    Write-Host "HƯỚNG DẪN CÀI EXIFTOOL:" -ForegroundColor Yellow
    Write-Host "1. Tải ExifTool từ: https://exiftool.org/" -ForegroundColor White
    Write-Host "2. Giải nén file 'exiftool(-k).exe'" -ForegroundColor White
    Write-Host "3. Đổi tên thành 'exiftool.exe'" -ForegroundColor White
    Write-Host "4. Copy vào C:\Windows\System32" -ForegroundColor White
    Write-Host "5. Hoặc thêm vào PATH environment variable" -ForegroundColor White
    Write-Host ""
    Write-Host "Sau khi cài xong, chạy lại script này để kiểm tra" -ForegroundColor Yellow
}

# Hiển thị kết quả
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  KẾT QUẢ CÀI ĐẶT              " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra lại tất cả
$allGood = $true

Write-Host "Kiểm tra các thành phần:" -ForegroundColor Yellow
Write-Host ""

# Kiểm tra exifreader
Set-Location $projectPath
if (Test-Path "node_modules\exifreader") {
    Write-Host "✓ exifreader (Frontend)" -ForegroundColor Green
} else {
    Write-Host "✗ exifreader (Frontend) - CHƯA CÀI ĐẶT" -ForegroundColor Red
    $allGood = $false
}

# Kiểm tra exiftool-vendored
Set-Location "$projectPath\backend"
if (Test-Path "node_modules\exiftool-vendored") {
    Write-Host "✓ exiftool-vendored (Backend)" -ForegroundColor Green
} else {
    Write-Host "✗ exiftool-vendored (Backend) - CHƯA CÀI ĐẶT" -ForegroundColor Red
    $allGood = $false
}

# Kiểm tra multer
if (Test-Path "node_modules\multer") {
    Write-Host "✓ multer (Backend)" -ForegroundColor Green
} else {
    Write-Host "✗ multer (Backend) - CHƯA CÀI ĐẶT" -ForegroundColor Red
    $allGood = $false
}

# Kiểm tra temp directory
if (Test-Path "$projectPath\backend\temp") {
    Write-Host "✓ Thư mục temp" -ForegroundColor Green
} else {
    Write-Host "✗ Thư mục temp - CHƯA TẠO" -ForegroundColor Red
    $allGood = $false
}

# Kiểm tra ExifTool
try {
    exiftool -ver | Out-Null
    Write-Host "✓ ExifTool (System)" -ForegroundColor Green
} catch {
    Write-Host "✗ ExifTool (System) - CHƯA CÀI ĐẶT" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host ""
    Write-Host "🎉 CÀI ĐẶT HOÀN TẤT!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Bạn có thể khởi động ứng dụng:" -ForegroundColor Yellow
    Write-Host "  Frontend: npm run dev" -ForegroundColor White
    Write-Host "  Backend: cd backend && node server.js" -ForegroundColor White
    Write-Host ""
    Write-Host "Xem hướng dẫn sử dụng tại: EXIF_EDITOR_GUIDE.md" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "⚠️ CÓ MỘT SỐ THÀNH PHẦN CHƯA CÀI ĐẶT" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Vui lòng kiểm tra các lỗi phía trên và cài đặt lại" -ForegroundColor White
}

Write-Host ""
Set-Location $projectPath
