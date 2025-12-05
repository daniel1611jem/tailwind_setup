# 🕐 EXIF Timezone Calculator & MakerNote Preservation Guide

## ✨ Tính năng mới v2.1

### 1. 🕐 **Timezone Calculator - Tính toán thời gian tự động**

#### Cách sử dụng:
1. Mở **EXIF Editor**
2. Click nút **🕐 Timezone Calculator** (màu indigo)
3. Chọn ngày giờ muốn set
4. Chọn múi giờ US (San Diego, Los Angeles, New York...)
5. Click **Áp dụng**

#### Các múi giờ được hỗ trợ:

| Timezone | Offset (Standard/DST) | Thành phố chính |
|----------|----------------------|----------------|
| **Pacific Time (PST/PDT)** | UTC-8 / UTC-7 | Los Angeles, San Diego, San Francisco, Seattle, Portland |
| **Mountain Time (MST/MDT)** | UTC-7 / UTC-6 | Denver, Phoenix, Salt Lake City, Albuquerque |
| **Central Time (CST/CDT)** | UTC-6 / UTC-5 | Chicago, Houston, Dallas, San Antonio, Austin |
| **Eastern Time (EST/EDT)** | UTC-5 / UTC-4 | New York, Boston, Philadelphia, Miami, Atlanta, DC |
| **Hawaii Time (HST)** | UTC-10 / UTC-10 | Honolulu (no DST) |
| **Alaska Time (AKST/AKDT)** | UTC-9 / UTC-8 | Anchorage |

#### Tự động tính toán:
- ✅ Daylight Saving Time (DST) - Tự động nhận diện tháng 3-11
- ✅ **DateTime** - Format: `2025:11:30 14:30:25`
- ✅ **DateTimeOriginal** - Same as DateTime
- ✅ **DateTimeDigitized** - Same as DateTime
- ✅ **ModifyDate** - Same as DateTime
- ✅ **CreateDate** - Same as DateTime
- ✅ **OffsetTime** - Timezone offset (e.g., `-08:00`)
- ✅ **OffsetTimeOriginal** - Same as OffsetTime
- ✅ **OffsetTimeDigitized** - Same as OffsetTime
- ✅ **SubSecTime** - Random 3 digits (e.g., `342`)
- ✅ **SubSecTimeOriginal** - Same as SubSecTime
- ✅ **SubSecTimeDigitized** - Same as SubSecTime
- ✅ **GPSDateStamp** - Format: `2025:11:30`
- ✅ **GPSTimeStamp** - Format: `14:30:25`

---

### 2. 🔒 **MakerNote Preservation - Giữ nguyên metadata camera**

#### Tại sao quan trọng?
- **MakerNote** chứa metadata đặc biệt từ nhà sản xuất camera
- Khi chỉnh sửa EXIF bằng phần mềm thông thường, MakerNote bị xóa
- Hệ thống check ảnh có thể phát hiện ảnh đã bị chỉnh sửa nếu **MakerNote = NULL**

#### Cách hoạt động:
1. Khi load ảnh, **EXIF Editor** tự động lưu **MakerNote gốc**
2. Hiển thị cảnh báo nếu ảnh không có MakerNote
3. Khi export, MakerNote được giữ nguyên

#### Indicator trong UI:

✅ **Ảnh có MakerNote (GOOD):**
```
✓ MakerNote được bảo toàn - Ảnh sẽ giữ metadata gốc từ camera
```

❌ **Ảnh không có MakerNote (WARNING):**
```
⚠️ CẢNH BÁO: Ảnh không có MakerNote - Có thể đã bị chỉnh sửa trước đó!
```

#### Validation Check:
Khi click **🔍 Kiểm tra tính nhất quán**, sẽ xuất hiện:

**Nếu có MakerNote:**
```
⚠️ MakerNote (CRITICAL)
✓ MakerNote CÓ - Ảnh có dữ liệu RAW từ nhà sản xuất
```

**Nếu không có MakerNote:**
```
⚠️ MakerNote (CRITICAL)
❌ CẢNH BÁO: MakerNote BỊ XÓA - Ảnh đã bị chỉnh sửa bởi phần mềm!
```

---

### 3. 📱 **Legit Mode + Device Profiles**

Kết hợp với tính năng có sẵn:

1. **Chọn thiết bị** (iPhone 15 Pro, Canon 5D, v.v.)
2. **Enable Legit Mode** - Khóa metadata hệ thống
3. **Sử dụng Timezone Calculator** - Chỉ thay đổi GPS và DateTime
4. **MakerNote tự động preserve** - Đảm bảo tính chân thực

#### Workflow chuẩn:

```
1. Load ảnh gốc (có MakerNote)
   ↓
2. Chọn Device Profile (e.g., iPhone 15 Pro)
   ↓
3. Enable Legit Mode
   ↓
4. Dùng Timezone Calculator set thời gian
   ↓
5. Chỉnh GPS nếu cần (Legit Mode cho phép)
   ↓
6. Kiểm tra validation (MakerNote, DateTime, GPS)
   ↓
7. Áp dụng thay đổi → Export
   ✓ Ảnh giữ nguyên MakerNote
   ✓ Chỉ thay đổi GPS + DateTime
   ✓ Trông như ảnh chụp thật
```

---

## 🎯 Use Cases

### Case 1: Ảnh từ iPhone - Đổi location San Diego
```
1. Load ảnh từ iPhone 15 Pro
2. Select Device: iPhone 15 Pro
3. Enable Legit Mode
4. Timezone Calculator:
   - Timezone: Pacific/Los Angeles (San Diego)
   - DateTime: 2025-11-30 14:30:00
5. GPS: 32.7157, -117.1611 (San Diego)
6. Apply → MakerNote preserved ✓
```

### Case 2: Ảnh từ Canon - Đổi thời gian New York
```
1. Load ảnh từ Canon 5D Mark IV
2. Select Device: Canon EOS 5D Mark IV
3. Enable Legit Mode
4. Timezone Calculator:
   - Timezone: America/New_York
   - DateTime: 2025-12-25 18:00:00 (Christmas)
5. GPS: 40.7128, -74.0060 (NYC)
6. Apply → MakerNote preserved ✓
```

### Case 3: Ảnh đã bị edit (không có MakerNote)
```
1. Load ảnh
2. WARNING: ⚠️ Ảnh không có MakerNote
3. Có thể edit nhưng sẽ không pass strict validation
4. Nên dùng ảnh gốc từ camera để có MakerNote
```

---

## 🔍 Validation Checklist

### ✅ Ảnh chuẩn (Pass tất cả):
- ✓ Make/Model match
- ✓ Lens compatible
- ✓ FNumber valid (f/1.0 - f/32)
- ✓ ISO valid (50 - 102400)
- ✓ DateTime consistent
- ✓ GPS format correct
- ✓ **MakerNote CÓ** 👈 CRITICAL

### ⚠️ Ảnh đáng ngờ:
- ✓ Make/Model match
- ✓ Lens compatible
- ✓ FNumber valid
- ✓ ISO valid
- ✓ DateTime consistent
- ✓ GPS format correct
- ❌ **MakerNote BỊ XÓA** 👈 RED FLAG

---

## 💡 Best Practices

### DO ✅
1. **Luôn dùng ảnh gốc từ camera** (có MakerNote)
2. **Chọn Device Profile phù hợp** với ảnh gốc
3. **Enable Legit Mode** để khóa metadata hệ thống
4. **Dùng Timezone Calculator** cho consistency
5. **Validate trước khi export**

### DON'T ❌
1. **Không edit ảnh bằng Photoshop/Lightroom** trước (mất MakerNote)
2. **Không thay đổi Make/Model** trong Legit Mode
3. **Không để DateTime và GPS không match timezone**
4. **Không export ảnh đã mất MakerNote** cho strict validation

---

## 🚀 Technical Details

### Timezone DST Detection
```javascript
const isDST = (date) => {
  const month = date.getMonth();
  return month >= 2 && month <= 10; // March (2) to November (10)
};
```

### MakerNote Preservation
```javascript
// When loading EXIF
if (tags.MakerNote) {
  setOriginalMakerNote(tags.MakerNote);
  console.log('✓ MakerNote preserved');
}

// When exporting
if (preserveMakerNote && originalMakerNote) {
  exifData.MakerNote = originalMakerNote;
}
```

### DateTime Format
```javascript
// Input: 2025-11-30T14:30:00
// Output: 2025:11:30 14:30:25

const exifDateTime = `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
```

---

## 📚 References

- **EXIF Spec**: https://www.exif.org/Exif2-2.PDF
- **GPS Format**: ISO 6709
- **Timezone Data**: IANA Time Zone Database
- **MakerNote**: Proprietary camera manufacturer data

---

## 🆘 Troubleshooting

### Q: Ảnh của tôi không có MakerNote?
**A:** Ảnh có thể đã bị edit bởi phần mềm khác. Dùng ảnh gốc từ camera/phone.

### Q: Timezone Calculator không work?
**A:** Kiểm tra:
- DateTime input đúng format
- Timezone đã chọn
- Browser hỗ trợ datetime-local

### Q: Export ra vẫn mất MakerNote?
**A:** Kiểm tra:
- `preserveMakerNote` state = true
- `originalMakerNote` đã được lưu khi load
- Backend exif route có preserve MakerNote

---

## 📝 Version History

### v2.1 (2025-11-30)
- ✨ NEW: Timezone Calculator với 6 múi giờ US
- ✨ NEW: MakerNote Preservation
- ✨ NEW: DST auto-detection
- ✨ NEW: Real-time validation warnings
- 🔧 FIX: DateTime format consistency
- 🔧 FIX: GPS offset auto-calculation

### v2.0 (Previous)
- Device Profiles
- Legit Mode
- JSON Import/Export
- Validation system

---

**Made with ❤️ for authentic EXIF editing**
