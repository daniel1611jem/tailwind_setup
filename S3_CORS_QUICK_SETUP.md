# ⚡ S3 CORS - Quick Setup (5 phút)

## 🎯 Mục tiêu
Fix lỗi: `Failed to fetch` khi click "📸 EXIF" trong MediaManager

## 📝 3 Bước cần làm

### Bước 1: Bucket Policy (Public Read)
1. Mở https://console.aws.amazon.com/s3/
2. Click bucket `mmo-kyc-storage`
3. Tab **Permissions** → **Bucket policy** → **Edit**
4. Paste:

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

5. **Save**

### Bước 2: CORS Configuration
1. Vẫn trong tab **Permissions**
2. Scroll xuống **CORS** → **Edit**
3. Paste:

```json
[{
	"AllowedHeaders": ["*"],
	"AllowedMethods": ["GET", "HEAD"],
	"AllowedOrigins": ["*"],
	"ExposeHeaders": ["ETag", "Content-Type"],
	"MaxAgeSeconds": 3600
}]
```

4. **Save**

### Bước 3: Tắt Block Public Access
1. Vẫn trong tab **Permissions**
2. **Block public access** → **Edit**
3. **Bỏ tick** "Block all public access"
4. **Save** → Type `confirm`

## ✅ Kiểm tra

```javascript
// Mở Browser Console (F12) và chạy:
fetch('https://mmo-kyc-storage.s3.ap-southeast-2.amazonaws.com/shared/test.jpg')
  .then(r => console.log('✅ CORS OK!'))
  .catch(e => console.error('❌ Still error:', e));
```

## 🔄 Nếu vẫn lỗi

1. **Hard refresh**: `Ctrl + F5`
2. **Clear cache**: DevTools → Network → Disable cache
3. **Đợi 1-2 phút** để AWS apply changes

## 🚀 Xong!

Bây giờ click "📸 EXIF" sẽ hoạt động!

---

**Lưu ý**: Config này cho phép tất cả mọi người đọc files. Chỉ dùng cho files không nhạy cảm!

**Xem chi tiết**: `FIX_S3_CORS.md` (full guide với troubleshooting)
