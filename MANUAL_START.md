# 🚀 HƯỚNG DẪN KHỞI ĐỘNG THỦ CÔNG

## ❌ Nếu file .bat hoặc .ps1 tự tắt, làm theo các bước sau:

### Cách 1: Khởi động thủ công (RECOMMENDED)

#### Bước 1: Mở Terminal Backend
1. Mở PowerShell hoặc CMD
2. Chuyển đến thư mục project:
   ```
   cd "\\vmware-host\Shared Folders\CODE\MMO"
   ```
3. Vào thư mục backend:
   ```
   cd backend
   ```
4. Chạy backend:
   ```
   npm start
   ```
5. **GIỮ NGUYÊN CỬA SỔ NÀY** - Không đóng!

#### Bước 2: Mở Terminal Frontend (cửa sổ mới)
1. Mở PowerShell hoặc CMD mới (cửa sổ thứ 2)
2. Chuyển đến thư mục project:
   ```
   cd "\\vmware-host\Shared Folders\CODE\MMO"
   ```
3. Chạy frontend:
   ```
   npm run dev
   ```
4. **GIỮ NGUYÊN CỬA SỔ NÀY** - Không đóng!

#### Bước 3: Mở trình duyệt
- Sau khi Frontend khởi động (5-10 giây)
- Truy cập: http://localhost:5173 hoặc http://localhost:3000

---

### Cách 2: Sử dụng VS Code Terminal

1. Mở VS Code trong thư mục MMO
2. Mở Terminal (Ctrl + `)
3. Split terminal thành 2 phần:
   - Click vào icon "Split Terminal" hoặc nhấn Ctrl+Shift+5

**Terminal 1 (Backend):**
```powershell
cd backend
npm start
```

**Terminal 2 (Frontend):**
```powershell
npm run dev
```

---

### Cách 3: Fix PowerShell Execution Policy (Nếu .ps1 bị chặn)

Nếu file `.ps1` bị lỗi "cannot be loaded because running scripts is disabled"

**Mở PowerShell as Administrator:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Sau đó thử chạy lại `start.ps1`

---

## 🔍 Kiểm tra lỗi phổ biến

### 1. Port đã được sử dụng
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Giải pháp:**
- Đóng các process đang dùng port 5000 hoặc 5173
- Hoặc tìm và kill process:
  ```powershell
  # Tìm process dùng port 5000
  netstat -ano | findstr :5000
  # Kill process (thay PID)
  taskkill /PID <PID> /F
  ```

### 2. Node.js chưa cài
```
'node' is not recognized as an internal or external command
```
**Giải pháp:**
- Tải Node.js: https://nodejs.org
- Cài đặt phiên bản LTS (Long Term Support)
- Restart terminal sau khi cài

### 3. Dependencies chưa cài
```
Error: Cannot find module 'express'
```
**Giải pháp:**
```powershell
# Cài backend dependencies
cd backend
npm install

# Cài frontend dependencies  
cd ..
npm install
```

### 4. MongoDB chưa kết nối
```
MongoServerError: connect ECONNREFUSED
```
**Giải pháp:**
- Kiểm tra file `backend/.env`
- Đảm bảo `MONGODB_URI` đúng
- Nếu dùng MongoDB Atlas, kiểm tra network access

---

## 📝 Checklist trước khi chạy

- [ ] Node.js đã cài (chạy: `node --version`)
- [ ] npm đã cài (chạy: `npm --version`)
- [ ] Backend dependencies đã cài (`backend/node_modules` tồn tại)
- [ ] Frontend dependencies đã cài (`node_modules` tồn tại)
- [ ] File `backend/.env` đã cấu hình đúng
- [ ] Port 5000 và 5173 chưa được sử dụng

---

## 🎯 Test nhanh

Chạy lệnh này để kiểm tra setup:

```powershell
# Check Node.js
node --version

# Check npm
npm --version

# Check backend folder
cd backend
ls

# Check if backend has node_modules
ls node_modules

# Back to root
cd ..

# Check frontend has node_modules
ls node_modules
```

Nếu tất cả đều OK → Chạy thủ công theo Cách 1

---

## 💡 Tips

### Giữ terminal mở
- Khi chạy `npm start` hoặc `npm run dev`, terminal PHẢI MỞ
- Nếu đóng terminal = dừng server
- Cần ít nhất 2 terminal (1 backend, 1 frontend)

### Dừng server
- Nhấn `Ctrl + C` trong terminal
- Hoặc đóng cửa sổ terminal

### Xem logs
- Backend logs: Terminal backend
- Frontend logs: Terminal frontend
- Browser console: F12 → Console tab

---

## 🆘 Vẫn không chạy được?

Kiểm tra các file sau:

1. `backend/package.json` - Có script "start" không?
2. `package.json` (root) - Có script "dev" không?
3. `backend/.env` - File này có tồn tại không?
4. `backend/server.js` - File main của backend

Nếu thiếu file nào → Báo lỗi cụ thể để fix!

---

## ✅ Khi đã chạy thành công

Bạn sẽ thấy:
- Backend terminal: `Server running on port 5000`
- Frontend terminal: `Local: http://localhost:5173`
- Browser tự mở và hiển thị app

**Giữ 2 terminal mở trong suốt quá trình sử dụng!**
