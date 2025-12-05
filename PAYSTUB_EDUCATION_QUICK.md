# Paystub Education Sector - Quick Reference

## 🚀 5 Điểm khác biệt lớn nhất so với phiếu lương văn phòng

### 1. ⭐ Leave Balances (Số dư ngày nghỉ)
**ĐẶC TRƯNG NHẤT của giáo viên**
```
Sick Leave: 72.00 + 1.00 - 0.00 = 73.00 days
Personal Necessity: 3.00 + 0.00 - 0.00 = 3.00 days
```
➡️ Vị trí: Góc dưới bên phải
➡️ Font: Courier New 9px

### 2. 🏛️ Employer Contributions
**Trường trả bảo hiểm cho giáo viên**
```
ER Health: $485.00
ER Dental: $45.00
ER Vision: $12.00
ER Retirement: $200.00
────────────────────
TOTAL: $742.00

* Employer contributions do not affect Net Pay
```
➡️ KHÔNG trừ vào lương
➡️ Chỉ để show phúc lợi tổng

### 3. 📝 Terminology (Thuật ngữ)
```
❌ Regular Pay    → ✅ Certificated Salary
❌ Retirement     → ✅ 403(b) Plan (trường tư)
                    ✅ CalSTRS (trường công)
❌ Tech Stipend   → ✅ Stipend - Technology
```

### 4. 🔢 Marital Status Format
```
❌ Status: Single
   Exemptions: 0

✅ Status: Fed: S / CA: S
   Allow: Fed: 01 / CA: 01
```
➡️ Phân biệt Federal vs California

### 5. 🔤 Font Typography
```
Headers: Arial Bold
Numbers: Courier New, monospace ← QUAN TRỌNG
```
➡️ Monospace giúp số thẳng hàng
➡️ Tạo cảm giác "hệ thống"

---

## 📋 Checklist trước khi export

### Must-Have (Bắt buộc)
- [ ] Leave Balances table (Sick + Personal)
- [ ] Employer Contributions table
- [ ] Check # và Advice # đều hiển thị
- [ ] Marital Status: "Fed: X / CA: X"
- [ ] Retirement: "403(b)" không phải "Retirement"

### Professional Details
- [ ] Font số liệu: Courier New
- [ ] Earnings: "Certificated Salary"
- [ ] Exemptions: "Fed: 01 / CA: 01"
- [ ] Note: "* Employer contributions do not affect Net Pay"

---

## 🎯 Mẫu dữ liệu nhanh

### Leave Balances (California Standard)
```
Sick Leave:
  Beginning: 72.00 (10-12 ngày/năm tích lũy)
  Accrued: 1.00 (cấp thêm mỗi tháng)
  Used: 0.00
  
Personal Necessity:
  Beginning: 3.00 (trích từ sick leave)
  Accrued: 0.00
  Used: 0.00
```

### Employer Contributions (Private School Average)
```
ER Health: $485/month ($10,670 YTD)
ER Dental: $45/month ($990 YTD)
ER Vision: $12/month ($264 YTD)
ER Retirement: $200/month ($4,400 YTD - 3-5% match)
```

### Earnings (Teacher)
```
Certificated Salary: $48.50/hr × 80hrs = $3,880
Stipend - Technology: $150 (flat)
Stipend - Master's: $200 (nếu có bằng thạc sĩ)
```

### Deductions (Standard)
```
Federal Tax: ~12% of gross
State Tax (CA): ~4.5% of gross
FICA - SS: 6.2% (up to wage base)
FICA - Med: 1.45%
CA SDI: 0.9%
403(b): $200 (voluntary)
Health Ins: $85 (employee portion)
```

---

## 🏫 Trường tư vs. Trường công

| Item | Private School | Public School |
|------|----------------|---------------|
| Retirement | 403(b), TIAA-CREF | CalSTRS (required) |
| Health Insurance | Varies (60-90% ER paid) | CalPERS or district plan |
| Sick Leave | 10-12 days/year | CA Ed Code: 10 days/year |
| Salary Structure | Hourly or Salary | Salary Schedule (steps) |

---

## ⚠️ Common Mistakes

### ❌ WRONG
```
Regular Pay: $3,880.00
Retirement: $200.00
Status: Single
Exemptions: 0
(Không có Leave Balances)
(Không có Employer Contributions)
```

### ✅ CORRECT
```
Certificated Salary: $3,880.00
403(b) Plan: $200.00
Status: Fed: S / CA: S
Allow: Fed: 01 / CA: 01
Leave Balances: ✓ (Sick + Personal)
Employer Contributions: ✓ (4 items)
Font Numbers: Courier New ✓
```

---

## 🎨 Layout Summary

```
┌──────────────────────────────────────────┐
│ NEW COVENANT ACADEMY     EARNINGS STMT   │
│ 3119 W 6th St            Check #: 45982  │
│ Los Angeles, CA 90020    Advice #: ADV-  │
├──────────────────────────────────────────┤
│ ETHAN COLE              Fed: S / CA: S   │
│ 1425 S Genesee Ave      Allow: 01 / 01   │
│ Los Angeles, CA 90019   ID: E-198745     │
├──────────────────────────────────────────┤
│                                          │
│ INCOME          │  DEDUCTIONS            │
│ Cert Salary     │  Fed Tax, State Tax    │
│ Stipend - Tech  │  FICA, 403(b), Health  │
│ GROSS PAY       │  TOTAL DEDUCTIONS      │
│                                          │
├──────────────────────────────────────────┤
│ YTD Summary → Current → NET PAY: $XXX    │
├──────────────────────────────────────────┤
│ EMPLOYER PAID   │  LEAVE BALANCES        │
│ BENEFITS        │  (HOURS)               │
│                 │                        │
│ ER Health       │  Sick Leave: 73.00     │
│ ER Dental       │  Personal: 3.00        │
│ ER Vision       │                        │
│ ER Retirement   │                        │
│ TOTAL: $742     │                        │
│ * do not affect │                        │
│   Net Pay       │                        │
└──────────────────────────────────────────┘
```

---

## 🔧 Công thức tính toán

### Leave Balance
```javascript
Current Balance = Beginning + Accrued - Used

Example:
Sick Leave = 72.00 + 1.00 - 0.00 = 73.00
```

### Employer Contributions Total
```javascript
Total = ER Health + ER Dental + ER Vision + ER Retirement

Example:
Total = 485.00 + 45.00 + 12.00 + 200.00 = 742.00
```

### Net Pay (không đổi)
```javascript
Net Pay = Gross Pay - Total Deductions

Example:
Net Pay = 4,030.00 - 1,298.55 = 2,731.45

NOTE: Employer Contributions KHÔNG ảnh hưởng Net Pay
```

---

## 📞 Support Info

**New Covenant Academy Example:**
- Address: 3119 W 6th St, Los Angeles, CA 90020
- Type: Private K-12 Christian School
- Typical Teacher Salary: $45-55/hour
- Sick Leave: 12 days/year (96 hours)
- Personal Necessity: 7 days/year (drawn from sick)
- Employer Health Coverage: 85%

**California Education Code:**
- Ed Code 44978-44987: Sick Leave for certificated employees
- Ed Code 45190-45197: Health benefits
- Ed Code 22000+: CalSTRS retirement system (public schools)

---

## 🎓 Education Sector Terms Glossary

- **Certificated Staff**: Teachers with teaching credentials
- **Classified Staff**: Non-teaching staff (admin, custodians)
- **Stipend**: Additional pay for extra duties (tech coord, dept head)
- **CalSTRS**: California State Teachers' Retirement System
- **403(b)**: Tax-advantaged retirement plan for non-profits/schools
- **Personal Necessity**: Personal leave drawn from sick leave pool
- **ER (Employer)**: School/district paid benefits
- **EE (Employee)**: Staff paid deductions
- **Allow (Allowances)**: Tax withholding exemptions

---

**Quick Reference Version 2.0**  
**Last Updated:** November 30, 2025  
**For:** Education Sector Paystubs (K-12, Private Schools)
