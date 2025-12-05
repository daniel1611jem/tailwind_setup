# Fix GPS Coordinate Input Issue - v1.2.2

## Vấn đề đã sửa
User không thể nhập số âm cho GPS Longitude hoặc thay đổi GPSLongitudeRef sang "W". Hệ thống tự động chuyển về số dương và "E".

**Triệu chứng:**
- Nhập `-118.2605` → Tự động đổi thành `118.2605`
- Chọn GPSLongitudeRef = "W" → Tự động đổi lại "E"
- Các trường khác thay đổi bình thường, chỉ GPS bị lỗi

## Nguyên nhân
Code cũ chỉ có logic normalize GPS khi **ĐỌC** file, không có logic xử lý khi user **NHẬP** thủ công.Tags to write: {
  Make: 'Apple',
  Model: 'iPhone 13 Pro',
  Software: '17.6.1',
  LensModel: 'iPhone 13 Pro back triple camera 5.7mm f/1.5',
  LensMake: 'Apple',
  ExposureTime: '1/120',
  FocalLength: '5.7 mm',
  DateTime: '2025-11-27T09:45:22',
  DateTimeOriginal: '2025:11:27 09:45:22',
  CreateDate: '2025:11:27 09:45:22',
  OffsetTime: '-08:00',
  OffsetTimeOriginal: '-08:00',
  OffsetTimeDigitized: '-08:00',
  GPSLatitude: 34.0415,
  GPSLatitudeRef: 'N',
  GPSLongitude: 118.2605,
  GPSLongitudeRef: 'W',
  GPSAltitude: '71.4 m',
  GPSAltitudeRef: '0',
  ColorSpace: 'sRGB',
  Artist: 'Thanh'
}
Tags to delete: [
  'SerialNumber',     'FNumber',
  'ISO',              'ISOSpeedRatings',
  'WhiteBalance',     'Flash',
  'MeteringMode',     'ExposureProgram',
  'SensingMethod',    'SceneType',
  'ModifyDate',       'GPSDateTime',
  'Orientation',      'Copyright',
  'ImageDescription', 'UserComment'
]
Step 1: Removing ALL existing EXIF...
Step 2: Deleting specific tags: [
  'SerialNumber',     'FNumber',
  'ISO',              'ISOSpeedRatings',
  'WhiteBalance',     'Flash',
  'MeteringMode',     'ExposureProgram',
  'SensingMethod',    'SceneType',
  'ModifyDate',       'GPSDateTime',
  'Orientation',      'Copyright',
  'ImageDescription', 'UserComment'
]

Khi user thay đổi GPSLongitude hoặc GPSLongitudeRef, hệ thống cần tự động sync dấu (+/-) với hướng (E/W).

## Giải pháp

### 1. Nâng cấp `handleFieldChange()` - Tự động sync GPS

**File:** `src/components/EXIFEditor.jsx`

Thêm logic đặc biệt cho GPS fields:

```javascript
const handleFieldChange = (field, value) => {
  // XỬ LÝ GPS LONGITUDE
  if (field === 'GPSLongitude') {
    const lon = parseFloat(value);
    if (!isNaN(lon)) {
      // Tự động set Ref dựa trên dấu
      const newRef = lon < 0 ? 'W' : 'E';
      setEditedData(prev => ({
        ...prev,
        [field]: value, // GIỮ NGUYÊN giá trị user nhập (có thể âm)
        'GPSLongitudeRef': newRef
      }));
      return;
    }
  }

  // XỬ LÝ GPS LONGITUDE REF
  if (field === 'GPSLongitudeRef') {
    const currentLon = parseFloat(editedData.GPSLongitude);
    if (!isNaN(currentLon)) {
      let newLon = currentLon;
      // W → lon phải âm
      // E → lon phải dương
      if (value === 'W' && currentLon > 0) {
        newLon = -Math.abs(currentLon);
      } else if (value === 'E' && currentLon < 0) {
        newLon = Math.abs(currentLon);
      }
      setEditedData(prev => ({
        ...prev,
        [field]: value,
        'GPSLongitude': String(newLon)
      }));
      return;
    }
  }
  
  // Tương tự cho Latitude...
};
```

**Cách hoạt động:**
- User nhập `-118.2605` → Ref tự động = "W"
- User nhập `118.2605` → Ref tự động = "E"
- User chọn Ref = "W" → Số tự động thêm dấu `-`
- User chọn Ref = "E" → Số tự động bỏ dấu `-`

### 2. Thêm Dropdown cho GPS Ref fields

**Trước đây:** GPS Ref là input text (user gõ "W", "E", "North", "West"...)  
**Bây giờ:** GPS Ref là dropdown select với options chuẩn

```javascript
// GPSLatitudeRef
<select>
  <option value="">(Chọn...)</option>
  <option value="N">N - North</option>
  <option value="S">S - South</option>
</select>

// GPSLongitudeRef
<select>
  <option value="">(Chọn...)</option>
  <option value="E">E - East</option>
  <option value="W">W - West</option>
</select>

// GPSAltitudeRef
<select>
  <option value="">(Chọn...)</option>
  <option value="0">0 - Above sea level</option>
  <option value="1">1 - Below sea level</option>
</select>
```

**Lợi ích:**
- Không thể nhập sai format
- Dễ dàng chuyển đổi N/S/E/W
- UI/UX tốt hơn

### 3. Thêm Dropdown cho Orientation

Cũng chuyển field `Orientation` sang dropdown:

```javascript
<select>
  <option value="">(Chọn...)</option>
  <option value="1">1 - Normal</option>
  <option value="3">3 - Rotate 180°</option>
  <option value="6">6 - Rotate 90° CW</option>
  <option value="8">8 - Rotate 270° CW</option>
</select>
```

## Luồng xử lý GPS hoàn chỉnh

### Kịch bản 1: User nhập GPS Longitude âm

```
User: Nhập "-118.2605"
│
├─> handleFieldChange('GPSLongitude', '-118.2605')
│   ├─> Parse: lon = -118.2605
│   ├─> Detect: lon < 0 → newRef = 'W'
│   └─> Set state:
│       ├─> GPSLongitude = "-118.2605" (GIỮ NGUYÊN dấu âm)
│       └─> GPSLongitudeRef = "W" (TỰ ĐỘNG)
│
└─> Kết quả hiển thị:
    ├─> GPSLongitude: -118.2605
    └─> GPSLongitudeRef: W - West
```

### Kịch bản 2: User chọn Ref = "W"

```
Hiện tại: GPSLongitude = "118.2605", Ref = "E"
User: Chọn Ref = "W"
│
├─> handleFieldChange('GPSLongitudeRef', 'W')
│   ├─> Current: lon = 118.2605 (dương)
│   ├─> Detect: value='W' && lon > 0
│   ├─> Convert: newLon = -118.2605
│   └─> Set state:
│       ├─> GPSLongitudeRef = "W"
│       └─> GPSLongitude = "-118.2605" (CHUYỂN ÂM)
│
└─> Kết quả hiển thị:
    ├─> GPSLongitude: -118.2605 (TỰ ĐỘNG đổi dấu)
    └─> GPSLongitudeRef: W - West
```

### Kịch bản 3: Backend xử lý khi Save

```
Frontend gửi: { GPSLongitude: "-118.2605", GPSLongitudeRef: "W" }
│
└─> Backend (routes/exif.js)
    ├─> Parse: lon = -118.2605
    ├─> Detect: lon < 0
    ├─> Convert for ExifTool:
    │   ├─> GPSLongitude = 118.2605 (SỐ DƯƠNG)
    │   └─> GPSLongitudeRef = "W"
    │
    └─> ExifTool write:
        exiftool -GPSLongitude=118.2605 -GPSLongitudeRef=W
```

### Kịch bản 4: Đọc lại file sau khi Save

```
ExifTool read: { GPSLongitude: "118.2605 W" }
│
└─> Frontend readExifData()
    ├─> Parse: lon = 118.2605, ref = "W"
    ├─> Normalize Ref: "West longitude" → "W"
    ├─> Auto-convert:
    │   ├─> Detect: ref='W' && lon > 0
    │   └─> Convert: lon = -118.2605
    │
    └─> Display:
        ├─> GPSLongitude: -118.2605 (SỐ ÂM)
        └─> GPSLongitudeRef: W
```

## Testing Checklist

### GPS Longitude
- [ ] Nhập `-118.2605` → Ref tự động = "W"
- [ ] Nhập `118.2605` → Ref tự động = "E"
- [ ] Chọn Ref = "W" khi lon=`118.2605` → lon đổi thành `-118.2605`
- [ ] Chọn Ref = "E" khi lon=`-118.2605` → lon đổi thành `118.2605`
- [ ] Save → Download → Mở lại → Vẫn hiển thị đúng `-118.2605, W`

### GPS Latitude
- [ ] Nhập `-34.0415` → Ref tự động = "S"
- [ ] Nhập `34.0415` → Ref tự động = "N"
- [ ] Chọn Ref = "S" khi lat=`34.0415` → lat đổi thành `-34.0415`
- [ ] Chọn Ref = "N" khi lat=`-34.0415` → lat đổi thành `34.0415`
- [ ] Save → Download → Mở lại → Vẫn hiển thị đúng `-34.0415, S`

### Import/Export JSON
- [ ] Export JSON có GPS âm: `{"GPSLongitude": "-118.2605", "GPSLongitudeRef": "W"}`
- [ ] Import JSON → Hiển thị đúng số âm và Ref
- [ ] Save sau khi import → EXIF chính xác

### Edge Cases
- [ ] Nhập text không phải số: "abc" → Không crash
- [ ] Nhập 0: `0` → Ref vẫn hoạt động
- [ ] Thay đổi Ref khi chưa có số → Không crash
- [ ] Clear EXIF → GPS fields về rỗng

## Lưu ý quan trọng

### 1. Convention: Số âm = W/S
**Chuẩn quốc tế:**
- Longitude âm = West (Tây)
- Longitude dương = East (Đông)
- Latitude âm = South (Nam)
- Latitude dương = North (Bắc)

**Ví dụ:**
- Los Angeles: `34.0415°N, 118.2605°W` = `(34.0415, -118.2605)`
- Sydney: `33.8688°S, 151.2093°E` = `(-33.8688, 151.2093)`
- Tokyo: `35.6762°N, 139.6503°E` = `(35.6762, 139.6503)`

### 2. ExifTool Format
ExifTool KHÔNG hỗ trợ lưu GPS dưới dạng số âm. Nó luôn lưu:
- Số dương + Ref (N/S/E/W)

Frontend phải tự động convert giữa hai format:
- **Display format:** `-118.2605` (người dùng thấy)
- **Storage format:** `118.2605 W` (ExifTool lưu)

### 3. Roundtrip Guarantee
Với fix này, GPS data được bảo toàn hoàn toàn qua chu trình:
```
Input → Edit → Save → Download → Read → Display
-118.2605 → -118.2605 → 118.2605 W → 118.2605 W → -118.2605
```

## Files Changed

### src/components/EXIFEditor.jsx
**Changes:**
1. `handleFieldChange()`: Thêm GPS coordinate sync logic (+80 lines)
2. `renderFieldsByGroup()`: Thêm dropdown cho GPS Ref và Orientation (+40 lines)

**Total:** ~120 lines added/modified

## Version History

- **v1.2.1**: EXIF Editor với 120 fields, Profile system, JSON import/export
- **v1.2.2**: Fix GPS coordinate input issue - Tự động sync số âm với W/S refs

## Next Steps

Sau khi test, có thể cải tiến thêm:
1. **Visual GPS Picker**: Map picker để chọn GPS bằng click
2. **GPS Validation**: Check latitude (-90 to 90), longitude (-180 to 180)
3. **Address Lookup**: Reverse geocoding - GPS → Địa chỉ
4. **Coordinate Converter**: DMS ↔ Decimal converter

---

**Updated:** ${new Date().toLocaleString('vi-VN')}  
**Version:** 1.2.2  
**Fix:** GPS coordinate input với số âm và W/S/E/N refs
