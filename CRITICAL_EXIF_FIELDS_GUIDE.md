# 🚨 CRITICAL EXIF Fields - Chứng Minh Ảnh Thật

## 🎯 Tổng quan

Một số EXIF fields **CỰC KỲ QUAN TRỌNG** để chứng minh ảnh được chụp bằng camera thật, KHÔNG PHẢI Photoshop hoặc phần mềm tạo ra.

Xóa hoặc sửa các trường này → **Phát hiện ngay** ảnh đã bị can thiệp!

---

## 🔴 Level 1: CRITICAL - TUYỆT ĐỐI GIỮ NGUYÊN

### 1. **MakerNote** ⚠️⚠️⚠️

**Tầm quan trọng:** ★★★★★ (Quan trọng nhất!)

**Mô tả:**
- Dữ liệu RAW độc quyền từ nhà sản xuất (Apple, Canon, Nikon, Sony...)
- Format binary, không thể tái tạo
- Chứa thông tin mã hóa về sensor, lens, firmware, serial number...

**Ví dụ:**
```
MakerNote: (Binary Data: 65,112 bytes)
Apple MakerNote: [Proprietary encrypted data]
Canon MakerNote: [Camera settings, focus points, white balance...]
```

**Cảnh báo:**
```
✅ MakerNote CÓ → Ảnh gốc từ camera
❌ MakerNote BỊ XÓA → Ảnh đã qua phần mềm chỉnh sửa (Photoshop, Lightroom...)
```

**Lý do:**
- Photoshop/Lightroom **LUÔN XÓA** MakerNote khi save ảnh
- Không thể tái tạo hoặc fake được MakerNote
- Đây là "dấu vân tay" của camera

---

### 2. **LensModel** 📷

**Tầm quan trọng:** ★★★★★

**Mô tả:**
- Tên chi tiết của ống kính (lens) được dùng
- Chứng minh phần cứng vật lý (không phải render)

**Ví dụ iPhone:**
```json
{
  "Make": "Apple",
  "Model": "iPhone 11 Pro Max",
  "LensModel": "iPhone 11 Pro Max back triple camera 4.25mm f/1.8"
}
```

**Đặc điểm:**
- **iPhone**: LensModel LUÔN có format: `"iPhone [Model] back [dual/triple] camera [focal]mm f/[aperture]"`
- **DSLR**: `"Canon EF 24-70mm f/2.8L II USM"`, `"Sony FE 85mm F1.4 GM"`

**Cảnh báo:**
```
✅ iPhone 11 Pro Max + LensModel có "iPhone 11 Pro Max" → Hợp lệ
❌ iPhone 11 Pro Max + LensModel rỗng → FAKE
❌ iPhone 11 Pro Max + LensModel = "Canon 50mm" → FAKE
```

---

### 3. **FocalLength + FNumber + ExposureTime + ISO** 🔬

**Tầm quan trọng:** ★★★★☆

**Mô tả:**
- Thông số quang học của ống kính vật lý
- Phải NHẤT QUÁN với nhau theo quy luật vật lý

**Ví dụ hợp lệ:**
```json
{
  "FocalLength": "4.25",        // iPhone 11 Pro Max wide lens
  "FNumber": "1.8",             // Khẩu độ f/1.8
  "ExposureTime": "1/60",       // Tốc độ màn trập
  "ISO": "400"                  // ISO
}
```

**Quy luật vật lý:**
```
Exposure Triangle:
Exposure = (ISO × ExposureTime) / (FNumber²)

Nếu các giá trị KHÔNG tuân theo công thức → Photoshop fake!
```

**Ví dụ FAKE:**
```json
{
  "FocalLength": "50",    // 50mm
  "FNumber": "22",        // f/22 (khẩu độ nhỏ)
  "ExposureTime": "1/4000", // Cực nhanh
  "ISO": "100"            // ISO thấp
}
❌ Không thể có ảnh sáng với f/22, 1/4000s, ISO 100 → FAKE!
```

---

### 4. **SceneType** 🌄

**Tầm quan trọng:** ★★★☆☆

**Mô tả:**
- Loại cảnh chụp (Directly photographed, Screenshot...)
- Được camera tự động ghi

**Giá trị:**
```
1 = Directly photographed (Chụp trực tiếp)
2 = Not directly photographed (Màn hình, scan...)
```

**Cảnh báo:**
```
✅ SceneType = 1 → Chụp trực tiếp từ camera
⚠️ SceneType bị xóa → Có thể đã chỉnh sửa
❌ SceneType = 2 → Screenshot hoặc scan
```

---

### 5. **SensingMethod** 📡

**Tầm quan trọng:** ★★★☆☆

**Mô tả:**
- Phương pháp cảm biến (sensor type)
- Đặc trưng của từng loại camera

**Giá trị:**
```
1 = Not defined
2 = One-chip color area sensor (Phổ biến: iPhone, compact cameras)
3 = Two-chip color area sensor
4 = Three-chip color area sensor
5 = Color sequential area sensor
7 = Trilinear sensor
8 = Color sequential linear sensor
```

**Ví dụ:**
```json
{
  "Make": "Apple",
  "Model": "iPhone 11 Pro Max",
  "SensingMethod": "2"  // One-chip color area sensor
}
```

---

## 🟡 Level 2: IMPORTANT - Quan trọng

### 6. **OffsetTime / OffsetTimeOriginal** 🕐

**Tầm quan trọng:** ★★★★☆

**Mô tả:**
- Timezone offset (múi giờ)
- Đi kèm với DateTime để xác định thời gian chụp chính xác

**Ví dụ:**
```json
{
  "DateTimeOriginal": "2025:11:27 09:30:00",
  "OffsetTimeOriginal": "-08:00"  // Pacific Time (Los Angeles)
}
→ Thời gian thực: 2025-11-27 09:30:00 UTC-8
```

**Cảnh báo:**
```
✅ Có OffsetTime → Timestamp chính xác
⚠️ Thiếu OffsetTime → Không xác định được múi giờ thực
```

---

### 7. **GPSLatitudeRef + GPSLongitudeRef** 🗺️

**Tầm quan trọng:** ★★★★☆

**Mô tả:**
- Hướng của tọa độ GPS (Bắc/Nam, Đông/Tây)
- Thiếu Ref → Tọa độ sai ngược vị trí!

**Ví dụ đúng:**
```json
{
  "GPSLatitude": "34.041500",
  "GPSLatitudeRef": "N",      // North (Bắc)
  "GPSLongitude": "-118.260500",
  "GPSLongitudeRef": "W"      // West (Tây)
}
→ Vị trí: 34.0415°N, 118.2605°W (Los Angeles, CA)
```

**Ví dụ SAI:**
```json
{
  "GPSLatitude": "34.041500",   // Không có Ref
  "GPSLongitude": "-118.260500"
}
→ Không xác định được N/S, E/W → Có thể sai vị trí hoàn toàn!
```

**Quy tắc:**
- **Latitude Ref**: `N` (North) hoặc `S` (South)
- **Longitude Ref**: `E` (East) hoặc `W` (West)

---

### 8. **ISOSpeedRatings** (alias của ISO)

**Tầm quan trọng:** ★★★☆☆

**Mô tả:**
- Một số camera ghi ISO vào `ISOSpeedRatings` thay vì `ISO`
- Cần giữ cả 2 để tương thích

**Ví dụ:**
```json
{
  "ISO": "400",
  "ISOSpeedRatings": "400"  // Cùng giá trị
}
```

---

### 9. **ExposureProgram + MeteringMode + Flash** ⚙️

**Tầm quan trọng:** ★★★☆☆

**Mô tả:**
- Chế độ chụp tự động/thủ công
- Chế độ đo sáng
- Trạng thái đèn flash

**ExposureProgram:**
```
0 = Not defined
1 = Manual
2 = Normal program (Auto)
3 = Aperture priority
4 = Shutter priority
5 = Creative program
6 = Action program
7 = Portrait mode
8 = Landscape mode
```

**MeteringMode:**
```
0 = Unknown
1 = Average
2 = Center-weighted average
3 = Spot
5 = Multi-spot
6 = Multi-segment (Matrix/Evaluative)
```

**Flash:**
```
0x0 = No flash
0x1 = Flash fired
0x5 = Flash fired, no return
0x7 = Flash fired, return detected
0x9 = Flash fired, compulsory
0x18 = Flash did not fire, auto
```

---

## 📋 Checklist Xác Thực Ảnh Thật

### ✅ Điều kiện ảnh THẬT (chụp từ camera):

1. **MakerNote**: ✅ CÓ (binary data)
2. **LensModel**: ✅ CÓ và khớp với Make/Model
3. **FocalLength + FNumber + ExposureTime + ISO**: ✅ Nhất quán theo Exposure Triangle
4. **SceneType**: ✅ = 1 (Directly photographed)
5. **SensingMethod**: ✅ CÓ và hợp lý với loại camera
6. **OffsetTime**: ✅ CÓ và khớp với DateTime
7. **GPSLatitudeRef/LongitudeRef**: ✅ CÓ nếu có GPS coordinates

### ❌ Dấu hiệu ảnh ĐÃ CHỈNH SỬA:

1. **MakerNote**: ❌ BỊ XÓA hoặc rỗng
2. **LensModel**: ❌ Không khớp Make/Model hoặc rỗng
3. **Optical params**: ❌ Không tuân theo Exposure Triangle
4. **SceneType**: ❌ Bị xóa hoặc ≠ 1
5. **Software**: ❌ Có "Adobe Photoshop", "GIMP", "Lightroom"...

---

## 🧪 Test với JSON bạn cung cấp

### Input JSON:
```json
{
  "Make": "Apple",
  "Model": "iPhone 11 Pro Max",
  "Software": "17.5.1",
  "DateTimeOriginal": "2025:11:27 09:30:00",
  "OffsetTime": "-08:00",
  "OffsetTimeOriginal": "-08:00",
  "GPSLatitude": 34.041500,
  "GPSLatitudeRef": "N",
  "GPSLongitude": -118.260500,
  "GPSLongitudeRef": "W",
  "LensModel": "iPhone 11 Pro Max back triple camera 4.25mm f/1.8"
}
```

### Validation Results:

✅ **Make/Model**: Apple + iPhone 11 Pro Max → Hợp lệ  
✅ **LensModel**: "iPhone 11 Pro Max back triple camera..." → Chứng minh phần cứng thật  
✅ **Software**: "17.5.1" → iOS version, hợp lệ  
✅ **DateTimeOriginal**: "2025:11:27 09:30:00" → Format chuẩn  
✅ **OffsetTime**: "-08:00" → Pacific Time, hợp lệ  
✅ **GPS Coordinates**: 34.0415°N, 118.2605°W → Los Angeles, CA  
✅ **GPS Refs**: N/W → Hợp lệ  

**Kết luận:** Đây là EXIF profile HỢP LỆ cho iPhone 11 Pro Max!

---

## 🚀 Import Test Workflow

### Bước 1: Import REPLACE mode
1. Click "📥 Import JSON"
2. Chọn **REPLACE** mode
3. Paste JSON trên
4. Click Import

### Bước 2: Verify
```
Tab "Tất cả EXIF":
✅ Tổng fields: 120
✅ Có dữ liệu: 12 (chính xác như JSON)
✅ Rỗng: 108

Fields có data:
✅ Make = "Apple"
✅ Model = "iPhone 11 Pro Max"
✅ Software = "17.5.1"
✅ DateTimeOriginal = "2025:11:27 09:30:00"
✅ OffsetTime = "-08:00"
✅ OffsetTimeOriginal = "-08:00"
✅ GPSLatitude = "34.041500"
✅ GPSLatitudeRef = "N"
✅ GPSLongitude = "-118.260500"
✅ GPSLongitudeRef = "W"
✅ LensModel = "iPhone 11 Pro Max back triple camera 4.25mm f/1.8"
```

### Bước 3: Export test (roundtrip)
1. Click "📤 Export Non-Empty"
2. So sánh với JSON gốc
3. ✅ Phải GIỐNG NHAU 100%

---

## 📊 EXIF Editor - Validation Panel

Khi click "🔍 Validate", hệ thống sẽ kiểm tra:

```
✅ Make/Model: Apple / iPhone 11 Pro Max (Hợp lý)
⚠️ LensModel (iPhone): iPhone 11 Pro Max back triple camera... (Hợp lệ)
✅ Optical Parameters: 4.25mm f/1.8 (Chứng minh ống kính vật lý)
❌ MakerNote (CRITICAL): CẢNH BÁO - MakerNote BỊ XÓA!
✅ SceneType: 1 (Giữ nguyên)
✅ SensingMethod: 2 (Giữ nguyên)
```

---

## 🔧 Technical Notes

### GPS Precision:
```javascript
// BAD - Mất precision
"GPSLatitude": 34.0415

// GOOD - Giữ nguyên
"GPSLatitude": "34.041500"
```

### DateTime Format:
```javascript
// EXIF Standard
"DateTimeOriginal": "2025:11:27 09:30:00"

// NOT: ISO format
"DateTimeOriginal": "2025-11-27T09:30:00"
```

### Numeric Values:
```javascript
// Import JSON normalize tất cả thành string
GPSLongitude: -118.260500  →  "-118.260500"
FNumber: 1.8  →  "1.8"
```

---

## 📝 Export Options

### 1. Export ALL (120 fields)
- Backup đầy đủ
- Bao gồm cả fields rỗng
- File size lớn (~5-10KB)

### 2. Export Non-Empty
- Chỉ fields có data
- Share profile nhẹ
- File size nhỏ (~500B-2KB)

**Ví dụ:**
```json
// Export ALL
{
  "Make": "Apple",
  "Model": "iPhone 11 Pro Max",
  "Software": "17.5.1",
  "LensModel": "iPhone 11 Pro Max...",
  "LensMake": "",          // Rỗng
  "SerialNumber": "",       // Rỗng
  ... + 108 fields rỗng
}

// Export Non-Empty
{
  "Make": "Apple",
  "Model": "iPhone 11 Pro Max",
  "Software": "17.5.1",
  "LensModel": "iPhone 11 Pro Max...",
  ... chỉ 12 fields
}
```

---

## 🎯 Key Takeaways

1. **MakerNote** = Dấu vân tay camera → XÓA = Photoshop
2. **LensModel** = Chứng minh phần cứng → Rỗng = Fake
3. **Optical Parameters** = Tuân theo vật lý → Sai = Render
4. **OffsetTime** = Timezone → Thiếu = Timestamp không chính xác
5. **GPS Refs** = N/S/E/W → Thiếu = Sai vị trí

**Quy tắc vàng:**
> Càng nhiều metadata GỐC từ camera → Càng khó fake  
> Xóa metadata → Dễ phát hiện can thiệp

---

**Test file:** `test-iphone-exif.json`  
**Last Updated:** 2025-11-27  
**Version:** 1.0 - Critical Fields Guide
