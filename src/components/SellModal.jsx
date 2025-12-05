import { X, Save, Calendar } from "lucide-react";

const SellModal = ({
  show,
  onClose,
  account,
  availableApps,
  sellForm,
  setSellForm,
  onSubmit,
}) => {
  if (!show) return null;

  const calculateExpirationDate = (registrationDate, duration) => {
    if (!registrationDate || !duration) return "";
    const date = new Date(registrationDate);
    date.setMonth(date.getMonth() + parseInt(duration));
    return date.toISOString().split("T")[0];
  };

  const handleDurationOrDateChange = (field, value) => {
    const updated = { ...sellForm, [field]: value };

    if (field === "registrationDate" || field === "duration") {
      updated.expirationDate = calculateExpirationDate(
        field === "registrationDate" ? value : updated.registrationDate,
        field === "duration" ? value : updated.duration
      );
    }

    setSellForm(updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Tạo Giao Dịch Bán Hàng
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              Tài khoản: {account?.customFields?.["Tên"]}
            </h3>
          </div>

          {/* Apps được bán */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apps được bán *
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
              {availableApps.map((app) => (
                <label
                  key={app}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={sellForm.apps.includes(app)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSellForm((prev) => ({
                          ...prev,
                          apps: [...prev.apps, app],
                        }));
                      } else {
                        setSellForm((prev) => ({
                          ...prev,
                          apps: prev.apps.filter((a) => a !== app),
                        }));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{app}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thông tin người mua */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên người mua *
              </label>
              <input
                type="text"
                required
                value={sellForm.buyerName}
                onChange={(e) =>
                  setSellForm({ ...sellForm, buyerName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên người mua"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liên hệ
              </label>
              <input
                type="text"
                value={sellForm.buyerContact}
                onChange={(e) =>
                  setSellForm({ ...sellForm, buyerContact: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SĐT, Email..."
              />
            </div>

            {/* Thông tin giao dịch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền *
              </label>
              <input
                type="number"
                required
                value={sellForm.amount}
                onChange={(e) =>
                  setSellForm({ ...sellForm, amount: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập số tiền"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phương thức thanh toán
              </label>
              <select
                value={sellForm.paymentMethod}
                onChange={(e) =>
                  setSellForm({
                    ...sellForm,
                    paymentMethod: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Chuyển khoản</option>
                <option>Tiền mặt</option>
                <option>Ví điện tử</option>
              </select>
            </div>

            {/* Thời hạn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời hạn (tháng)
              </label>
              <input
                type="number"
                value={sellForm.duration}
                onChange={(e) =>
                  handleDurationOrDateChange("duration", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày đăng ký thành công
              </label>
              <input
                type="date"
                value={sellForm.registrationDate}
                onChange={(e) =>
                  handleDurationOrDateChange("registrationDate", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày hết hạn (tự động tính)
              </label>
              <input
                type="date"
                value={sellForm.expirationDate}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={sellForm.notes}
              onChange={(e) =>
                setSellForm({ ...sellForm, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ghi chú thêm..."
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Save size={18} />
              <span>Lưu giao dịch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellModal;
