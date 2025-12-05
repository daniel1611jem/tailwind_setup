# 📄 Full Profile JSON Viewer

## ✨ Cải tiến

Khi xem JSON của profile, giờ đây hiển thị **FULL thông tin**, không chỉ EXIF data.

## 🎯 Trước & Sau

### ❌ Trước đây
```json
{
  "Make": "Canon",
  "Model": "Canon EOS 5D Mark IV",
  "ISO": "400",
  ...
}
```
- Chỉ có EXIF data
- Không biết profile tên gì
- Không biết tạo lúc nào
- Không biết từ file ảnh nào

### ✅ Bây giờ
```json
{
  "profileInfo": {
    "id": 1732704800000,
    "name": "Canon EOS 5D Mark IV - Studio",
    "createdAt": "2025-11-27T10:30:00.000Z",
    "imageFileName": "IMG_1234.jpg",
    "totalFields": 25
  },
  "exifData": {
    "Make": "Canon",
    "Model": "Canon EOS 5D Mark IV",
    "ISO": "400",
    "FNumber": "f/2.8",
    "ExposureTime": "1/250",
    ...
  }
}
```

## 📊 Metadata hiển thị

### Profile Info Section
Hiển thị ngay trên JSON Viewer với UI đẹp:

```
┌────────────────────────────────────────────────┐
│ 📄 Profile: Canon EOS 5D    [×]                │
│    25 EXIF fields                              │
├────────────────────────────────────────────────┤
│ 📝 Tên Profile: Canon EOS 5D Mark IV - Studio  │
│ 🆔 ID: 1732704800000                           │
│ 📅 Ngày tạo: 27/11/2025, 10:30:00              │
│ 🖼️ File gốc: IMG_1234.jpg                      │
│ 📊 Số EXIF fields: 25                          │
├────────────────────────────────────────────────┤
│ {                                              │
│   "profileInfo": { ... },                      │
│   "exifData": { ... }                          │
│ }                                              │
├────────────────────────────────────────────────┤
│ [📋 Copy] [📥 Download] [Đóng]                 │
└────────────────────────────────────────────────┘
```

### Thông tin chi tiết

| Field | Mô tả | Ví dụ |
|-------|-------|-------|
| **id** | Unique ID (timestamp) | `1732704800000` |
| **name** | Tên profile do user đặt | `Canon EOS 5D - Studio` |
| **createdAt** | ISO 8601 timestamp | `2025-11-27T10:30:00.000Z` |
| **imageFileName** | File ảnh gốc | `IMG_1234.jpg` |
| **totalFields** | Số lượng EXIF fields | `25` |

## 💡 Use Cases

### Use Case 1: Audit Trail
**Tình huống**: Cần trace xem profile được tạo từ đâu, khi nào

**Trước**:
- ❌ Chỉ có EXIF data
- ❌ Không biết nguồn gốc
- ❌ Khó debug

**Bây giờ**:
```json
{
  "profileInfo": {
    "name": "Canon 5D - Test",
    "createdAt": "2025-11-27T10:30:00.000Z",
    "imageFileName": "IMG_1234.jpg"
  }
}
```
- ✅ Biết profile tạo lúc 10:30 ngày 27/11
- ✅ Biết từ file IMG_1234.jpg
- ✅ Dễ trace và debug

### Use Case 2: Profile Management
**Tình huống**: Có nhiều profiles, cần biết profile nào tạo lâu nhất

**Giải pháp**:
1. Export tất cả profiles
2. Check `createdAt` trong JSON
3. Sort theo thời gian
4. Delete profiles cũ không dùng

### Use Case 3: Team Collaboration
**Tình huống**: Share profile với teammate

**Trước**:
```
Email: "Đây là EXIF data cho Canon 5D..."
Attachment: exif-data.json (chỉ có data, không biết context)
```

**Bây giờ**:
```
Email: "Đây là profile Canon 5D - Studio"
Attachment: Canon-5D-Studio.json
```
```json
{
  "profileInfo": {
    "name": "Canon EOS 5D - Studio Setup",
    "createdAt": "2025-11-27T10:30:00.000Z",
    "imageFileName": "studio-reference.jpg",
    "totalFields": 25
  },
  "exifData": { ... }
}
```
- ✅ Teammate biết đây là profile gì
- ✅ Biết tạo từ file nào để reference
- ✅ Professional hơn

### Use Case 4: Version Control
**Tình huống**: Track changes của profiles qua thời gian

**Workflow**:
```
1. Tạo profile v1 → createdAt: 2025-11-20
2. Tạo profile v2 → createdAt: 2025-11-27
3. Compare 2 JSON files
4. Thấy rõ timeline và changes
```

### Use Case 5: Data Recovery
**Tình huống**: Profile bị corrupt hoặc mất

**Recovery**:
```
1. Check backup JSON files
2. Xem profileInfo.createdAt
3. Restore version mới nhất
4. Import lại vào system
```

## 🎨 UI Design

### Profile Info Bar
**Background**: Gradient blue-purple
**Layout**: 2 columns grid
**Icons**: Emoji cho mỗi field

```css
bg-gradient-to-r from-blue-50 to-purple-50
grid-cols-2 gap-4
```

### Fields
- 📝 **Tên Profile**: Bold, dark text
- 🆔 **ID**: Monospace font, small, gray
- 📅 **Ngày tạo**: Vietnamese locale format
- 🖼️ **File gốc**: Filename only
- 📊 **Số fields**: Blue, bold

## 🔧 Technical Details

### Data Structure
```typescript
interface ProfileViewerData {
  title: string;
  data: {
    profileInfo: {
      id: number;
      name: string;
      createdAt: string;
      imageFileName: string;
      totalFields: number;
    };
    exifData: {
      [key: string]: string;
    };
  };
  isFullProfile: boolean;
}
```

### viewProfileJson() Function
```javascript
const viewProfileJson = (profile) => {
  setJsonViewerData({
    title: `Profile: ${profile.name}`,
    data: {
      profileInfo: {
        id: profile.id,
        name: profile.name,
        createdAt: profile.createdAt,
        imageFileName: profile.imageFileName,
        totalFields: Object.keys(profile.data).length
      },
      exifData: profile.data
    },
    isFullProfile: true
  });
  setShowJsonViewer(true);
};
```

### Date Formatting
```javascript
// Convert ISO 8601 to Vietnamese locale
new Date(jsonViewerData.data.profileInfo.createdAt)
  .toLocaleString('vi-VN')

// Output: "27/11/2025, 10:30:00"
```

## 📥 Export Format

### Full Profile JSON
```json
{
  "profileInfo": {
    "id": 1732704800000,
    "name": "Canon EOS 5D Mark IV - Studio",
    "createdAt": "2025-11-27T10:30:00.000Z",
    "imageFileName": "IMG_1234.jpg",
    "totalFields": 25
  },
  "exifData": {
    "Make": "Canon",
    "Model": "Canon EOS 5D Mark IV",
    "Software": "Firmware Version 1.3.0",
    "LensModel": "EF 24-70mm f/2.8L II USM",
    "FNumber": "f/2.8",
    "ExposureTime": "1/250",
    "ISO": "400",
    "FocalLength": "50mm",
    "DateTime": "2025:11:27 10:30:45",
    "DateTimeOriginal": "2025:11:27 10:30:45",
    "GPSLatitude": "21.0285",
    "GPSLongitude": "105.8542",
    "Copyright": "© 2025 Your Name",
    "Artist": "Your Name",
    ... (20+ more fields)
  }
}
```

### EXIF Data Only (Current Data Viewer)
```json
{
  "Make": "Canon",
  "Model": "Canon EOS 5D Mark IV",
  "ISO": "400",
  ...
}
```

## 🔄 Comparison

### Profile JSON vs Current Data JSON

| Aspect | Profile JSON | Current Data JSON |
|--------|-------------|-------------------|
| Metadata | ✅ Có (profileInfo) | ❌ Không |
| ID | ✅ Có | ❌ Không |
| Timestamp | ✅ Có | ❌ Không |
| Source file | ✅ Có | ❌ Không |
| Field count | ✅ Có | ❌ Không |
| EXIF data | ✅ Có (nested) | ✅ Có (root) |
| Use case | Archive, share, audit | Quick export, import |

## 📋 Migration Notes

### Breaking Changes
**None** - Backward compatible

### For existing profiles
- Old profiles chỉ có `data` field
- Khi view → System tự tạo `profileInfo` on-the-fly
- Không cần migrate database

### For new profiles
- Tự động include full metadata
- JSON format mới
- Better for long-term storage

## 🎯 Benefits

### 1. Traceability
- ✅ Biết profile tạo khi nào
- ✅ Biết từ file ảnh nào
- ✅ Dễ audit và debug

### 2. Organization
- ✅ Có ID unique để reference
- ✅ Có timestamp để sort
- ✅ Có filename để trace

### 3. Collaboration
- ✅ Share với context đầy đủ
- ✅ Professional hơn
- ✅ Dễ hiểu cho người khác

### 4. Documentation
- ✅ Self-documenting JSON
- ✅ Không cần explain riêng
- ✅ Metadata ngay trong file

### 5. Version Control
- ✅ Git-friendly format
- ✅ Easy to diff
- ✅ Track changes over time

## 🧪 Testing

### Test Full Profile View
```
1. Open EXIF Editor
2. Click "💾 Profiles"
3. Chọn một profile
4. Click "👁️ Xem"
5. ✓ Profile Info bar hiển thị
6. ✓ Tất cả metadata hiển thị đúng
7. ✓ EXIF data hiển thị ở exifData object
8. Click "📋 Copy Full JSON"
9. Paste vào text editor
10. ✓ JSON có cả profileInfo và exifData
```

### Test Current Data View
```
1. Open EXIF Editor
2. Edit một số fields
3. Click "👁️ Xem JSON"
4. ✓ Không có Profile Info bar
5. ✓ Chỉ có EXIF data (flat structure)
6. ✓ Đơn giản hơn cho quick export
```

## 💾 Storage Format

### LocalStorage
```javascript
// Profiles array in localStorage
[
  {
    id: 1732704800000,
    name: "Canon 5D - Studio",
    data: { Make: "Canon", ... },
    createdAt: "2025-11-27T10:30:00.000Z",
    imageFileName: "IMG_1234.jpg"
  },
  ...
]
```

### Export JSON File
```javascript
// Full profile with metadata
{
  profileInfo: { ... },
  exifData: { ... }
}
```

## 🔮 Future Enhancements

### Planned
- [ ] lastModified timestamp
- [ ] modifiedBy user info
- [ ] version number
- [ ] changelog array
- [ ] tags/categories

### Maybe
- [ ] Import count (how many times used)
- [ ] Related profiles (parent/child)
- [ ] Thumbnail preview
- [ ] Statistics (avg values)

---

**Version**: 2.0.0
**Date**: 27/11/2025
**Feature**: Full Profile JSON Viewer
**Status**: ✅ Production Ready
**Files Modified**: `src/components/EXIFEditor.jsx`
