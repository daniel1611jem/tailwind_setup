import { useState, useEffect } from "react";
import { X, Save, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { categoryService } from "../services/categoryService";
import { keyService } from "../services/keyService";
import { keySaleService } from "../services/keySaleService";

// Category Modal
export const CategoryModal = ({
  show,
  onClose,
  editingItem,
  userId,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    type: "key",
  });

  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name || "",
        description: editingItem.description || "",
        color: editingItem.color || "#3B82F6",
        type: editingItem.type || "key",
      });
    } else {
      setForm({ name: "", description: "", color: "#3B82F6", type: "key" });
    }
  }, [editingItem, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await categoryService.updateCategory(editingItem._id, form);
        toast.success("Đã cập nhật danh mục");
      } else {
        await categoryService.createCategory({ ...form, userId });
        toast.success("Đã tạo danh mục mới");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {editingItem ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Danh Mục *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="key">Key</option>
              <option value="account">Tài Khoản</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô Tả
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-24 overflow-y-auto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Màu Sắc
            </label>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Save size={18} />
              <span>{editingItem ? "Cập Nhật" : "Tạo Mới"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Key Modal
export const KeyModal = ({ show, onClose, userId, categories, onSuccess }) => {
  const [form, setForm] = useState({
    categoryId: "",
    price: "",
    currency: "VND",
    keys: "",
    // Account fields
    accounts: "",
    createdDate: new Date().toISOString().split("T")[0],
    duration: "",
    notes: "",
  });

  // Auto-select category if only one (from CategoryDetailPage)
  useEffect(() => {
    if (show && categories.length === 1) {
      const shouldAutoSelect =
        !form.categoryId || form.categoryId !== categories[0]._id;
      if (shouldAutoSelect) {
        console.log("Auto-selecting category:", categories[0]);
        setForm((prev) => ({
          ...prev,
          categoryId: categories[0]._id,
        }));
      }
    }
  }, [show, categories]);

  // Calculate selected category and type
  const selectedCategory = categories.find((c) => c._id === form.categoryId);
  // Default to "key" if type is not specified (for backward compatibility)
  const isAccountType = selectedCategory?.type === "account";

  useEffect(() => {
    if (!show) {
      setForm({
        categoryId: "",
        price: "",
        currency: "VND",
        keys: "",
        accounts: "",
        createdDate: new Date().toISOString().split("T")[0],
        duration: "",
        notes: "",
      });
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isAccountType) {
        // Handle account type
        const accountLines = form.accounts
          .split("\n")
          .filter((line) => line.trim());

        if (accountLines.length === 0) {
          toast.error("Vui lòng nhập ít nhất 1 tài khoản");
          return;
        }

        const accountsData = accountLines.map((line) => {
          const [username, password] = line.split("|").map((s) => s.trim());
          if (!username || !password) {
            throw new Error("Format: username|password (mỗi dòng)");
          }

          const createdDate = new Date(form.createdDate);
          const duration = parseInt(form.duration);
          const expirationDate = new Date(createdDate);
          expirationDate.setDate(expirationDate.getDate() + duration);

          return {
            keyCode: `${username}`, // Use username as keyCode for display
            username,
            password,
            categoryId: form.categoryId,
            createdDate,
            duration,
            expirationDate,
            notes: form.notes,
            userId,
          };
        });

        await keyService.createKey({ keys: accountsData });
        toast.success(`Đã thêm ${accountLines.length} tài khoản vào kho`);
      } else {
        // Handle key type
        const keyLines = form.keys.split("\n").filter((line) => line.trim());

        if (keyLines.length === 0) {
          toast.error("Vui lòng nhập ít nhất 1 key");
          return;
        }

        const keysData = keyLines.map((keyCode) => ({
          keyCode: keyCode.trim(),
          categoryId: form.categoryId,
          notes: form.notes,
          userId,
        }));

        await keyService.createKey({ keys: keysData });
        toast.success(`Đã thêm ${keyLines.length} key vào kho`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Có lỗi xảy ra"
      );
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h3 className="text-lg font-semibold">
            {isAccountType ? "Thêm Tài Khoản Vào Kho" : "Thêm Key Vào Kho"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh Mục *
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} ({cat.type === "key" ? "Key" : "Tài khoản"})
                  </option>
                ))}
              </select>
            </div>

            {isAccountType ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tài Khoản (username|password, mỗi dòng 1 tài khoản) *
                  </label>
                  <textarea
                    value={form.accounts}
                    onChange={(e) =>
                      setForm({ ...form, accounts: e.target.value })
                    }
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                    placeholder="user1|pass1&#10;user2|pass2&#10;user3|pass3"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tổng:{" "}
                    {
                      form.accounts.split("\n").filter((line) => line.trim())
                        .length
                    }{" "}
                    tài khoản
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày Tạo *
                    </label>
                    <input
                      type="date"
                      value={form.createdDate}
                      onChange={(e) =>
                        setForm({ ...form, createdDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời Hạn (ngày) *
                    </label>
                    <input
                      type="number"
                      value={form.duration}
                      onChange={(e) =>
                        setForm({ ...form, duration: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      placeholder="30"
                      required
                    />
                  </div>
                </div>

                {form.createdDate && form.duration && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Ngày hết hạn:</span>{" "}
                      {new Date(
                        new Date(form.createdDate).getTime() +
                          parseInt(form.duration) * 24 * 60 * 60 * 1000
                      ).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi Chú
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-20 overflow-y-auto"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keys (Mỗi key 1 dòng) *
                  </label>
                  <textarea
                    value={form.keys}
                    onChange={(e) => setForm({ ...form, keys: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                    placeholder="KEY1-XXXX-XXXX-XXXX&#10;KEY2-XXXX-XXXX-XXXX&#10;KEY3-XXXX-XXXX-XXXX"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tổng:{" "}
                    {form.keys.split("\n").filter((line) => line.trim()).length}{" "}
                    keys
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi Chú
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-20 overflow-y-auto"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 p-4 border-t bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus size={18} />
              <span>Thêm Vào Kho</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sell Key Modal
export const SellKeyModal = ({
  show,
  onClose,
  selectedKey,
  userId,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    buyerName: "",
    buyerContact: "",
    buyerEmail: "",
    amount: "",
    paymentMethod: "Chuyển khoản",
    invoiceNumber: "",
    notes: "",
  });

  useEffect(() => {
    if (show && selectedKey) {
      setForm({
        buyerName: "",
        buyerContact: "",
        buyerEmail: "",
        amount: selectedKey.price?.toString() || "",
        paymentMethod: "Chuyển khoản",
        invoiceNumber: "",
        notes: "",
      });
    }
  }, [show, selectedKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await keyService.sellKey(selectedKey._id, {
        ...form,
        amount: parseFloat(form.amount),
        userId,
      });
      toast.success("Đã bán key thành công!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  if (!show || !selectedKey) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Bán Key</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Key Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Key:</span>
                <span className="font-mono font-medium">
                  {selectedKey.keyCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dịch vụ:</span>
                <span className="font-medium">
                  {selectedKey.serviceId?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Danh mục:</span>
                <span className="font-medium">
                  {selectedKey.categoryId?.name}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Người Mua *
            </label>
            <input
              type="text"
              value={form.buyerName}
              onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số Điện Thoại
              </label>
              <input
                type="text"
                value={form.buyerContact}
                onChange={(e) =>
                  setForm({ ...form, buyerContact: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.buyerEmail}
                onChange={(e) =>
                  setForm({ ...form, buyerEmail: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số Tiền (VND) *
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phương Thức
              </label>
              <select
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm({ ...form, paymentMethod: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Ví điện tử">Ví điện tử</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số Hóa Đơn
            </label>
            <input
              type="text"
              value={form.invoiceNumber}
              onChange={(e) =>
                setForm({ ...form, invoiceNumber: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="HD001, INV-2024-001,..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi Chú
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-20 overflow-y-auto"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Xác Nhận Bán
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Invoice Modal
export const InvoiceModal = ({ show, onClose, selectedKey }) => {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && selectedKey) {
      fetchSaleInfo();
    }
  }, [show, selectedKey]);

  const fetchSaleInfo = async () => {
    try {
      setLoading(true);
      const saleData = await keySaleService.getSaleByKey(selectedKey._id);
      setSale(saleData);
    } catch (err) {
      toast.error("Không thể tải thông tin bán hàng");
    } finally {
      setLoading(false);
    }
  };

  if (!show || !selectedKey) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Thông Tin Bán Hàng</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-2">Đang tải...</p>
            </div>
          ) : sale ? (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  HÓA ĐƠN BÁN HÀNG
                </h2>
                {sale.invoiceNumber && (
                  <p className="text-gray-600 mt-1">Số: {sale.invoiceNumber}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Ngày: {new Date(sale.saleDate).toLocaleDateString("vi-VN")}
                </p>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Thông Tin Khách Hàng
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-600">Tên:</span>{" "}
                      <span className="font-medium">{sale.buyerName}</span>
                    </p>
                    {sale.buyerContact && (
                      <p>
                        <span className="text-gray-600">SĐT:</span>{" "}
                        {sale.buyerContact}
                      </p>
                    )}
                    {sale.buyerEmail && (
                      <p>
                        <span className="text-gray-600">Email:</span>{" "}
                        {sale.buyerEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Thông Tin Thanh Toán
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-600">Phương thức:</span>{" "}
                      <span className="font-medium">{sale.paymentMethod}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Số tiền:</span>{" "}
                      <span className="text-lg font-bold text-green-600">
                        {sale.amount.toLocaleString()} {sale.currency}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Thông Tin Sản Phẩm
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Key Code:</span>
                    <span className="font-mono font-medium">
                      {selectedKey.keyCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Danh mục:</span>
                    <span className="font-medium">
                      {selectedKey.categoryId?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá:</span>
                    <span className="font-medium">
                      {selectedKey.price?.toLocaleString() || 0}{" "}
                      {selectedKey.currency || "VND"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {sale.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Ghi Chú</h4>
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                    {sale.notes}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 border-t pt-4">
                <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy thông tin bán hàng
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
