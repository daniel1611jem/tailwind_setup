# 🚀 Hướng dẫn cấu hình AWS S3 cho Upload Media

## 📋 Thông tin đăng nhập AWS

**Console URL:** https://299589795696.signin.aws.amazon.com/console  
**Username:** thnkthuhigh  
**Password:** Aa@0932985776

## 🔧 Các bước cài đặt

### 1. Cài đặt packages (Backend)

```bash
cd backend
npm install @aws-sdk/client-s3 multer multer-s3
```

**Packages:**
- `@aws-sdk/client-s3`: AWS SDK v3 cho S3 (version mới nhất)
- `multer`: Middleware xử lý multipart/form-data
- `multer-s3`: Streaming upload trực tiếp lên S3
### 2. Tạo S3 Bucket

1. Đăng nhập AWS Console{ customFields: { col_moi: 'value' } }
2. Vào **S3** service
3. Click **"Create bucket"**
4. Cấu hình:
   - **Bucket name:** `mmo-media-bucket` (hoặc tên khác - phải unique globally)
   - **AWS Region:** `us-east-1` (hoặc region gần bạn)
   - **Object Ownership:** ACLs disabled (recommended)
   - **Block Public Access settings for this bucket:**
     - ❌ **BỎ CHỌN TẤT CẢ** các checkbox:
       - ❌ Block all public access
       - ❌ Block public access to buckets and objects granted through new access control lists (ACLs)
       - ❌ Block public access to buckets and objects granted through any access control lists (ACLs)
       - ❌ Block public access to buckets and objects granted through new public bucket or access point policies
       - ❌ Block public and cross-account access to buckets and objects through any public bucket or access point policies
     - ✅ **TICK VÀO:** "I acknowledge that the current settings might result in this bucket and the objects within becoming public"
   - **Bucket Versioning:** Disable (hoặc Enable nếu muốn backup)
   - **Default encryption:** Disable (hoặc Enable nếu muốn)
5. Click **"Create bucket"**

### 2.1. Tắt Block Public Access (NẾU ĐÃ TẠO BUCKET)

**Nếu bạn đã tạo bucket và quên tắt Block Public Access:**

1. Vào bucket vừa tạo
2. Tab **"Permissions"**
3. Phần **"Block public access (bucket settings)"**
4. Click **"Edit"**
5. ❌ **BỎ CHỌN** "Block all public access"
6. ✅ **TICK** vào "I acknowledge that the current settings might result in this bucket and the objects within becoming public"
7. Click **"Save changes"**
8. Nhập `confirm` → Click **"Confirm"**

### 3. Cấu hình Bucket Policy (Public Read)

**SAU KHI ĐÃ TẮT BLOCK PUBLIC ACCESS:**

1. Vào bucket của bạn
2. Tab **"Permissions"**
3. Scroll xuống **"Bucket policy"**
4. Click **"Edit"**
5. Paste policy sau (thay `mmo-media-bucket` bằng tên bucket của bạn):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mmo-media-bucket/*"
    }
  ]
}
```

**Lưu ý:** 
- Thay `mmo-media-bucket` bằng tên bucket của bạn (2 chỗ trong Resource)
- Đảm bảo có `/*` ở cuối Resource để cho phép đọc tất cả objects

6. Click **"Save changes"**

**✅ Nếu thành công:** Bạn sẽ thấy thông báo "Successfully edited bucket policy"

**❌ Nếu vẫn lỗi:** Quay lại bước 2.1 và đảm bảo đã tắt hết Block Public Access

### 4. Tạo IAM User cho ứng dụng

#### 4.1. Tạo IAM User

1. Vào **IAM** service (tìm "IAM" trong thanh search)
2. Bên trái click **"Users"** 
3. Click **"Create user"** (nút màu cam)
4. **Step 1: Specify user details**
   - **User name:** `mmo-app-user` (hoặc tên bạn muốn)
   - ✅ **KHÔNG TICK** vào "Provide user access to the AWS Management Console"
   - Click **"Next"**
5. **Step 2: Set permissions**
   - Chọn **"Attach policies directly"**
   - Tìm và tick vào **"AmazonS3FullAccess"**
   - Click **"Next"**
6. **Step 3: Review and create**
   - Xem lại thông tin
   - Click **"Create user"**
7. ✅ User đã được tạo!

#### 4.2. Tạo Access Key cho User

**SAU KHI TẠO USER:**

1. Click vào **user name** vừa tạo (`mmo-app-user`)
2. Tab **"Security credentials"**
3. Scroll xuống phần **"Access keys"**
4. Click **"Create access key"**
5. **Access key best practices & alternatives:**
   - Chọn **"Application running outside AWS"** (hoặc "Local code")
   - Click **"Next"**
6. **Description tag (optional):**
   - Nhập mô tả (ví dụ: "MMO Media Upload App")
   - Click **"Create access key"**
7. **🔴 QUAN TRỌNG - Retrieve access keys:**
   - ✅ **Copy Access key** (ví dụ: `AKIAIOSFODNN7EXAMPLE`)
   - ✅ **Copy Secret access key** (ví dụ: `wJalrXUtnFEMI/K7MDENG/bPxRfiCY...`)
   - **Hoặc click "Download .csv file"** để lưu file
   - **⚠️ CHÚ Ý:** Secret key chỉ hiển thị 1 lần duy nhất!
   - **⚠️ NẾU KHÔNG COPY:** Phải xóa key này và tạo lại
8. Click **"Done"**

#### 4.3. Nếu quên Secret Key

**Nếu bạn đã click "Done" mà quên copy Secret Key:**

1. Vào IAM → Users → `mmo-app-user`
2. Tab **"Security credentials"**
3. Tìm Access key vừa tạo
4. Click **"Actions"** → **"Deactivate"** (hoặc **"Delete"**)
5. Quay lại bước 4.2 để tạo Access key mới

### 5. Cập nhật file .env

Mở file `backend/.env` và cập nhật với **Access key vừa tạo**:

```properties
# AWS Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET=mmo-kyc-storage
```

**Thay thế:**
- `AWS_ACCESS_KEY_ID`: **Access key** từ bước 4.2 (bước 7)
- `AWS_SECRET_ACCESS_KEY`: **Secret access key** từ bước 4.2 (bước 7)
- `AWS_REGION`: Region của bucket (ví dụ: `ap-southeast-2`)
- `AWS_S3_BUCKET`: Tên bucket đã tạo ở bước 2

**📝 Lưu ý bảo mật:**
- ❌ KHÔNG commit file `.env` lên Git
- ❌ KHÔNG share Secret key với ai
- ✅ Thêm `.env` vào file `.gitignore`

### 6. (Optional) Tạo Custom IAM Policy (Bảo mật hơn)

Thay vì dùng `AmazonS3FullAccess`, tạo policy riêng:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::mmo-media-bucket",
        "arn:aws:s3:::mmo-media-bucket/*"
      ]
    }
  ]
}
```

## 🎯 Cấu trúc thư mục trong S3

```
mmo-media-bucket/
├── shared/          # Ảnh chung
│   ├── 1234567890-123456789.jpg
│   └── 1234567891-987654321.png
├── document/        # Tài liệu
│   ├── 1234567892-111222333.pdf
│   └── 1234567893-444555666.docx
└── private/         # Ảnh riêng
    ├── 1234567894-777888999.jpg
    └── 1234567895-101112131.png
```

## ✅ Test kết nối

Tạo file `backend/test-s3.js`:

```javascript
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// List buckets
try {
  const data = await s3Client.send(new ListBucketsCommand({}));
  console.log("Success! Buckets:");
  console.log(data.Buckets);
} catch (err) {
  console.log("Error:", err);
}
```

Chạy test:
```bash
node test-s3.js
```

## 📁 File structure

### Backend đã tạo:
- ✅ `backend/models/Media.js` - Schema cho media
- ✅ `backend/routes/media.js` - API routes
- ✅ `backend/config/aws.js` - AWS S3 config
- ✅ `backend/server.js` - Đã thêm media routes

### Frontend đã tạo:
- ✅ `src/services/mediaService.js` - API calls
- ✅ `src/pages/MediaManager.jsx` - Trang quản lý media
- ✅ `src/App.jsx` - Đã thêm route `/media`

### Trang chủ:
- ✅ Đã thêm nút "Quản lý Media"

## 🎨 Tính năng

### 3 Tabs:
1. **Ảnh chung** 🖼️ - Ảnh công khai, chia sẻ
2. **Tài liệu** 📄 - PDF, DOC, TXT, ZIP...
3. **Ảnh riêng** 🔒 - Ảnh cá nhân, bảo mật

### Upload:
- Chọn file (ảnh hoặc tài liệu)
- Thêm mô tả (optional)
- Thêm tags (optional)
- Click "Upload" → Lưu lên S3 + Database

### Quản lý:
- **Grid view** với thumbnail
- **Preview** modal cho ảnh
- **Copy URL** để dùng ở nơi khác
- **Delete** file (xóa cả S3 + Database)
- Hiển thị: tên file, kích thước, mô tả, tags

## 🔒 Bảo mật

### Public vs Private:
- **Public:** Bucket policy cho phép đọc công khai (`s3:GetObject`)
- **Private:** Nếu cần bảo mật, xóa bucket policy và dùng signed URLs

### Signed URLs (Nếu muốn private):

```javascript
const params = {
  Bucket: 'mmo-media-bucket',
  Key: 'private/myfile.jpg',
  Expires: 60 * 5 // 5 minutes
};

const url = s3.getSignedUrl('getObject', params);
```

## 💰 Chi phí AWS S3

### Free Tier (12 tháng đầu):
- 5GB storage
- 20,000 GET requests
- 2,000 PUT requests

### Sau Free Tier (us-east-1):
- Storage: $0.023/GB/tháng
- PUT requests: $0.005/1000 requests
- GET requests: $0.0004/1000 requests

**Ước tính:** Với 1000 file (~2GB), chi phí ~$0.05/tháng

## 🚀 Chạy ứng dụng

### Terminal 1 - Backend:
```bash
cd backend
npm start
```

### Terminal 2 - Frontend:
```bash
npm run dev
```

### Truy cập:
- Trang chủ: http://localhost:3000
- Quản lý Media: http://localhost:3000/media

## 📝 API Endpoints

```
GET    /api/media              - Lấy tất cả media
GET    /api/media?type=shared  - Lấy theo type
GET    /api/media/:id          - Lấy 1 media
POST   /api/media/upload       - Upload file
PUT    /api/media/:id          - Cập nhật mô tả/tags
DELETE /api/media/:id          - Xóa file
```

## ⚠️ Lưu ý

1. **Giới hạn file:** Hiện tại 10MB/file (có thể thay đổi trong `aws.js`)
2. **File types:** Ảnh (jpg, png, gif) + Tài liệu (pdf, doc, txt, zip)
3. **CORS:** S3 bucket cần cấu hình CORS nếu upload trực tiếp từ browser
4. **Region:** Dùng region gần để tăng tốc độ
5. **Backup:** S3 Versioning để tránh mất dữ liệu

## 🐛 Troubleshooting

### ⚠️ Lỗi "Your bucket policy changes can't be saved"

**Nguyên nhân:** Block Public Access đang bật

**Giải pháp:**
1. Vào bucket → Tab **"Permissions"**
2. Phần **"Block public access (bucket settings)"** → Click **"Edit"**
3. ❌ Bỏ chọn "Block all public access"
4. ✅ Tick "I acknowledge..."
5. Click **"Save changes"** → Nhập `confirm`
6. Đợi vài giây → Thử thêm Bucket Policy lại

### Lỗi "AccessDenied"
- Kiểm tra IAM policy có quyền `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`
- Kiểm tra Access Key/Secret Key đúng trong `.env`
- Kiểm tra Bucket policy đã được lưu thành công

### Lỗi "NoSuchBucket"
- Kiểm tra tên bucket trong `.env` khớp với tên bucket trên AWS
- Kiểm tra region đúng (ví dụ: `us-east-1`)
- Bucket name phải unique globally (không trùng bucket của người khác)

### Upload chậm
- Chọn region gần hơn (ví dụ: `ap-southeast-1` cho Singapore)
- Kiểm tra kết nối internet
- Giảm kích thước file hoặc tăng giới hạn trong `aws.js`

### File upload nhưng không hiển thị
- Kiểm tra Bucket Policy đã có `"Action": "s3:GetObject"`
- Kiểm tra ACL trong upload config: `acl: 'public-read'`
- Kiểm tra URL trong database có đúng không

### CORS Error khi upload
Thêm CORS configuration vào bucket:

1. Tab **"Permissions"** → Scroll xuống **"Cross-origin resource sharing (CORS)"**
2. Click **"Edit"**
3. Paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:5173"],
    "ExposeHeaders": ["ETag"]
  }
]
```

4. Click **"Save changes"**

## 🎉 Hoàn thành!

Bây giờ bạn có thể:
- ✅ Upload ảnh/tài liệu lên AWS S3
- ✅ Quản lý trong 3 tab riêng biệt
- ✅ Preview ảnh
- ✅ Copy URL để dùng
- ✅ Xóa file khi không cần

Enjoy! 🚀
