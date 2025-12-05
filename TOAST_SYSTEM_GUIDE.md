# 🔔 Toast Notification System

## 📋 Tổng quan

Hệ thống thông báo Toast thay thế hoàn toàn alert() với UI đẹp hơn, UX tốt hơn, và không blocking.

## ✨ Tính năng

### Toast Types
- ✅ **Success** - Màu xanh lá, thông báo thành công
- ❌ **Error** - Màu đỏ, thông báo lỗi
- ⚠️ **Warning** - Màu vàng, cảnh báo
- ℹ️ **Info** - Màu xanh dương, thông tin

### Features
- ✅ Auto dismiss sau 3 giây (configurable)
- ✅ Click to dismiss
- ✅ Slide-in animation
- ✅ Multiple toasts (stack)
- ✅ Non-blocking (không dừng UI)
- ✅ Mobile friendly

## 🚀 Cách sử dụng

### Import
```javascript
import { toast } from '../components/Toast';
```

### Basic Usage
```javascript
// Success
toast.success('✓ Upload thành công!');

// Error
toast.error('Lỗi khi tải ảnh');

// Warning
toast.warning('Vui lòng chọn file!');

// Info
toast.info('Đang tải xuống...');
```

### Custom Duration
```javascript
// Hiển thị trong 5 giây
toast.success('✓ Đã lưu!', 5000);

// Hiển thị trong 2 giây (ngắn)
toast.success('✓ Copied!', 2000);

// Hiển thị lâu hơn cho thông báo dài
toast.error('Lỗi: Connection timeout. Vui lòng kiểm tra mạng.', 6000);
```

### Examples trong MediaManager

#### Upload Success
```javascript
await mediaService.uploadMedia(selectedFile, activeTab, description, tags);
toast.success('✓ Upload thành công!');
```

#### File Selected
```javascript
const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    setSelectedFile(file);
    toast.info(`Đã chọn: ${file.name}`);
  }
};
```

#### Copy URL
```javascript
const copyUrl = (url) => {
  navigator.clipboard.writeText(url);
  toast.success('✓ Đã copy URL', 2000);
};
```

#### Download Image
```javascript
const downloadImage = async (item) => {
  try {
    toast.info('Đang tải xuống...');
    // ... download logic ...
    toast.success('✓ Đã tải xuống: ' + item.originalName);
  } catch (err) {
    toast.error('Lỗi khi tải xuống: ' + err.message);
  }
};
```

#### Validation
```javascript
if (!selectedFile) {
  toast.warning('Vui lòng chọn file!');
  return;
}
```

## 🎨 UI Design

### Position
```
┌─────────────────────────────────────────────────┐
│                                    [Toast 1]    │
│                                    [Toast 2]    │
│                                    [Toast 3]    │
│                                                 │
│                                                 │
│                  Main Content                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Toast Structure
```
┌────────────────────────────────────────────┐
│ ✓  Upload thành công!                  × │
└────────────────────────────────────────────┘
 ^          ^                              ^
Icon    Message                         Close
```

### Colors
- **Success**: `bg-green-500 text-white`
- **Error**: `bg-red-500 text-white`
- **Warning**: `bg-yellow-500 text-white`
- **Info**: `bg-blue-500 text-white`

### Animation
```css
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

## 🔧 Technical Details

### Component Structure
```
src/components/Toast.jsx
├── Toast component (container)
├── toast object (global API)
│   ├── success()
│   ├── error()
│   ├── warning()
│   └── info()
└── toastListeners (event system)
```

### State Management
```javascript
// Global toast ID counter
let toastId = 0;

// Listeners set for React components
const toastListeners = new Set();

// Add toast function
const addToast = (message, type, duration) => {
  const id = toastId++;
  const toast = { id, message, type, duration };
  toastListeners.forEach(listener => listener(toast));
  return id;
};
```

### Auto Dismiss
```javascript
useEffect(() => {
  const listener = (newToast) => {
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, newToast.duration);
    }
  };
  
  toastListeners.add(listener);
  return () => toastListeners.delete(listener);
}, []);
```

### Props
```typescript
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number; // milliseconds
}
```

## 📊 Migration từ Alert

### Before (Alert)
```javascript
// ❌ Blocking, xấu, không professional
alert('✓ Upload thành công!');
alert('Lỗi khi upload: ' + err.message);
alert('Vui lòng chọn file!');
```

### After (Toast)
```javascript
// ✅ Non-blocking, đẹp, professional
toast.success('✓ Upload thành công!');
toast.error('Lỗi khi upload: ' + err.message);
toast.warning('Vui lòng chọn file!');
```

### Confirm Dialogs
**Giữ nguyên** `window.confirm()` cho các actions quan trọng:
```javascript
// ✅ Vẫn dùng confirm cho delete
if (!window.confirm('Xóa file này?')) return;
await mediaService.deleteMedia(id);
toast.success('✓ Đã xóa file');
```

## 📝 Best Practices

### 1. Choose Right Type
```javascript
// Success - Action hoàn thành
toast.success('✓ Đã lưu file');

// Error - Có lỗi xảy ra
toast.error('Lỗi kết nối server');

// Warning - Validation, nhắc nhở
toast.warning('Vui lòng nhập đầy đủ thông tin');

// Info - Thông tin, đang xử lý
toast.info('Đang tải xuống...');
```

### 2. Message Guidelines
```javascript
// ✅ Good - Ngắn gọn, rõ ràng
toast.success('✓ Upload thành công!');
toast.error('Lỗi kết nối');

// ❌ Bad - Quá dài
toast.success('Hệ thống đã upload file của bạn lên server thành công và file đã được lưu vào database');

// ✅ Good - Có context
toast.success('✓ Đã tải xuống: photo.jpg');

// ❌ Bad - Không rõ
toast.success('Xong');
```

### 3. Duration Timing
```javascript
// 2 seconds - Quick feedback
toast.success('✓ Copied!', 2000);

// 3 seconds (default) - Standard
toast.success('✓ Upload thành công!');

// 4-5 seconds - Thông báo dài
toast.success('✓ Đã cắt ảnh! Khung: iPhone 12 • 1170×2532', 4000);

// 5-6 seconds - Error messages
toast.error('Lỗi: Connection timeout. Vui lòng kiểm tra kết nối mạng.', 6000);
```

### 4. Multiple Toasts
```javascript
// ✅ Good - Sequential
toast.info('Đang tải xuống...');
// ... download ...
toast.success('✓ Đã tải xuống!');

// ✅ Good - Batch operations
files.forEach(async (file) => {
  await upload(file);
  toast.success(`✓ ${file.name}`);
});

// ❌ Bad - Spam
for (let i = 0; i < 100; i++) {
  toast.success('Done ' + i); // Quá nhiều!
}
```

### 5. Icons in Messages
```javascript
// ✅ Good - Có icon tăng visual feedback
toast.success('✓ Upload thành công!');
toast.error('❌ Lỗi kết nối');
toast.warning('⚠️ File quá lớn');
toast.info('📥 Đang tải xuống...');

// ✅ Also good - Emoji relevant
toast.success('✂️ Đã cắt ảnh thành công!');
toast.success('📸 Đã lưu EXIF!');
toast.success('🗑️ Đã xóa file');
```

## 🎯 Use Cases

### Use Case 1: File Upload
```javascript
const handleUpload = async () => {
  if (!selectedFile) {
    toast.warning('Vui lòng chọn file!');
    return;
  }

  try {
    setUploadProgress(true);
    await mediaService.uploadMedia(selectedFile, activeTab, description, tags);
    toast.success('✓ Upload thành công!');
    fetchMedia();
  } catch (err) {
    toast.error('Lỗi khi upload: ' + err.message);
  } finally {
    setUploadProgress(false);
  }
};
```

### Use Case 2: Copy to Clipboard
```javascript
const copyUrl = (url) => {
  navigator.clipboard.writeText(url);
  toast.success('✓ Đã copy URL', 2000);
};
```

### Use Case 3: EXIF Save
```javascript
const handleExifSave = async (editedExifData) => {
  try {
    const modifiedBlob = await exifService.writeExif(exifFile, editedExifData);
    exifService.downloadModifiedImage(modifiedBlob, exifFile.name);
    toast.success('✓ Đã lưu file với EXIF mới!');
    setShowExifEditor(false);
  } catch (error) {
    toast.error('Lỗi khi lưu EXIF: ' + error.message);
  }
};
```

### Use Case 4: Image Crop
```javascript
const handleCropSave = (croppedFile, cropInfo) => {
  // Download cropped image
  downloadFile(croppedFile);
  
  toast.success(
    `✂️ Đã cắt ảnh! Khung: ${cropInfo.preset} • ${cropInfo.dimensions}`,
    4000
  );
  
  setShowCropper(false);
};
```

### Use Case 5: Delete with Confirmation
```javascript
const handleDelete = async (id) => {
  // Vẫn dùng confirm cho action quan trọng
  if (!window.confirm('Xóa file này?')) return;

  try {
    await mediaService.deleteMedia(id);
    fetchMedia();
    toast.success('✓ Đã xóa file');
  } catch (err) {
    toast.error('Lỗi khi xóa: ' + err.message);
  }
};
```

## 🔮 Future Enhancements

### Planned
- [ ] Toast queue (limit max visible)
- [ ] Progress bar in toast
- [ ] Action buttons in toast
- [ ] Persistent toasts (no auto dismiss)
- [ ] Toast positions (top, bottom, left, right)
- [ ] Custom icons
- [ ] Sound effects (optional)

### Maybe
- [ ] Toast history/log
- [ ] Undo action in toast
- [ ] Group similar toasts
- [ ] Collapse multiple toasts
- [ ] Swipe to dismiss (mobile)

## 🐛 Known Issues

### Current Limitations
- No queue limit (100 toasts = 100 visible)
- No z-index conflict resolution
- No accessibility (ARIA labels)
- No keyboard navigation

### Workarounds
- Don't spam toasts in loops
- Use higher z-index for critical modals
- Screen readers see text content
- Click to dismiss works

## 📚 Related Files

```
src/
├── components/
│   └── Toast.jsx              # Toast component + API
├── App.jsx                    # Toast container mounted
├── index.css                  # Toast animations
└── pages/
    └── MediaManager.jsx       # Example usage
```

## 🔗 Integration Checklist

- [x] Create `Toast.jsx` component
- [x] Add animations to `index.css`
- [x] Mount `<Toast />` in `App.jsx`
- [x] Import `toast` in pages
- [x] Replace all `alert()` with `toast.*`
- [x] Test all toast types
- [x] Verify auto-dismiss timing
- [x] Check mobile responsiveness

---

**Version**: 1.0.0
**Date**: 27/11/2025
**Component**: `src/components/Toast.jsx`
**Status**: ✅ Production ready
**Replaced**: All `alert()` calls in MediaManager
