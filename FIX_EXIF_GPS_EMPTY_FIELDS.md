# 🐛 FIX: EXIF Import/Export Issues

## 📋 Vấn đề phát hiện

### 1. **GPSLongitude số âm mất dấu `-`**
```json
Input JSON:
"GPSLongitude": -118.260500  // Los Angeles (Tây kinh tuyến Greenwich)

Sau khi lưu vào ảnh và xem lại:
"GPSLongitude": 118.260500   // ❌ SAI! Mất dấu âm → Vị trí sai!
```

**Nguyên nhân:**
- JSON có `GPSLongitude: -118.260500` nhưng thiếu `GPSLongitudeRef: "W"`
- ExifTool cần **CẢ HAI**: giá trị số + Ref (W/E) để xác định đúng kinh độ

### 2. **Empty fields không bị xóa**
```json
Input JSON:
"Artist": "",
"UserComment": ""

Ảnh cũ có:
"Artist": "John Doe",
"UserComment": "Old comment"

Sau khi import JSON với REPLACE mode:
"Artist": "John Doe",      // ❌ SAI! Vẫn còn data cũ!
"UserComment": "Old comment"  // ❌ SAI! Không bị xóa!
```

**Nguyên nhân:**
Backend code:
```javascript
if (value !== null && value !== undefined && value !== '') {
  //                                          ^^^^^^^^^^^ 
  // Empty string bị SKIP, không ghi vào ảnh!
  tagsToWrite[field] = value;
}
```

---

## ✅ Giải pháp

### Fix 1: Backend - Cho phép empty string để xóa fields

**File:** `backend/routes/exif.js`

**Trước:**
```javascript
for (const [field, value] of Object.entries(exifData)) {
  if (fieldMapping[field] && value !== null && value !== undefined && value !== '') {
    tagsToWrite[fieldMapping[field]] = value;
  }
}
```

**Sau:**
```javascript
for (const [field, value] of Object.entries(exifData)) {
  if (fieldMapping[field]) {
    if (value === null || value === undefined) {
      continue; // Skip null/undefined
    } else if (value === '') {
      tagsToWrite[fieldMapping[field]] = ''; // XÓA field
    } else {
      tagsToWrite[fieldMapping[field]] = value; // Normal value
    }
  }
}
```

### Fix 2: Thêm GPS Refs vào fieldMapping

**Trước:**
```javascript
const fieldMapping = {
  'GPSLatitude': 'GPSLatitude',
  'GPSLongitude': 'GPSLongitude',
  // Thiếu Refs!
};
```

**Sau:**
```javascript
const fieldMapping = {
  'GPSLatitude': 'GPSLatitude',
  'GPSLongitude': 'GPSLongitude',
  'GPSLatitudeRef': 'GPSLatitudeRef',  // ✅ Thêm
  'GPSLongitudeRef': 'GPSLongitudeRef', // ✅ Thêm
  'GPSAltitudeRef': 'GPSAltitudeRef',  // ✅ Thêm
  'OffsetTime': 'OffsetTime',          // ✅ Thêm
  'OffsetTimeOriginal': 'OffsetTimeOriginal',
  'OffsetTimeDigitized': 'OffsetTimeDigitized',
  // ... other fields
};
```

### Fix 3: Frontend - Debug logging

**File:** `src/components/EXIFEditor.jsx`

Thêm console.log để verify:
```javascript
console.log('GPSLongitude từ JSON:', parsed.GPSLongitude);
console.log('GPSLongitude sau normalize:', normalized.GPSLongitude);
console.log('Artist từ JSON:', parsed.Artist, 'length:', parsed.Artist?.length);
```

---

## 🧪 Test Case

### Input JSON:
```json
{
  "GPSLatitude": 34.041500,
  "GPSLongitude": -118.260500,
  "GPSLatitudeRef": "N",
  "GPSLongitudeRef": "W",
  "Artist": "",
  "Copyright": "",
  "UserComment": ""
}
```

### Expected Result (sau khi import REPLACE + Save):

✅ **GPSLongitude**:
```
Value: -118.260500 (giữ nguyên dấu âm)
Ref: W (West)
→ Vị trí: 34.0415°N, 118.2605°W (Los Angeles, CA)
```

✅ **Artist**: Empty (xóa data cũ)
✅ **Copyright**: Empty (xóa data cũ)
✅ **UserComment**: Empty (xóa data cũ)

---

## 🔍 Hiểu về GPS Coordinates

### Format GPS trong EXIF:

#### Cách 1: Decimal Degrees (ExifTool)
```json
{
  "GPSLatitude": 34.041500,    // Số dương/âm
  "GPSLongitude": -118.260500, // Số âm = West
  "GPSLatitudeRef": "N",       // N = North, S = South
  "GPSLongitudeRef": "W"       // W = West, E = East
}
```

**Quy tắc:**
- **Latitude**: `-90` đến `+90`
  - Dương (+) hoặc Ref="N" → Bắc bán cầu
  - Âm (-) hoặc Ref="S" → Nam bán cầu

- **Longitude**: `-180` đến `+180`
  - Dương (+) hoặc Ref="E" → Đông kinh tuyến Greenwich
  - Âm (-) hoặc Ref="W" → Tây kinh tuyến Greenwich

#### Cách 2: Degrees Minutes Seconds
```
34°02'29.4"N, 118°15'37.8"W
→ 34.041500, -118.260500
```

### Lỗi thường gặp:

❌ **Chỉ có value, thiếu Ref:**
```json
{
  "GPSLongitude": -118.260500
  // Thiếu GPSLongitudeRef!
}
```
→ ExifTool có thể parse SAI: `-118.260500` thành `118.260500 E` (sai 180°!)

❌ **Ref sai:**
```json
{
  "GPSLongitude": -118.260500,
  "GPSLongitudeRef": "E"  // ❌ SAI! Phải là "W"
}
```
→ Vị trí sai hoàn toàn!

✅ **Đúng:**
```json
{
  "GPSLongitude": -118.260500,
  "GPSLongitudeRef": "W"  // ✅ ĐÚNG
}
```

---

## 📊 Debug Workflow

### Bước 1: Import JSON
```
1. Open EXIF Editor
2. Click "📥 Import JSON"
3. Chọn REPLACE mode
4. Paste JSON
5. Click Import
```

**Check Console:**
```
=== NORMALIZE DEBUG ===
GPSLongitude từ JSON: -118.2605 type: number
GPSLongitude sau normalize: -118.2605 type: string  ✅
Artist từ JSON:  type: string length: 0  ✅
Artist sau normalize:  type: string length: 0  ✅

=== REPLACE MODE ===
GPSLongitude in JSON: -118.2605
GPSLongitude in freshData: -118.2605  ✅
Artist in JSON: 
Artist in freshData:   ✅ (empty)
```

### Bước 2: Save to Image
```
1. Click "💾 Áp dụng EXIF mới"
2. Download image với suffix _exif
3. Click "Upload to server" (optional)
```

**Check Backend Console:**
```
=== EXIF WRITE DEBUG ===
GPSLongitude from client: -118.2605  ✅
GPSLongitudeRef from client: W  ✅
Artist from client:   ✅ (empty)
UserComment from client:   ✅ (empty)
Tags to write: {
  GPSLongitude: '-118.2605',
  GPSLongitudeRef: 'W',
  Artist: '',
  UserComment: ''
}
```

### Bước 3: Verify Result
```
1. Load ảnh mới vào EXIF Editor
2. Check GPS tab:
   ✅ GPSLongitude = "-118.2605"
   ✅ GPSLongitudeRef = "W"

3. Check Other tab:
   ✅ Artist = "" (rỗng)
   ✅ UserComment = "" (rỗng)
```

---

## 🎯 Checklist

### Frontend (`EXIFEditor.jsx`):
- [x] Normalize giữ nguyên số âm: `String(-118.2605)` → `"-118.2605"` ✅
- [x] REPLACE mode reset về template ✅
- [x] Empty string `""` được giữ nguyên ✅
- [x] Console.log debug ✅

### Backend (`backend/routes/exif.js`):
- [x] fieldMapping có GPSLatitudeRef/GPSLongitudeRef ✅
- [x] fieldMapping có OffsetTime* ✅
- [x] Cho phép empty string để xóa fields ✅
- [x] Console.log debug ✅

### Test Files:
- [x] `test-iphone13-full.json` - 51 fields iPhone 13 Pro ✅

---

## 🚀 Test Commands

### Test 1: GPS Coordinates
```json
{
  "GPSLatitude": 34.041500,
  "GPSLongitude": -118.260500,
  "GPSLatitudeRef": "N",
  "GPSLongitudeRef": "W"
}
```
Expected: `-118.260500` GIỮ NGUYÊN dấu âm!

### Test 2: Empty Fields
```json
{
  "Artist": "",
  "Copyright": "",
  "UserComment": "",
  "ImageDescription": ""
}
```
Expected: TẤT CẢ fields bị XÓA (empty)!

### Test 3: Roundtrip
```
1. Import JSON → Save → Export Non-Empty
2. So sánh JSON export với JSON input
3. ✅ Phải GIỐNG NHAU 100%!
```

---

**Updated:** 2025-11-27  
**Status:** ✅ FIXED  
**Files changed:**
- `backend/routes/exif.js` (fieldMapping + empty string handling)
- `src/components/EXIFEditor.jsx` (debug logging)
