import { useState, useEffect } from "react";
import { X, Calendar, Clock } from "lucide-react";

function ExtendModal({ show, onClose, transaction, onExtend }) {
  const [form, setForm] = useState({
    duration: "1",
    notes: "",
  });

  const [newExpirationDate, setNewExpirationDate] = useState("");

  useEffect(() => {
    if (transaction?.expirationDate && form.duration) {
      const currentExpiration = new Date(transaction.expirationDate);
      const newExpiration = new Date(currentExpiration);
      newExpiration.setMonth(
        newExpiration.getMonth() + parseInt(form.duration)
      );
      setNewExpirationDate(newExpiration.toISOString().split("T")[0]);
    }
  }, [transaction, form.duration]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onExtend(parseInt(form.duration), form.notes);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Gia hạn tài khoản</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Current Info */}
          <div className="bg-blue-50 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Người mua:</span>
              <span className="font-medium">{transaction?.buyerName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Thời hạn hiện tại:</span>
              <span className="font-medium">{transaction?.duration} tháng</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Ngày hết hạn:</span>
              <span className="font-medium">
                {transaction?.expirationDate
                  ? new Date(transaction.expirationDate).toLocaleDateString(
                      "vi-VN"
                    )
                  : "Chưa có"}
              </span>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock size={16} className="inline mr-1" />
              Gia hạn thêm
            </label>
            <select
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="1">1 tháng</option>
              <option value="2">2 tháng</option>
              <option value="3">3 tháng</option>
              <option value="6">6 tháng</option>
              <option value="12">12 tháng</option>
            </select>
          </div>

          {/* New Expiration Preview */}
          {newExpirationDate && (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Ngày hết hạn mới:
                </span>
                <span className="font-semibold text-green-700">
                  {new Date(newExpirationDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Nhập ghi chú về việc gia hạn..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Gia hạn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExtendModal;
