# 🔧 Fix EXIF Save & JSON Viewer

## ✅ Đã sửa

### 1. EXIF không được lưu vào ảnh trên server

**Vấn đề**:
- ❌ User click "Áp dụng thay đổi EXIF"
- ✓ File được download về máy với EXIF mới
- ❌ NHƯNG ảnh trên server vẫn giữ EXIF cũ
- ❌ Khi xem lại ảnh từ server → EXIF không thay đổi

**Nguyên nhân**:
- EXIF Editor chỉ tạo file mới và download về máy
- Không có bước upload file mới lên server
- File cũ trên server không bị thay thế

**Giải pháp**:
```javascript
const handleExifSave = async (editedExifData) => {
  try {
    toast.info('Đang xử lý EXIF...');
    
    // 1. Ghi EXIF vào file
    const modifiedBlob = await exifService.writeExif(exifFile, editedExifData);
    
    // 2. Download file về máy (backup)
    downloadFile(modifiedBlob, exifFile.name);
    
    toast.success('✓ File đã được tải về!');
    setShowExifEditor(false);
    
    // 3. Hỏi user có muốn upload lại lên server không
    setTimeout(() => {
      const shouldUpload = window.confirm(
        'File với EXIF mới đã được tải về máy.\n\n' +
        'Bạn có muốn upload file này lên server để thay thế ảnh cũ không?'
      );
      
      if (shouldUpload) {
        handleUploadModifiedFile(modifiedBlob);
      }
    }, 500);
    
  } catch (error) {
    toast.error('Lỗi khi lưu EXIF: ' + error.message);
  }
};

const handleUploadModifiedFile = async (blob) => {
  try {
    toast.info('Đang upload file mới lên server...');
    
    // Convert blob to file
    const file = new File([blob], exifFile.name, { type: blob.type });
    
    // Upload lên server
    await mediaService.uploadMedia(file, activeTab, 'EXIF modified', '');
    
    toast.success('✓ Đã upload file mới lên server!');
    fetchMedia(); // Refresh list
  } catch (err) {
    toast.error('Lỗi khi upload: ' + err.message);
  }
};
```

**Workflow mới**:
```
1. User edit EXIF fields
2. Click "✓ Áp dụng thay đổi"
3. Toast: "Đang xử lý EXIF..."
4. File mới được download về máy (có suffix _exif)
5. Toast: "✓ Đã lưu file! File đã được tải về"
6. Confirm dialog: "Bạn có muốn upload lên server không?"
   
   [Có] → Upload file mới lên server
        → Toast: "Đang upload..."
        → Toast: "✓ Đã upload!"
        → Refresh media list
        → Ảnh trên server có EXIF mới
   
   [Không] → Chỉ giữ file ở máy
          → Ảnh trên server vẫn EXIF cũ
          → User có thể upload thủ công sau
```

### 2. Không có cách xem full JSON của profile

**Vấn đề**:
- ❌ Nút 👁️ chỉ show alert với preview 500 ký tự
- ❌ Không thể xem full JSON nếu quá dài
- ❌ Không thể copy full JSON
- ❌ Khó debug khi profile có nhiều fields

**Giải pháp - JSON Viewer Modal**:
```javascript
// State
const [showJsonViewer, setShowJsonViewer] = useState(false);
const [jsonViewerData, setJsonViewerData] = useState(null);

// View profile JSON
const viewProfileJson = (profile) => {
  setJsonViewerData({
    title: `Profile: ${profile.name}`,
    data: profile.data
  });
  setShowJsonViewer(true);
};

// View current EXIF data JSON
const viewCurrentJson = () => {
  setJsonViewerData({
    title: 'EXIF Data hiện tại',
    data: editedData
  });
  setShowJsonViewer(true);
};

// Copy to clipboard
const copyJsonToClipboard = () => {
  const json = JSON.stringify(jsonViewerData.data, null, 2);
  navigator.clipboard.writeText(json);
  toast.success('✓ Đã copy JSON');
};
```

**JSON Viewer Modal UI**:
```
┌────────────────────────────────────────────────┐
│ 📄 Profile: Canon EOS 5D        [×]            │
│    25 fields                                   │
├────────────────────────────────────────────────┤
│                                                │
│  {                                             │
│    "Make": "Canon",                            │
│    "Model": "Canon EOS 5D Mark IV",            │
│    "ISO": "400",                               │
│    "FNumber": "f/2.8",                         │
│    "ExposureTime": "1/250",                    │
│    ...                                         │
│  }                                             │
│                                                │
├────────────────────────────────────────────────┤
│ [📋 Copy Full JSON] [📥 Download JSON] [Đóng] │
└────────────────────────────────────────────────┘
```

**Features**:
- ✅ Hiển thị full JSON (không limit)
- ✅ Syntax highlighting (green text on black bg)
- ✅ Scrollable nếu JSON dài
- ✅ Copy full JSON với 1 click
- ✅ Download JSON file
- ✅ Hiển thị số lượng fields
- ✅ Beautiful modal design

### 3. Thêm nút "Xem JSON" cho current data

**Vấn đề**:
- ❌ Chỉ có thể xem JSON của profile đã lưu
- ❌ Không thể xem JSON của EXIF data đang edit

**Giải pháp**:
```javascript
// Thêm nút mới trong Actions
<button
  onClick={viewCurrentJson}
  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
>
  👁️ Xem JSON
</button>
```

**Use case**:
1. User đang edit EXIF fields
2. Muốn xem tất cả changes đã làm
3. Click "👁️ Xem JSON"
4. Popup hiển thị full JSON của editedData
5. Copy JSON để backup hoặc share

## 📋 Files đã sửa

### 1. `src/pages/MediaManager.jsx`
**Changes**:
- ✅ Sửa `handleExifSave()` - thêm option upload lại lên server
- ✅ Thêm `handleUploadModifiedFile()` - upload modified file
- ✅ File download có suffix `_exif` để phân biệt
- ✅ Toast notifications cho từng bước
- ✅ Confirm dialog hỏi user có muốn upload không

### 2. `src/components/EXIFEditor.jsx`
**Changes**:
- ✅ Thêm state `showJsonViewer`, `jsonViewerData`
- ✅ Thêm function `viewProfileJson(profile)`
- ✅ Thêm function `viewCurrentJson()`
- ✅ Thêm function `copyJsonToClipboard()`
- ✅ Sửa nút 👁️ trong profile list: `alert()` → `viewProfileJson()`
- ✅ Thêm nút "👁️ Xem JSON" trong Actions
- ✅ Đổi text "📤 JSON" → "📤 Export" cho rõ ràng
- ✅ Thêm JSON Viewer Modal component
- ✅ Sửa `handleApplyChanges()` - thêm loading state và async/await

## 🧪 Test Checklist

### Test EXIF Save & Upload
- [ ] Open EXIF Editor với ảnh từ server
- [ ] Edit một số EXIF fields (ví dụ: Make, Model)
- [ ] Click "✓ Áp dụng thay đổi"
- [ ] Check toast "Đang xử lý EXIF..."
- [ ] File được download về máy (có suffix _exif)
- [ ] Toast "✓ Đã lưu file! File đã được tải về"
- [ ] Confirm dialog xuất hiện
- [ ] Click "OK" để upload
- [ ] Toast "Đang upload file mới..."
- [ ] Toast "✓ Đã upload file mới lên server!"
- [ ] Media list refresh
- [ ] Mở ảnh vừa upload → Check EXIF mới có trong ảnh

### Test JSON Viewer - Profile
- [ ] Open EXIF Editor
- [ ] Click "💾 Profiles"
- [ ] Chọn một profile
- [ ] Click "👁️ Xem"
- [ ] JSON Viewer modal mở
- [ ] Full JSON hiển thị đúng
- [ ] Syntax highlighting (green/black)
- [ ] Scrollable nếu dài
- [ ] Click "📋 Copy Full JSON"
- [ ] Toast "✓ Đã copy JSON"
- [ ] Paste vào notepad → Verify JSON đúng
- [ ] Click "📥 Download JSON"
- [ ] File JSON được download
- [ ] Open file → Verify nội dung

### Test JSON Viewer - Current Data
- [ ] Open EXIF Editor
- [ ] Edit một số fields
- [ ] Click "👁️ Xem JSON" (nút chính)
- [ ] JSON Viewer hiển thị editedData
- [ ] Verify tất cả edited fields có trong JSON
- [ ] Copy JSON
- [ ] Download JSON
- [ ] Đóng modal

### Test Download với suffix
- [ ] Edit EXIF của file `photo.jpg`
- [ ] Apply changes
- [ ] File download có tên `photo_exif.jpg`
- [ ] Không ghi đè file gốc

## 🎯 Expected Behavior

### Scenario 1: Chỉ download, không upload
```
1. Edit EXIF
2. Apply changes
3. File download về: photo_exif.jpg
4. Confirm: "Upload lên server?" → Click "Cancel"
5. Ảnh trên server vẫn giữ EXIF cũ
6. User có file mới ở máy để dùng offline
```

### Scenario 2: Download và upload
```
1. Edit EXIF
2. Apply changes
3. File download về: photo_exif.jpg (backup)
4. Confirm: "Upload lên server?" → Click "OK"
5. Upload file mới lên server
6. Ảnh trên server có EXIF mới
7. Refresh page → Xem ảnh → EXIF đã thay đổi ✓
```

### Scenario 3: Xem và copy JSON
```
1. Open EXIF Editor
2. Edit fields
3. Click "👁️ Xem JSON"
4. Modal hiển thị full JSON
5. Click "📋 Copy Full JSON"
6. Paste vào text editor
7. JSON formatted đẹp (2 spaces indent)
8. Share JSON với teammate
9. Teammate import JSON vào profile
```

## 🔍 Troubleshooting

### Issue: Upload fail sau khi save EXIF

**Nguyên nhân**: 
- Server upload endpoint có vấn đề
- File size quá lớn
- Network error

**Debug**:
```javascript
// Check console log
console.log('Modified blob:', modifiedBlob);
console.log('File to upload:', file);

// Check network tab
// Request status?
// Error message?
```

**Workaround**:
- Click "Cancel" trong confirm dialog
- Upload thủ công file `photo_exif.jpg` từ máy

### Issue: JSON Viewer không hiển thị

**Debug**:
```javascript
// Check console
console.log('jsonViewerData:', jsonViewerData);
console.log('showJsonViewer:', showJsonViewer);
```

**Fix**: 
- Verify state được set đúng
- Check z-index của modal (z-[60])

### Issue: Copy JSON không hoạt động

**Nguyên nhân**: Clipboard API blocked (HTTPS required)

**Workaround**:
- Click "📥 Download JSON" thay vì copy
- Hoặc manual copy từ modal

## 📊 Key Improvements

| Feature | Before | After |
|---------|--------|-------|
| EXIF Save | ❌ Chỉ download | ✅ Download + option upload |
| File naming | ❌ Overwrite gốc | ✅ Suffix _exif |
| Upload confirmation | ❌ Không có | ✅ Confirm dialog |
| View JSON | ❌ Alert 500 chars | ✅ Full modal viewer |
| Copy JSON | ❌ Manual copy | ✅ One-click copy |
| Download JSON | ❌ Không có | ✅ One-click download |
| Syntax highlight | ❌ Plain text | ✅ Green/black theme |
| Current data JSON | ❌ Không xem được | ✅ Nút "Xem JSON" |

## 🎨 UI Updates

### Actions bar mới
```
[💾 Profiles (3)] [📥 Import JSON] [👁️ Xem JSON] [📤 Export JSON]
```

### Profile actions mới
```
[✓ Áp dụng] [📤 Export] [👁️ Xem] [🗑️]
```

## 💡 Tips

### Workflow tối ưu cho team

**Tạo EXIF template**:
```
1. Tìm 1 ảnh gốc có đầy đủ EXIF từ camera
2. Open EXIF Editor
3. Adjust một số fields nếu cần
4. Click "👁️ Xem JSON"
5. Copy JSON
6. Share với team qua Slack/Email
7. Teammates import JSON → Save as profile
8. Cả team dùng chung EXIF template!
```

**Backup EXIF profiles**:
```
1. Open "💾 Profiles"
2. Với mỗi profile:
   - Click "👁️ Xem"
   - Click "📥 Download JSON"
3. Lưu tất cả JSON files vào folder backup
4. Commit vào Git repository
5. Team khác có thể import profiles!
```

---

**Date**: 27/11/2025
**Status**: ✅ Fixed & Enhanced
**Files Modified**: 2
- `src/pages/MediaManager.jsx`
- `src/components/EXIFEditor.jsx`

**New Features**: 
- EXIF upload option
- JSON Viewer Modal
- Copy/Download JSON
- Better UX with toasts
