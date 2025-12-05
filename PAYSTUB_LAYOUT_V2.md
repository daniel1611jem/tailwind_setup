# 📐 Paystub Layout Optimization v2.0

## Thay đổi chính

### ❌ Before (v1.0) - Quá dài, không vừa 1 trang
- Header chiếm 6-8cm
- Employee info 2 columns riêng biệt
- Earnings table riêng
- Deductions table riêng  
- Footer lớn với bank info
- **Tổng chiều cao: ~13-14 inches** ❌

### ✅ After (v2.0) - Vừa đúng 1 trang Letter
- Header compact: 2-3cm
- Info row single line
- **Earnings + Deductions CÙNG TABLE** (side by side)
- Bottom summary compact
- **Tổng chiều cao: 11 inches** ✅

---

## Layout Structure Mới

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] COMPANY NAME          EARNINGS STATEMENT  #45678 │ ← 2cm
│        Address, City                                    │
├─────────────────────────────────────────────────────────┤
│ EMPLOYEE | Status | SSN | Pay Period | Pay Date        │ ← 1.5cm
├─────────────────────────────────────────────────────────┤
│ INCOME  │RATE│HRS│CURRENT│ DEDUCTIONS  │CURRENT│  YTD  │ ← 0.5cm header
├─────────┼────┼───┼───────┼─────────────┼───────┼───────┤
│ Wages   │$38 │80 │2,960  │ FICA MED    │  45.86│ 1,100 │
│ Overtime│$51 │2  │  103  │ FICA SS     │ 196.11│ 4,706 │
│ Bonus   │$100│   │  100  │ FED TAX     │ 434.57│10,429 │
│         │    │   │       │ AZ ST TAX   │  69.35│ 1,664 │
├─────────┴────┴───┼───────┼─────────────┼───────┼───────┤
│ GROSS PAY        │ 3,163 │TOTAL DEDUCT │745.89 │17,901 │ ← Bold
├──────────────────┴───────┴─────────────┴───────┴───────┤
│ YTD GROSS │YTD DED│YTD NET│ CURR TOT│CURR DED│ NET PAY│ ← 1cm
│  75,912   │17,901 │58,010 │  3,163  │ 745.89 │2,417.11│ ← Bold
└─────────────────────────────────────────────────────────┘
Total: ~10.5 inches ✅ Vừa Letter size (11 inches)
```

---

## Dimensions Chi Tiết

### Page Setup
- **Paper**: US Letter (8.5" × 11")
- **Padding**: 0.3 inch all sides
- **Usable area**: 7.9" × 10.4"
- **Font**: Arial, Helvetica (chuẩn paystub USA)

### Section Heights

1. **Header Row** (~0.8 inch):
   - Logo: 40px (~0.55")
   - Company info: 3 lines × 10px
   - Earnings Statement title: 18px
   - Check number: 10px

2. **Info Row** (~0.6 inch):
   - Single row, 12 columns grid
   - Employee name + address (3 cols)
   - Tax status (2 cols)
   - SSN + ID (2 cols)
   - Pay period (3 cols)
   - Pay date (2 cols)
   - Font: 10px

3. **Main Table** (~7 inches):
   - Header: 1 row
   - Data rows: Dynamic (earnings + deductions side by side)
   - Gross/Total row: 1 row
   - Font: 10px
   - Cell padding: 2px

4. **Bottom Summary** (~0.5 inch):
   - 2 rows (header + data)
   - 6 columns
   - Font: 10px-12px
   - NET PAY highlight: 14px, white on black

5. **Total with borders**: ~10.5 inches ✅

---

## Font Specifications (Chuẩn USA Paystub)

### Font Family
```css
font-family: 'Arial, Helvetica, sans-serif'
```

**Lý do:** 
- Arial/Helvetica là font chuẩn cho business documents ở USA
- Dễ đọc khi in
- Được IRS và payroll services sử dụng rộng rãi

### Font Sizes

```css
/* Page base */
fontSize: '10px'  

/* Headers */
.earnings-statement-title: '18px', bold, uppercase
.check-number: '10px'
.table-header: '10px', bold

/* Company info */
.company-name: '12px', bold, uppercase
.company-address: '10px'

/* Employee info */
.employee-name: '10px', bold
.employee-details: '10px'

/* Table data */
.table-cell: '10px'
.table-total: '10px', bold

/* Bottom summary */
.summary-header: '10px', bold
.summary-data: '12px', bold
.net-pay-final: '14px', bold, white on black
```

### Font Weights
- Regular: 400 (default)
- Bold: 700 (totals, headers, names)

---

## Table Layout - Side by Side

### Old Way (2 Tables):
```
EARNINGS TABLE (full width)
┌──────────┬──────┬───────┬─────────┬─────────┐
│ EARNINGS │ RATE │ HOURS │ CURRENT │   YTD   │
└──────────┴──────┴───────┴─────────┴─────────┘
(4-6 inches height)

DEDUCTIONS TABLE (full width)
┌────────────┬──────────┬─────────┬─────────┐
│ DEDUCTIONS │   TYPE   │ CURRENT │   YTD   │
└────────────┴──────────┴─────────┴─────────┘
(4-6 inches height)

TOTAL: 8-12 inches ❌ Too tall!
```

### New Way (Combined Table):
```
SINGLE TABLE - EARNINGS + DEDUCTIONS
┌────────┬──────┬──────┬────────┬────────────┬────────┬────────┐
│ INCOME │ RATE │ HOURS│CURRENT │ DEDUCTIONS │CURRENT │  YTD   │
├────────┼──────┼──────┼────────┼────────────┼────────┼────────┤
│ Row 1  │ ...  │ ...  │  ...   │   Row 1    │  ...   │  ...   │
│ Row 2  │ ...  │ ...  │  ...   │   Row 2    │  ...   │  ...   │
│ ...    │      │      │        │   ...      │        │        │
├────────┴──────┴──────┼────────┼────────────┼────────┼────────┤
│ GROSS PAY            │ $3,163 │TOTAL DEDUCT│$745.89 │$17,901 │
└──────────────────────┴────────┴────────────┴────────┴────────┘

TOTAL: ~7 inches ✅ Compact!
```

### Logic:
```javascript
// Render earnings and deductions in same rows
const maxRows = Math.max(earnings.length + 1, deductions.length + 1);

Array.from({ length: maxRows }).map((_, index) => {
  const earning = earnings[index];
  const deduction = deductions[index];
  
  // Last row of earnings → GROSS PAY
  // Last row of deductions → TOTAL DEDUCTIONS
  // Empty cells → &nbsp;
  
  return (
    <tr>
      {/* 4 columns for earnings */}
      {/* 3 columns for deductions */}
    </tr>
  );
});
```

---

## Column Widths

### 7-Column Layout:

| Column | Width | Content |
|--------|-------|---------|
| 1 | Auto | Income Name |
| 2 | 64px (16%) | Rate |
| 3 | 64px (16%) | Hours |
| 4 | 96px (24%) | Current Total |
| 5 | Auto | Deductions Name |
| 6 | 96px (24%) | Current Total |
| 7 | 96px (24%) | Year-to-Date |

**Tổng:** ~8 inches (fit 7.9" usable width)

---

## Border & Spacing

### Borders:
```css
.outer-border: 2px solid black
.table-border: 1px solid black
.cell-border: 1px solid black
```

### Padding/Spacing:
```css
.page-padding: 0.3in (all sides)
.section-padding: 8px (0.5em)
.cell-padding: 4px (0.25em)
.row-spacing: 0 (border-collapse)
```

### Colors:
```css
.header-bg: #e5e7eb (gray-200)
.total-row-bg: #f3f4f6 (gray-100)
.net-pay-bg: #000000 (black)
.net-pay-text: #ffffff (white)
.border-color: #000000 (black)
```

---

## Responsive Scaling

### For Export:

**PDF (Letter size):**
```javascript
html2canvas(element, {
  scale: 3,
  width: 816,   // 8.5" × 96 DPI
  height: 1056  // 11" × 96 DPI
})
```

**PNG (High quality):**
```javascript
html2canvas(element, {
  scale: 4,
  width: 1088,  // 8.5" × 128 DPI
  height: 1408  // 11" × 128 DPI
})
```

---

## Sample Layout Measurements

Ví dụ với paystub mẫu:

```
Section                Height    Cumulative
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Top border             0.05"     0.05"
Header row             0.80"     0.85"
Border                 0.05"     0.90"
Info row               0.60"     1.50"
Border                 0.05"     1.55"
Table header           0.30"     1.85"
Data rows (8 rows)     2.40"     4.25"
Gross/Total row        0.30"     4.55"
Border                 0.05"     4.60"
Bottom summary         0.50"     5.10"
Bottom border          0.05"     5.15"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL                            ~5.15" ✅
```

**Còn dư:** 11" - 5.15" = 5.85" (có thể thêm nhiều rows)

---

## Comparison với mẫu USA thật

### ✅ Đúng chuẩn:
- Font: Arial/Helvetica
- Size: 10-12px (9-11pt)
- Border: Single line, black
- Layout: Compact, vừa 1 trang
- Headers: Bold, uppercase
- Totals: Bold, highlighted
- Net Pay: Black background, white text

### 📋 Tham khảo:
- ADP Paystubs
- Paychex Payroll
- QuickBooks Payroll
- School district paystubs (USA)

---

## Print Settings Khuyến nghị

### Browser Print:
```
Paper size: Letter (8.5" × 11")
Orientation: Portrait
Margins: None (custom 0.3")
Scale: 100%
Background graphics: ON
Headers/Footers: OFF
```

### PDF Export:
```
Format: Letter
Quality: High (300 DPI)
Color: RGB
Compression: Medium
```

### PNG Export:
```
Resolution: 4× (≈ 400 DPI)
Format: PNG (lossless)
Color: RGB
```

---

## Troubleshooting

### ❓ Vẫn dài hơn 1 trang?

**Nguyên nhân:**
- Quá nhiều earning rows (>8)
- Quá nhiều deduction rows (>8)

**Giải pháp:**
1. Giảm padding (0.3" → 0.2")
2. Giảm font size (10px → 9px)
3. Giảm row height (cell padding 4px → 2px)
4. Combine rows (Regular + Overtime = Total Wages)

### ❓ Font không đúng khi export PDF?

**Giải pháp:**
- Dùng web-safe fonts (Arial, Helvetica)
- Không dùng custom fonts
- Embed fonts nếu cần (jsPDF config)

### ❓ Borders bị mờ khi in?

**Giải pháp:**
- Tăng border width: 1px → 1.5px
- Dùng scale cao hơn: 3× → 4×
- Print với quality: High/Best

---

## Code Example

```jsx
<div style={{ 
  width: '8.5in', 
  minHeight: '11in',
  maxHeight: '11in',  // ← QUAN TRỌNG: Giới hạn chiều cao
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '10px',
  padding: '0.3in',
  boxSizing: 'border-box'
}}>
  {/* Content */}
</div>
```

**Key CSS:**
- `maxHeight: '11in'` - Đảm bảo không vượt quá 1 trang
- `boxSizing: 'border-box'` - Padding tính trong width/height
- `fontSize: '10px'` - Base font size nhỏ gọn
- `padding: '0.3in'` - Margins chuẩn

---

## Kết luận

### ✅ Advantages của layout mới:
- Vừa đúng 1 trang Letter size
- Font chuẩn USA paystub (Arial/Helvetica)
- Compact nhưng vẫn dễ đọc
- Side-by-side earnings/deductions tiết kiệm không gian
- Professional appearance

### 📊 Space Savings:
- Old: 13-14 inches (2 pages)
- New: 10-11 inches (1 page)
- **Tiết kiệm: ~30-40% chiều cao**

---

**Version**: 2.0  
**Last Updated**: 30/11/2024  
**Status**: ✅ Production Ready
