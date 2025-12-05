import { useState, useRef } from 'react';
import { toast } from './Toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PaystubEditor = () => {
  const paystubRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [zebraStriping, setZebraStriping] = useState(true); // Enable zebra striping by default
  
  // Company Information
  const [companyData, setCompanyData] = useState({
    name: 'NEW COVENANT ACADEMY',
    address: '3119 W 6th St',
    cityStateZip: 'Los Angeles, CA 90020'
  });

  // Employee Information
  const [employeeData, setEmployeeData] = useState({
    name: 'ETHAN COLE',
    id: 'E-198745',
    department: 'Teacher - Middle School',
    address: '1425 S Genesee Ave',
    cityStateZip: 'Los Angeles, CA 90019'
  });

  // Pay Information
  const [payInfo, setPayInfo] = useState({
    payDate: '11/28/2025',
    payPeriod: '11/01/2025 - 11/15/2025',
    checkNumber: '45982',
    adviceNumber: 'ADV-2025-1122'
  });

  // Tax Data
  const [taxData, setTaxData] = useState({
    fedStatus: 'S',
    fedAllow: '01',
    stateStatus: 'S',
    stateAllow: '01'
  });

  // Earnings
  const [earnings, setEarnings] = useState([
    { name: 'Certificated Salary', rate: '48.50', hours: '80.00', current: '3,880.00', ytd: '85,360.00' },
    { name: 'Stipend - Technology', rate: 'Flat', hours: '--', current: '150.00', ytd: '3,300.00' }
  ]);

  // Deductions
  const [deductions, setDeductions] = useState([
    { name: 'Federal Tax', type: 'Fed Withholding', current: '483.60', ytd: '10,639.20' },
    { name: 'State Tax', type: 'CA Withholding', current: '185.38', ytd: '4,078.36' },
    { name: 'FICA - SS', type: 'Social Security', current: '249.86', ytd: '5,496.92' },
    { name: 'FICA - Med', type: 'Medicare', current: '58.44', ytd: '1,285.68' },
    { name: 'CA SDI', type: 'Disability Ins', current: '36.27', ytd: '797.94' },
    { name: '403(b) Plan', type: 'Retirement', current: '200.00', ytd: '4,400.00' },
    { name: 'Health Ins', type: 'Medical HMO', current: '85.00', ytd: '1,870.00' }
  ]);

  // Bank Information
  const [bankInfo, setBankInfo] = useState({
    bankName: 'Chase Bank',
    accountNumber: 'XXXXXX8842',
    description: 'Direct Deposit'
  });

  // Leave Balances (Education sector specific)
  const [leaveBalances, setLeaveBalances] = useState({
    sickLeave: {
      beginning: '72.00',
      accrued: '1.00',
      used: '0.00'
    },
    personalNecessity: {
      beginning: '3.00',
      accrued: '0.00',
      used: '0.00'
    }
  });

  // Employer Contributions (Education sector specific)
  const [employerContributions, setEmployerContributions] = useState([
    { name: 'ER Health', type: 'Medical Insurance', amount: '485.00', ytd: '10,670.00' },
    { name: 'ER Dental', type: 'Dental Insurance', amount: '45.00', ytd: '990.00' },
    { name: 'ER Vision', type: 'Vision Insurance', amount: '12.00', ytd: '264.00' },
    { name: 'ER Retirement', type: '403(b) Match', amount: '200.00', ytd: '4,400.00' }
  ]);

  // Calculated totals
  const calculateGrossPay = () => {
    return earnings.reduce((sum, e) => sum + parseFloat(e.current.replace(/,/g, '') || 0), 0);
  };

  const calculateTotalDeductions = () => {
    return deductions.reduce((sum, d) => sum + parseFloat(d.current.replace(/,/g, '') || 0), 0);
  };

  const calculateNetPay = () => {
    return calculateGrossPay() - calculateTotalDeductions();
  };

  const calculateYTDGross = () => {
    return earnings.reduce((sum, e) => sum + parseFloat(e.ytd.replace(/,/g, '') || 0), 0);
  };

  const calculateYTDDeductions = () => {
    return deductions.reduce((sum, d) => sum + parseFloat(d.ytd.replace(/,/g, '') || 0), 0);
  };

  const calculateYTDNet = () => {
    return calculateYTDGross() - calculateYTDDeductions();
  };

  const formatCurrency = (value) => {
    return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Calculate leave balance
  const calculateLeaveBalance = (leaveType) => {
    const leave = leaveBalances[leaveType];
    const beginning = parseFloat(leave.beginning || 0);
    const accrued = parseFloat(leave.accrued || 0);
    const used = parseFloat(leave.used || 0);
    return (beginning + accrued - used).toFixed(2);
  };

  // Calculate total employer contributions
  const calculateTotalEmployerContributions = () => {
    return employerContributions.reduce((sum, ec) => sum + parseFloat(ec.amount.replace(/,/g, '') || 0), 0);
  };

  const calculateYTDEmployerContributions = () => {
    return employerContributions.reduce((sum, ec) => sum + parseFloat(ec.ytd.replace(/,/g, '') || 0), 0);
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo phải nhỏ hơn 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target.result);
        toast.success('✓ Đã tải logo lên!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new earning row
  const addEarning = () => {
    setEarnings([...earnings, { name: '', rate: '', hours: '', current: '', ytd: '' }]);
  };

  // Remove earning row
  const removeEarning = (index) => {
    setEarnings(earnings.filter((_, i) => i !== index));
  };

  // Add new deduction row
  const addDeduction = () => {
    setDeductions([...deductions, { name: '', type: '', current: '', ytd: '' }]);
  };

  // Remove deduction row
  const removeDeduction = (index) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      toast.success('⏳ Đang tạo PDF...');
      
      const element = paystubRef.current;
      const canvas = await html2canvas(element, {
        scale: 5,  // High quality export (500+ DPI)
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794, // Match actual container width (A4 @ 96 DPI)
        windowHeight: 1123, // Match actual container height (A4 @ 96 DPI)
        width: 794,
        height: 1123,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
        removeContainer: true
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(`Paystub_${employeeData.name.replace(/\s/g, '_')}_${payInfo.payDate.replace(/\//g, '-')}.pdf`);
      
      toast.success('✓ Đã xuất PDF thành công!');
    } catch (error) {
      console.error('Export PDF error:', error);
      toast.error('❌ Lỗi khi xuất PDF: ' + error.message);
    }
  };

  // Export to PNG
  const exportToPNG = async () => {
    try {
      toast.success('⏳ Đang tạo PNG...');
      
      const element = paystubRef.current;
      const canvas = await html2canvas(element, {
        scale: 6,  // Ultra high quality (600 DPI)
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,  // Match actual container (A4 @ 96 DPI)
        windowHeight: 1123,
        width: 794,
        height: 1123,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        allowTaint: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
        removeContainer: true
      });

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Paystub_${employeeData.name.replace(/\s/g, '_')}_${payInfo.payDate.replace(/\//g, '-')}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('✓ Đã xuất PNG chất lượng cao!');
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Export PNG error:', error);
      toast.error('❌ Lỗi khi xuất PNG: ' + error.message);
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Export to JSON
  const exportToJSON = () => {
    const data = {
      company: companyData,
      employee: employeeData,
      pay: payInfo,
      tax: taxData,
      earnings,
      deductions,
      bank: bankInfo,
      leaveBalances,
      employerContributions,
      logo: logoUrl
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Paystub_${employeeData.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('✓ Đã xuất JSON thành công!');
  };

  // Import from JSON
  const importFromJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (data.company) setCompanyData(data.company);
        if (data.employee) setEmployeeData(data.employee);
        if (data.pay) setPayInfo(data.pay);
        if (data.tax) setTaxData(data.tax);
        if (data.earnings) setEarnings(data.earnings);
        if (data.deductions) setDeductions(data.deductions);
        if (data.bank) setBankInfo(data.bank);
        if (data.leaveBalances) setLeaveBalances(data.leaveBalances);
        if (data.employerContributions) setEmployerContributions(data.employerContributions);
        if (data.logo) setLogoUrl(data.logo);
        
        toast.success('✓ Đã import JSON thành công!');
      } catch (error) {
        toast.error('❌ Lỗi: File JSON không hợp lệ!');
        console.error('JSON parse error:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">💰 Paystub Editor</h1>
              <p className="text-gray-600 mt-1">Tạo và chỉnh sửa phiếu lương chuẩn USA</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
              >
                <span>📄</span>
                <span>Xuất PDF</span>
              </button>
              <button
                onClick={exportToPNG}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <span>🖼️</span>
                <span>Xuất PNG</span>
              </button>
              <button
                onClick={exportToJSON}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
              >
                <span>💾</span>
                <span>Xuất JSON</span>
              </button>
              <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2 cursor-pointer">
                <span>📥</span>
                <span>Nhập JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importFromJSON}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setZebraStriping(!zebraStriping)}
                className={`px-4 py-2 rounded-lg transition flex items-center space-x-2 ${
                  zebraStriping 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                <span>🎨</span>
                <span>Zebra Striping</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center space-x-2"
              >
                <span>🖨️</span>
                <span>In</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: Editor Form */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-800">📷 Logo công ty</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {logoUrl && (
                <div className="mt-4">
                  <img src={logoUrl} alt="Logo" className="h-16 object-contain" />
                  <button
                    onClick={() => setLogoUrl('')}
                    className="mt-2 text-red-600 text-sm hover:underline"
                  >
                    ✕ Xóa logo
                  </button>
                </div>
              )}
            </div>

            {/* Company Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-800">🏢 Thông tin công ty</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  placeholder="Tên công ty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                  placeholder="Địa chỉ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={companyData.cityStateZip}
                  onChange={(e) => setCompanyData({...companyData, cityStateZip: e.target.value})}
                  placeholder="City, State Zip"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Employee Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-800">👤 Thông tin nhân viên</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={employeeData.name}
                  onChange={(e) => setEmployeeData({...employeeData, name: e.target.value})}
                  placeholder="Tên nhân viên"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={employeeData.id}
                    onChange={(e) => setEmployeeData({...employeeData, id: e.target.value})}
                    placeholder="Employee ID"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={employeeData.department}
                    onChange={(e) => setEmployeeData({...employeeData, department: e.target.value})}
                    placeholder="Department"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="text"
                  value={employeeData.address}
                  onChange={(e) => setEmployeeData({...employeeData, address: e.target.value})}
                  placeholder="Địa chỉ nhân viên"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={employeeData.cityStateZip}
                  onChange={(e) => setEmployeeData({...employeeData, cityStateZip: e.target.value})}
                  placeholder="City, State Zip"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Pay Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-800">📅 Thông tin thanh toán</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={payInfo.payDate}
                  onChange={(e) => setPayInfo({...payInfo, payDate: e.target.value})}
                  placeholder="Pay Date (MM/DD/YYYY)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={payInfo.payPeriod}
                  onChange={(e) => setPayInfo({...payInfo, payPeriod: e.target.value})}
                  placeholder="Pay Period"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={payInfo.checkNumber}
                  onChange={(e) => setPayInfo({...payInfo, checkNumber: e.target.value})}
                  placeholder="Check Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={payInfo.adviceNumber}
                  onChange={(e) => setPayInfo({...payInfo, adviceNumber: e.target.value})}
                  placeholder="Advice Number (e.g., ADV-2025-1122)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tax Data */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-800">📊 Thông tin thuế</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={taxData.fedStatus}
                  onChange={(e) => setTaxData({...taxData, fedStatus: e.target.value})}
                  placeholder="Fed Status"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={taxData.fedAllow}
                  onChange={(e) => setTaxData({...taxData, fedAllow: e.target.value})}
                  placeholder="Fed Allow"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={taxData.stateStatus}
                  onChange={(e) => setTaxData({...taxData, stateStatus: e.target.value})}
                  placeholder="State Status"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={taxData.stateAllow}
                  onChange={(e) => setTaxData({...taxData, stateAllow: e.target.value})}
                  placeholder="State Allow"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Earnings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">💵 Earnings</h3>
                <button
                  onClick={addEarning}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  + Thêm
                </button>
              </div>
              {earnings.map((earning, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 mb-3">
                  <input
                    type="text"
                    value={earning.name}
                    onChange={(e) => {
                      const newEarnings = [...earnings];
                      newEarnings[index].name = e.target.value;
                      setEarnings(newEarnings);
                    }}
                    placeholder="Name"
                    className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={earning.rate}
                    onChange={(e) => {
                      const newEarnings = [...earnings];
                      newEarnings[index].rate = e.target.value;
                      setEarnings(newEarnings);
                    }}
                    placeholder="Rate"
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={earning.hours}
                    onChange={(e) => {
                      const newEarnings = [...earnings];
                      newEarnings[index].hours = e.target.value;
                      setEarnings(newEarnings);
                    }}
                    placeholder="Hours"
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={earning.current}
                    onChange={(e) => {
                      const newEarnings = [...earnings];
                      newEarnings[index].current = e.target.value;
                      setEarnings(newEarnings);
                    }}
                    placeholder="Current"
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={earning.ytd}
                      onChange={(e) => {
                        const newEarnings = [...earnings];
                        newEarnings[index].ytd = e.target.value;
                        setEarnings(newEarnings);
                      }}
                      placeholder="YTD"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {earnings.length > 1 && (
                      <button
                        onClick={() => removeEarning(index)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Deductions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">📉 Deductions</h3>
                <button
                  onClick={addDeduction}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  + Thêm
                </button>
              </div>
              {deductions.map((deduction, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 mb-3">
                  <input
                    type="text"
                    value={deduction.name}
                    onChange={(e) => {
                      const newDeductions = [...deductions];
                      newDeductions[index].name = e.target.value;
                      setDeductions(newDeductions);
                    }}
                    placeholder="Name"
                    className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={deduction.type}
                    onChange={(e) => {
                      const newDeductions = [...deductions];
                      newDeductions[index].type = e.target.value;
                      setDeductions(newDeductions);
                    }}
                    placeholder="Type"
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={deduction.current}
                    onChange={(e) => {
                      const newDeductions = [...deductions];
                      newDeductions[index].current = e.target.value;
                      setDeductions(newDeductions);
                    }}
                    placeholder="Current"
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={deduction.ytd}
                      onChange={(e) => {
                        const newDeductions = [...deductions];
                        newDeductions[index].ytd = e.target.value;
                        setDeductions(newDeductions);
                      }}
                      placeholder="YTD"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {deductions.length > 1 && (
                      <button
                        onClick={() => removeDeduction(index)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bank Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-800">🏦 Thông tin ngân hàng</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={bankInfo.bankName}
                  onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})}
                  placeholder="Bank Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={bankInfo.accountNumber}
                  onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                  placeholder="Account Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={bankInfo.description}
                  onChange={(e) => setBankInfo({...bankInfo, description: e.target.value})}
                  placeholder="Description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Employer Contributions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">🏛️ Employer Contributions</h3>
                <button
                  onClick={() => setEmployerContributions([...employerContributions, { name: '', type: '', amount: '', ytd: '' }])}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  + Thêm
                </button>
              </div>
              <div className="text-xs text-gray-600 mb-3">Đóng góp của nhà trường (không ảnh hưởng Net Pay)</div>
              {employerContributions.map((ec, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 mb-3">
                  <input
                    type="text"
                    value={ec.name}
                    onChange={(e) => {
                      const newEC = [...employerContributions];
                      newEC[index].name = e.target.value;
                      setEmployerContributions(newEC);
                    }}
                    placeholder="Name"
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={ec.type}
                    onChange={(e) => {
                      const newEC = [...employerContributions];
                      newEC[index].type = e.target.value;
                      setEmployerContributions(newEC);
                    }}
                    placeholder="Type"
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={ec.amount}
                    onChange={(e) => {
                      const newEC = [...employerContributions];
                      newEC[index].amount = e.target.value;
                      setEmployerContributions(newEC);
                    }}
                    placeholder="Current"
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={ec.ytd}
                    onChange={(e) => {
                      const newEC = [...employerContributions];
                      newEC[index].ytd = e.target.value;
                      setEmployerContributions(newEC);
                    }}
                    placeholder="YTD"
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setEmployerContributions(employerContributions.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Leave Balances */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-800">🏖️ Leave Balances (Số dư ngày nghỉ)</h3>
              <div className="space-y-4">
                {/* Sick Leave */}
                <div>
                  <div className="font-semibold text-sm mb-2">Sick Leave (Nghỉ ốm)</div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={leaveBalances.sickLeave.beginning}
                      onChange={(e) => setLeaveBalances({
                        ...leaveBalances,
                        sickLeave: { ...leaveBalances.sickLeave, beginning: e.target.value }
                      })}
                      placeholder="Beginning"
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={leaveBalances.sickLeave.accrued}
                      onChange={(e) => setLeaveBalances({
                        ...leaveBalances,
                        sickLeave: { ...leaveBalances.sickLeave, accrued: e.target.value }
                      })}
                      placeholder="Accrued"
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={leaveBalances.sickLeave.used}
                      onChange={(e) => setLeaveBalances({
                        ...leaveBalances,
                        sickLeave: { ...leaveBalances.sickLeave, used: e.target.value }
                      })}
                      placeholder="Used"
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Current Balance: {calculateLeaveBalance('sickLeave')} days
                  </div>
                </div>

                {/* Personal Necessity */}
                <div>
                  <div className="font-semibold text-sm mb-2">Personal Necessity (Việc riêng)</div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={leaveBalances.personalNecessity.beginning}
                      onChange={(e) => setLeaveBalances({
                        ...leaveBalances,
                        personalNecessity: { ...leaveBalances.personalNecessity, beginning: e.target.value }
                      })}
                      placeholder="Beginning"
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={leaveBalances.personalNecessity.accrued}
                      onChange={(e) => setLeaveBalances({
                        ...leaveBalances,
                        personalNecessity: { ...leaveBalances.personalNecessity, accrued: e.target.value }
                      })}
                      placeholder="Accrued"
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={leaveBalances.personalNecessity.used}
                      onChange={(e) => setLeaveBalances({
                        ...leaveBalances,
                        personalNecessity: { ...leaveBalances.personalNecessity, used: e.target.value }
                      })}
                      placeholder="Used"
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Current Balance: {calculateLeaveBalance('personalNecessity')} days
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Paystub Preview */}
          <div className="sticky top-8">
            <div className="bg-white rounded-lg shadow-xl p-4 print:shadow-none print:p-0">
              <div 
                ref={paystubRef} 
                className="bg-white overflow-hidden"
                style={{ 
                  width: '794px', // A4: 210mm = 8.27" * 96 DPI
                  height: '1123px', // A4: 297mm = 11.69" * 96 DPI
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontSize: '14px',
                  padding: '0', // No padding - full width A4
                  boxSizing: 'border-box',
                  position: 'relative',
                  margin: '0 auto'
                }}
              >
                {/* Global styles for all table cells */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                    td, th {
                      vertical-align: middle !important;
                      padding: 4px 8px !important;
                    }
                    td {
                      line-height: 1.3;
                    }
                  `
                }} />
                
                {/* Paystub Header */}
                <div className="border-2 border-black" style={{ 
                  width: '100%',
                  height: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px' // Increased internal padding
                }}>
                  {/* Top Header Row */}
                  <div 
                    className="border-b border-black flex justify-between items-center"
                    style={{
                      padding: '12px',
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: '#000',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {logoUrl && (
                        <img 
                          src={logoUrl} 
                          alt="Logo" 
                          style={{ 
                            height: '40px', 
                            width: '40px', 
                            objectFit: 'contain' 
                          }} 
                        />
                      )}
                      <div>
                        <div style={{ 
                          fontWeight: 'bold', 
                          fontSize: '18px', 
                          textTransform: 'uppercase', 
                          lineHeight: '1.3',
                          letterSpacing: '0.5px'
                        }}>
                          {companyData.name}
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: '1.3' }}>
                          {companyData.address}
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: '1.3' }}>
                          {companyData.cityStateZip}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '24px', 
                        textTransform: 'uppercase' 
                      }}>
                        EARNINGS STATEMENT
                      </div>
                      <div style={{ fontSize: '13px', marginTop: '4px', fontFamily: 'Courier New, monospace' }}>
                        Check #: {payInfo.checkNumber}
                      </div>
                      <div style={{ fontSize: '13px', fontFamily: 'Courier New, monospace' }}>
                        Advice #: {payInfo.adviceNumber}
                      </div>
                    </div>
                  </div>

                  {/* Info Row - Compact */}
                  <div 
                    style={{
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: '#000',
                      padding: '12px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(12, 1fr)',
                      gap: '12px',
                      fontSize: '14px'
                    }}
                  >
                    <div style={{ gridColumn: 'span 3' }}>
                      <div style={{ fontWeight: 'bold' }}>{employeeData.name}</div>
                      <div>{employeeData.address}</div>
                      <div>{employeeData.cityStateZip}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2', fontFamily: 'Courier New, monospace' }}>
                      <div><span style={{ fontWeight: 'bold' }}>Status:</span> Fed: {taxData.fedStatus} / CA: {taxData.stateStatus}</div>
                      <div><span style={{ fontWeight: 'bold' }}>Allow:</span> Fed: {taxData.fedAllow} / CA: {taxData.stateAllow}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2', fontFamily: 'Courier New, monospace' }}>
                      <div><span style={{ fontWeight: 'bold' }}>SSN:</span> XXX-XX-{employeeData.id.slice(-4)}</div>
                      <div><span style={{ fontWeight: 'bold' }}>Employee ID:</span> {employeeData.id}</div>
                    </div>
                    <div style={{ gridColumn: 'span 3' }}>
                      <div><span style={{ fontWeight: 'bold' }}>Pay Period:</span></div>
                      <div>{payInfo.payPeriod}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <div><span style={{ fontWeight: 'bold' }}>Pay Date:</span></div>
                      <div>{payInfo.payDate}</div>
                    </div>
                  </div>

                  {/* Earnings Table - Compact */}
                  <div className="p-2" style={{ padding: '12px' }}>
                    <table className="w-full text-xs border-collapse" style={{ 
                      width: '100%', 
                      fontSize: '14px', 
                      borderCollapse: 'collapse',
                      tableLayout: 'fixed'
                    }}>
                      <thead>
                        <tr className="bg-gray-200" style={{ backgroundColor: '#e5e7eb' }}>
                          <th className="border border-black px-1 py-1 text-left font-bold" style={{ 
                            border: '1px solid #000', 
                            padding: '5px 8px', 
                            textAlign: 'left', 
                            fontWeight: 'bold',
                            verticalAlign: 'middle'
                          }}>INCOME</th>
                          <th className="border border-black px-1 py-1 text-center font-bold w-16" style={{ 
                            border: '1px solid #000', 
                            padding: '5px 8px', 
                            textAlign: 'center', 
                            fontWeight: 'bold',
                            width: '70px',
                            verticalAlign: 'middle'
                          }}>RATE</th>
                          <th className="border border-black px-1 py-1 text-center font-bold w-16" style={{ 
                            border: '1px solid #000', 
                            padding: '5px 8px', 
                            textAlign: 'center', 
                            fontWeight: 'bold',
                            width: '70px',
                            verticalAlign: 'middle'
                          }}>HOURS</th>
                          <th className="border border-black px-1 py-1 text-right font-bold w-24" style={{ 
                            border: '1px solid #000', 
                            padding: '5px 8px', 
                            textAlign: 'right', 
                            fontWeight: 'bold',
                            width: '100px',
                            verticalAlign: 'middle'
                          }}>CURRENT TOTAL</th>
                          <th className="border border-black px-1 py-1 text-left font-bold" style={{ 
                            border: '1px solid #000', 
                            padding: '5px 8px', 
                            textAlign: 'left', 
                            fontWeight: 'bold',
                            verticalAlign: 'middle'
                          }}>DEDUCTIONS</th>
                          <th className="border border-black px-1 py-1 text-right font-bold w-24" style={{ 
                            border: '1px solid #000', 
                            padding: '5px 8px', 
                            textAlign: 'right', 
                            fontWeight: 'bold',
                            width: '100px',
                            verticalAlign: 'middle'
                          }}>CURRENT TOTAL</th>
                          <th className="border border-black px-1 py-1 text-right font-bold w-24" style={{ 
                            border: '1px solid #000', 
                            padding: '5px 8px', 
                            textAlign: 'right', 
                            fontWeight: 'bold',
                            width: '100px',
                            verticalAlign: 'middle'
                          }}>YEAR-TO-DATE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Render rows side by side */}
                        {Array.from({ length: Math.max(earnings.length + 1, deductions.length + 1) }).map((_, index) => {
                          const earning = earnings[index];
                          const deduction = deductions[index];
                          const isGrossRow = index === earnings.length;
                          const isTotalDeductRow = index === deductions.length;
                          const rowBgColor = zebraStriping && index % 2 === 0 ? '#f2f2f2' : 'transparent';
                          
                          return (
                            <tr key={index} style={{ backgroundColor: rowBgColor }}>
                              {/* Earnings columns */}
                              {isGrossRow ? (
                                <>
                                  <td className="border border-black px-1 py-1 font-bold" colSpan="3" style={{ 
                                    border: '1px solid #000', 
                                    padding: '4px', 
                                    fontWeight: 'bold',
                                    backgroundColor: '#f3f4f6',
                                    verticalAlign: 'middle'
                                  }}>GROSS PAY</td>
                                  <td className="border border-black px-1 py-1 text-right font-bold" style={{ 
                                    border: '1px solid #000', 
                                    padding: '4px', 
                                    textAlign: 'right', 
                                    fontWeight: 'bold',
                                    backgroundColor: '#f3f4f6',
                                    fontFamily: 'Courier New, monospace',
                                    verticalAlign: 'middle'
                                  }}>${formatCurrency(calculateGrossPay())}</td>
                                </>
                              ) : earning ? (
                                <>
                                  <td className="border border-black px-1 py-1" style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'middle' }}>{earning.name}</td>
                                  <td className="border border-black px-1 py-1 text-center" style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontFamily: 'Courier New, monospace', verticalAlign: 'middle' }}>
                                    {earning.rate !== 'Flat' && earning.rate ? `$${earning.rate}` : earning.rate}
                                  </td>
                                  <td className="border border-black px-1 py-1 text-center" style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontFamily: 'Courier New, monospace', verticalAlign: 'middle' }}>{earning.hours}</td>
                                  <td className="border border-black px-1 py-1 text-right" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontFamily: 'Courier New, monospace', verticalAlign: 'middle' }}>${earning.current}</td>
                                </>
                              ) : (
                                <>
                                  <td className="border border-black px-1 py-1" style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'middle' }}>&nbsp;</td>
                                  <td className="border border-black px-1 py-1" style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'middle' }}>&nbsp;</td>
                                  <td className="border border-black px-1 py-1" style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'middle' }}>&nbsp;</td>
                                  <td className="border border-black px-1 py-1" style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'middle' }}>&nbsp;</td>
                                </>
                              )}
                              
                              {/* Deductions columns */}
                              {isTotalDeductRow ? (
                                <>
                                  <td className="border border-black px-1 py-1 font-bold" colSpan="1" style={{ 
                                    border: '1px solid #000', 
                                    padding: '4px', 
                                    fontWeight: 'bold',
                                    backgroundColor: '#f3f4f6',
                                    verticalAlign: 'middle'
                                  }}>TOTAL DEDUCTIONS</td>
                                  <td className="border border-black px-1 py-1 text-right font-bold" style={{ 
                                    border: '1px solid #000', 
                                    padding: '4px', 
                                    textAlign: 'right', 
                                    fontWeight: 'bold',
                                    backgroundColor: '#f3f4f6',
                                    fontFamily: 'Courier New, monospace',
                                    verticalAlign: 'middle'
                                  }}>${formatCurrency(calculateTotalDeductions())}</td>
                                  <td className="border border-black px-1 py-1 text-right font-bold" style={{ 
                                    border: '1px solid #000', 
                                    padding: '4px', 
                                    textAlign: 'right', 
                                    fontWeight: 'bold',
                                    backgroundColor: '#f3f4f6',
                                    fontFamily: 'Courier New, monospace',
                                    verticalAlign: 'middle'
                                  }}>${formatCurrency(calculateYTDDeductions())}</td>
                                </>
                              ) : deduction ? (
                                <>
                                  <td className="border border-black px-1 py-1" style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'middle' }}>{deduction.name}</td>
                                  <td className="border border-black px-1 py-1 text-right" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontFamily: 'Courier New, monospace', verticalAlign: 'middle' }}>${deduction.current}</td>
                                  <td className="border border-black px-1 py-1 text-right" style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontFamily: 'Courier New, monospace', verticalAlign: 'middle' }}>${deduction.ytd}</td>
                                </>
                              ) : (
                                <>
                                  <td className="border border-black px-1 py-1" style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'middle' }}>&nbsp;</td>
                                  <td className="border border-black px-1 py-1" style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'middle' }}>&nbsp;</td>
                                  <td className="border border-black px-1 py-1" style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'middle' }}>&nbsp;</td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom Summary - Compact */}
                  <div className="border-t-2 border-black p-2" style={{ 
                    borderTop: '2px solid #000', 
                    padding: '12px' 
                  }}>
                    <table className="w-full text-xs" style={{ 
                      width: '100%', 
                      fontSize: '14px',
                      borderCollapse: 'collapse'
                    }}>
                      <tbody>
                        <tr className="font-bold" style={{ fontWeight: 'bold' }}>
                          <td className="border border-black px-1 py-1 bg-gray-200" style={{ 
                            border: '1px solid #000', 
                            padding: '4px', 
                            backgroundColor: '#e5e7eb',
                            fontWeight: 'bold'
                          }}>YTD GROSS</td>
                          <td className="border border-black px-1 py-1 bg-gray-200" style={{ 
                            border: '1px solid #000', 
                            padding: '4px', 
                            backgroundColor: '#e5e7eb',
                            fontWeight: 'bold'
                          }}>YTD DEDUCTIONS</td>
                          <td className="border border-black px-1 py-1 bg-gray-200" style={{ 
                            border: '1px solid #000', 
                            padding: '4px', 
                            backgroundColor: '#e5e7eb',
                            fontWeight: 'bold'
                          }}>YTD NET PAY</td>
                          <td className="border border-black px-1 py-1 bg-gray-200" style={{ 
                            border: '1px solid #000', 
                            padding: '4px', 
                            backgroundColor: '#e5e7eb',
                            fontWeight: 'bold'
                          }}>CURRENT TOTAL</td>
                          <td className="border border-black px-1 py-1 bg-gray-200" style={{ 
                            border: '1px solid #000', 
                            padding: '4px', 
                            backgroundColor: '#e5e7eb',
                            fontWeight: 'bold'
                          }}>CURRENT DEDUCTIONS</td>
                          <td className="border border-black px-1 py-1 bg-gray-200 text-right" style={{ 
                            border: '1px solid #000', 
                            padding: '4px', 
                            backgroundColor: '#e5e7eb',
                            textAlign: 'right',
                            fontWeight: 'bold'
                          }}>NET PAY</td>
                        </tr>
                        <tr className="font-bold text-sm" style={{ fontWeight: 'bold', fontSize: '13px', fontFamily: 'Courier New, monospace' }}>
                          <td className="border border-black px-1 py-1 text-right" style={{ 
                            border: '1px solid #000', 
                            padding: '4px', 
                            textAlign: 'right',
                            fontWeight: 'bold',
                            fontFamily: 'Courier New, monospace'
                          }}>${formatCurrency(calculateYTDGross())}</td>
                          <td className="border border-black px-1 py-1 text-right" style={{ 
                            border: '1px solid #000', 
                            padding: '4px', 
                            textAlign: 'right',
                            fontWeight: 'bold',
                            fontFamily: 'Courier New, monospace'
                          }}>${formatCurrency(calculateYTDDeductions())}</td>
                          <td className="border border-black px-1 py-1 text-right" style={{ 
                            border: '1px solid #000', 
                            padding: '4px', 
                            textAlign: 'right',
                            fontWeight: 'bold',
                            fontFamily: 'Courier New, monospace'
                          }}>${formatCurrency(calculateYTDNet())}</td>
                          <td className="border border-black px-1 py-1 text-right" style={{ 
                            border: '1px solid #000', 
                            padding: '4px', 
                            textAlign: 'right',
                            fontWeight: 'bold',
                            fontFamily: 'Courier New, monospace'
                          }}>${formatCurrency(calculateGrossPay())}</td>
                          <td className="border border-black px-1 py-1 text-right" style={{ 
                            border: '1px solid #000', 
                            padding: '4px', 
                            textAlign: 'right',
                            fontWeight: 'bold',
                            fontFamily: 'Courier New, monospace'
                          }}>${formatCurrency(calculateTotalDeductions())}</td>
                          <td className="border border-black px-1 py-1 text-right text-base bg-black text-white" style={{ 
                            border: '1px solid #000', 
                            padding: '8px 10px', 
                            textAlign: 'right',
                            fontSize: '16px',
                            backgroundColor: '#000',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontFamily: 'Courier New, monospace'
                          }}>
                            ${formatCurrency(calculateNetPay())}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Employer Contributions & Leave Balances Section */}
                  <div style={{ 
                    borderTop: '1px solid #000', 
                    padding: '12px',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '16px'
                  }}>
                    {/* Employer Contributions */}
                    <div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '13px', 
                        marginBottom: '6px',
                        textTransform: 'uppercase'
                      }}>EMPLOYER PAID BENEFITS</div>
                      <table style={{ 
                        width: '100%', 
                        fontSize: '12px', 
                        borderCollapse: 'collapse',
                        fontFamily: 'Courier New, monospace',
                        border: '1px solid #000'
                      }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f3f4f6' }}>
                            <th style={{ 
                              borderBottom: '1px solid #000',
                              borderRight: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'left',
                              fontWeight: 'bold'
                            }}>BENEFIT</th>
                            <th style={{ 
                              borderBottom: '1px solid #000',
                              borderRight: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'right',
                              fontWeight: 'bold',
                              width: '80px'
                            }}>CURRENT</th>
                            <th style={{ 
                              borderBottom: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'right',
                              fontWeight: 'bold',
                              width: '80px'
                            }}>YTD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employerContributions.map((ec, index) => {
                            const rowBgColor = zebraStriping && index % 2 === 0 ? '#f2f2f2' : 'transparent';
                            return (
                            <tr key={index} style={{ backgroundColor: rowBgColor }}>
                              <td style={{ 
                                borderRight: '1px solid #000',
                                padding: '3px 4px'
                              }}>
                                {ec.name} - {ec.type}
                              </td>
                              <td style={{ 
                                borderRight: '1px solid #000',
                                padding: '3px 4px', 
                                textAlign: 'right'
                              }}>${ec.amount}</td>
                              <td style={{ 
                                padding: '3px 4px', 
                                textAlign: 'right'
                              }}>${ec.ytd}</td>
                            </tr>
                          )})}
                          <tr style={{ backgroundColor: '#e5e7eb', fontWeight: 'bold', borderTop: '1px solid #000' }}>
                            <td style={{ 
                              borderRight: '1px solid #000',
                              padding: '3px 4px',
                              fontWeight: 'bold'
                            }}>TOTAL EMPLOYER CONTRIBUTIONS</td>
                            <td style={{ 
                              borderRight: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'right',
                              fontWeight: 'bold'
                            }}>${formatCurrency(calculateTotalEmployerContributions())}</td>
                            <td style={{ 
                              padding: '3px 4px', 
                              textAlign: 'right',
                              fontWeight: 'bold'
                            }}>${formatCurrency(calculateYTDEmployerContributions())}</td>
                          </tr>
                        </tbody>
                      </table>
                      <div style={{ 
                        fontSize: '8px', 
                        fontStyle: 'italic', 
                        marginTop: '2px',
                        color: '#666'
                      }}>
                        * Employer contributions do not affect Net Pay
                      </div>
                    </div>

                    {/* Leave Balances */}
                    <div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '13px', 
                        marginBottom: '6px',
                        textTransform: 'uppercase'
                      }}>LEAVE BALANCES (HOURS)</div>
                      <table style={{ 
                        width: '100%', 
                        fontSize: '12px', 
                        borderCollapse: 'collapse',
                        fontFamily: 'Courier New, monospace',
                        border: '1px solid #000'
                      }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f3f4f6' }}>
                            <th style={{ 
                              borderBottom: '1px solid #000',
                              borderRight: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'left',
                              fontWeight: 'bold'
                            }}>TYPE</th>
                            <th style={{ 
                              borderBottom: '1px solid #000',
                              borderRight: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'right',
                              fontWeight: 'bold',
                              width: '50px'
                            }}>BEGIN</th>
                            <th style={{ 
                              borderBottom: '1px solid #000',
                              borderRight: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'right',
                              fontWeight: 'bold',
                              width: '45px'
                            }}>ACCR</th>
                            <th style={{ 
                              borderBottom: '1px solid #000',
                              borderRight: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'right',
                              fontWeight: 'bold',
                              width: '45px'
                            }}>USED</th>
                            <th style={{ 
                              borderBottom: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'right',
                              fontWeight: 'bold',
                              width: '55px'
                            }}>BALANCE</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ backgroundColor: zebraStriping ? '#f2f2f2' : 'transparent' }}>
                            <td style={{ borderRight: '1px solid #000', padding: '3px 4px' }}>Sick Leave</td>
                            <td style={{ 
                              borderRight: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'right'
                            }}>{leaveBalances.sickLeave.beginning}</td>
                            <td style={{ 
                              borderRight: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'right'
                            }}>{leaveBalances.sickLeave.accrued}</td>
                            <td style={{ 
                              borderRight: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'right'
                            }}>{leaveBalances.sickLeave.used}</td>
                            <td style={{ 
                              padding: '3px 4px', 
                              textAlign: 'right',
                              fontWeight: 'bold'
                            }}>{calculateLeaveBalance('sickLeave')}</td>
                          </tr>
                          <tr style={{ backgroundColor: 'transparent' }}>
                            <td style={{ borderRight: '1px solid #000', padding: '3px 4px' }}>Personal Nec</td>
                            <td style={{ 
                              borderRight: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'right'
                            }}>{leaveBalances.personalNecessity.beginning}</td>
                            <td style={{ 
                              borderRight: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'right'
                            }}>{leaveBalances.personalNecessity.accrued}</td>
                            <td style={{ 
                              borderRight: '1px solid #000',
                              padding: '3px 4px', 
                              textAlign: 'right'
                            }}>{leaveBalances.personalNecessity.used}</td>
                            <td style={{ 
                              padding: '3px 4px', 
                              textAlign: 'right',
                              fontWeight: 'bold'
                            }}>{calculateLeaveBalance('personalNecessity')}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none, .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
          }
          @page {
            size: letter;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PaystubEditor;
