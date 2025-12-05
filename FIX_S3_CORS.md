# 🔧 Cấu hình CORS cho S3 Bucket - Fix lỗi EXIF Editor

## ❌ Lỗi hiện tại

```
GET https://mmo-kyc-storage.s3.ap-southeast-2.amazonaws.com/... 
net::ERR_FAILED 304 (Not Modified)
TypeError: Failed to fetch
```

## 🔍 Nguyên nhân

S3 bucket chưa được cấu hình CORS (Cross-Origin Resource Sharing), dẫn đến browser chặn request từ frontend.

### 📊 Flow diagram

```
Without CORS:
Browser (localhost:5173) --[fetch]--> S3 Bucket
                              ❌ CORS Error: Blocked by browser

With Bucket Policy only:
Browser (localhost:5173) --[fetch]--> S3 Bucket
                              ❌ CORS Error: S3 allows, but browser blocks

With CORS only:
Browser (localhost:5173) --[fetch]--> S3 Bucket
                              ❌ Access Denied: Browser allows, but S3 blocks

With BOTH:
Browser (localhost:5173) --[fetch]--> S3 Bucket
                              ✅ Success: Both allow!
```

## ✅ Giải pháp

### Option 1: Cấu hình CORS trên AWS Console (Khuyến nghị)

#### Bước 1: Đăng nhập AWS Console
1. Truy cập: https://console.aws.amazon.com/s3/
2. Đăng nhập với tài khoản AWS của bạn

#### Bước 2: Chọn S3 Bucket
1. Click vào bucket: `mmo-kyc-storage`
2. Chọn tab **"Permissions"**

#### Bước 3: Cấu hình Bucket Policy (Public Access)

**Mục đích**: Cho phép tất cả mọi người đọc files trong bucket

1. Scroll xuống phần **"Bucket policy"**
2. Click **"Edit"**
3. Paste configuration sau:

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "PublicReadGetObject",
			"Effect": "Allow",
			"Principal": "*",
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::mmo-kyc-storage/*"
		}
	]
}
```

4. Click **"Save changes"**

**⚠️ Lưu ý**: Bước này làm cho tất cả files trong bucket có thể được đọc công khai. Chỉ dùng cho files không nhạy cảm!

#### Bước 4: Cấu hình CORS

**Mục đích**: Cho phép browser fetch files từ domain khác

1. Scroll xuống phần **"Cross-origin resource sharing (CORS)"**
2. Click **"Edit"**
3. Paste configuration sau:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD",
            "PUT",
            "POST",
            "DELETE"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag",
            "Content-Type",
            "Content-Length"
        ],
        "MaxAgeSeconds": 3600
    }
]
```

4. Click **"Save changes"**

#### Bước 5: Tắt "Block Public Access" (nếu cần)

Nếu bạn bật Bucket Policy ở Bước 3 mà vẫn bị lỗi:

1. Scroll lên phần **"Block public access (bucket settings)"**
2. Click **"Edit"**
3. **Bỏ tick** tất cả các options:
   - ☐ Block all public access
   - ☐ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ☐ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ☐ Block public access to buckets and objects granted through new public bucket or access point policies
   - ☐ Block public and cross-account access to buckets and objects through any public bucket or access point policies
4. Click **"Save changes"**
5. Type `confirm` để xác nhận

**⚠️ Cảnh báo bảo mật**: Chỉ làm điều này nếu bạn thực sự muốn bucket là public!

#### Bước 6: Lưu thay đổi và kiểm tra
- Click **"Save changes"**
- Đợi vài giây để AWS apply configuration

### Option 2: Cấu hình CORS qua AWS CLI

```bash
# Tạo file cors-config.json
cat > cors-config.json << 'EOF'
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag", "Content-Type", "Content-Length"],
            "MaxAgeSeconds": 3600
        }
    ]
}
EOF

# Apply CORS configuration
aws s3api put-bucket-cors \
    --bucket mmo-kyc-storage \
    --cors-configuration file://cors-config.json \
    --region ap-southeast-2
```

### Option 3: Sử dụng ảnh từ máy tính (Workaround)

Nếu không thể cấu hình CORS ngay, sử dụng tính năng mới:

1. Trong trang **Quản Lý Media**
2. Tìm box màu tím **"EXIF Editor"**
3. Click nút **"📁 Chọn ảnh từ máy"**
4. Upload ảnh trực tiếp từ máy tính
5. Không cần fetch từ S3

## 🔒 CORS Configuration Giải thích

### Hiểu rõ: Bucket Policy vs CORS

#### 🔐 Bucket Policy
- **Mục đích**: Kiểm soát **ai** có thể truy cập bucket
- **Câu hỏi**: "User này có được phép đọc/ghi file không?"
- **Ví dụ**: Cho phép tất cả mọi người đọc files (public read)

```json
{
	"Version": "2012-10-17",
	"Statement": [{
		"Effect": "Allow",
		"Principal": "*",
		"Action": "s3:GetObject",
		"Resource": "arn:aws:s3:::mmo-kyc-storage/*"
	}]
}
```

#### 🌐 CORS Configuration
- **Mục đích**: Cho phép **browser** fetch từ domain khác
- **Câu hỏi**: "Browser từ domain A có được fetch file từ S3 không?"
- **Ví dụ**: Cho phép localhost:5173 fetch ảnh từ S3

```json
[{
	"AllowedOrigins": ["http://localhost:5173"],
	"AllowedMethods": ["GET", "HEAD"],
	"AllowedHeaders": ["*"],
	"ExposeHeaders": ["ETag"]
}]
```

#### ⚡ Cần CẢ HAI để EXIF Editor hoạt động!

1. **Bucket Policy** → S3 cho phép đọc file
2. **CORS** → Browser được phép fetch từ frontend domain

### Production (Bảo mật cao hơn)

Thay vì `"AllowedOrigins": ["*"]`, chỉ định domain cụ thể:

```json
{
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://yourdomain.com"
    ],
    "ExposeHeaders": ["ETag", "Content-Type"],
    "MaxAgeSeconds": 3600
}
```

### Chỉ cho phép GET (Read-only)

```json
{
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
}
```

## ✅ Kiểm tra CORS đã hoạt động

### Bước 1: Test trong Browser Console

Mở DevTools (F12) và chạy:

```javascript
fetch('https://mmo-kyc-storage.s3.ap-southeast-2.amazonaws.com/shared/test.jpg', {
  method: 'GET',
  mode: 'cors'
})
.then(res => console.log('✓ CORS OK:', res.status))
.catch(err => console.error('✗ CORS Error:', err));
```

### Bước 2: Test EXIF Editor

1. Mở trang **Quản Lý Media**
2. Click nút **"📸 EXIF"** trên bất kỳ ảnh nào
3. Nếu EXIF Editor mở → **CORS OK** ✓
4. Nếu báo lỗi → **CORS chưa OK** ✗

## 🐛 Troubleshooting

### Lỗi: "Access Denied" khi cấu hình CORS

**Nguyên nhân**: Tài khoản AWS không có quyền `s3:PutBucketCors`

**Giải pháp**:
1. Đăng nhập với tài khoản có quyền Admin
2. Hoặc request quyền từ AWS Administrator

### Lỗi: CORS vẫn không hoạt động sau khi cấu hình

**Nguyên nhân**: Browser cache

**Giải pháp**:
1. Hard refresh: `Ctrl + F5` (Windows) hoặc `Cmd + Shift + R` (Mac)
2. Xóa cache: DevTools → Network → Disable cache
3. Restart browser

### Lỗi: "304 Not Modified"

**Nguyên nhân**: Cache của S3 hoặc CDN

**Giải pháp**: Code đã được update để thêm cache busting:
```javascript
const imageUrl = `${item.url}?t=${Date.now()}`;
```

## 📊 So sánh giải pháp

| Giải pháp | Ưu điểm | Nhược điểm |
|-----------|---------|------------|
| **Cấu hình CORS** | Tốt nhất, seamless UX | Cần quyền AWS |
| **Upload từ máy** | Không cần CORS, hoạt động ngay | Phải upload lại ảnh |
| **Proxy qua Backend** | Bảo mật cao | Tăng load cho server |

## 🚀 Recommended Flow

1. **Ngắn hạn**: Dùng "Chọn ảnh từ máy" để sử dụng ngay
2. **Dài hạn**: Cấu hình CORS cho S3 bucket
3. **Tối ưu**: Thêm CDN (CloudFront) với CORS đã configure

## 📝 Checklist

- [ ] Đăng nhập AWS Console
- [ ] Mở S3 bucket `mmo-kyc-storage`
- [ ] Chọn tab Permissions
- [ ] Edit CORS configuration
- [ ] Paste JSON config
- [ ] Save changes
- [ ] Hard refresh browser (Ctrl + F5)
- [ ] Test EXIF Editor
- [ ] Confirm ảnh load được từ S3

## 🎯 Alternative: Proxy qua Backend

Nếu không muốn expose S3 với CORS, tạo proxy endpoint:

### Backend (routes/media.js)
```javascript
// Proxy image from S3
router.get('/proxy/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    // Fetch from S3
    const response = await fetch(media.url);
    const buffer = await response.buffer();
    
    res.set('Content-Type', media.mimeType);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

### Frontend (MediaManager.jsx)
```javascript
const openExifEditor = async (item) => {
  try {
    // Sử dụng proxy thay vì direct S3 URL
    const proxyUrl = `/api/media/proxy/${item._id}`;
    const response = await fetch(proxyUrl);
    const blob = await response.blob();
    // ... rest of code
  } catch (err) {
    // ...
  }
};
```

---

## 📋 Quick Reference Card

### Checklist đầy đủ (Copy & Paste)

#### 1️⃣ Bucket Policy (Permissions → Bucket policy)
```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "PublicReadGetObject",
			"Effect": "Allow",
			"Principal": "*",
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::mmo-kyc-storage/*"
		}
	]
}
```

#### 2️⃣ CORS Configuration (Permissions → CORS)
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag", "Content-Type", "Content-Length"],
        "MaxAgeSeconds": 3600
    }
]
```

#### 3️⃣ Block Public Access (Permissions → Block public access)
- ☐ Bỏ tick "Block all public access"
- ☐ Bỏ tick tất cả 4 options bên dưới
- Type `confirm` để save

### Troubleshooting Quick Fix

| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| `Failed to fetch` | CORS chưa config | Thêm CORS config |
| `Access Denied` | Bucket Policy chưa config | Thêm Bucket Policy |
| `403 Forbidden` | Block Public Access đang bật | Tắt Block Public Access |
| `304 Not Modified` | Browser cache | Hard refresh (Ctrl+F5) |

### Test Commands

```javascript
// Test trong Browser Console (F12)

// 1. Test fetch
fetch('https://mmo-kyc-storage.s3.ap-southeast-2.amazonaws.com/shared/test.jpg')
  .then(r => console.log('✅ OK:', r.status))
  .catch(e => console.error('❌ Error:', e.message));

// 2. Test CORS headers
fetch('https://mmo-kyc-storage.s3.ap-southeast-2.amazonaws.com/shared/test.jpg', {
  method: 'HEAD'
})
  .then(r => {
    console.log('CORS Headers:');
    console.log('Access-Control-Allow-Origin:', r.headers.get('access-control-allow-origin'));
    console.log('Access-Control-Allow-Methods:', r.headers.get('access-control-allow-methods'));
  });
```

---

**Cập nhật**: 26/11/2025
**Version**: 1.0.0
**Status**: ✅ Code đã được update với workaround "Chọn ảnh từ máy"
