# ✂️ Image Cropper - Cắt ảnh theo khung thiết bị

## 🎯 Tổng quan

Công cụ cắt ảnh thông minh với các khung cắt mẫu theo kích thước thiết bị phổ biến:
- **iPhone**: 11 Pro, 12/13/14, Pro Max, SE
- **Samsung**: S21, S21 Ultra, Note 20
- **Social Media**: Instagram, Facebook, Twitter
- **ID Cards**: CMND/CCCD, Passport
- **Common ratios**: 1:1, 4:3, 16:9, 3:2, v.v.

## ✨ Tính năng chính

### 1️⃣ Khung mẫu (Presets)
- 18+ khung mẫu sẵn có
- Phân loại theo category: iPhone, Samsung, Social Media, ID Card, Common, Camera
- Aspect ratio chính xác theo thiết bị thực tế
- Kích thước output tối ưu

### 2️⃣ Tùy chỉnh (Custom)
- Nhập kích thước tùy ý (width × height)
- Quick ratio buttons: 1:1, 4:3, 16:9, 9:16, 3:2, 2:3
- Preview trực tiếp trên canvas

### 3️⃣ Canvas tương tác
- Drag & drop để di chuyển vùng cắt
- Zoom in/out (50% - 200%)
- Hiển thị kích thước real-time
- Visual feedback với overlay tối

### 4️⃣ Export chất lượng cao
- Output JPEG với quality 95%
- Resize chính xác theo preset
- Download trực tiếp về máy
- Filename tự động thêm suffix "_cropped"

## 🚀 Hướng dẫn sử dụng

### Cách 1: Cắt ảnh từ danh sách Media

```
1. Vào tab "Quản Lý Media"
2. Tìm ảnh cần cắt trong grid
3. Click nút "✂️ Cắt"
4. Chọn khung mẫu hoặc nhập kích thước tùy chỉnh
5. Di chuyển/zoom vùng cắt
6. Click "✂️ Cắt ảnh và tải về"
7. ✓ File đã được tải về!
```

### Cách 2: Cắt ảnh từ máy tính

```
1. Vào tab "Quản Lý Media"
2. Click box "Cắt ảnh thông minh" → "Chọn ảnh từ máy"
3. Chọn file ảnh từ máy tính
4. Chọn khung mẫu
5. Adjust vùng cắt
6. Click "✂️ Cắt ảnh và tải về"
```

### Cách 3: Drag trong Canvas

```
1. Mở Image Cropper
2. Click và drag trên canvas để di chuyển vùng cắt
3. Scroll hoặc dùng slider Zoom để phóng to/thu nhỏ
4. Chọn preset để thay đổi tỷ lệ
5. Cắt khi hài lòng
```

## 📱 Danh sách khung mẫu

### iPhone
| Tên | Kích thước | Aspect Ratio | Thiết bị |
|-----|-----------|--------------|----------|
| iPhone 11 Pro | 1125×2436 | 1125:2436 | iPhone 11 Pro, X, XS |
| iPhone 12/13/14 | 1170×2532 | 1170:2532 | iPhone 12, 12 Pro, 13, 13 Pro, 14, 14 Pro |
| iPhone 12/13/14 Pro Max | 1284×2778 | 1284:2778 | iPhone 12 Pro Max, 13 Pro Max, 14 Pro Max |
| iPhone SE (2020) | 750×1334 | 750:1334 | iPhone SE (2nd/3rd gen), 6, 7, 8 |

### Samsung
| Tên | Kích thước | Aspect Ratio | Thiết bị |
|-----|-----------|--------------|----------|
| Samsung S21 | 1080×2400 | 1080:2400 | Galaxy S21, S21+, S22, S23 |
| Samsung S21 Ultra | 1440×3200 | 1440:3200 | Galaxy S21 Ultra, S22 Ultra, S23 Ultra |
| Samsung Note 20 | 1080×2400 | 1080:2400 | Galaxy Note 20, Note 20 Ultra |

### Social Media
| Tên | Kích thước | Aspect Ratio | Use Case |
|-----|-----------|--------------|----------|
| Instagram Post | 1080×1080 | 1:1 | Feed post (square) |
| Instagram Story | 1080×1920 | 9:16 | Story, Reels |
| Facebook Cover | 820×312 | 820:312 | Page cover photo |
| Twitter Header | 1500×500 | 3:1 | Profile header |

### ID Card / Documents
| Tên | Kích thước | Aspect Ratio | Use Case |
|-----|-----------|--------------|----------|
| CMND/CCCD (Trước) | 858×540 | 858:540 | Căn cước công dân VN |
| Passport Photo | 600×800 | 3:4 | Passport standard |

### Common Ratios
| Tên | Kích thước | Aspect Ratio | Use Case |
|-----|-----------|--------------|----------|
| 1:1 (Square) | 1080×1080 | 1:1 | Social media, profile pictures |
| 4:3 (Standard) | 1600×1200 | 4:3 | Classic photos, presentations |
| 16:9 (Widescreen) | 1920×1080 | 16:9 | YouTube, monitors, TV |
| 3:2 (DSLR) | 3000×2000 | 3:2 | Professional photography |

## 🎨 UI/UX Features

### Canvas
- **Background**: Màu đen (#000) để highlight ảnh
- **Overlay**: Dimmed area (50% opacity) ngoài vùng cắt
- **Crop border**: Blue (#3b82f6), 2px
- **Corner handles**: Blue squares (10×10px)
- **Dimension label**: Blue badge hiển thị kích thước

### Controls
- **Zoom slider**: 50% - 200%, step 10%
- **Drag**: Click và kéo để di chuyển
- **Preset buttons**: Highlight active preset với blue background
- **Categories**: Group presets theo loại để dễ tìm

### Info Display
```
Ảnh gốc: 4000 × 3000px
Vùng cắt: 1920 × 1080px
Kích thước xuất: 1920 × 1080px
```

## 💡 Use Cases thực tế

### Use Case 1: Chụp màn hình điện thoại
**Tình huống**: Có screenshot từ iPhone, cần crop cho đúng tỷ lệ để làm mockup

**Giải pháp**:
1. Upload screenshot
2. Chọn preset "iPhone 12/13/14"
3. Adjust vùng cắt
4. Export → Perfect phone mockup!

### Use Case 2: Ảnh CMND/CCCD cho KYC
**Tình huống**: Ảnh CMND chụp bằng camera, có background, cần crop chỉ lấy thẻ

**Giải pháp**:
1. Upload ảnh CMND đã chụp
2. Chọn preset "CMND/CCCD (Trước)"
3. Drag vùng cắt để align với thẻ
4. Export → Ảnh CMND chuẩn 858×540px

### Use Case 3: Batch Instagram posts
**Tình huống**: 50 ảnh ngang (16:9) cần crop thành square cho Instagram

**Workflow**:
1. Open cropper với ảnh đầu tiên
2. Chọn preset "Instagram Post" (1:1)
3. Crop và save
4. Repeat cho 49 ảnh còn lại (mỗi ảnh ~10 giây)
5. 50 ảnh × 10s = ~8 phút

### Use Case 4: YouTube Thumbnail
**Tình huống**: Design thumbnail 1920×1080 từ ảnh 4K

**Giải pháp**:
1. Upload ảnh 4K
2. Chọn preset "16:9 (Widescreen)"
3. Zoom và frame đúng composition
4. Export → Perfect 1920×1080 thumbnail!

### Use Case 5: Social Media headers
**Tình huống**: Cần tạo cover photo cho Facebook và Twitter

**Workflow**:
1. Upload ảnh đẹp
2. Crop với preset "Facebook Cover" → Save
3. Open lại cùng ảnh
4. Crop với preset "Twitter Header" → Save
5. Xong! Có 2 sizes chuẩn cho 2 platforms

## 🔧 Technical Details

### Canvas Size
```javascript
width: 800px
height: 600px
```

### Image Scaling
```javascript
// Fit image to canvas maintaining aspect ratio
if (imgAspect > canvasAspect) {
  drawWidth = canvasWidth * scale;
  drawHeight = drawWidth / imgAspect;
} else {
  drawHeight = canvasHeight * scale;
  drawWidth = drawHeight * imgAspect;
}
```

### Crop Calculation
```javascript
// Convert canvas coordinates to image coordinates
const scaleX = image.naturalWidth / drawWidth;
const scaleY = image.naturalHeight / drawHeight;

const imageX = cropArea.x;
const imageY = cropArea.y;
const imageWidth = cropArea.width;
const imageHeight = cropArea.height;
```

### Export Quality
```javascript
cropCanvas.toBlob((blob) => {
  // blob ready for download
}, 'image/jpeg', 0.95); // 95% quality
```

### Preset Application
```javascript
const aspectRatio = preset.width / preset.height;

// Fit crop area maintaining aspect ratio
let newWidth = Math.min(image.naturalWidth * 0.9, image.naturalWidth);
let newHeight = newWidth / aspectRatio;

if (newHeight > image.naturalHeight * 0.9) {
  newHeight = image.naturalHeight * 0.9;
  newWidth = newHeight * aspectRatio;
}

// Center crop area
setCropArea({
  x: (image.naturalWidth - newWidth) / 2,
  y: (image.naturalHeight - newHeight) / 2,
  width: newWidth,
  height: newHeight
});
```

## 📊 Supported Formats

### Input
- ✅ JPEG/JPG
- ✅ PNG
- ✅ WebP
- ✅ TIFF
- ✅ BMP
- ✅ All browser-supported image formats

### Output
- 📤 JPEG (quality 95%)

## ⚙️ Customization Options

### Preset Structure
```javascript
{
  name: 'iPhone 12',      // Display name
  width: 1170,            // Output width (px)
  height: 2532,           // Output height (px)
  aspectRatio: 1170/2532, // Pre-calculated ratio
  category: 'iPhone',     // Group category
  icon: '📱'              // Display icon
}
```

### Adding New Preset
```javascript
// In ImageCropper.jsx, devicePresets array:
{
  name: 'Your Device',
  width: 1440,
  height: 2960,
  aspectRatio: 1440/2960,
  category: 'Custom',
  icon: '📱'
}
```

## 🎯 Best Practices

### 1. Choosing Presets
- **Social Media**: Use exact presets for platforms
- **ID Cards**: Always use standard presets
- **Custom sizes**: Use "Tùy chỉnh" tab

### 2. Image Quality
- Start with high-resolution images
- Crop first, then resize if needed
- Use 95% JPEG quality for balance

### 3. Workflow Tips
- Use Quick Ratio buttons for common ratios
- Zoom in for precision cropping
- Preview dimension label before export

### 4. Performance
- Large images (>5MB) may take a few seconds to load
- Canvas rendering is real-time (no lag)
- Export is instant (<1s for most images)

## 🚫 Limitations

### Current Limitations
- ❌ Cannot crop multiple images at once (batch mode)
- ❌ Cannot save crop position for later
- ❌ Cannot rotate image before cropping
- ❌ Output is always JPEG (no PNG transparency)

### Workarounds
- **Batch**: Open cropper multiple times (still faster than manual)
- **Save position**: Take screenshot of canvas for reference
- **Rotate**: Rotate image before uploading
- **PNG**: Use other tools for transparent images

## 🔮 Future Enhancements

### Planned
- [ ] Batch crop mode (select multiple images)
- [ ] Save crop templates
- [ ] Image rotation within cropper
- [ ] PNG output with transparency
- [ ] More device presets (iPad, tablets, etc.)
- [ ] Free-form crop (no aspect ratio lock)
- [ ] Crop history (undo/redo)
- [ ] Direct upload to server after crop

### Maybe
- [ ] AI auto-crop (detect subject)
- [ ] Face detection for smart crop
- [ ] Grid overlay (rule of thirds)
- [ ] Filters and adjustments
- [ ] Video thumbnail extraction
- [ ] Animated GIF cropping
- [ ] PDF page cropping

## 📝 Notes

### Performance Optimization
- Canvas uses requestAnimationFrame for smooth rendering
- Image scaling is done in-memory (no server calls)
- Blob URLs are cleaned up after use

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ IE11 (not supported)

### Mobile Support
- ✅ Touch drag to move crop area
- ✅ Pinch zoom (limited support)
- ⚠️ Small screen: UI may be cramped
- ✅ File picker works on mobile

## 🔗 Integration

### Component Props
```javascript
<ImageCropper
  imageFile={file}        // File object
  imageUrl={url}          // Preview URL (blob or http)
  onClose={() => {...}}   // Close handler
  onSave={(croppedFile, cropInfo) => {...}} // Save handler
/>
```

### Save Handler
```javascript
const handleCropSave = (croppedFile, cropInfo) => {
  // croppedFile: File object with cropped image
  // cropInfo: { preset, dimensions, originalSize }
  
  // Download or upload to server
  downloadFile(croppedFile);
  // or
  uploadToServer(croppedFile);
};
```

## 📚 Related Documentation
- `EXIF_EDITOR_GUIDE.md` - EXIF metadata editor
- `EXIF_PROFILES_GUIDE.md` - EXIF profile management
- `MEDIA_MANAGER.md` - Media upload and management

---

**Version**: 1.0.0
**Date**: 26/11/2025
**Component**: `src/components/ImageCropper.jsx`
**Status**: ✅ Production ready
**Author**: GitHub Copilot
