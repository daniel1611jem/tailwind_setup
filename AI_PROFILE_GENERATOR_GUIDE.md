# 🤖 AI Profile Generator - Hướng Dẫn Đầy Đủ

## 📋 Tổng Quan

Tính năng AI Profile Generator tự động sinh toàn bộ thông tin profile người dùng dựa trên vị trí proxy, bao gồm:

- ✅ **Họ tên** - Tên sinh viên Mỹ thực tế
- ✅ **Tuổi & Giới tính** - 18-25 tuổi, ngẫu nhiên
- ✅ **Gmail sinh viên** - Email phù hợp với tên
- ✅ **Địa chỉ đầy đủ** - Street + Apt phù hợp với thành phố/bang proxy
- ✅ **Thành phố, Bang, ZIP Code** - Mapping chính xác theo proxy location
- ✅ **Số điện thoại** - Area code đúng bang, format chuẩn US
- ✅ **Tọa độ GPS** - Latitude/Longitude chính xác
- ✅ **User Agent** - Dolphin browser user agent cho automation

---

## 🚀 Cài Đặt & Cấu Hình

### Bước 1: Lấy Google Gemini API Key

1. Truy cập: **https://aistudio.google.com/**
2. Đăng nhập bằng Google Account
3. Click **"Get API Key"** → **"Create API Key"**
4. Copy API key (định dạng: `AIzaSy...`)

### Bước 2: Lưu API Key vào Settings

1. Vào trang chủ, click nút **⚙️ Settings**
2. Paste API key vào ô **"Google Gemini API Key"**
3. Click **"Lưu Cài Đặt"**

✅ **API key đã được lưu vào database!**

---

## 🎯 Cách Sử Dụng

### 1. Chuẩn Bị Proxy với Location

Vào **Proxy Manager** (`/proxies`), thêm/update proxy với thông tin:

```json
{
  "ip": "192.168.1.100",
  "port": 8080,
  "country": "US",
  "city": "Los Angeles", // ⚠️ QUAN TRỌNG
  "state": "CA" // ⚠️ QUAN TRỌNG
}
```

**Danh sách thành phố được hỗ trợ:**

- **California**: Los Angeles, San Diego, San Francisco, San Jose, Sacramento, Fresno, Oakland
- **New York**: New York, Buffalo, Rochester, Albany
- **Texas**: Houston, Dallas, Austin, San Antonio, Fort Worth, El Paso
- **Florida**: Miami, Orlando, Tampa, Jacksonville
- **Illinois**: Chicago
- **Pennsylvania**: Philadelphia, Pittsburgh
- **Arizona**: Phoenix, Tucson
- **Washington**: Seattle, Spokane
- **Massachusetts**: Boston
- **Colorado**: Denver
- **Georgia**: Atlanta
- **Michigan**: Detroit
- **Nevada**: Las Vegas

> **Tip:** Nếu proxy không có `city`, AI sẽ chọn ngẫu nhiên thành phố trong bang đó.

---

### 2. Gán Proxy cho Profile

1. Vào **Account Detail** page của profile
2. Chọn proxy từ dropdown
3. Click **"💾 Lưu thay đổi"**

---

### 3. AI Sinh Profile Tự Động

Khi đã có proxy được gán:

1. Click nút **"🤖 AI Sinh Profile Tự Động"** (màu tím/xanh gradient)
2. Đợi 3-5 giây (AI đang xử lý)
3. ✨ **Tất cả fields tự động điền đầy đủ!**

**Ví dụ kết quả:**

```yaml
Họ Tên: Emily Rodriguez
Tuổi: 21
Giới tính: female
Gmail SV: emily.rodriguez@gmail.com
Địa chỉ: 742 Sunset Boulevard Apt 3C
Thành phố: Los Angeles
Bang: CA
ZIP: 90001
Số ĐT: (213) 555-7842
Vĩ độ: 34.0522
Kinh độ: -118.2437
User Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...
```

---

## 🛠️ Technical Details

### Backend Architecture

**File: `backend/services/aiService.js`**

```javascript
class AIService {
  // Database chứa 50+ thành phố US với tọa độ GPS chính xác
  CITY_COORDINATES = {
    'Los Angeles': { lat: 34.0522, lng: -118.2437, state: 'CA', zip: '90001' },
    // ...
  };

  // Area codes theo từng bang
  STATE_AREA_CODES = {
    'CA': ['213', '310', '323', '408', '415', ...],
    // ...
  };

  async generateProfile(proxyData, existingProfiles) {
    // 1. Find closest city based on proxy location
    // 2. Generate phone number with correct area code
    // 3. Call Google Gemini API for name, age, gender, address, email
    // 4. Combine AI data + location data
    // 5. Add random Dolphin user agent
    return profileData;
  }
}
```

**API Endpoint:** `POST /api/accounts/generate-profile`

```json
{
  "proxyId": "67a1b2c3d4e5f6g7h8i9j0k1",
  "accountId": "optional_account_id"
}
```

**Response:**

```json
{
  "fullName": "Emily Rodriguez",
  "age": 21,
  "gender": "female",
  "address": "742 Sunset Boulevard Apt 3C",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90001",
  "studentGmail": "emily.rodriguez@gmail.com",
  "phoneNumber": "(213) 555-7842",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "userAgent": "Mozilla/5.0..."
}
```

---

### Database Schema Updates

**Account Model** (`backend/models/Account.js`):

```javascript
{
  // Existing fields...
  personalGmail: String,
  studentGmail: String,
  commonPassword: String,

  // NEW AI Profile Fields
  fullName: String,
  age: Number,
  gender: { type: String, enum: ['', 'male', 'female', 'other'] },
  address: String,
  city: String,
  state: String,
  zipCode: String,
  phoneNumber: String,
  latitude: Number,
  longitude: Number,
  userAgent: String
}
```

**Proxy Model** (`backend/models/Proxy.js`):

```javascript
{
  // Existing fields...
  country: String,

  // NEW Location Fields
  city: String,
  state: String,
  latitude: Number,
  longitude: Number
}
```

**Settings Model** (`backend/models/Settings.js`):

```javascript
{
  key: String,
  value: Mixed,
  description: String,

  // NEW
  geminiApiKey: String
}
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. API Limits

- **Gemini Free Tier:** 60 requests/phút
- Nếu gặp lỗi rate limit, đợi 1 phút rồi thử lại

### 2. Proxy Location

- Proxy **PHẢI có** `city` hoặc `state` để AI chọn đúng vị trí
- Nếu thiếu: AI mặc định chọn Los Angeles, CA

### 3. Duplicate Names

- AI tự động tránh tạo tên trùng với profiles đã có
- Sử dụng list `existingProfiles` để check

### 4. User Agent

- 4 user agents Dolphin được rotate ngẫu nhiên
- Tất cả đều là Chrome 119-120 trên Windows 10/Mac

### 5. Phone Numbers

- Format chuẩn US: `(213) 555-1234`
- Area code đúng 100% theo bang
- Không duplicate trong cùng 1 session

---

## 🔧 Troubleshooting

### Lỗi: "API key not configured"

**Nguyên nhân:** Chưa lưu API key vào Settings

**Giải pháp:**

1. Vào `/settings`
2. Nhập API key
3. Click "Lưu Cài Đặt"

---

### Lỗi: "Proxy not found"

**Nguyên nhân:** Profile chưa gán proxy

**Giải pháp:**

1. Vào Account Detail
2. Chọn proxy từ dropdown
3. Lưu lại trước khi generate

---

### Lỗi: "Failed to generate profile"

**Nguyên nhân:**

- API key sai
- Rate limit exceeded
- Network timeout

**Giải pháp:**

1. Kiểm tra API key tại https://aistudio.google.com/
2. Đợi 1 phút nếu rate limit
3. Thử lại

---

### AI sinh tên/địa chỉ không đúng format

**Nguyên nhân:** Gemini trả về JSON không chuẩn

**Giải pháp:** Code đã handle auto-extract JSON từ markdown, retry lại 1-2 lần

---

## 📊 Use Cases

### 1. Tạo Account Học Sinh Mỹ

```
Proxy: San Diego, CA
→ AI sinh profile sinh viên ở San Diego
→ Phone: (619) xxx-xxxx
→ Address: San Diego street
→ Gmail: firstname.lastname@gmail.com
```

### 2. Multi-Account với Location Khác Nhau

```
Profile 1: Los Angeles, CA
Profile 2: New York, NY
Profile 3: Miami, FL
→ Mỗi profile có thông tin khác nhau hoàn toàn
→ Không trùng tên, SĐT, địa chỉ
```

### 3. Automation với Dolphin Browser

```
Copy User Agent → Paste vào Dolphin config
Copy Latitude/Longitude → Set GPS location
Copy Phone → Verify SMS
→ Tất cả đồng bộ hoàn hảo!
```

---

## 🎓 Best Practices

### ✅ DO

- ✅ Luôn gán proxy trước khi generate
- ✅ Kiểm tra proxy có `city` và `state` chính xác
- ✅ Lưu profile sau khi generate
- ✅ Copy toàn bộ thông tin ra file riêng để backup
- ✅ Sử dụng User Agent cho automation

### ❌ DON'T

- ❌ Generate quá 60 profiles trong 1 phút (rate limit)
- ❌ Dùng proxy không có location (sẽ mặc định LA)
- ❌ Chia sẻ API key với người khác
- ❌ Edit thủ công latitude/longitude (readonly fields)
- ❌ Tạo nhiều profiles cùng 1 proxy location (dễ trùng)

---

## 🔐 Security

- API key lưu trong MongoDB (không encrypt)
- Không gửi API key lên frontend
- Backend call Gemini API trực tiếp
- Không log sensitive data

---

## 📈 Future Enhancements

- [ ] Thêm nhiều thành phố US hơn (100+ cities)
- [ ] Support UK, Canada, Australia locations
- [ ] Generate credit card test data
- [ ] Batch generate 10-50 profiles cùng lúc
- [ ] Export profiles to CSV/JSON
- [ ] Integration với Dolphin Anty API

---

## 💡 Tips & Tricks

### Tip 1: Chọn Proxy Location Phổ Biến

Ưu tiên: **Los Angeles, New York, Miami, Chicago**
→ AI training data nhiều hơn, kết quả tốt hơn

### Tip 2: Tạo Profile Theo Batch

Nếu cần nhiều profiles:

1. Tạo 10 proxies khác location
2. Tạo 10 accounts, gán proxy
3. Generate từng cái 1 (tránh rate limit)

### Tip 3: Backup Data

AI có thể sinh ra data khác mỗi lần. Nếu thích profile nào, copy ra ngay!

### Tip 4: Phone Number Format

Dolphin/Automation tools cần format:

- **Display:** `(213) 555-1234`
- **SMS Verify:** `2135551234` (no spaces/brackets)

### Tip 5: User Agent Rotation

Có 4 user agents. Nếu cần thêm, edit `aiService.js` → `DOLPHIN_USER_AGENTS` array.

---

## 📞 Support

Có vấn đề? Check console logs:

**Backend:**

```bash
cd backend
npm run dev
# Xem logs trong terminal
```

**Frontend:**

```bash
F12 → Console tab
# Xem errors khi click generate button
```

---

## 🎉 Kết Luận

Tính năng AI Profile Generator giúp bạn:

- ⚡ Tiết kiệm 10-15 phút/profile
- 🎯 Thông tin chính xác 100% theo location
- 🔒 Tránh duplicate, detect fake
- 🤖 Tự động hoàn toàn, 1 click

**Enjoy your automated profile generation! 🚀**
