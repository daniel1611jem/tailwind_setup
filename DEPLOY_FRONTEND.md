# Frontend Deploy Guide

## Deploy trên Vercel (Miễn phí - Recommended)

1. **Tạo tài khoản tại** https://vercel.com

2. **Cập nhật API URL:**
   
   Trong file `src/services/accountService.js`, thay đổi:
   ```javascript
   const API_URL = 'https://your-backend-url.com/api/accounts';
   ```

3. **Deploy:**
   - Click "Add New Project"
   - Import Git repository
   - Vercel tự động detect Vite
   - Click "Deploy"

4. **Environment Variables (nếu cần):**
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

---

## Deploy trên Netlify

1. **Build locally:**
```bash
npm run build
```

2. **Tạo file `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. **Deploy:**
   - Đăng nhập https://netlify.com
   - Drag & drop thư mục `dist`
   - Hoặc connect Git repository

---

## Deploy thủ công

1. **Build:**
```bash
npm run build
```

2. **Upload thư mục `dist`** lên:
   - GitHub Pages
   - Firebase Hosting
   - AWS S3
   - Cloudflare Pages

---

## ⚠️ Lưu ý quan trọng

Sau khi deploy backend, **BẮT BUỘC** phải cập nhật URL trong frontend:

**Cách 1: Hardcode**
```javascript
// src/services/accountService.js
const API_URL = 'https://mmo-backend.onrender.com/api/accounts';
```

**Cách 2: Environment Variables**
```javascript
// src/services/accountService.js
const API_URL = import.meta.env.VITE_API_URL || '/api/accounts';
```

Và tạo file `.env`:
```
VITE_API_URL=https://your-backend-url.com/api/accounts
```
