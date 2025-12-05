# 🔧 FIX v1.2.1 - Sửa lỗi mất dữ liệu cũ khi lưu

## ❌ Vấn đề

**Mô tả:**
```
Bước 1: Đã có 4 cột với dữ liệu trong database
        Col A: "data1"
        Col B: "data2"
        Col C: "data3"
        Col D: "data4"

Bước 2: Thêm dữ liệu cho cột E: "data5"

Bước 3: Nhấn "Lưu ngay"

Kết quả: ❌ Database chỉ còn:
        Col E: "data5"
        
        → Mất hết Col A, B, C, D
```

**Nguyên nhân:**
Backend route `PUT /accounts/:id` sử dụng `findByIdAndUpdate` với `req.body` **GHI ĐÈ** toàn bộ `customFields` thay vì **MERGE**.

---

## ✅ Giải pháp

### Backend Changes (CRITICAL)

**File:** `backend/routes/accounts.js`

**Trước đây:**
```javascript
router.put('/:id', async (req, res) => {
  const account = await Account.findByIdAndUpdate(
    req.params.id,
    req.body,  // ❌ GHI ĐÈ toàn bộ
    { new: true }
  );
});
```

**Sau khi sửa:**
```javascript
router.put('/:id', async (req, res) => {
  // 1. Lấy dữ liệu cũ từ database
  const currentAccount = await Account.findById(req.params.id);
  
  // 2. MERGE customFields (giữ dữ liệu cũ + thêm mới)
  if (req.body.customFields) {
    req.body.customFields = {
      ...currentAccount.customFields.toObject(), // Dữ liệu cũ ✓
      ...req.body.customFields                   // Dữ liệu mới (merge)
    };
  }
  
  // 3. Update với dữ liệu đã merge
  const account = await Account.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
});
```

**Cách hoạt động:**

| Trường hợp | Dữ liệu DB cũ | Request body | Kết quả sau merge |
|------------|---------------|--------------|-------------------|
| Thêm field mới | `{a: 1, b: 2}` | `{c: 3}` | `{a: 1, b: 2, c: 3}` ✅ |
| Update field cũ | `{a: 1, b: 2}` | `{b: 99}` | `{a: 1, b: 99}` ✅ |
| Mix | `{a: 1, b: 2}` | `{b: 99, c: 3}` | `{a: 1, b: 99, c: 3}` ✅ |

---

## 🚀 Cách áp dụng

### Bước 1: Code đã được update
✅ File `backend/routes/accounts.js` đã được sửa

### Bước 2: Restart Backend
```bash
# Trong terminal backend đang chạy:
# 1. Nhấn Ctrl+C để stop
# 2. Chạy lại:
cd backend
npm start
```

**Hoặc dùng start.bat/start.ps1:**
- Đóng terminal backend cũ
- Chạy lại `start.bat` hoặc `start.ps1`

### Bước 3: Test
```
1. Reload trang web
2. Nhập dữ liệu vào 3 ô: A, B, C
3. Blur ra (click ngoài)
4. Đợi auto-save hoặc nhấn "Lưu ngay"
5. Reload trang → Kiểm tra A, B, C vẫn còn ✓
6. Nhập thêm ô D
7. Nhấn "Lưu ngay"
8. Reload trang → Kiểm tra A, B, C, D đều còn ✓
```

---

## 📊 So sánh Before/After

### Before v1.2.1:
```javascript
// Frontend gửi:
{
  customFields: { email: "new@email.com" }
}

// Backend lưu (GHI ĐÈ):
account.customFields = { email: "new@email.com" }
// ❌ Mất hết các field khác!
```

### After v1.2.1:
```javascript
// Frontend gửi:
{
  customFields: { email: "new@email.com" }
}

// Backend MERGE:
account.customFields = {
  ...currentAccount.customFields, // { name: "John", phone: "123" }
  ...req.body.customFields        // { email: "new@email.com" }
}
// Kết quả: { name: "John", phone: "123", email: "new@email.com" }
// ✅ Giữ nguyên các field cũ!
```

---

## 🧪 Test Cases

### Test 1: Thêm field mới
```
✓ DB có: { name: "A", phone: "B" }
✓ Nhập email: "C"
✓ Lưu
✓ Kiểm tra DB: { name: "A", phone: "B", email: "C" }
```

### Test 2: Update field cũ
```
✓ DB có: { name: "A", phone: "B" }
✓ Sửa phone thành "X"
✓ Lưu
✓ Kiểm tra DB: { name: "A", phone: "X" }
```

### Test 3: Mix add + update
```
✓ DB có: { name: "A", phone: "B" }
✓ Sửa name thành "Z", thêm email: "C"
✓ Lưu
✓ Kiểm tra DB: { name: "Z", phone: "B", email: "C" }
```

### Test 4: Multiple saves
```
✓ Save 1: { col1: "1" }
✓ Save 2: { col2: "2" }
✓ Save 3: { col3: "3" }
✓ Kiểm tra DB: { col1: "1", col2: "2", col3: "3" }
```

---

## ⚠️ Important Notes

1. **Phải restart Backend** sau khi update code
2. **Frontend không cần thay đổi** (vẫn hoạt động như cũ)
3. **Dữ liệu cũ trong DB** vẫn giữ nguyên
4. **Tương thích ngược** 100% với v1.2.0

---

## 🐛 Troubleshooting

### Vẫn bị mất dữ liệu?

**Check 1: Backend đã restart chưa?**
```bash
# Kiểm tra log backend
# Phải thấy dòng: "Server running on port 5000"
```

**Check 2: Code đã update chưa?**
```bash
# Mở backend/routes/accounts.js
# Dòng ~47-50 phải có:
if (req.body.customFields) {
  req.body.customFields = {
    ...currentAccount.customFields.toObject(),
    ...req.body.customFields
  };
}
```

**Check 3: Network request**
```
F12 → Network → XHR
Khi lưu, xem Request Payload
Phải có customFields với ĐẦY ĐỦ các field
```

**Check 4: Database**
```
MongoDB Compass/Atlas
Xem document
customFields phải có đầy đủ các field
```

---

## 📝 Version Info

- **Fixed in:** v1.2.1
- **Date:** 2024-11-26
- **Type:** CRITICAL BUG FIX
- **Breaking changes:** None
- **Migration needed:** Restart backend only

---

**Status:** ✅ FIXED

Bây giờ hệ thống sẽ **MERGE** thay vì **REPLACE** customFields!
