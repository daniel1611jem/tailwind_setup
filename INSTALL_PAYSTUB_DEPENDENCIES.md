# 📦 Dependencies cần cài đặt cho Paystub Editor

## Cài đặt

Chạy lệnh sau trong terminal tại thư mục project:

```bash
npm install html2canvas jspdf
```

Hoặc dùng yarn:

```bash
yarn add html2canvas jspdf
```

---

## Package Details

### 1. html2canvas
- **Version**: Latest (^1.4.1)
- **Purpose**: Chuyển HTML element thành canvas
- **Use**: Capture paystub HTML → Canvas → PNG/PDF
- **Documentation**: https://html2canvas.hertzen.com/

**Tính năng sử dụng:**
- `scale: 3-4` - Chất lượng cao
- `useCORS: true` - Load images từ domain khác (logo)
- `backgroundColor: '#ffffff'` - Background trắng

### 2. jsPDF
- **Version**: Latest (^2.5.1)
- **Purpose**: Tạo file PDF từ JavaScript
- **Use**: Canvas → PDF file
- **Documentation**: https://github.com/parallax/jsPDF

**Tính năng sử dụng:**
- Format: Letter (8.5" × 11")
- Orientation: Portrait
- Units: mm
- `addImage()` để thêm canvas vào PDF

---

## Verification

Sau khi cài đặt, kiểm tra trong `package.json`:

```json
{
  "dependencies": {
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.1",
    ...
  }
}
```

---

## Import trong code

```javascript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
```

---

## Export Workflow

### Export PDF:
```
HTML Element (paystubRef)
  ↓ html2canvas({ scale: 3 })
Canvas (high resolution)
  ↓ canvas.toDataURL('image/png')
Image Data URL
  ↓ jsPDF.addImage()
PDF File
  ↓ pdf.save()
Download PDF ✅
```

### Export PNG:
```
HTML Element (paystubRef)
  ↓ html2canvas({ scale: 4 })
Canvas (ultra high resolution)
  ↓ canvas.toBlob()
Blob Data
  ↓ URL.createObjectURL()
Download Link
  ↓ a.click()
Download PNG ✅
```

---

## File Sizes

**PDF Output:**
- Resolution: 300 DPI
- Size: ~200-500 KB
- Format: Letter (8.5" × 11")

**PNG Output:**
- Resolution: 4x native (~2400 DPI)
- Size: ~2-5 MB
- Format: PNG (lossless)

---

## Troubleshooting

### ❓ npm không được nhận diện?

**Giải pháp:**
1. Cài Node.js từ https://nodejs.org/
2. Restart terminal
3. Chạy lại `npm install`

### ❓ Lỗi "Module not found"?

**Giải pháp:**
```bash
# Clear node_modules và reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### ❓ Export PDF bị lỗi?

**Kiểm tra:**
1. html2canvas và jsPDF đã cài đúng version
2. Browser hỗ trợ Canvas API
3. Không có CORS error (logo từ external domain)

---

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

---

## Alternative Packages (nếu cần)

### Nếu muốn thêm tính năng:

**1. Canvas to PDF khác:**
- `pdfmake` - PDF generation library
- `react-pdf` - React wrapper cho PDF

**2. Image processing:**
- `sharp` (backend only)
- `jimp` (browser + node)

**3. Print optimization:**
- `print-js` - Printing library

---

## Current Setup

```
Frontend (React + Vite):
├── html2canvas - HTML → Canvas
├── jspdf - Canvas → PDF
└── Native APIs - Canvas → PNG, Print
```

**Không cần backend** - Tất cả processing ở client-side!

---

## Performance

**Thời gian export:**
- PDF: ~2-3 giây
- PNG: ~3-4 giây
- Print: Instant

**Optimization:**
- Dùng `scale: 3` cho PDF (đủ chất lượng)
- Dùng `scale: 4` cho PNG (in ấn)
- Không dùng `scale` quá cao (>5) → Lag

---

Sau khi cài xong, restart dev server:
```bash
npm run dev
```

Truy cập: `http://localhost:5173/paystub`
