import { X, Save, Calendar } from "lucide-react";

const StatusModal = ({
  show,
  onClose,
  account,
  transaction,
  statusForm,
  setStatusForm,
  onSubmit,
  onOpenExtendModal,
}) => {
  if (!show || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Thay Đổi Trạng Thái
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
            <p className="text-sm text-gray-600">
              Người mua: {transaction.buyerName}
            </p>
            {transaction.expirationDate && (
              <p className="text-sm text-gray-600 mt-1">
                Hết hạn:{" "}
                {new Date(transaction.expirationDate).toLocaleDateString(
                  "vi-VN"
                )}
              </p>
            )}
          </div>

          {/* Extend Button */}
          {onOpenExtendModal && transaction.status === "active" && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <button
                type="button"
                onClick={onOpenExtendModal}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                <Calendar size={18} />
                <span>Gia hạn tài khoản</span>
              </button>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hành động
            </label>
            <select
              value={statusForm.action}
              onChange={(e) =>
                setStatusForm({ ...statusForm, action: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="status_changed">Thay đổi trạng thái</option>
              <option value="returned">Đổi trả</option>
              <option value="refunded">Hoàn tiền</option>
              <option value="exchanged">Đổi tài khoản khác</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái mới
            </label>
            <select
              value={statusForm.status}
              onChange={(e) =>
                setStatusForm({ ...statusForm, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Đang hoạt động</option>
              <option value="expired">Hết hạn</option>
              <option value="returned">Đã trả</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={statusForm.notes}
              onChange={(e) =>
                setStatusForm({ ...statusForm, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Lý do thay đổi..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              <Save size={18} />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusModal;
