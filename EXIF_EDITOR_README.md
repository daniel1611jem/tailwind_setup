# 📸 EXIF Editor - Quick Start

## Cài đặt nhanh

### Tự động (Khuyến nghị)
```powershell
.\install-exif-editor.ps1
```

### Thủ công
```bash
# Frontend
npm install exifreader --save

# Backend
cd backend
npm install exiftool-vendored multer --save

# Tạo thư mục temp
mkdir backend/temp
```

## Cài ExifTool

### Windows
1. Tải: https://exiftool.org/
2. Giải nén `exiftool(-k).exe`
3. Đổi tên thành `exiftool.exe`
4. Copy vào `C:\Windows\System32`

### Kiểm tra
```bash
exiftool -ver
```

## Sử dụng

1. Mở **Quản Lý Media**
2. Click nút **📸 EXIF** trên ảnh bất kỳ
3. Chỉnh sửa EXIF metadata
4. Click **✓ Áp dụng thay đổi**
5. File mới sẽ được tải về

## Tính năng

✅ Đọc EXIF từ JPG, PNG, RAW
✅ Chỉnh sửa 20+ trường EXIF
✅ Kiểm tra tính nhất quán
✅ Validate dữ liệu tự động
✅ Bảo mật (xử lý client-side)
✅ Responsive design

## Xem chi tiết

Đọc file **EXIF_EDITOR_GUIDE.md** để biết đầy đủ tính năng và hướng dẫn sử dụng.
