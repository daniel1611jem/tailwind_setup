# 💰 Paystub Editor - Quick Start

## Cài đặt Dependencies

```bash
npm install html2canvas jspdf
```

## Truy cập

Vào URL: `http://localhost:5173/paystub`

Hoặc click nút **"💰 Paystub Editor"** ở trang chủ.

---

## Quick Example

### 1. Điền thông tin cơ bản:

**Company:**
- Name: NEW COVENANT ACADEMY
- Address: 3119 W 6th St, Los Angeles, CA 90020

**Employee:**
- Name: ETHAN COLE
- ID: E-198745
- Department: STEM / Technology

**Pay Info:**
- Pay Date: 11/28/2025
- Pay Period: 11/01/2025 - 11/15/2025
- Check Number: 45982

### 2. Earnings (click "+ Thêm" nếu cần):

| Name | Rate | Hours | Current | YTD |
|------|------|-------|---------|-----|
| Regular Pay | 48.50 | 80.00 | 3,880.00 | 85,360.00 |
| Tech Stipend | Flat | -- | 150.00 | 3,300.00 |

### 3. Deductions:

| Name | Type | Current | YTD |
|------|------|---------|-----|
| Federal Tax | Withholding | 483.60 | 10,639.20 |
| State Tax | CA Withholding | 185.38 | 4,078.36 |
| FICA - SS | Social Security | 249.86 | 5,496.92 |
| FICA - Med | Medicare | 58.44 | 1,285.68 |

### 4. Export:
- **📄 Xuất PDF**: Download file PDF
- **🖼️ Xuất PNG**: Download PNG chất lượng cao
- **🖨️ In**: In trực tiếp

---

## Automatic Calculations

Tool tự động tính:
- ✅ **Gross Pay** = Tổng earnings
- ✅ **Total Deductions** = Tổng deductions  
- ✅ **Net Pay** = Gross Pay - Total Deductions
- ✅ **YTD Gross** = Tổng YTD earnings
- ✅ **YTD Deductions** = Tổng YTD deductions
- ✅ **YTD Net** = YTD Gross - YTD Deductions

---

## Features

✨ **Live Preview** - Xem trước thời gian thực  
📤 **Export PDF** - Letter size, 300 DPI  
🖼️ **Export PNG** - 4x resolution (ultra high quality)  
🖨️ **Print Ready** - Chuẩn US Letter format  
📷 **Logo Support** - Upload logo công ty  
➕ **Dynamic Rows** - Thêm/xóa earnings và deductions  
🔢 **Auto Calculate** - Tính toán tự động

---

## Format chuẩn

### Numbers:
- ✅ `3,880.00` (có dấu phẩy và 2 số thập phân)
- ❌ `3880` (thiếu format)

### Dates:
- ✅ `11/28/2025` (MM/DD/YYYY)
- ✅ `11/01/2025 - 11/15/2025` (pay period)

### Account Number:
- ✅ `XXXXXX8842` (che 6 số đầu)
- ✅ `****8842` (che bằng dấu *)

---

## Template Sample

```javascript
Company: NEW COVENANT ACADEMY
Employee: ETHAN COLE (E-198745)
Pay Period: 11/01/2025 - 11/15/2025

EARNINGS:
Regular Pay: $48.50 × 80h = $3,880.00
Tech Stipend: Flat = $150.00
──────────────────────────────────
GROSS PAY: $4,030.00

DEDUCTIONS:
Federal Tax: -$483.60
State Tax: -$185.38
FICA-SS: -$249.86
FICA-Med: -$58.44
CA SDI: -$36.27
Retirement: -$200.00
Health Ins: -$85.00
──────────────────────────────────
TOTAL DEDUCTIONS: -$1,298.55

NET PAY: $2,731.45 ✅
```

---

## Common Earnings

- **Regular Pay**: Lương cơ bản
- **Overtime**: Làm thêm (×1.5)
- **Bonus**: Thưởng
- **Commission**: Hoa hồng
- **Stipend**: Phụ cấp
- **Holiday Pay**: Lương ngày lễ

## Common Deductions

- **Federal Tax**: Thuế liên bang
- **State Tax**: Thuế tiểu bang
- **FICA-SS**: Social Security (6.2%)
- **FICA-Med**: Medicare (1.45%)
- **401(k)/403(b)**: Retirement
- **Health Insurance**: Bảo hiểm y tế

---

## Tax Rates Reference

### FICA (cố định):
- Social Security: **6.2%** (max wage $160,200)
- Medicare: **1.45%**

### Federal Tax (2024-2025):
- 10%, 12%, 22%, 24%, 32%, 35%, 37%

### State Tax (varies):
- CA: 1% - 13.3%
- NY: 4% - 10.9%
- TX, FL: 0% (no state tax)

---

## Legal Disclaimer

⚠️ **Chỉ dùng cho mục đích hợp pháp:**
- Tạo paystub thật cho nhân viên
- Template thiết kế
- Mục đích giáo dục

❌ **KHÔNG dùng để giả mạo tài liệu**

---

## Troubleshooting

**Logo không hiển thị?**
→ Kiểm tra file < 5MB, format PNG/JPG

**Export PDF mờ?**
→ Dùng Export PNG (chất lượng cao hơn)

**Tính toán sai?**
→ Kiểm tra format số (dấu phẩy, 2 chữ số thập phân)

**Print bị cắt?**
→ Chọn Paper = Letter, Margins = 0.5in

---

Xem hướng dẫn đầy đủ: **`PAYSTUB_EDITOR_GUIDE.md`**
