# ✅ EXIF Editor - Installation & Testing Checklist

## 📋 Pre-Installation Checklist

- [ ] Node.js đã được cài đặt (kiểm tra: `node -v`)
- [ ] npm đã được cài đặt (kiểm tra: `npm -v`)
- [ ] Git đã được cài đặt (nếu clone từ repo)
- [ ] VS Code hoặc editor khác đã sẵn sàng

## 📦 Installation Checklist

### Tự động (Khuyến nghị)
- [ ] Chạy `.\install-exif-editor.ps1` trong PowerShell
- [ ] Kiểm tra output không có lỗi
- [ ] Tất cả components đều ✓ (màu xanh)

### Thủ công
#### Frontend
- [ ] Chạy `npm install exifreader --save` trong thư mục root
- [ ] Kiểm tra `node_modules/exifreader` tồn tại
- [ ] Không có lỗi trong console

#### Backend
- [ ] Chạy `cd backend`
- [ ] Chạy `npm install exiftool-vendored --save`
- [ ] Kiểm tra `node_modules/exiftool-vendored` tồn tại
- [ ] Multer đã có sẵn trong package.json

#### System
- [ ] Tải ExifTool từ https://exiftool.org/
- [ ] Giải nén và đổi tên thành `exiftool.exe`
- [ ] Copy vào `C:\Windows\System32` hoặc thêm vào PATH
- [ ] Chạy `exiftool -ver` để kiểm tra
- [ ] Version hiển thị đúng (ví dụ: 12.70)

#### Directories
- [ ] Thư mục `backend/temp` đã được tạo
- [ ] Quyền ghi file trong thư mục temp

## 🎯 Files Checklist

### New Files (Created)
- [ ] `src/components/EXIFEditor.jsx` - Component chính
- [ ] `src/services/exifService.js` - Service cho EXIF
- [ ] `backend/routes/exif.js` - Backend API routes
- [ ] `EXIF_EDITOR_GUIDE.md` - Hướng dẫn đầy đủ
- [ ] `EXIF_EDITOR_README.md` - Quick start
- [ ] `EXIF_EDITOR_SUMMARY.md` - Tóm tắt
- [ ] `install-exif-editor.ps1` - Installation script
- [ ] `exif-test-examples.js` - Test examples
- [ ] `EXIF_EDITOR_CHECKLIST.md` - File này

### Modified Files
- [ ] `src/pages/MediaManager.jsx` - Added EXIF button & modal
- [ ] `src/services/mediaService.js` - Updated uploadMedia()
- [ ] `backend/server.js` - Added exif routes

## 🚀 Startup Checklist

### Backend
- [ ] Chạy `cd backend`
- [ ] Chạy `npm start` hoặc `node server.js`
- [ ] Server chạy trên port 5000 (hoặc PORT trong .env)
- [ ] Không có lỗi kết nối database
- [ ] Routes `/api/exif/*` được load

### Frontend
- [ ] Chạy `npm run dev` trong terminal mới
- [ ] Vite dev server chạy (thường port 5173)
- [ ] Không có compile errors
- [ ] Browser tự động mở

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Mở http://localhost:5173 (hoặc port của bạn)
- [ ] Navigation hoạt động
- [ ] Trang "Quản Lý Media" mở được
- [ ] Tabs (Ảnh chung, Tài liệu, Ảnh riêng) hoạt động

### Upload Image
- [ ] Click "Chọn file"
- [ ] Chọn một ảnh JPG/PNG
- [ ] Ảnh hiển thị trong form
- [ ] Click "Upload"
- [ ] Ảnh xuất hiện trong grid
- [ ] Không có lỗi

### Open EXIF Editor
- [ ] Tìm ảnh vừa upload (hoặc ảnh có sẵn)
- [ ] Nút "📸 EXIF" hiển thị (chỉ trên ảnh)
- [ ] Click nút "📸 EXIF"
- [ ] Modal EXIF Editor mở ra
- [ ] Preview ảnh hiển thị bên trái
- [ ] Tabs hiển thị bên phải

### Read EXIF
- [ ] Tab "Thông tin thiết bị" hiển thị Make, Model
- [ ] Tab "Cài đặt Camera" hiển thị ISO, FNumber
- [ ] Tab "Ngày giờ" hiển thị DateTime
- [ ] Tab "Vị trí GPS" hiển thị GPS (nếu có)
- [ ] Tab "Thông tin khác" hiển thị Copyright, Artist
- [ ] Các trường có màu trắng (editable) hoặc xám (read-only)

### Edit EXIF
- [ ] Thay đổi Make (ví dụ: "Canon" → "Nikon")
- [ ] Thay đổi Model (ví dụ: "EOS 5D" → "D850")
- [ ] Thay đổi ISO (ví dụ: "400" → "800")
- [ ] Thay đổi GPS (ví dụ: "21.0285" → "10.8231")
- [ ] Giá trị mới hiển thị trong input fields

### Validate EXIF
- [ ] Click nút "🔍 Kiểm tra tính nhất quán"
- [ ] Panel validation hiển thị bên trái
- [ ] Kết quả hiển thị với icon ✓/❌
- [ ] Các thông báo rõ ràng
- [ ] Validation logic đúng (ví dụ: Canon + D850 = ❌)

### Save EXIF
- [ ] Click nút "✓ Áp dụng thay đổi"
- [ ] Loading indicator hiển thị (nếu có)
- [ ] File mới được tải về
- [ ] Tên file có prefix "modified_"
- [ ] Alert thành công hiển thị

### Close Modal
- [ ] Click nút X (góc trên bên phải)
- [ ] Modal đóng lại
- [ ] Quay về trang MediaManager
- [ ] Không có lỗi

## 🔍 Advanced Testing

### Different Image Formats
- [ ] Test với JPG
- [ ] Test với PNG
- [ ] Test với TIFF (nếu có)
- [ ] Test với RAW (nếu có)

### Edge Cases
- [ ] Ảnh không có EXIF (ví dụ: screenshot)
- [ ] Ảnh có EXIF bị hỏng
- [ ] Ảnh rất lớn (>10MB)
- [ ] Ảnh rất nhỏ (<100KB)
- [ ] Upload file không phải ảnh

### Validation Rules
- [ ] Valid Canon + Canon model = ✓
- [ ] Valid Nikon + Nikon model = ✓
- [ ] Invalid Canon + Nikon model = ❌
- [ ] Valid GPS (lat: -90 to 90, lon: -180 to 180) = ✓
- [ ] Invalid GPS (lat: 999, lon: -999) = ❌
- [ ] Valid ISO (50-102400) = ✓
- [ ] Invalid ISO (999999) = ❌
- [ ] Valid FNumber (1.0-32) = ✓
- [ ] Invalid FNumber (0.5) = ❌

### API Endpoints
- [ ] POST /api/exif/read - Returns EXIF data
- [ ] POST /api/exif/write - Returns modified image
- [ ] POST /api/exif/validate - Returns validation results
- [ ] POST /api/exif/compare - Returns differences
- [ ] POST /api/exif/remove-all - Returns cleaned image

### Error Handling
- [ ] Upload không có file → Thông báo lỗi
- [ ] EXIF read fail → Thông báo rõ ràng
- [ ] EXIF write fail → Thông báo lỗi
- [ ] Network error → Timeout gracefully
- [ ] Server error → User-friendly message

## 🎨 UI/UX Testing

### Responsive Design
- [ ] Desktop (1920x1080) hiển thị đúng
- [ ] Laptop (1366x768) hiển thị đúng
- [ ] Tablet (768px) hiển thị đúng
- [ ] Mobile (375px) hiển thị đúng
- [ ] Modal fit screen trên tất cả devices

### Visual Testing
- [ ] Colors match design (Blue primary)
- [ ] Icons hiển thị đúng (📸, 📱, 📷, etc.)
- [ ] Fonts rõ ràng, dễ đọc
- [ ] Spacing hợp lý
- [ ] Buttons có hover effects
- [ ] Inputs có focus styles

### Accessibility
- [ ] Tab navigation hoạt động
- [ ] Keyboard shortcuts (ESC để close modal)
- [ ] Focus indicators rõ ràng
- [ ] Color contrast đủ (AA standard)
- [ ] Alt text cho images

## 🛡️ Security Testing

### Client-side
- [ ] File chỉ được đọc local (không upload khi chỉ view)
- [ ] No XSS vulnerabilities
- [ ] Input validation đúng
- [ ] No sensitive data exposed

### Server-side
- [ ] File upload có size limit
- [ ] Only allowed file types
- [ ] Temp files auto-deleted
- [ ] No directory traversal
- [ ] Secure file naming

## 📊 Performance Testing

- [ ] EXIF read < 2 seconds (file < 5MB)
- [ ] EXIF write < 5 seconds (file < 5MB)
- [ ] Modal open/close smooth (< 300ms)
- [ ] No memory leaks
- [ ] UI responsive during processing

## 🐛 Known Issues Check

- [ ] ExifReader không hỗ trợ một số RAW formats
- [ ] ExifTool cần cài riêng trên system
- [ ] Large files (>10MB) có thể chậm
- [ ] IE11 không được hỗ trợ
- [ ] Một số EXIF fields có thể read-only

## 📝 Documentation Review

- [ ] `EXIF_EDITOR_GUIDE.md` đầy đủ, rõ ràng
- [ ] `EXIF_EDITOR_README.md` dễ hiểu
- [ ] `EXIF_EDITOR_SUMMARY.md` chính xác
- [ ] Code comments đầy đủ
- [ ] API documentation rõ ràng

## 🎓 User Training

- [ ] Hướng dẫn cách mở EXIF Editor
- [ ] Hướng dẫn chỉnh sửa EXIF
- [ ] Hướng dẫn validation
- [ ] Hướng dẫn save & download
- [ ] Giải thích security concerns

## ✅ Final Checklist

- [ ] Tất cả tests pass
- [ ] Không có console errors
- [ ] Không có console warnings (hoặc explained)
- [ ] Code đã được commit
- [ ] Documentation đã update
- [ ] Team đã được training
- [ ] Ready for production

---

## 🎉 Khi tất cả đều ✅

Chúc mừng! EXIF Editor đã sẵn sàng sử dụng.

### Next Steps:
1. Deploy lên production (nếu cần)
2. Monitor logs cho errors
3. Collect user feedback
4. Plan future enhancements

### Support:
- Xem `EXIF_EDITOR_GUIDE.md` để troubleshooting
- Chạy `.\install-exif-editor.ps1` để verify installation
- Check console logs (F12) nếu có lỗi

---

**Version**: 1.0.0
**Last Updated**: 26/11/2025
