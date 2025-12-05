# 📱 LEGIT MODE - Hướng dẫn sử dụng

## Tổng quan

**Legit Mode** là chế độ chỉnh sửa EXIF đặc biệt giúp tạo ra ảnh có metadata **100% chân thực** như được chụp từ thiết bị thật, đồng thời vẫn cho phép tùy chỉnh các thông tin cá nhân hóa.

---

## Cách hoạt động

### 1️⃣ Chọn thiết bị
- Click nút **"📱 Chọn thiết bị"**
- Chọn một trong 15+ thiết bị phổ biến:
  - iPhone (15 Pro Max, 15 Pro, 14 Pro Max, 13 Pro)
  - Samsung (S23 Ultra, S22 Ultra, S21 Ultra)
  - Google Pixel (8 Pro, 7 Pro)
  - Xiaomi (13 Pro)
  - OPPO (Find X5 Pro)
  - Canon (EOS R5)
  - v.v.

### 2️⃣ Metadata tự động load
Khi chọn thiết bị, hệ thống sẽ tự động điền **TẤT CẢ** metadata như ảnh chụp thật:
- ✅ Make & Model (hãng và dòng máy)
- ✅ Software version (iOS 17.1.1, One UI 5.1, v.v.)
- ✅ Lens Model (ống kính)
- ✅ Camera Settings (ISO, Aperture, Shutter Speed, v.v.)
- ✅ Resolution & Color Space
- ✅ Và 40+ field khác...

### 3️⃣ Legit Mode tự động BẬT
- Các metadata kỹ thuật **BỊ KHÓA** ngay lập tức
- Chỉ cho phép sửa các field cá nhân hóa

---

## Các field CÓ THỂ SỬA trong Legit Mode

### 📍 GPS & Location (Định vị)
✅ Bạn có thể tùy chỉnh:
- `GPSLatitude`, `GPSLongitude` - Tọa độ GPS
- `GPSAltitude` - Độ cao
- `GPSLatitudeRef`, `GPSLongitudeRef` - North/South, East/West
- `GPSDateTime`, `GPSDateStamp`, `GPSTimeStamp` - Thời gian GPS
- `GPSSpeed`, `GPSImgDirection` - Tốc độ, hướng
- `GPSHPositioningError` - Sai số GPS

**Use case:** Thay đổi vị trí chụp ảnh (VD: ảnh chụp tại Việt Nam nhưng muốn GPS hiển thị Paris)

---

### 🕐 Date & Time (Thời gian)
✅ Bạn có thể tùy chỉnh:
- `DateTime` - Thời gian chung
- `DateTimeOriginal` - Thời gian chụp gốc
- `DateTimeDigitized` - Thời gian số hóa
- `ModifyDate`, `CreateDate` - Ngày sửa/tạo
- `OffsetTime`, `OffsetTimeOriginal` - Múi giờ
- `SubSecTime`, `SubSecTimeOriginal` - Phân giây chính xác

**Use case:** Thay đổi thời gian chụp (VD: ảnh chụp hôm nay nhưng muốn hiển thị tuần trước)

---

### 👤 Personal Information (Thông tin cá nhân)
✅ Bạn có thể tùy chỉnh:
- `Artist` - Tên nghệ sĩ/người chụp
- `Copyright` - Bản quyền
- `OwnerName` - Tên chủ sở hữu
- `Creator`, `CreatorWorkURL` - Người tạo và website
- `ImageDescription`, `Description` - Mô tả ảnh
- `UserComment`, `Comment` - Ghi chú người dùng
- `Keywords`, `Subject` - Từ khóa, chủ đề
- `Title`, `Headline` - Tiêu đề
- `Credit`, `Source` - Nguồn, tín dụng
- `Category`, `SupplementalCategories` - Phân loại

**Use case:** Thêm watermark text, thông tin bản quyền, mô tả ảnh

---

### ⭐ Optional Fields (Tùy chọn)
✅ Bạn có thể tùy chỉnh:
- `Rating`, `RatingPercent` - Đánh giá sao
- `Label`, `Marked`, `Select` - Nhãn, đánh dấu
- `CameraOwnerName` - Tên chủ máy ảnh
- `BodySerialNumber` - Serial body máy
- `LensSerialNumber` - Serial ống kính

**Use case:** Tùy chỉnh thông tin thiết bị cá nhân

---

## Các field BỊ KHÓA trong Legit Mode

### 🔒 Metadata hệ thống (KHÔNG thể sửa)
Để đảm bảo độ chân thực 100%, các field sau **BỊ KHÓA HOÀN TOÀN**:

#### Device Information
- `Make` (Apple, Samsung, Canon...)
- `Model` (iPhone 15 Pro Max, S23 Ultra...)
- `Software` (iOS 17.1.1, One UI 5.1...)
- `LensModel`, `LensMake`

#### Camera Settings
- `FocalLength`, `FocalLengthIn35mmFormat`
- `FNumber` (Aperture)
- `ExposureTime` (Shutter Speed)
- `ISO`
- `WhiteBalance`, `Flash`, `MeteringMode`
- `ExposureProgram`, `ExposureMode`
- `SceneCaptureType`, `Sharpness`, `Saturation`, `Contrast`

#### Technical Specs
- `XResolution`, `YResolution`, `ResolutionUnit`
- `ColorSpace`, `ExifImageWidth`, `ExifImageHeight`
- `Orientation`, `YCbCrPositioning`
- `SensingMethod`, `SceneType`
- `ExposureBiasValue`, `LightSource`

**Lý do khóa:** Đây là các thông số kỹ thuật của máy ảnh/camera, nếu sửa sẽ dễ bị phát hiện giả mạo.

---

## Quy trình sử dụng

### Bước 1: Upload ảnh
```
1. Vào EXIF Editor
2. Click "Chọn file" hoặc kéo thả ảnh
```

### Bước 2: Chọn thiết bị
```
1. Click "📱 Chọn thiết bị"
2. Chọn device phù hợp (VD: iPhone 15 Pro Max)
3. Metadata tự động load
4. Legit Mode tự động BẬT
```

### Bước 3: Tùy chỉnh thông tin cá nhân
```
✅ Sửa GPS nếu cần:
   - GPSLatitude: 21.0285 (Hà Nội)
   - GPSLongitude: 105.8542
   - GPSLatitudeRef: N
   - GPSLongitudeRef: E

✅ Sửa DateTime nếu cần:
   - DateTime: 2024:11:25 14:30:00
   - DateTimeOriginal: 2024:11:25 14:30:00

✅ Thêm thông tin:
   - Artist: "Nguyễn Văn A"
   - Copyright: "© 2024 Your Name"
   - ImageDescription: "Sunset at Hoan Kiem Lake"

🔒 Các field khác BỊ KHÓA (màu xám, có icon 🔒)
```

### Bước 4: Lưu
```
1. Click "💾 Lưu thay đổi"
2. Tải file ảnh mới về
```

---

## Tắt Legit Mode

Nếu muốn sửa TẤT CẢ field (kể cả metadata hệ thống):

1. Click nút **"🔓 Legit Mode OFF"**
2. Tất cả field sẽ mở khóa
3. Có thể sửa Make, Model, ISO, v.v.

⚠️ **Cảnh báo:** Khi tắt Legit Mode, bạn có thể làm hỏng tính chân thực của metadata!

---

## Use Cases thực tế

### 📷 Case 1: Thay đổi vị trí chụp
```
Tình huống: Ảnh chụp tại Việt Nam, muốn GPS hiển thị Paris

Giải pháp:
1. Chọn device: iPhone 15 Pro Max
2. Sửa GPS:
   - Latitude: 48.8566
   - Longitude: 2.3522
   - LatitudeRef: N
   - LongitudeRef: E
3. Metadata khác giữ nguyên như iPhone 15 thật
```

### 🕐 Case 2: Thay đổi thời gian chụp
```
Tình huống: Ảnh chụp hôm nay, muốn hiển thị tuần trước

Giải pháp:
1. Chọn device: Samsung S23 Ultra
2. Sửa DateTime: 2024:11:20 10:00:00
3. Camera settings (ISO, Aperture) giữ nguyên như S23 thật
```

### 👤 Case 3: Thêm watermark metadata
```
Tình huống: Muốn thêm bản quyền vào EXIF

Giải pháp:
1. Chọn device: Canon EOS R5
2. Điền:
   - Artist: "John Doe Photography"
   - Copyright: "© 2024 John Doe. All rights reserved."
   - Contact: contact@johndoe.com
3. Camera specs giữ nguyên như Canon R5 thật
```

---

## Câu hỏi thường gặp

### ❓ Tại sao cần Legit Mode?
**Trả lời:** Nhiều hệ thống kiểm tra ảnh (social media, stock photo, v.v.) sẽ phát hiện metadata bị sửa không đúng cách. Legit Mode đảm bảo metadata kỹ thuật **100% chân thực** như ảnh chụp thật từ device đó.

### ❓ Có thể sửa ISO, Aperture không?
**Trả lời:** KHÔNG trong Legit Mode. Các thông số camera (ISO, Aperture, Shutter Speed) bị khóa để giữ tính chân thực. Nếu muốn sửa, tắt Legit Mode.

### ❓ Metadata có bị phát hiện giả không?
**Trả lời:** KHÔNG, nếu bạn CHỈ sửa GPS/DateTime/Thông tin cá nhân. Metadata device được lấy từ ảnh thật nên không thể phân biệt.

### ❓ Có thể thêm device mới không?
**Trả lời:** CÓ, chỉnh sửa file `src/data/deviceProfiles.js` và thêm metadata từ ảnh thật của device đó.

### ❓ GPS có giữ nguyên khi đổi device không?
**Trả lời:** CÓ, khi load device mới, hệ thống sẽ **GIỮ NGUYÊN** GPS và DateTime đã nhập trước đó.

---

## Danh sách thiết bị hỗ trợ

### 📱 iPhone
- iPhone 15 Pro Max
- iPhone 15 Pro
- iPhone 14 Pro Max
- iPhone 13 Pro

### 📱 Samsung
- Galaxy S23 Ultra
- Galaxy S22 Ultra
- Galaxy S21 Ultra

### 📱 Google Pixel
- Pixel 8 Pro
- Pixel 7 Pro

### 📱 Xiaomi
- Xiaomi 13 Pro

### 📱 OPPO
- OPPO Find X5 Pro

### 📷 DSLR/Mirrorless
- Canon EOS R5
- Canon EOS R6
- Sony A7IV
- Nikon Z9

*(Danh sách sẽ được cập nhật thường xuyên)*

---

## Kết luận

**Legit Mode** là công cụ mạnh mẽ để:
- ✅ Tạo metadata chân thực 100%
- ✅ Tùy chỉnh GPS, DateTime, thông tin cá nhân
- ✅ Bảo vệ khỏi bị phát hiện metadata giả
- ✅ Tiết kiệm thời gian (không cần nhập thủ công 50+ fields)

Sử dụng có trách nhiệm và tuân thủ pháp luật! 🎯
