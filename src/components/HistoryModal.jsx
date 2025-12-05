import { X, Clock, Calendar } from "lucide-react";

const HistoryModal = ({ show, onClose, account, transactions }) => {
  if (!show) return null;

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "expired":
        return "Hết hạn";
      case "returned":
        return "Đã trả";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Lịch Sử Giao Dịch</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Tài khoản: {account?.customFields?.["Tên"]}
          </h3>

          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Chưa có giao dịch nào
            </p>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {tx.buyerName}
                      </h4>
                      <p className="text-sm text-gray-600">{tx.buyerContact}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        tx.status
                      )}`}
                    >
                      {getStatusText(tx.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Số tiền:</span>
                      <span className="ml-2 font-medium">
                        {tx.amount.toLocaleString()} {tx.currency}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Thời hạn:</span>
                      <span className="ml-2 font-medium">
                        {tx.duration} tháng
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Đăng ký:</span>
                      <span className="ml-2 font-medium">
                        {new Date(tx.registrationDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Hết hạn:</span>
                      <span className="ml-2 font-medium">
                        {new Date(tx.expirationDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-sm text-gray-600">Apps:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tx.apps.map((app) => (
                        <span
                          key={app}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>

                  {tx.notes && (
                    <p className="text-sm text-gray-600 mb-3">
                      Ghi chú: {tx.notes}
                    </p>
                  )}

                  {/* History Timeline */}
                  {tx.history && tx.history.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Lịch sử thay đổi:
                      </h5>
                      <div className="space-y-2">
                        {tx.history.map((h, idx) => (
                          <div
                            key={idx}
                            className={`text-xs flex items-start gap-2 p-2 rounded ${
                              h.action === "extended"
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-600"
                            }`}
                          >
                            {h.action === "extended" ? (
                              <Calendar
                                size={12}
                                className="mt-0.5 flex-shrink-0"
                              />
                            ) : (
                              <Clock
                                size={12}
                                className="mt-0.5 flex-shrink-0"
                              />
                            )}
                            <div>
                              <span className="font-medium">
                                {new Date(h.timestamp).toLocaleString("vi-VN")}
                              </span>
                              <span className="mx-1">-</span>
                              <span>{h.notes}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
