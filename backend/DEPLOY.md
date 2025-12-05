# Backend Deploy Guide

## Deploy trên Render.com (Miễn phí)

1. **Tạo tài khoản tại** https://render.com

2. **Tạo Web Service mới:**
   - Click "New +" → "Web Service"
   - Connect repository hoặc upload code
   - Chọn thư mục `backend`

3. **Cấu hình:**
   - **Name**: mmo-backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

4. **Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://thnkthuhigh:thnkthuhigh@mmo.qukfgfn.mongodb.net/?appName=mmo
   PORT=5000
   NODE_ENV=production
   ```

5. **Deploy** và lấy URL backend

---

## Deploy trên Railway.app (Miễn phí)

1. **Tạo tài khoản tại** https://railway.app

2. **New Project** → Deploy from GitHub repo

3. **Cấu hình:**
   - Chọn thư mục `backend`
   - Railway tự động detect Node.js

4. **Variables:**
   - Thêm `MONGODB_URI`
   - Railway tự động set `PORT`

5. **Generate Domain** để có public URL

---

## Deploy trên Heroku

1. **Cài Heroku CLI** và login:
```bash
heroku login
```

2. **Tạo app:**
```bash
cd backend
heroku create mmo-backend-app
```

3. **Set config:**
```bash
heroku config:set MONGODB_URI="mongodb+srv://thnkthuhigh:thnkthuhigh@mmo.qukfgfn.mongodb.net/?appName=mmo"
```

4. **Deploy:**
```bash
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a mmo-backend-app
git push heroku main
```
