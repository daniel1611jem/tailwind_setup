# Hướng dẫn cài đặt và sử dụng EXIF Editor

## 🎯 Tổng quan
Chức năng EXIF Editor cho phép bạn:
- ✅ Đọc và hiển thị metadata EXIF từ ảnh
- ✅ Chỉnh sửa các thông tin EXIF (Make, Model, GPS, DateTime, Camera Settings, v.v.)
- ✅ Kiểm tra tính nhất quán của EXIF data
- ✅ Xuất ảnh đã chỉnh sửa EXIF
- ✅ Xóa toàn bộ EXIF từ ảnh

## 📦 Cài đặt

### 1. Cài đặt dependencies cho Frontend
```bash
cd "\\vmware-host\Shared Folders\CODE\MMO"
npm install exifreader --save
```

### 2. Cài đặt dependencies cho Backend
```bash
cd "\\vmware-host\Shared Folders\CODE\MMO\backend"
npm install exiftool-vendored multer --save
```

### 3. Cài đặt ExifTool trên hệ thống
ExifTool là công cụ command-line cần thiết cho backend.

#### Windows:
1. Tải ExifTool từ: https://exiftool.org/
2. Giải nén file `exiftool(-k).exe`
3. Đổi tên thành `exiftool.exe`
4. Copy vào `C:\Windows\System32` hoặc thêm vào PATH

#### Linux/Mac:
```bash
# Ubuntu/Debian
sudo apt-get install libimage-exiftool-perl

# Mac
brew install exiftool
```

### 4. Tạo thư mục temp cho backend
```bash
mkdir backend/temp
```

## 🚀 Sử dụng

### 1. Mở EXIF Editor
1. Vào trang **Quản Lý Media**
2. Chọn tab (Ảnh chung / Tài liệu / Ảnh riêng)
3. Click nút **"📸 EXIF"** trên bất kỳ ảnh nào

### 2. Giao diện EXIF Editor

#### Bên trái: Preview & Validation
- **Preview ảnh**: Hiển thị ảnh đang chỉnh sửa
- **Kết quả kiểm tra**: Hiển thị sau khi click "Kiểm tra tính nhất quán"

#### Bên phải: EXIF Data
Gồm 5 tabs:
1. **📱 Thông tin thiết bị**: Make, Model, Software, LensModel
2. **📷 Cài đặt Camera**: FNumber, ISO, ExposureTime, FocalLength, WhiteBalance, Flash
3. **🕐 Ngày giờ**: DateTime, DateTimeOriginal, ModifyDate
4. **📍 Vị trí GPS**: GPSLatitude, GPSLongitude, GPSAltitude
5. **📋 Thông tin khác**: Copyright, Artist, ImageDescription

### 3. Chỉnh sửa EXIF
- **Trường màu trắng**: Có thể chỉnh sửa
- **Trường màu xám**: Chỉ đọc (read-only)

### 4. Kiểm tra tính nhất quán
Click nút **"🔍 Kiểm tra tính nhất quán"** để validate:
- ✓ Model có khớp với Make không?
- ✓ GPS coordinates có hợp lệ không?
- ✓ ISO, FNumber có trong phạm vi chuẩn không?
- ✓ DateTime có nhất quán không?

### 5. Lưu thay đổi
1. Click **"✓ Áp dụng thay đổi"**
2. File ảnh mới sẽ được tải về với tên `modified_[tên_gốc]`
3. Ảnh gốc trên server **không bị thay đổi**

## 🔧 Các trường EXIF có thể chỉnh sửa

### Device Information
- **Make**: Hãng sản xuất (Canon, Nikon, Sony, v.v.)
- **Model**: Model camera (EOS 5D Mark IV, D850, v.v.)
- **Software**: Phiên bản firmware
- **LensModel**: Model ống kính

### Camera Settings
- **FNumber**: Khẩu độ (f/1.4, f/2.8, v.v.)
- **ExposureTime**: Tốc độ màn trập (1/1000, 1/250, v.v.)
- **ISO**: Độ nhạy sáng (100, 400, 1600, v.v.)
- **FocalLength**: Tiêu cự (24mm, 50mm, 85mm, v.v.)
- **WhiteBalance**: Cân bằng trắng
- **Flash**: Thông tin đèn flash

### DateTime
- **DateTime**: Thời gian chỉnh sửa file
- **DateTimeOriginal**: Thời gian chụp ảnh
- **DateTimeDigitized**: Thời gian số hóa
- **ModifyDate**: Ngày sửa đổi

### GPS Location
- **GPSLatitude**: Vĩ độ (ví dụ: 21.0285)
- **GPSLongitude**: Kinh độ (ví dụ: 105.8542)
- **GPSAltitude**: Độ cao (mét)
- **GPSDateTime**: Thời gian GPS

### Other
- **Copyright**: Bản quyền
- **Artist**: Tác giả
- **ImageDescription**: Mô tả ảnh
- **UserComment**: Ghi chú người dùng

## 🛡️ Bảo mật

### Client-side (ExifReader)
- ✅ Xử lý trên trình duyệt
- ✅ Không upload ảnh lên server khi chỉ đọc
- ✅ Bảo vệ thông tin cá nhân

### Server-side (ExifTool)
- ⚠️ File được upload lên server tạm thời
- ✅ File tự động xóa sau khi xử lý
- ✅ Không lưu trữ file trên server
- ✅ Thư mục temp được dọn dẹp tự động

## ⚠️ Lưu ý quan trọng

### 1. Định dạng file hỗ trợ
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ TIFF (.tiff, .tif)
- ✅ RAW (.cr2, .nef, .arw, v.v.)
- ❌ GIF, BMP (không hỗ trợ EXIF)

### 2. Thông tin nhạy cảm
- **GPS**: Có thể tiết lộ vị trí chụp ảnh
- **DateTime**: Có thể tiết lộ thời gian chụp
- **Artist/Copyright**: Thông tin tác giả

### 3. Validation
- Không phải tất cả validation đều chính xác 100%
- Chỉ là gợi ý, không cứng nhắc
- Một số camera đặc biệt có thể có EXIF khác thường

### 4. Tính xác thực
- Chỉnh sửa EXIF có thể làm giảm tính xác thực của ảnh
- Một số nền tảng có thể phát hiện EXIF đã chỉnh sửa
- Chỉ sử dụng cho mục đích hợp pháp

## 🔍 Ví dụ sử dụng

### Case 1: Thay đổi thông tin camera
```
Make: Canon
Model: EOS 5D Mark IV
Software: Firmware Version 1.3.0
LensModel: EF 24-70mm f/2.8L II USM
```

### Case 2: Xóa thông tin GPS
```
GPSLatitude: (để trống)
GPSLongitude: (để trống)
GPSAltitude: (để trống)
```

### Case 3: Cập nhật thời gian
```
DateTime: 2025-11-26 10:30:00
DateTimeOriginal: 2025-11-26 10:30:00
```

## 🐛 Xử lý lỗi

### Lỗi: "Không thể đọc EXIF"
- File không chứa EXIF
- Định dạng file không hỗ trợ
- File bị hỏng

**Giải pháp**: Thử với file khác hoặc kiểm tra định dạng

### Lỗi: "ExifTool not found"
- ExifTool chưa được cài đặt trên server
- ExifTool không có trong PATH

**Giải pháp**: Cài đặt ExifTool theo hướng dẫn ở trên

### Lỗi: "Cannot write EXIF"
- File bị khóa ghi
- Không đủ quyền
- File format không hỗ trợ ghi

**Giải pháp**: Kiểm tra quyền file và định dạng

## 📚 API Endpoints

### POST /api/exif/read
Đọc EXIF từ ảnh
```javascript
FormData: {
  image: File
}
```

### POST /api/exif/write
Ghi EXIF vào ảnh
```javascript
FormData: {
  image: File,
  exifData: JSON string
}
```

### POST /api/exif/validate
Validate EXIF data
```javascript
{
  exifData: { Make, Model, ... }
}
```

### POST /api/exif/compare
So sánh EXIF giữa 2 ảnh
```javascript
FormData: {
  image1: File,
  image2: File
}
```

### POST /api/exif/remove-all
Xóa toàn bộ EXIF
```javascript
FormData: {
  image: File
}
```

## 🎨 Customization

### Thêm trường EXIF mới
Chỉnh sửa file `src/components/EXIFEditor.jsx`:
```javascript
const exifGroups = {
  myCustomGroup: {
    title: 'Nhóm tùy chỉnh',
    icon: '🎨',
    fields: ['CustomField1', 'CustomField2']
  }
}

const editableFields = [
  ...
  'CustomField1',
  'CustomField2'
]
```

### Thêm validation rule mới
Thêm vào function `validateExifData()`:
```javascript
// Kiểm tra custom field
if (editedData.CustomField) {
  const isValid = /* logic kiểm tra */;
  results.push({
    field: 'CustomField',
    status: isValid,
    message: isValid ? '✓ Hợp lệ' : '❌ Không hợp lệ'
  });
}
```

## 📞 Support
Nếu gặp vấn đề, kiểm tra:
1. Console log trong DevTools
2. Network tab để xem API response
3. Backend logs
4. ExifTool có hoạt động không: `exiftool -ver`
