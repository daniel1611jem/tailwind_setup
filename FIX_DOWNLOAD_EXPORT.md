# 🔧 Fix Download & Export Issues

## ✅ Đã sửa

### 1. Download Image không hoạt động
**Nguyên nhân**: 
- Thiếu CORS headers khi fetch
- Không appendChild element trước khi click
- Cleanup quá nhanh

**Giải pháp**:
```javascript
const downloadImage = async (item) => {
  try {
    toast.info('Đang tải xuống...');
    
    // Fetch với CORS headers
    const response = await fetch(item.url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = item.originalName || 'download';
    a.style.display = 'none';
    document.body.appendChild(a);  // ← Thêm vào DOM
    a.click();
    
    // Cleanup sau một chút để đảm bảo download hoàn tất
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);  // ← Delay cleanup
    
    toast.success('✓ Đã tải xuống: ' + item.originalName);
  } catch (err) {
    console.error('Download error:', err);
    
    // Fallback: Open in new tab nếu CORS fail
    if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
      toast.warning('Đang mở ảnh trong tab mới...');
      window.open(item.url, '_blank');
    } else {
      toast.error('Lỗi khi tải xuống: ' + err.message);
    }
  }
};
```

### 2. Export JSON không hoạt động
**Nguyên nhân**:
- Không appendChild vào DOM trước khi click
- Cleanup ngay lập tức

**Giải pháp**:
```javascript
const exportProfileToJson = (profile) => {
  try {
    const json = JSON.stringify(profile.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exif-profile-${profile.name.replace(/\s+/g, '-')}.json`;
    a.style.display = 'none';
    document.body.appendChild(a);  // ← CRITICAL
    a.click();
    
    setTimeout(() => {  // ← CRITICAL
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    toast.success(`✓ Đã export profile: ${profile.name}`);
  } catch (err) {
    console.error('Export error:', err);
    toast.error('Lỗi khi export: ' + err.message);
  }
};

const exportCurrentToJson = () => {
  try {
    const json = JSON.stringify(editedData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exif-data-${Date.now()}.json`;
    a.style.display = 'none';
    document.body.appendChild(a);  // ← CRITICAL
    a.click();
    
    setTimeout(() => {  // ← CRITICAL
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    toast.success('✓ Đã export EXIF data');
  } catch (err) {
    console.error('Export error:', err);
    toast.error('Lỗi khi export: ' + err.message);
  }
};
```

### 3. Thêm Toast Notifications
**Thay thế tất cả alert() bằng toast**:
```javascript
// ❌ Before
alert('Vui lòng nhập tên profile!');
alert('✓ Đã lưu profile');
alert('✓ Đã load profile');
alert('✓ Đã xóa profile');
alert('✓ Đã import fields từ JSON');
alert('Lỗi khi parse JSON');

// ✅ After
toast.warning('Vui lòng nhập tên profile!');
toast.success(`✓ Đã lưu profile "${name}"`);
toast.success(`✓ Đã load profile "${name}"`);
toast.success('✓ Đã xóa profile');
toast.success(`✓ Đã import ${count} fields từ JSON`);
toast.error(`Lỗi khi parse JSON: ${error}`);
```

## 📋 Files đã sửa

### 1. `src/pages/MediaManager.jsx`
- ✅ Fix `downloadImage()` function
- ✅ Thêm CORS headers cho fetch
- ✅ Thêm appendChild trước click
- ✅ Delay cleanup 100ms
- ✅ Fallback: open in new tab nếu CORS fail

### 2. `src/components/EXIFEditor.jsx`
- ✅ Import `toast` từ Toast component
- ✅ Fix `exportProfileToJson()` function
- ✅ Fix `exportCurrentToJson()` function
- ✅ Thay alert bằng toast trong `saveCurrentAsProfile()`
- ✅ Thay alert bằng toast trong `loadProfile()`
- ✅ Thay alert bằng toast trong `deleteProfile()`
- ✅ Thay alert bằng toast trong `importFromJson()`

## 🧪 Test Checklist

### Download Image
- [ ] Click "⬇️ Tải" trên ảnh trong grid
- [ ] Verify file được download về máy
- [ ] Check toast "Đang tải xuống..." hiện lên
- [ ] Check toast "✓ Đã tải xuống: filename" hiện lên
- [ ] Nếu CORS fail, verify tab mới mở

### Export Profile JSON
- [ ] Mở EXIF Editor
- [ ] Click "💾 Profiles"
- [ ] Chọn một profile
- [ ] Click "📤 JSON"
- [ ] Verify file JSON được download
- [ ] Check toast "✓ Đã export profile: name"

### Export Current JSON
- [ ] Mở EXIF Editor với ảnh
- [ ] Edit một số EXIF fields
- [ ] Click "📤 Export JSON" (nút chính)
- [ ] Verify file JSON được download
- [ ] Check toast "✓ Đã export EXIF data"

### Save Profile
- [ ] Edit EXIF fields
- [ ] Click "💾 Profiles"
- [ ] Nhập tên profile
- [ ] Click "💾 Lưu"
- [ ] Check toast "✓ Đã lưu profile ..."
- [ ] Không còn alert popup

### Load Profile
- [ ] Click "💾 Profiles"
- [ ] Chọn profile
- [ ] Click "✓ Áp dụng"
- [ ] Confirm dialog (giữ nguyên)
- [ ] Check toast "✓ Đã load profile ..."
- [ ] Verify fields được fill

### Delete Profile
- [ ] Click "💾 Profiles"
- [ ] Click "🗑️" trên profile
- [ ] Confirm dialog (giữ nguyên)
- [ ] Check toast "✓ Đã xóa profile"
- [ ] Profile biến mất

### Import JSON
- [ ] Click "📥 Import JSON"
- [ ] Paste valid JSON
- [ ] Click "📥 Import"
- [ ] Check toast "✓ Đã import X fields từ JSON"
- [ ] Verify fields được fill
- [ ] Test invalid JSON → Check toast error

## 🔍 Debug Tips

### Nếu download vẫn không hoạt động:

**1. Check Console**
```javascript
// Mở DevTools Console (F12)
// Xem có error gì không:
- CORS errors?
- Network errors?
- JavaScript errors?
```

**2. Check Network Tab**
```
- Request có được gửi không?
- Response status code?
- Response headers có CORS headers không?
```

**3. Manual Test**
```javascript
// Paste vào Console để test download:
const blob = new Blob(['test'], { type: 'text/plain' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'test.txt';
a.style.display = 'none';
document.body.appendChild(a);
a.click();
setTimeout(() => {
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}, 100);
// File "test.txt" phải được download
```

### Nếu export JSON không hoạt động:

**1. Check Console**
```javascript
// Xem có error khi stringify không:
try {
  JSON.stringify(editedData, null, 2);
  console.log('JSON valid');
} catch (e) {
  console.error('JSON error:', e);
}
```

**2. Manual Test**
```javascript
// Paste vào Console:
const data = { test: 'hello' };
const json = JSON.stringify(data, null, 2);
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'test.json';
a.style.display = 'none';
document.body.appendChild(a);
a.click();
setTimeout(() => {
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}, 100);
// File "test.json" phải được download
```

## 🐛 Known Issues & Solutions

### Issue: Download hiển thị success nhưng file không có

**Nguyên nhân**: Browser block download do:
1. Popup blocker
2. Download settings
3. CORS restrictions

**Giải pháp**:
```javascript
// 1. Allow downloads trong browser settings
// 2. Check popup blocker không chặn
// 3. Verify CORS headers trên S3:
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

### Issue: Export JSON file rỗng

**Nguyên nhân**: Blob được cleanup trước khi download hoàn tất

**Giải pháp**: ✅ Đã fix với setTimeout 100ms

### Issue: Toast hiển thị nhưng không download

**Nguyên nhân**: Click() không trigger download

**Giải pháp**: 
```javascript
// Phải appendChild trước khi click
document.body.appendChild(a);  // ← CRITICAL
a.click();
```

## 📊 Expected Behavior

### Download Success
```
1. User click "⬇️ Tải"
2. Toast: "Đang tải xuống..." (blue)
3. Browser download dialog xuất hiện
4. File được lưu vào Downloads folder
5. Toast: "✓ Đã tải xuống: photo.jpg" (green)
```

### Download with CORS Error
```
1. User click "⬇️ Tải"
2. Toast: "Đang tải xuống..." (blue)
3. CORS error xảy ra
4. Toast: "Đang mở ảnh trong tab mới..." (yellow)
5. New tab mở với ảnh
6. User có thể right-click → Save Image
```

### Export JSON Success
```
1. User click "📤 Export JSON"
2. File "exif-data-1732704800000.json" được download
3. Toast: "✓ Đã export EXIF data" (green)
```

## 🎯 Key Changes Summary

| Function | Before | After |
|----------|--------|-------|
| downloadImage | ❌ Thiếu appendChild | ✅ appendChild + delay cleanup |
| exportProfileToJson | ❌ Click trực tiếp | ✅ appendChild + delay + toast |
| exportCurrentToJson | ❌ Click trực tiếp | ✅ appendChild + delay + toast |
| saveCurrentAsProfile | ❌ alert() | ✅ toast.success() |
| loadProfile | ❌ alert() | ✅ toast.success() |
| deleteProfile | ❌ alert() | ✅ toast.success() |
| importFromJson | ❌ alert() | ✅ toast.success/error() |

---

**Date**: 27/11/2025
**Status**: ✅ Fixed
**Files Modified**: 2
- `src/pages/MediaManager.jsx`
- `src/components/EXIFEditor.jsx`
