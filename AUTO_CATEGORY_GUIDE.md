# 🎯 Hướng Dẫn Tính Năng Tự Động Tạo Danh Mục & Lưu Kho

## 📋 Tổng Quan

Hệ thống đã được cập nhật với các tính năng tự động hóa mạnh mẽ:

### ✨ Tính Năng Mới

1. **3 Cột Cố Định Mới:**

   - 📧 **Gmail Cá Nhân**: Email cá nhân của người dùng
   - 🎓 **Gmail Sinh Viên**: Email sinh viên (dùng làm mặc định)
   - 🔑 **Mật Khẩu Chung**: Mật khẩu chung có thể chỉnh sửa

2. **Tự Động Sinh Tài Khoản:**

   - Khi cột select được chọn giá trị, tự động tạo username và accountName
   - Nếu không có giá trị select, sử dụng Gmail sinh viên làm mặc định
   - Mật khẩu sử dụng "Mật khẩu chung" và có thể thay đổi

3. **Tự Động Tạo Danh Mục trong Kho:**

   - Mỗi cột select có thể tự động tạo danh mục tương ứng
   - Danh mục được tạo với type='key' để quản lý

4. **Tự Động Lưu vào Kho Khi Thành Công:**
   - Khi giá trị cột select = giá trị "thành công" đã cấu hình
   - Tự động tạo Key entry với thời hạn
   - Lưu vào danh mục tương ứng

---

## 🚀 Cách Sử Dụng

### Bước 1: Thiết Lập Cột Select với Auto Category

1. Vào **Quản Lý Cột**
2. Tạo hoặc sửa cột có type = **Select**
3. Nhập các options (mỗi dòng 1 option)
4. ✅ **Bật checkbox**: "🎯 Tự động tạo danh mục trong kho & lưu khi thành công"
5. Cấu hình:
   - **Giá trị thành công**: Nhập giá trị khi coi như "thành công" (vd: "Thành công", "Done", "Active")
   - **Thời hạn (ngày)**: Số ngày ưu đãi có hiệu lực (mặc định: 30)
6. Lưu cột

**Ví dụ cấu hình:**

```
Tên cột: Spotify Premium
Options:
  - Chưa đăng ký
  - Đang xử lý
  - Thành công
  - Thất bại

Giá trị thành công: Thành công
Thời hạn: 30 ngày
```

### Bước 2: Nhập Thông Tin Gmail

Trong bảng Account List:

1. Nhập **Gmail Cá Nhân** vào cột màu vàng
2. Nhập **Gmail Sinh Viên** vào cột màu xanh (bắt buộc nếu muốn auto generate)
3. Nhập **Mật Khẩu Chung** vào cột màu xanh lá

### Bước 3: Chọn Trạng Thái

Khi bạn chọn giá trị trong cột select:

- ⚡ Hệ thống tự động sinh:
  - **Username**: Lấy từ Gmail sinh viên
  - **Account Name**: Phần trước @ của Gmail sinh viên
  - **Password**: Lấy từ Mật khẩu chung

### Bước 4: Đánh Dấu Thành Công

Khi chuyển giá trị select sang "Thành công" (hoặc giá trị bạn đã cấu hình):

- 🎉 **Tự động tạo Key** trong kho với:
  - Category: Danh mục tương ứng với tên cột
  - Username: Từ Gmail sinh viên
  - Password: Từ Mật khẩu chung
  - Expiration Date: Tính từ ngày hiện tại + thời hạn
  - Status: in_stock
  - Notes: Ghi chú tự động về nguồn gốc

---

## 📊 Cấu Trúc Dữ Liệu

### Account Model (Backend)

```javascript
{
  personalGmail: String,      // Email cá nhân
  studentGmail: String,        // Email sinh viên (dùng làm username)
  commonPassword: String,      // Mật khẩu chung
  generatedAccounts: Map,      // Lưu các tài khoản đã sinh
  expirationDates: Map,        // Lưu ngày hết hạn
  customFields: Map            // Các cột tùy chỉnh
}
```

### ColumnConfig Model (Backend)

```javascript
{
  autoGenerateCategory: Boolean,  // Có tự sinh danh mục không
  categoryId: ObjectId,           // ID danh mục đã tạo
  successValue: String,           // Giá trị thành công
  durationDays: Number            // Thời hạn (ngày)
}
```

### Key Model (Backend)

```javascript
{
  keyCode: String,           // Mã key tự động
  categoryId: ObjectId,      // Danh mục
  username: String,          // Username từ Gmail sinh viên
  password: String,          // Password từ Mật khẩu chung
  expirationDate: Date,      // Ngày hết hạn
  duration: Number,          // Số ngày
  status: 'in_stock',        // Trạng thái
  notes: String              // Ghi chú tự động
}
```

---

## 🔄 Quy Trình Tự Động

```
1. User tạo cột Select với autoGenerateCategory = true
   ↓
2. Hệ thống tự tạo Category trong kho
   ↓
3. User nhập Gmail sinh viên + Mật khẩu chung
   ↓
4. User chọn giá trị trong cột Select
   ↓
5. Hệ thống tự sinh Username & Account Name
   ↓
6. User chuyển sang giá trị "Thành công"
   ↓
7. Hệ thống tự động:
   - Tính ngày hết hạn
   - Tạo Key entry
   - Lưu vào Category tương ứng
   - Đánh dấu status = in_stock
```

---

## 💡 Tips & Best Practices

### 1. Đặt Tên Cột Rõ Ràng

- ✅ Tốt: "Spotify Premium", "Netflix 4K", "YouTube Premium"
- ❌ Tránh: "Col1", "Dịch vụ", "Ưu đãi"

### 2. Giá Trị Thành Công Nhất Quán

- Nên dùng: "Thành công", "Active", "Done"
- Tránh: Nhiều giá trị khác nhau cho mỗi cột

### 3. Thời Hạn Hợp Lý

- Học sinh/sinh viên: 30-180 ngày
- Dùng thử: 7-30 ngày
- VIP dài hạn: 365 ngày

### 4. Quản Lý Gmail Sinh Viên

- Luôn nhập đầy đủ Gmail sinh viên trước khi chọn dịch vụ
- Kiểm tra email hợp lệ trước khi lưu

### 5. Kiểm Tra Kho Thường Xuyên

- Vào "Quản Lý Kho" để xem các Key đã tạo
- Kiểm tra expiration date
- Filter theo Category để dễ quản lý

---

## ⚠️ Lưu Ý Quan Trọng

1. **Backup Dữ Liệu**: Luôn backup database trước khi sử dụng tính năng mới
2. **Kiểm Tra Category**: Danh mục sẽ tự động tạo 1 lần duy nhất khi tạo cột
3. **Thay Đổi Cột**: Nếu sửa cột sau khi đã tạo, categoryId vẫn giữ nguyên
4. **Xóa Cột**: Xóa cột KHÔNG tự động xóa Category và Keys đã tạo
5. **Multiple Users**: Mỗi user có thể có category riêng với cùng tên

---

## 🐛 Troubleshooting

### Key không được tạo tự động?

- Kiểm tra Gmail sinh viên đã nhập chưa
- Kiểm tra giá trị "Thành công" có khớp với cấu hình không
- Xem Console log để debug

### Category không xuất hiện trong kho?

- Refresh trang
- Kiểm tra checkbox "Tự động tạo danh mục" đã bật chưa
- Kiểm tra userId có hợp lệ không

### Thời hạn sai?

- Kiểm tra cấu hình "Thời hạn (ngày)"
- Mặc định là 30 ngày nếu không set

---

## 📝 Changelog

### v1.0.0 - 2024

- ✅ Thêm 3 cột cố định: Gmail cá nhân, Gmail sinh viên, Mật khẩu chung
- ✅ Tự động sinh username/account name từ Gmail sinh viên
- ✅ Tự động tạo Category khi tạo cột Select
- ✅ Tự động lưu Key vào kho khi thành công
- ✅ UI cải thiện với màu sắc phân biệt cột
- ✅ Form quản lý cột có thêm cấu hình auto category

---

## 🎓 Ví Dụ Thực Tế

### Kịch Bản: Quản Lý Spotify Premium cho Sinh Viên

**Bước 1: Tạo Cột**

```
Tên cột: Spotify Premium
Type: Select
Options:
  - Chưa đăng ký
  - Đang chờ verify
  - Thành công
  - Đã hết hạn

✅ Tự động tạo danh mục
Giá trị thành công: Thành công
Thời hạn: 180 ngày
```

**Bước 2: Nhập Profile Sinh Viên**

```
Gmail cá nhân: nguyenvana@gmail.com
Gmail sinh viên: nguyenvana@student.hcmute.edu.vn
Mật khẩu chung: MatKhau@123
```

**Bước 3: Đăng Ký Dịch Vụ**

- Chọn: "Đang chờ verify"
- Hệ thống tự sinh:
  - Username: nguyenvana@student.hcmute.edu.vn
  - Account Name: nguyenvana

**Bước 4: Xác Nhận Thành Công**

- Chọn: "Thành công"
- Hệ thống tự động:
  - Tạo Key: `nguyenvana_spotify_premium_1701234567890`
  - Category: "Spotify Premium"
  - Expiration: 180 ngày từ hôm nay
  - Status: in_stock
  - Lưu vào kho

**Kết Quả:**

- Profile được đánh dấu thành công
- Key xuất hiện trong kho "Spotify Premium"
- Có thể quản lý, bán, hoặc extend key sau này

---

## 📞 Support

Nếu có vấn đề, kiểm tra:

1. Console log (F12 -> Console)
2. Network tab để xem API calls
3. Database để kiểm tra dữ liệu thực tế

---

**Chúc bạn quản lý hiệu quả! 🚀**
