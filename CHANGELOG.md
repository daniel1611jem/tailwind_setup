# 📝 Changelog - MMO Account Manager# 📝 Changelog - MMO Account Manager# Changelog - Cập nhật Giao Diện Mới



---



## [v1.2.1] - 2024-11-26 🔥 **CRITICAL HOTFIX**## [v1.2.0] - 2024-11-26 ⭐ **BẢN SỬA LỖI QUAN TRỌNG**## Phiên bản mới nhất - Giao diện Popup



### 🐛 **FIXED: Backend mất dữ liệu cũ khi lưu**



#### ❌ Vấn đề nghiêm trọng:### 🔧 **FIXED: Lỗi mất dữ liệu nghiêm trọng**### ✨ Tính năng mới



**Mô tả:**

```

Database có: { col1: "A", col2: "B", col3: "C", col4: "D" }#### ❌ Vấn đề trước đây:#### 1. **Giao diện Popup thay vì Page riêng**



User nhập thêm: { col5: "E" }- ✅ **Quản lý Cột** giờ là popup, không cần chuyển trang

Nhấn "Lưu ngay"

**1. Mất dữ liệu khi thêm cột**- ✅ **Quản lý Proxy** giờ là popup, không cần chuyển trang

Database sau khi lưu: { col5: "E" }

→ Mất hết col1, col2, col3, col4 ❌❌❌```- ✅ Làm việc nhanh hơn, không mất ngữ cảnh khi quản lý

```

Bước 1: Nhập dữ liệu ở 5 ô

**Root cause:**

- Backend route `PUT /accounts/:id` sử dụng `findByIdAndUpdate(id, req.body)`Bước 2: Nhấn "Thêm Cột Mới"#### 2. **Tự động tạo ID cho cột**

- `req.body` chỉ chứa field mới → **GHI ĐÈ** toàn bộ customFields

- Không có logic **MERGE** với dữ liệu cũKết quả: Tất cả 5 ô bị mất dữ liệu ❌- ✅ Không cần nhập ID thủ công nữa



#### ✅ Giải pháp:```- ✅ Chỉ cần nhập **Tên hiển thị**, hệ thống tự tạo ID



**File modified:** `backend/routes/accounts.js`- ✅ Ví dụ: "Số điện thoại" → ID: `so_dien_thoai`



**Changes:****2. Mất dữ liệu khi nhấn "Lưu ngay"**

```javascript

// BEFORE (v1.2.0):```#### 3. **Tùy chọn độ rộng cột "Auto"**

router.put('/:id', async (req, res) => {

  const account = await Account.findByIdAndUpdate(Bước 1: Nhập dữ liệu ở cột A, B, C- ✅ Thêm option **Auto** cho độ rộng cột

    req.params.id,

    req.body,  // ❌ GHI ĐÈBước 2: Đang edit cột D- ✅ Các option có sẵn: Auto, 100px, 150px, 200px, 250px, 300px

    { new: true }

  );Bước 3: Nhấn "Lưu ngay"- ✅ Cột sẽ tự động điều chỉnh theo nội dung

});

Kết quả: Chỉ cột D được lưu, A B C bị mất ❌

// AFTER (v1.2.1):

router.put('/:id', async (req, res) => {```#### 4. **Bảo vệ xóa cột bằng mật khẩu**

  // 1. Lấy dữ liệu cũ

  const currentAccount = await Account.findById(req.params.id);- ✅ Xóa cột cũng yêu cầu nhập mã bảo vệ (giống xóa tài khoản)

  

  // 2. MERGE customFields**3. Auto-save gián đoạn khi đang nhập**- ✅ Mã mặc định: `admin123`

  if (req.body.customFields) {

    req.body.customFields = {```- ✅ Tránh xóa nhầm cột quan trọng

      ...currentAccount.customFields.toObject(), // Giữ cũ

      ...req.body.customFields                   // Thêm mớiBước 1: Đang nhập dữ liệu

    };

  }Bước 2: Auto-save chạy sau 10s#### 5. **Cột Proxy mặc định cho tất cả tài khoản**

  

  // 3. Update với data đã mergeKết quả: Giật lag, mất focus ❌- ✅ Cột Proxy luôn hiển thị, không cần thêm qua Quản lý Cột

  const account = await Account.findByIdAndUpdate(

    req.params.id,```- ✅ Mỗi tài khoản đều có thể chọn proxy ngay trong bảng

    req.body,

    { new: true }- ✅ Dropdown thông minh: hiển thị proxy hiện tại và danh sách proxy khả dụng

  ).populate('userId').populate('proxy');

});---

```

#### 6. **Giao diện không dùng Icon**

**Kết quả:**

```javascript#### ✅ Giải pháp hoàn chỉnh:- ✅ Thay thế icon bằng text rõ ràng

// DB cũ:  { col1: "A", col2: "B" }

// Request: { col3: "C" }- ✅ Dễ hiểu, dễ sử dụng hơn

// DB mới:  { col1: "A", col2: "B", col3: "C" } ✅

```### **1. Tự động lưu trước mọi thao tác**- ✅ Buttons: "Xem", "Xóa", "Quản lý Proxy", "Quản lý Cột", "Ẩn/Hiện Cột", "Thêm Dòng Mới"



#### 📝 Migration:



**BẮT BUỘC: Restart Backend**Trước khi thực hiện bất kỳ thao tác nào gọi `fetchData()`, hệ thống sẽ **tự động lưu tất cả thay đổi pending**:### 🎨 Cải tiến giao diện

```bash

# Trong terminal backend:

Ctrl+C

cd backend```javascript#### Header Buttons

npm start

if (pendingSaves.size > 0) {```

# Hoặc dùng start script:

.\start.bat  await savePendingChanges(false); // Lưu âm thầm[Quản lý Proxy] [Quản lý Cột] [Ẩn/Hiện Cột] [Thêm Dòng Mới]

```

}```

**Không cần:**

- ❌ Update frontend// Sau đó mới thực hiện thao tác- Purple: Quản lý Proxy

- ❌ Migration database

- ❌ Thay đổi workflow```- Green: Quản lý Cột  



#### 🧪 Testing:- Gray: Ẩn/Hiện Cột



**Quick test:****Áp dụng cho 9 operations:**- Blue: Thêm Dòng Mới

1. Nhập 3 ô → Lưu → Reload → Kiểm tra ✓

2. Nhập thêm 2 ô → Lưu → Reload → Kiểm tra 5 ô ✓- ✅ Thêm/sửa cột (`handleColumnSubmit`)



**Advanced test:**- ✅ Xóa cột (`handleDeleteColumnConfirm`)#### Bảng chính

```bash

# Copy test-merge-fix.js vào Browser Console- ✅ Thêm/sửa proxy (`handleProxySubmit`)- Cột động: Hiển thị theo cấu hình

# Chạy automated tests

```- ✅ Xóa proxy (`handleDeleteProxy`)- **Cột Proxy**: Luôn có, dropdown chọn proxy



#### ⚠️ Impact:- ✅ Hủy gán proxy (`handleUnassignProxy`)- **Cột Thao tác**: Nút "Xem" và "Xóa"



- **Severity:** CRITICAL 🔥- ✅ Thêm/sửa user (`handleUserSubmit`)

- **Affected versions:** v1.0.0 - v1.2.0

- **Data loss risk:** HIGH- ✅ Xóa user (`handleDeleteUser`)### 📋 Hướng dẫn sử dụng mới

- **Fix priority:** IMMEDIATE

- ✅ Kéo thả reorder cột (`handleColumnDrop`)

---

- ✅ Gán proxy (`Proxy select onChange`)#### Tạo cột mới (Đơn giản hơn)

## [v1.2.0] - 2024-11-26 ⭐ **LỖI FRONTEND**

1. Click **"Quản lý Cột"**

### 🔧 **FIXED: Frontend mất pending changes**

---2. Popup hiện ra

#### ❌ Vấn đề:

3. Chỉ cần nhập:

1. **Mất pending khi thêm cột**: Nhập 5 ô → Thêm cột → Mất 5 ô

2. **Lưu ngay không lưu ô đang edit**: Nhập A,B,C → Đang edit D → Lưu → Chỉ lưu D### **2. "Lưu ngay" thông minh**   - **Tên hiển thị**: "Email"

3. **Auto-save gián đoạn**: Đang nhập → Auto-save chạy → Giật lag

   - **Kiểu dữ liệu**: Text/Number/Email/Password/Date/Select

#### ✅ Giải pháp:

Khi nhấn nút **"Lưu ngay"**:   - **Độ rộng**: Auto hoặc chọn px

**1. Tự động lưu pending trước operations** (9 functions)

- `handleColumnSubmit`, `handleDeleteColumnConfirm`1. Lấy giá trị ô đang edit (nếu có)4. Click **"Thêm"**

- `handleProxySubmit`, `handleDeleteProxy`, `handleUnassignProxy`

- `handleUserSubmit`, `handleDeleteUser`2. Cập nhật vào `pendingSaves`5. Xong! (ID tự động tạo từ tên)

- `handleColumnDrop`, Proxy select onChange

3. Lưu **TẤT CẢ** `pendingSaves`

**2. Manual save thông minh**

```javascript#### Quản lý Proxy trong Popup

const handleManualSave = async () => {

  // Lấy giá trị ô đang edit```javascript1. Click **"Quản lý Proxy"**

  if (editingCell && editingCellDataRef.current) {

    // Merge vào pendingSavesconst handleManualSave = async () => {2. Popup hiện danh sách proxy

  }

  // Lưu tất cả  // Nếu đang edit ô3. Thêm/Sửa/Xóa proxy ngay trong popup

  await savePendingChanges(false);

};  if (editingCell && editingCellDataRef.current) {4. Xem trạng thái: "Đã gán" hoặc "Khả dụng"

```

    // Merge vào pendingSaves5. Hủy gán proxy nếu cần

**3. Auto-save chỉ khi idle**

```javascript    // Clear editing state

if (!editingCell && pendingSaves.size > 0) {

  savePendingChanges();  }#### Gán Proxy cho tài khoản

}

```  // Lưu tất cả- Ngay trong bảng chính, mỗi hàng có cột Proxy



#### 📚 Technical:  await savePendingChanges(false);- Click dropdown → Chọn proxy



**File:** `src/pages/AccountListEditable.jsx`};- Proxy tự động gán cho tài khoản đó



**Key changes:**```

- Added `editingCellDataRef`

- Added `useCallback` for `savePendingChanges`#### Xóa cột (Có bảo vệ)

- Split `useEffect` thành 2 phần

- Save before all `fetchData()` calls**→ Không còn mất dữ liệu! ✅**1. Click **"Quản lý Cột"**



---2. Trong danh sách cột, click **"Xóa"**



## [v1.1.0] - 2024-11-25---3. Nhập mã bảo vệ: `admin123`



### ✨ Features4. Xác nhận



**1. Drag-and-Drop Columns**### **3. Auto-save chỉ chạy khi không edit**

- ⋮⋮ Icon để kéo

- Visual feedback### 🔒 Bảo mật

- Auto-save order

Auto-save 10s chỉ chạy khi **KHÔNG có ô nào đang được edit**:

**2. Manual Save Button**

- 2 vị trí (header + banner)**Mã bảo vệ** (Delete Protection Code):

- Silent save

- Show pending count```javascript- Áp dụng cho: Xóa tài khoản + Xóa cột



**3. Auto-start Scripts**setInterval(() => {- Mã mặc định: `admin123`

- `start.bat` (Windows Batch)

- `start.ps1` (PowerShell - recommended)  if (!editingCell && pendingSaves.size > 0) {- Thay đổi trong MongoDB:

- Auto npm install

- Port checking    savePendingChanges(); // Chỉ khi rảnh  - Collection: `settings`

- Auto browser launch

  }  - Key: `delete_protection_code`

---

}, 10000);  - Value: Mã mới của bạn

## [v1.0.0] - 2024-11-20

```

### 🎉 Initial Release

### 🚀 So sánh trước/sau

**Core Features:**

- Popup UI (không page riêng)**→ Không còn gián đoạn khi nhập liệu! ✅**

- Auto ID generation

- Column width: Auto + px options| Tính năng | Trước | Sau |

- Delete protection (password)

- Built-in Proxy column---|-----------|-------|-----|

- Text-based UI

- User management| Quản lý Cột | Page riêng | ✅ Popup |

- Media upload (AWS S3)

- Auto-save (10s)### 🎯 Kết quả sau khi sửa:| Quản lý Proxy | Page riêng | ✅ Popup |

- Search & filter

| Tạo cột | Nhập ID + Label | ✅ Chỉ nhập Label |

---

| Tình huống | Trước v1.2.0 | Sau v1.2.0 || Độ rộng cột | 100-300px | ✅ Có thêm Auto |

## 📊 Version Comparison

|------------|--------------|------------|| Xóa cột | Không bảo vệ | ✅ Có mật khẩu |

| Feature | v1.0 | v1.1 | v1.2.0 | v1.2.1 |

|---------|------|------|--------|--------|| Nhập 5 ô → Thêm cột | Mất 5 ô ❌ | Giữ nguyên ✅ || Cột Proxy | Phải tự thêm | ✅ Luôn có sẵn |

| Popup UI | ✅ | ✅ | ✅ | ✅ |

| Drag columns | ❌ | ✅ | ✅ | ✅ || Đang edit ô D → Lưu ngay | Mất A B C ❌ | Lưu tất cả ✅ || Giao diện | Icon emoji | ✅ Text rõ ràng |

| Manual save | ❌ | ✅ | ✅ | ✅ |

| Auto-start | ❌ | ✅ | ✅ | ✅ || Đang nhập → Auto-save chạy | Giật lag ❌ | Không chạy ✅ |

| Save pending before ops | ❌ | ❌ | ✅ | ✅ |

| Smart auto-save | ❌ | ❌ | ✅ | ✅ || Idle 10s có pending changes | Auto-save ✅ | Auto-save ✅ |### 💡 Mẹo sử dụng

| **Backend MERGE** | ❌ | ❌ | ❌ | ✅ |



---

---1. **Popup vs Page**: 

## 🎯 Upgrade Path

   - Popup giúp làm việc nhanh hơn, không mất ngữ cảnh

### From v1.0/v1.1 → v1.2.1

### 📚 Technical Details   - Có thể đóng popup bằng nút X hoặc click bên ngoài

1. Pull latest code

2. **Restart Backend** (REQUIRED)

3. Restart Frontend (optional)

4. Test thoroughly**File modified:**2. **Auto width**: 

5. Done!

- `src/pages/AccountListEditable.jsx` (1986 lines)   - Dùng "Auto" cho cột có nội dung ngắn/thay đổi

### From v1.2.0 → v1.2.1

   - Dùng px cố định cho cột có nội dung dài

1. Pull latest code

2. **Restart Backend** (REQUIRED)**Key changes:**

3. Done! (Frontend unchanged)

3. **Proxy mặc định**:

---

1. **Added ref to track editing cell data**   - Không cần tạo cột proxy nữa

## 🐛 Known Issues

```javascript   - Cột proxy luôn ở cuối, trước cột "Thao tác"

### Fixed in v1.2.1:

- ✅ Backend overwrites customFieldsconst editingCellDataRef = useRef(null);

- ✅ Data loss on save

```4. **Tìm kiếm thông minh**:

### Fixed in v1.2.0:

- ✅ Pending changes lost on operations   - Gõ bất kỳ để tìm trong tất cả các cột

- ✅ Manual save doesn't include editing cell

- ✅ Auto-save interrupts editing2. **Updated `handleCellEdit` to save to ref**   - Hiển thị số kết quả: "5 / 20 tài khoản"



### Still open:```javascript

- None critical

editingCellDataRef.current = { accountId, field, value };### 🐛 Lưu ý

---

```

## 📚 Documentation

- **Không còn trang /columns và /proxies**: Tất cả quản lý qua popup

- **Quick Fix Guide:** `QUICK_FIX.md`

- **Detailed Fix:** `FIX_v1.2.1.md`3. **Smart manual save**- **Cột Proxy**: Không xuất hiện trong "Quản lý Cột" (vì đã mặc định)

- **Test Script:** `test-merge-fix.js`

- **Auto-start Guide:** `start.bat` / `start.ps1````javascript- **Auto-save**: Vẫn hoạt động sau 10 giây như cũ

- **AWS Setup:** `AWS_SETUP_GUIDE.md`

const handleManualSave = async () => {

---

  if (editingCell && editingCellDataRef.current) {### 📸 Workflow mới

## 🤝 Support

    // Merge editing cell into pendingSaves

Issues? Questions?

1. Check documentation    // Clear editing state```

2. Review CHANGELOG

3. Run test scripts    // Wait for React state updateTrang chủ

4. Contact developer

  }  ↓

---

  await savePendingChanges(false);[Quản lý Cột] → Popup → Thêm/Sửa/Xóa → Đóng

**Current stable version: v1.2.1** ✅

};  ↓

```[Quản lý Proxy] → Popup → Thêm/Sửa/Xóa/Hủy gán → Đóng

  ↓

4. **Smart auto-save with separate useEffect**[Bảng chính] → Edit inline → Chọn proxy → Auto-save

```javascript```

useEffect(() => {

  const interval = setInterval(() => {### ✅ Checklist Migration

    if (!editingCell && pendingSaves.size > 0) {

      savePendingChanges();Nếu bạn đang dùng phiên bản cũ:

    }- [ ] Code mới đã được cập nhật (AccountListEditable.jsx)

  }, 10000);- [ ] Backend không thay đổi, vẫn hoạt động bình thường

  return () => clearInterval(interval);- [ ] Test popup Quản lý Cột

}, [editingCell, pendingSaves]);- [ ] Test popup Quản lý Proxy

```- [ ] Test tự động tạo ID khi thêm cột

- [ ] Test chọn độ rộng "Auto"

5. **Wrapped `savePendingChanges` with `useCallback`**- [ ] Test xóa cột với mã bảo vệ

```javascript- [ ] Test cột Proxy mặc định

const savePendingChanges = useCallback(async (showAlert = false) => {- [ ] Các tính năng cũ vẫn hoạt động (auto-save, filter, toggle columns)

  // ...

}, [pendingSaves]);### 🎯 Kết luận

```

Phiên bản mới tập trung vào:

6. **Added save before all operations that call `fetchData()`**- **UX đơn giản hơn**: Popup thay vì page

- 9 functions updated- **Workflow nhanh hơn**: Tự động tạo ID, auto width

- **An toàn hơn**: Bảo vệ xóa cột

**Dependencies:**- **Tiện lợi hơn**: Cột proxy mặc định

- Added `useCallback` import from React- **Rõ ràng hơn**: Text thay vì icon



**Breaking changes:**Enjoy! 🎉

- None! 100% backward compatible ✅

---

## [v1.1.0] - 2024-11-25

### ✨ Tính năng mới

#### 1. **Drag-and-Drop Column Reordering**
- ⋮⋮ Icon để kéo cột
- Visual feedback: opacity + background khi drag
- Lưu tự động vào database
- Tooltip hướng dẫn chi tiết

#### 2. **Manual Save Button**
- **2 vị trí**:
  - Header (luôn hiển thị khi có pending)
  - Yellow warning banner
- Hiển thị số lượng thay đổi: `Lưu ngay (5)`
- **Silent save** (không hiện alert)
- Tooltip: "Lưu tất cả thay đổi ngay..."

#### 3. **Auto-start Scripts**

**start.bat** (Windows Batch):
- Kiểm tra Node.js/npm
- Auto npm install nếu thiếu dependencies
- Khởi động Backend (port 5000)
- Khởi động Frontend (port 5173/3000)
- Mở browser tự động
- Color-coded output
- UTF-8 support

**start.ps1** (PowerShell - Khuyên dùng):
- Tất cả tính năng của .bat
- **+ Kiểm tra port đã sử dụng**
- **+ Error handling tốt hơn**
- **+ Màu sắc đẹp hơn**
- **+ Progress indicator**

### 🎨 UI/UX Improvements
- Removed all alerts on manual save
- Better drag-drop visual feedback
- Improved tooltip instructions
- Cleaner user experience

---

## [v1.0.0] - 2024-11-20

### 🎉 Initial Release - Popup UI

#### ✨ Core Features

**1. Giao diện Popup**
- Quản lý Cột → Popup (không page riêng)
- Quản lý Proxy → Popup (không page riêng)
- Workflow nhanh hơn, không mất context

**2. Tự động tạo ID cột**
- Chỉ nhập "Tên hiển thị"
- ID tự động: `so_dien_thoai` từ "Số điện thoại"
- Normalize tiếng Việt không dấu

**3. Column Width Options**
- Auto (mới)
- 100px, 150px, 200px, 250px, 300px

**4. Delete Protection**
- Xóa cột yêu cầu mã bảo vệ
- Mã mặc định: `admin123`
- Tương tự xóa account

**5. Proxy Column (Built-in)**
- Cột Proxy luôn có sẵn
- Dropdown chọn proxy ngay trong bảng
- Hiển thị: Proxy hiện tại + Available proxies

**6. Text-based UI**
- Không dùng icon emoji
- Buttons rõ ràng: "Xem", "Xóa", "Quản lý Proxy"...
- Dễ hiểu cho mọi user

#### 📋 User Guide

**Tạo cột mới:**
1. Click "Quản lý Cột"
2. Nhập "Tên hiển thị": Email
3. Chọn kiểu: Text/Number/Email/Password/Date/Select
4. Chọn độ rộng: Auto/100px/...
5. Click "Thêm"

**Quản lý Proxy:**
1. Click "Quản lý Proxy"
2. Thêm/Sửa/Xóa trong popup
3. Xem trạng thái: Đã gán / Khả dụng
4. Hủy gán nếu cần

**Gán Proxy:**
- Trong bảng, click dropdown cột Proxy
- Chọn proxy
- Tự động gán

#### 🔒 Security

**Delete Protection Code:**
- Collection: `settings`
- Key: `delete_protection_code`
- Default: `admin123`
- Thay đổi trong MongoDB nếu muốn

#### 🚀 Comparison

| Feature | Old | New v1.0 |
|---------|-----|----------|
| Quản lý Cột | Page riêng | ✅ Popup |
| Quản lý Proxy | Page riêng | ✅ Popup |
| Tạo cột | Nhập ID + Label | ✅ Chỉ Label |
| Width | 100-300px | ✅ + Auto |
| Xóa cột | Không bảo vệ | ✅ Password |
| Cột Proxy | Phải tự thêm | ✅ Built-in |
| UI | Icon | ✅ Text |

#### 💡 Tips

1. **Popup**: Nhanh hơn page, không mất context
2. **Auto width**: Dùng cho cột nội dung ngắn
3. **Proxy**: Luôn ở cuối, trước cột "Thao tác"
4. **Search**: Tìm trong tất cả cột, hiển thị "X / Y tài khoản"

#### 🐛 Notes

- Không còn routes `/columns` và `/proxies`
- Cột Proxy không trong "Quản lý Cột"
- Auto-save: 10 giây (như cũ)

---

## 📌 Migration Checklist

### v1.1.0 → v1.2.0
- [x] Pull code mới
- [ ] Test thêm cột (dữ liệu không mất)
- [ ] Test "Lưu ngay" khi đang edit (lưu tất cả)
- [ ] Test auto-save không chạy khi đang edit
- [ ] Verify không có breaking changes

### v1.0.0 → v1.2.0
- [x] Pull code mới
- [ ] Run `npm install` (backend + frontend)
- [ ] Test all core features
- [ ] Test drag-drop columns
- [ ] Test manual save
- [ ] Try auto-start scripts

---

## 🎯 Roadmap

### Planned for v1.3.0
- [ ] Bulk edit multiple cells
- [ ] Export/Import CSV
- [ ] Column templates
- [ ] Advanced filtering
- [ ] Activity logs

### Under consideration
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile responsive
- [ ] Keyboard shortcuts

---

## 🤝 Contributing

Found a bug? Have a suggestion?
- Open an issue
- Submit a pull request
- Contact: [your-contact]

---

**Made with ❤️ for MMO Account Management**
