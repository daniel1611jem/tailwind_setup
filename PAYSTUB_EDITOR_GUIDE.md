# 💰 PAYSTUB EDITOR - Hướng dẫn sử dụng

## Tổng quan

**Paystub Editor** là công cụ chuyên nghiệp để tạo và chỉnh sửa phiếu lương (earnings statement) theo chuẩn định dạng USA. Hỗ trợ export file PDF và PNG chất lượng cao để in ấn.

---

## Tính năng chính

### ✨ Chức năng

1. **Chỉnh sửa đầy đủ thông tin**:
   - Thông tin công ty/trường học
   - Thông tin nhân viên
   - Thông tin thanh toán (pay date, period, check number)
   - Tax data (Fed/State status & allowances)
   - Earnings (lương, thưởng, phụ cấp)
   - Deductions (khấu trừ thuế, bảo hiểm, v.v.)
   - Thông tin ngân hàng

2. **Upload logo công ty**:
   - Hỗ trợ PNG, JPG, SVG
   - Tự động resize phù hợp
   - Hiển thị góc trái trên phiếu lương

3. **Export chất lượng cao**:
   - **PDF**: Letter size (8.5" x 11"), 300 DPI
   - **PNG**: 4x resolution, phù hợp in ấn
   - **Print**: In trực tiếp từ trình duyệt

4. **Preview thời gian thực**:
   - Xem trước ngay khi chỉnh sửa
   - Tính toán tự động gross pay, deductions, net pay
   - Layout chuẩn USA

---

## Hướng dẫn sử dụng

### Bước 1: Truy cập Paystub Editor

```
1. Vào trang chủ
2. Click nút "💰 Paystub Editor" ở header
```

### Bước 2: Upload Logo (tùy chọn)

```
1. Trong section "📷 Logo công ty"
2. Click "Choose File" → Chọn file logo
3. Logo sẽ hiển thị góc trái phiếu lương
4. Click "✕ Xóa logo" nếu muốn bỏ
```

**Lưu ý:**
- File phải nhỏ hơn 5MB
- Định dạng: PNG, JPG, GIF, SVG
- Nên dùng logo trong suốt (PNG) để đẹp

### Bước 3: Điền thông tin công ty

```
🏢 Thông tin công ty:
- Company Name: NEW COVENANT ACADEMY
- Address: 3119 W 6th St
- City, State Zip: Los Angeles, CA 90020
```

### Bước 4: Điền thông tin nhân viên

```
👤 Thông tin nhân viên:
- Employee Name: ETHAN COLE
- Employee ID: E-198745
- Department: STEM / Technology
- Address: 1425 S Genesee Ave
- City, State Zip: Los Angeles, CA 90019
```

### Bước 5: Điền thông tin thanh toán

```
📅 Thông tin thanh toán:
- Pay Date: 11/28/2025
- Pay Period: 11/01/2025 - 11/15/2025
- Check Number: 45982
```

### Bước 6: Điền Tax Data

```
📊 Thông tin thuế:
- Fed Status: Single / Married / Head of Household
- Fed Allow: 0, 1, 2, 3... (số người phụ thuộc)
- State Status: Single / Married
- State Allow: 0, 1, 2, 3...
```

### Bước 7: Thêm Earnings (Thu nhập)

```
💵 Earnings:
Mỗi dòng gồm:
- Name: Regular Pay, Overtime, Bonus, Stipend, v.v.
- Rate: $48.50 (hoặc "Flat" nếu cố định)
- Hours: 80.00 (hoặc "--" nếu không tính giờ)
- Current: 3,880.00 (tiền kỳ này)
- YTD: 85,360.00 (tổng từ đầu năm)

Click "+ Thêm" để thêm dòng mới
Click "✕" để xóa dòng
```

**Ví dụ:**
| Name | Rate | Hours | Current | YTD |
|------|------|-------|---------|-----|
| Regular Pay | $48.50 | 80.00 | 3,880.00 | 85,360.00 |
| Tech Stipend | Flat | -- | 150.00 | 3,300.00 |

**Gross Pay tự động tính** = Tổng Current của tất cả earnings

### Bước 8: Thêm Deductions (Khấu trừ)

```
📉 Deductions:
Mỗi dòng gồm:
- Name: Federal Tax, State Tax, FICA-SS, FICA-Med, v.v.
- Type: Withholding, Social Security, Medicare, 401(k), Health Ins
- Current: 483.60 (khấu trừ kỳ này)
- YTD: 10,639.20 (tổng khấu trừ từ đầu năm)

Click "+ Thêm" để thêm dòng mới
Click "✕" để xóa dòng
```

**Ví dụ các deduction phổ biến:**
| Name | Type | Current | YTD |
|------|------|---------|-----|
| Federal Tax | Withholding | 483.60 | 10,639.20 |
| State Tax | CA Withholding | 185.38 | 4,078.36 |
| FICA - SS | Social Security | 249.86 | 5,496.92 |
| FICA - Med | Medicare | 58.44 | 1,285.68 |
| CA SDI | Disability Ins | 36.27 | 797.94 |
| Retirement | 403(b) Plan | 200.00 | 4,400.00 |
| Health Ins | Medical HMO | 85.00 | 1,870.00 |

**Total Deductions tự động tính** = Tổng Current của tất cả deductions

### Bước 9: Điền thông tin ngân hàng

```
🏦 Thông tin ngân hàng:
- Bank Name: Chase Bank
- Account Number: XXXXXX8842 (che số tài khoản)
- Description: Direct Deposit
```

### Bước 10: Preview & Export

Bên phải màn hình sẽ hiển thị **preview thời gian thực** của paystub.

**NET PAY tự động tính** = Gross Pay - Total Deductions

**Xuất file:**
1. **📄 Xuất PDF**: Letter size, phù hợp nộp HR
2. **🖼️ Xuất PNG**: Chất lượng cao, phù hợp in ấn
3. **🖨️ In**: In trực tiếp

---

## Công thức tính toán

### Gross Pay (Tổng thu nhập)
```
Gross Pay = Σ (Earnings Current)

Ví dụ:
Regular Pay: $3,880.00
Tech Stipend: $150.00
--------------------------
Gross Pay: $4,030.00
```

### Total Deductions (Tổng khấu trừ)
```
Total Deductions = Σ (Deductions Current)

Ví dụ:
Federal Tax: $483.60
State Tax: $185.38
FICA-SS: $249.86
FICA-Med: $58.44
CA SDI: $36.27
Retirement: $200.00
Health Ins: $85.00
--------------------------
Total Deductions: $1,298.55
```

### Net Pay (Lương thực nhận)
```
Net Pay = Gross Pay - Total Deductions

Ví dụ:
$4,030.00 - $1,298.55 = $2,731.45
```

### YTD Calculations
```
YTD Gross = Σ (Earnings YTD)
YTD Deductions = Σ (Deductions YTD)
YTD Net Pay = YTD Gross - YTD Deductions
```

---

## Ví dụ mẫu

### School/Academy Paystub

```
Company: NEW COVENANT ACADEMY
Employee: ETHAN COLE
Department: STEM / Technology
Pay Period: 11/01/2025 - 11/15/2025

EARNINGS:
- Regular Pay: $48.50 × 80 hrs = $3,880.00
- Tech Stipend: Flat = $150.00
GROSS PAY: $4,030.00

DEDUCTIONS:
- Federal Tax: -$483.60
- State Tax (CA): -$185.38
- FICA-SS: -$249.86
- FICA-Med: -$58.44
- CA SDI: -$36.27
- Retirement (403b): -$200.00
- Health Insurance: -$85.00
TOTAL DEDUCTIONS: -$1,298.55

NET PAY: $2,731.45
```

### Corporate Paystub

```
Company: SAMPLE COMPANY NAME
Employee: SAMPLE EMPLOYEE NAME
Department: IT / Engineering
Pay Period: 12/03/2023 - 12/09/2023

EARNINGS:
- Gross Wages: $38.00 × 40 hrs = $1,520.00
GROSS PAY: $1,520.00

DEDUCTIONS:
- FICA Med Tax: -$22.04
- FICA SS Tax: -$94.24
- Fed Tax: -$185.56
- VA ST Tax: -$76.04
TOTAL DEDUCTIONS: -$377.88

NET PAY: $1,142.12
```

---

## Thuật ngữ phổ biến

### Earnings (Thu nhập)
- **Regular Pay**: Lương cơ bản theo giờ
- **Salary**: Lương theo tháng/năm
- **Overtime (OT)**: Làm thêm giờ (thường × 1.5)
- **Bonus**: Thưởng
- **Commission**: Hoa hồng
- **Stipend**: Phụ cấp
- **Holiday Pay**: Lương ngày lễ
- **Sick Pay**: Lương ngày ốm

### Deductions (Khấu trừ)
- **Federal Tax**: Thuế liên bang
- **State Tax**: Thuế tiểu bang (CA, NY, TX, v.v.)
- **FICA-SS**: Social Security (6.2%, tối đa $160,200)
- **FICA-Med**: Medicare (1.45%)
- **SDI**: State Disability Insurance (CA, NJ, v.v.)
- **401(k) / 403(b)**: Tiết kiệm hưu trí
- **Health Insurance**: Bảo hiểm y tế
- **Dental**: Bảo hiểm nha khoa
- **Vision**: Bảo hiểm mắt
- **Life Insurance**: Bảo hiểm nhân thọ
- **FSA**: Flexible Spending Account
- **HSA**: Health Savings Account

### Tax Status
- **Single**: Độc thân
- **Married**: Đã kết hôn
- **Head of Household**: Chủ hộ
- **Allowances**: Số người phụ thuộc (0, 1, 2, 3...)

---

## Tips & Best Practices

### 1. Tính chính xác thuế

**Federal Tax Withholding** (2024-2025):
- Single: 10% - 37% (tùy thu nhập)
- Married: 10% - 37%
- Dùng IRS Publication 15 để tính chính xác

**FICA Tax** (cố định):
- Social Security: 6.2% (maximum wage $160,200)
- Medicare: 1.45%

**State Tax** (khác nhau mỗi bang):
- California: 1% - 13.3%
- New York: 4% - 10.9%
- Texas, Florida: 0% (no state income tax)

### 2. Định dạng số tiền

✅ Đúng:
- 3,880.00
- $48.50
- 1,142.12

❌ Sai:
- 3880 (thiếu dấu phẩy)
- 48.5 (thiếu số 0)
- $3,880.00 (thừa $, số đã có sẵn trong format)

### 3. YTD (Year-to-Date)

Đảm bảo YTD hợp lý:
```
YTD phải >= Current
YTD Gross = YTD của tất cả earnings
YTD Deductions = YTD của tất cả deductions
```

### 4. Pay Period

Format chuẩn:
- MM/DD/YYYY - MM/DD/YYYY
- Ví dụ: 11/01/2025 - 11/15/2025
- Thường 2 tuần (bi-weekly) hoặc nửa tháng (semi-monthly)

### 5. Account Number Security

Che bớt số tài khoản:
- ✅ XXXXXX8842 (6 chữ X + 4 số cuối)
- ✅ ****8842 (4 dấu * + 4 số cuối)
- ❌ 123456788842 (toàn bộ số - không an toàn)

---

## Troubleshooting

### ❓ Logo không hiển thị?
- Kiểm tra file size < 5MB
- Dùng format PNG/JPG
- Clear cache và reload

### ❓ Export PDF bị mờ?
- Scale đã set 3x (high quality)
- Nếu vẫn mờ, dùng Export PNG (scale 4x)

### ❓ Tính toán sai?
- Kiểm tra format số (dùng dấu phẩy, 2 số thập phân)
- Không thêm ký tự $ hay - vào input
- Chỉ nhập số và dấu phẩy

### ❓ Print bị cắt?
- Chọn Paper Size = Letter (8.5" x 11")
- Margins = 0.5 inch
- Scale = 100%

---

## Specifications kỹ thuật

### Export PDF
- Format: Letter (8.5" × 11" inch)
- Resolution: 300 DPI
- Scale: 3x
- Color: RGB
- Size: ~200-500 KB

### Export PNG
- Resolution: 4x native (ultra high quality)
- Format: PNG (lossless)
- Color: RGB
- Size: ~2-5 MB

### Print
- Paper: US Letter
- Orientation: Portrait
- Margins: 0.5 inch all sides
- Color: Color or Grayscale

---

## Use Cases

### 1. HR Department
```
- Tạo paystub cho nhân viên
- Export PDF gửi email
- In và đưa kèm check
```

### 2. School/Academy
```
- Tạo earning statement cho giáo viên
- Ghi rõ stipend, bonus
- Include retirement plan (403b)
```

### 3. Freelancer/Contractor
```
- Tạo paystub cho bản thân
- Dùng cho visa, loan application
- Chứng minh thu nhập
```

### 4. Small Business
```
- Tạo paystub cho 1-10 nhân viên
- Tiết kiệm chi phí payroll service
- Tùy chỉnh theo nhu cầu
```

---

## Legal Disclaimer

⚠️ **Cảnh báo quan trọng:**

1. Tool này chỉ dùng cho mục đích **hợp pháp**
2. KHÔNG dùng để tạo paystub giả mạo cho vay, visa, thuê nhà
3. Việc làm giả paystub là **tội phạm liên bang** (18 U.S.C. § 1001)
4. Chỉ dùng để:
   - Tạo paystub thật cho nhân viên
   - Template/mockup cho thiết kế
   - Mục đích giáo dục

**Người dùng chịu trách nhiệm hoàn toàn về việc sử dụng tool này.**

---

## Support

Nếu có vấn đề:
1. Đọc lại hướng dẫn
2. Kiểm tra format dữ liệu
3. Clear cache và thử lại
4. Dùng browser khác (Chrome, Firefox)

**Version**: 1.0.0  
**Last Updated**: 30/11/2024  
**Status**: ✅ Production Ready
