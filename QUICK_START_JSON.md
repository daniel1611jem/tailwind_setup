# 🚀 Quick Start - Paystub Editor với Gemini AI

## ⚡ Tạo Paystub trong 2 phút

### Bước 1: Chuẩn bị
1. Mở Gemini AI: https://gemini.google.com
2. Upload file `paystub-sample.json` từ thư mục này

### Bước 2: Copy prompt này và paste vào Gemini

```
Using the JSON template I uploaded, create a complete paystub with:

Teacher: [TÊN GIÁO VIÊN]
School: [TÊN TRƯỜNG], [CITY], CA [ZIP]
Position: [MÔN HỌC] Teacher - [CẤP HỌC]
Hourly Rate: $[XX.XX]
Hours: 80.00
Pay Date: [MM/DD/YYYY]
Pay Period: [MM/DD/YYYY - MM/DD/YYYY]

Sick Leave: [XX] hours beginning, 1 hour accrued, 0 used
Personal Leave: [X] hours beginning, 0 accrued, 0 used

Retirement: 403(b) Plan (private school)
Health Insurance: Employee pays $85, Employer pays $485

Calculate all taxes automatically:
- Federal Tax: ~12%
- State Tax (CA): ~4.5%
- FICA SS: 6.2%
- FICA Medicare: 1.45%
- CA SDI: 0.9%

Make YTD realistic for pay period 22 of 26.
Format all numbers with commas, 2 decimals, NO dollar signs.
Output: Valid JSON only.
```

### Bước 3: Lấy kết quả
1. Gemini sẽ trả về JSON hoàn chỉnh
2. Copy toàn bộ JSON
3. Lưu vào file `.json` (ví dụ: `my-paystub.json`)

### Bước 4: Import vào Paystub Editor
1. Mở app: `npm run dev`
2. Vào `/paystub`
3. Click nút **"📥 Nhập JSON"**
4. Chọn file JSON vừa tạo
5. ✅ Done! Tất cả dữ liệu tự động điền

### Bước 5: Export
- Click **"📄 Xuất PDF"** → Professional PDF
- Click **"🖼️ Xuất PNG"** → High-quality image
- Click **"🖨️ In"** → Print directly

---

## 💡 Ví dụ cụ thể

### Ví dụ 1: Math Teacher
```
Teacher: Sarah Johnson
School: Lincoln High School, Sacramento, CA 95814
Position: Math Teacher - High School
Hourly Rate: $52.00
Hours: 80.00
Pay Date: 12/15/2025
Pay Period: 12/01/2025 - 12/15/2025

Sick Leave: 96 hours beginning, 1 hour accrued, 0 used
Personal Leave: 40 hours beginning, 0 accrued, 0 used

Retirement: CalSTRS (public school)
Health Insurance: Employee pays $95, Employer pays $520
```

Gemini sẽ tạo:
- Gross Pay: $4,160.00
- Federal Tax: ~$499
- State Tax: ~$187
- Net Pay: ~$2,900
- YTD calculations cho pay period 22

### Ví dụ 2: Private School Teacher
```
Teacher: Michael Chen
School: St. Mary's Academy, San Francisco, CA 94102
Position: Science Teacher - Middle School
Hourly Rate: $45.00
Hours: 80.00
Pay Date: 12/20/2025

Sick Leave: 72 hours beginning, 1 accrued, 8 used
Personal: 24 hours, no change

Retirement: 403(b) Plan with 3% employer match
Stipends: Technology $150, Master's Degree $200
```

---

## 📋 Template JSON Structure

Bạn cũng có thể edit JSON thủ công:

```json
{
  "company": {
    "name": "TÊN TRƯỜNG (VIẾT HOA)",
    "address": "Số nhà + Tên đường",
    "cityStateZip": "City, CA Zipcode"
  },
  "employee": {
    "name": "TÊN NHÂN VIÊN (VIẾT HOA)",
    "id": "E-XXXXX",
    "department": "Position - Level",
    "address": "Địa chỉ nhà",
    "cityStateZip": "City, CA Zipcode"
  },
  "earnings": [
    {
      "name": "Certificated Salary",
      "rate": "48.50",
      "hours": "80.00",
      "current": "3,880.00",
      "ytd": "85,360.00"
    }
  ]
}
```

**LƯU Ý:**
- ❌ KHÔNG dùng ký tự `$` trong values
- ✅ Dùng dấu phẩy cho số lớn: `1,234.56`
- ✅ 2 chữ số thập phân: `.00`
- ✅ Strings dùng quotes: `"value"`

---

## 🎯 3 Prompts hay dùng

### 1. Basic Teacher Paystub
```
Create paystub JSON: 
Teacher [Name], [School] [City] CA, 
[Subject] Teacher, $[XX]/hr 80hrs,
pay date [MM/DD/YYYY],
sick leave [XX]hrs, [Retirement type]
```

### 2. With Stipends
```
Create paystub JSON:
Teacher [Name], [School],
Base $[XX]/hr, Tech Stipend $150, Master's $200,
80 hours, pay date [MM/DD/YYYY]
```

### 3. Batch (Multiple Teachers)
```
Create 5 paystub JSONs for Lincoln HS:
1. Math Teacher: John Smith, $48/hr, 5 years
2. English: Emily Davis, $52/hr, 10 years
3. PE: Robert Wilson, $42/hr, 2 years
4. Science: Lisa Brown, $50/hr, 7 years
5. Music: David Lee, $45/hr, 3 years
All same pay date 12/15/2025
```

---

## 🔄 Workflow Nhanh

### Tạo mới (2 phút):
```
Info → Gemini → JSON → Import → PDF
```

### Update monthly (1 phút):
```
Export JSON → Gemini edit → Import → PDF
```

### Batch 10 people (10 phút):
```
List → Gemini batch → Import each → 10 PDFs
```

---

## ⚠️ Troubleshooting

### Lỗi: "File JSON không hợp lệ"
**Nguyên nhân:** JSON syntax error
**Giải pháp:** 
1. Copy lại JSON từ Gemini
2. Paste vào https://jsonlint.com để validate
3. Fix errors
4. Save và import lại

### Lỗi: Numbers có dấu $
**Nguyên nhân:** Gemini thêm $ vào values
**Giải pháp:**
- Thêm vào prompt: "NO dollar signs in numeric values"
- Hoặc tìm/thay "$" → "" trong file JSON

### Lỗi: Missing commas
**Nguyên nhân:** Số lớn không có dấu phẩy
**Giải pháp:**
- Thêm vào prompt: "Use comma separators: 1,234.56"
- Hoặc edit thủ công: `85360.00` → `85,360.00`

---

## 📚 Chi tiết hơn

Xem file `GEMINI_AI_GUIDE.md` để:
- Advanced prompts
- Calculation formulas
- Batch processing
- Error handling
- Best practices

---

## 🎁 Bonus Tips

### Tip 1: Save favorite prompts
Tạo file `my-prompts.txt` với các prompt hay dùng

### Tip 2: Template library
Tạo folder `templates/` với các JSON mẫu:
- `math-teacher-template.json`
- `admin-template.json`
- `substitute-template.json`

### Tip 3: Gemini conversation
Giữ nguyên conversation với Gemini để:
- Tạo variations nhanh
- Adjust amounts
- Generate series (monthly)

---

**Version:** 2.1  
**Updated:** November 30, 2025  
**Purpose:** Quick start guide for JSON + Gemini workflow
