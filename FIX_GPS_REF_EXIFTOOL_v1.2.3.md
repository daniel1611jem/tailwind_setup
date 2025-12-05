# Fix GPS Ref bị sai khi ghi vào EXIF - v1.2.3

## Vấn đề phát hiện

**Triệu chứng:**
```
Frontend gửi: GPSLongitude=118.2605, GPSLongitudeRef='W'
Backend log: Tags to write: { GPSLongitude: 118.2605, GPSLongitudeRef: 'W' }
Kết quả file: Check trên web EXIF viewer → GPSLongitudeRef = 'E' ❌
```

**Tóm tắt:** Backend log hiển thị đúng `W`, nhưng file ảnh cuối cùng vẫn có `E`.

## Nguyên nhân gốc rễ

### ExifTool behavior với GPS coordinates

ExifTool (và chuẩn EXIF) xử lý GPS theo quy tắc:

**Quy tắc 1: GPS Reference được suy luận từ DẤU của số**
- Số dương → East/North
- Số âm → West/South

**Quy tắc 2: Khi GHI đồng thời số và Ref, ExifTool ưu tiên DẤU SỐ**

Ví dụ:
```javascript
// ❌ SAI - ExifTool sẽ ignore Ref, dùng dấu số
exiftool.write(file, {
  GPSLongitude: 118.2605,      // Dương
  GPSLongitudeRef: 'W'         // Conflict!
});
// Kết quả: 118.2605 E (vì số dương → auto = E)

// ✅ ĐÚNG - Dùng số âm để ExifTool tự set Ref
exiftool.write(file, {
  GPSLongitude: -118.2605      // Âm → auto set Ref = W
});
// Kết quả: 118.2605 W
```

### Vấn đề trong code cũ

**File:** `backend/routes/exif.js`

```javascript
// CODE CŨ - SAI ❌
if (field === 'GPSLongitude') {
  const lon = parseFloat(value);
  tagsToWrite['GPSLongitude'] = Math.abs(lon);  // ← Luôn GHI SỐ DƯƠNG!
  
  if (exifData.GPSLongitudeRef) {
    tagsToWrite['GPSLongitudeRef'] = exifData.GPSLongitudeRef; // ← Conflict với số dương
  }
}
```

**Kết quả:**
- Input: `lon = 118.2605, Ref = 'W'`
- Write: `{ GPSLongitude: 118.2605, GPSLongitudeRef: 'W' }`
- ExifTool: "Số 118.2605 dương → Phải là E, bỏ qua Ref=W"
- File: `118.2605 E` ❌

## Giải pháp

### Strategy mới: Chuyển đổi dấu số theo Ref

**Logic:**
1. Frontend gửi: `lon = 118.2605, Ref = 'W'`
2. Backend check: Ref='W' + số dương → **Đổi thành số âm**
3. Ghi vào ExifTool: `lon = -118.2605` (KHÔNG ghi Ref riêng)
4. ExifTool tự động: Số âm → Set Ref='W'
5. Kết quả: `118.2605 W` ✅

### Code mới

**File:** `backend/routes/exif.js`

```javascript
// GPS Longitude: Xử lý số âm
if (field === 'GPSLongitude') {
  const lon = parseFloat(value);
  if (!isNaN(lon)) {
    // Lấy Ref từ frontend HOẶC auto-detect từ dấu
    let ref;
    if (exifData.GPSLongitudeRef) {
      ref = normalizeExifValue('GPSLongitudeRef', exifData.GPSLongitudeRef);
    } else {
      ref = lon >= 0 ? 'E' : 'W';
    }
    
    // EXIFTOOL-VENDORED STRATEGY:
    // Nếu West → GHI SỐ ÂM
    // Nếu East → GHI SỐ DƯƠNG
    let finalLon = lon;
    if (ref === 'W' && lon > 0) {
      finalLon = -Math.abs(lon);  // ← CHUYỂN THÀNH ÂM
    } else if (ref === 'E' && lon < 0) {
      finalLon = Math.abs(lon);   // ← CHUYỂN THÀNH DƯƠNG
    }
    
    tagsToWrite['GPSLongitude'] = finalLon;  // ← GHI SỐ CÓ DẤU ĐÚNG
    
    console.log(`GPS Longitude: ${value} (Ref: ${ref}) → ${finalLon}`);
  }
  continue;
}

// SKIP GPS Ref fields - đã được xử lý trong GPS Latitude/Longitude
if (field === 'GPSLatitudeRef' || field === 'GPSLongitudeRef') {
  console.log(`Skipping ${field} - already merged into GPS coordinate`);
  continue;
}
```

### Thay đổi chính

1. **Đổi dấu số theo Ref:**
   - `Ref='W' + lon > 0` → `finalLon = -lon`
   - `Ref='E' + lon < 0` → `finalLon = +lon`

2. **Skip GPS Ref fields:**
   - Không ghi `GPSLongitudeRef` riêng
   - Để ExifTool tự suy luận từ dấu số

3. **Tương tự cho Latitude:**
   - `Ref='S' + lat > 0` → `finalLat = -lat`
   - `Ref='N' + lat < 0` → `finalLat = +lat`

## Flow hoàn chỉnh

### Case 1: Los Angeles (West)

```
Frontend:
  User nhập: GPSLongitude = "-118.2605"
  Auto-set: GPSLongitudeRef = "W"
  Gửi đến backend: { GPSLongitude: "-118.2605", GPSLongitudeRef: "W" }

Backend:
  Parse: lon = -118.2605 (âm)
  Ref từ frontend: "W"
  Check: Ref='W' && lon < 0 → finalLon = -118.2605 (GIỮ NGUYÊN)
  Write: { GPSLongitude: -118.2605 }

ExifTool:
  Nhận: -118.2605 (âm)
  Auto-set: GPSLongitudeRef = "W"
  Lưu: 118.2605 W ✅

Web EXIF Checker:
  Hiển thị: 118°15'13.8"W ✅
```

### Case 2: Tokyo (East)

```
Frontend:
  User nhập: GPSLongitude = "139.6503"
  Auto-set: GPSLongitudeRef = "E"
  Gửi: { GPSLongitude: "139.6503", GPSLongitudeRef: "E" }

Backend:
  Parse: lon = 139.6503 (dương)
  Ref: "E"
  Check: Ref='E' && lon > 0 → finalLon = 139.6503 (GIỮ NGUYÊN)
  Write: { GPSLongitude: 139.6503 }

ExifTool:
  Nhận: 139.6503 (dương)
  Auto-set: GPSLongitudeRef = "E"
  Lưu: 139.6503 E ✅
```

### Case 3: Sydney (South)

```
Frontend:
  User nhập: GPSLatitude = "-33.8688"
  Auto-set: GPSLatitudeRef = "S"
  Gửi: { GPSLatitude: "-33.8688", GPSLatitudeRef: "S" }

Backend:
  Parse: lat = -33.8688 (âm)
  Ref: "S"
  Check: Ref='S' && lat < 0 → finalLat = -33.8688 (GIỮ NGUYÊN)
  Write: { GPSLatitude: -33.8688 }

ExifTool:
  Nhận: -33.8688 (âm)
  Auto-set: GPSLatitudeRef = "S"
  Lưu: 33.8688 S ✅
```

## Testing Checklist

### Test với EXIF Checker websites
- [ ] https://exifdata.com/
- [ ] https://jimpl.com/
- [ ] https://www.metadata2go.com/

### Test Cases

#### TC1: West Longitude (Los Angeles)
```javascript
Input:  { GPSLongitude: "118.2605", GPSLongitudeRef: "W" }
Backend converts: 118.2605 → -118.2605
Expected EXIF: 118°15'37.8"W or 118.2605 W
```

#### TC2: East Longitude (Tokyo)
```javascript
Input:  { GPSLongitude: "139.6503", GPSLongitudeRef: "E" }
Backend converts: 139.6503 → 139.6503 (no change)
Expected EXIF: 139°39'1.08"E or 139.6503 E
```

#### TC3: South Latitude (Sydney)
```javascript
Input:  { GPSLatitude: "33.8688", GPSLatitudeRef: "S" }
Backend converts: 33.8688 → -33.8688
Expected EXIF: 33°52'7.68"S or 33.8688 S
```

#### TC4: North Latitude (Tokyo)
```javascript
Input:  { GPSLatitude: "35.6762", GPSLatitudeRef: "N" }
Backend converts: 35.6762 → 35.6762 (no change)
Expected EXIF: 35°40'34.32"N or 35.6762 N
```

#### TC5: User nhập số âm trực tiếp
```javascript
Frontend: User gõ "-118.2605"
Auto-set Ref: "W"
Send: { GPSLongitude: "-118.2605", GPSLongitudeRef: "W" }
Backend: -118.2605 (W) → -118.2605 (keep negative)
Expected: 118.2605 W
```

#### TC6: User đổi Ref từ E → W
```javascript
Current: { GPSLongitude: "118.2605", GPSLongitudeRef: "E" }
User changes Ref: "E" → "W"
Frontend auto-converts: 118.2605 → -118.2605
Send: { GPSLongitude: "-118.2605", GPSLongitudeRef: "W" }
Backend: -118.2605 (W) → -118.2605
Expected: 118.2605 W
```

## Debug Commands

### Kiểm tra EXIF sau khi save

**Windows PowerShell:**
```powershell
# Cài ExifTool standalone (nếu chưa có)
# Download từ: https://exiftool.org/

# Check GPS tags
exiftool -GPS* image.jpg

# Check cụ thể Longitude
exiftool -GPSLongitude -GPSLongitudeRef image.jpg

# Output mong đợi:
# GPS Longitude                   : 118 deg 15' 37.80" W
# GPS Longitude Ref               : West
```

**Node.js console:**
```javascript
const { exiftool } = require('exiftool-vendored');

// Read back để verify
const tags = await exiftool.read('modified_image.jpg');
console.log('GPSLongitude:', tags.GPSLongitude);
console.log('GPSLongitudeRef:', tags.GPSLongitudeRef);
// Expected: GPSLongitude: 118.2605, GPSLongitudeRef: 'W'
```

## Files Changed

### backend/routes/exif.js

**Lines ~213-257: GPS Latitude/Longitude processing**

**Thay đổi:**
1. Thêm logic chuyển đổi dấu số theo Ref
2. KHÔNG ghi `GPSLatitudeRef` và `GPSLongitudeRef` riêng
3. Skip GPS Ref fields trong main loop

**Impact:**
- GPS coordinates giờ đây được ghi CHÍNH XÁC theo Ref
- ExifTool tự động suy luận Ref từ dấu số
- Không còn conflict giữa số và Ref

## Lưu ý quan trọng

### 1. ExifTool conventions

ExifTool sử dụng quy tắc:
- **Số âm = West/South**
- **Số dương = East/North**

Đây là chuẩn quốc tế (ISO 6709):
```
Los Angeles:  34.0415, -118.2605  (N, W)
Tokyo:        35.6762, 139.6503   (N, E)
Sydney:      -33.8688, 151.2093   (S, E)
Cape Town:   -33.9249, 18.4241    (S, E)
```

### 2. EXIF Tag Priority

Khi ExifTool nhận cả số và Ref:
```javascript
// Trường hợp 1: Conflict
{ GPSLongitude: 118.2605,  GPSLongitudeRef: 'W' }
                    ↑ dương         ↑ West
// ExifTool: "Dấu số ưu tiên hơn Ref" → Kết quả: E

// Trường hợp 2: Consistent
{ GPSLongitude: -118.2605 }
                    ↑ âm
// ExifTool: "Số âm → auto Ref=W" → Kết quả: W
```

### 3. Roundtrip guarantee

Với fix này, GPS data được bảo toàn qua toàn bộ chu trình:

```
User Input → Frontend → Backend → ExifTool → File → Read → Display
-118.2605 → -118.2605 → -118.2605 → 118.2605W → 118.2605W → -118.2605
   (W)         (W)         (W)         (W)         (W)         (W)
```

### 4. Frontend không cần thay đổi

Frontend vẫn hoạt động như cũ:
- User nhập `-118.2605` → Auto-set Ref='W'
- User chọn Ref='W' → Auto-convert số thành âm
- Gửi cả số và Ref đến backend

Backend sẽ xử lý logic chuyển đổi cuối cùng.

## Version History

- **v1.2.1**: EXIF Editor với 120 fields, Profile system
- **v1.2.2**: Frontend GPS coordinate sync (auto-convert dấu số ↔ Ref)
- **v1.2.3**: Backend GPS Ref fix - Chuyển dấu số theo Ref trước khi ghi ExifTool

## Troubleshooting

### Vẫn thấy sai Ref sau khi fix?

**1. Clear cache/temp files:**
```powershell
Remove-Item backend/temp/* -Force
```

**2. Restart backend server:**
```powershell
cd backend
npm start
```

**3. Test với ảnh MỚI (không phải ảnh đã edit trước đó)**

**4. Check backend console log:**
```
GPS Longitude: 118.2605 (Ref: W) → -118.2605
Final tags object: { GPSLongitude: -118.2605, ... }
```

Phải thấy số ÂM (`-118.2605`) trong log!

### EXIF checker vẫn hiển thị E?

**Kiểm tra:**
1. File có thực sự được ghi mới không? (Check modified timestamp)
2. Browser cache? (Hard refresh: Ctrl+F5)
3. Upload đúng file? (File name có `_exif` suffix)
4. ExifTool version? (Cần >= 12.0)

**Test trực tiếp với ExifTool CLI:**
```bash
exiftool -GPSLongitude -GPSLongitudeRef modified_image.jpg
```

Phải thấy: `GPS Longitude: ... W`

---

**Updated:** 2025-11-27  
**Version:** 1.2.3  
**Fix:** GPS Ref chính xác khi ghi vào EXIF bằng ExifTool
