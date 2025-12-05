import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ShoppingCart,
  FileText,
  Calendar,
  Clock,
  Key as KeyIcon,
  User,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { categoryService } from "../services/categoryService";
import { keyService } from "../services/keyService";
import { KeyModal, SellKeyModal, InvoiceModal } from "../components/KeyModals";

const CategoryDetailPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("in_stock");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [showPasswords, setShowPasswords] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [expirationFilter, setExpirationFilter] = useState("all");

  const userId = "674daf3084e471762c58f869"; // In production, get from auth

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoryData, keysData] = await Promise.all([
        categoryService.getCategoryById(categoryId),
        keyService.getAllKeys(),
      ]);
      setCategory(categoryData);
      setKeys(keysData.filter((k) => k.categoryId?._id === categoryId));
    } catch (err) {
      toast.error("Không thể tải dữ liệu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa?")) return;
    try {
      await keyService.deleteKey(id);
      toast.success("Đã xóa thành công");
      fetchData();
    } catch (err) {
      toast.error("Có lỗi xảy ra khi xóa");
    }
  };

  const handleRestock = async (id) => {
    if (!window.confirm("Thu hồi về kho?")) return;
    try {
      await keyService.updateKey(id, { status: "in_stock" });
      toast.success("Đã thu hồi về kho");
      fetchData();
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleSell = (key) => {
    setSelectedKey(key);
    setShowSellModal(true);
  };

  const handleViewInvoice = (key) => {
    setSelectedKey(key);
    setShowInvoiceModal(true);
  };

  const togglePasswordVisibility = (keyId) => {
    setShowPasswords((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const getDaysRemaining = (expirationDate) => {
    if (!expirationDate) return null;
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationColor = (expirationDate) => {
    const days = getDaysRemaining(expirationDate);
    if (days === null) return "text-gray-600";
    if (days <= 0) return "text-red-600 font-semibold";
    if (days <= 2) return "text-red-600 font-medium";
    if (days <= 7) return "text-yellow-600 font-medium";
    return "text-green-600";
  };

  const isAccountType = category?.type === "account";
  const inStockCount = keys.filter((k) => k.status === "in_stock").length;
  const soldCount = keys.filter((k) => k.status === "sold").length;

  const filteredKeys = keys
    .filter((key) => {
      // Filter by tab (in_stock/sold)
      const matchTab =
        activeTab === "in_stock"
          ? key.status === "in_stock"
          : key.status === "sold";

      // Filter by status dropdown
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "in_stock" && key.status === "in_stock") ||
        (statusFilter === "sold" && key.status === "sold");

      // Filter by expiration
      let matchExpiration = true;
      if (isAccountType && expirationFilter !== "all" && key.expirationDate) {
        const days = getDaysRemaining(key.expirationDate);
        if (expirationFilter === "active" && days <= 0) matchExpiration = false;
        if (expirationFilter === "expiring" && (days > 7 || days <= 0))
          matchExpiration = false;
        if (expirationFilter === "expired" && days > 0) matchExpiration = false;
      }

      // Search text filter
      const matchSearch =
        !searchText ||
        key.keyCode?.toLowerCase().includes(searchText.toLowerCase()) ||
        key.username?.toLowerCase().includes(searchText.toLowerCase());

      return matchTab && matchStatus && matchExpiration && matchSearch;
    })
    .sort((a, b) => {
      // Sắp xếp theo ngày hết hạn cho account type
      if (isAccountType && a.expirationDate && b.expirationDate) {
        const daysA = getDaysRemaining(a.expirationDate);
        const daysB = getDaysRemaining(b.expirationDate);
        // Sắp xếp: hết hạn/sắp hết hạn lên đầu
        return daysA - daysB;
      }
      // Mặc định sắp xếp theo ngày tạo mới nhất
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 mb-4">Không tìm thấy danh mục</p>
        <button
          onClick={() => navigate("/keys")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Quay Lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/keys")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Quay Lại</span>
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div
                className="w-16 h-16 rounded-lg flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 break-words">
                  {category.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {category.type === "key"
                    ? "Danh mục Key"
                    : "Danh mục Tài khoản"}
                </p>
                {category.description && (
                  <p className="text-sm text-gray-500 mt-1 break-words line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus size={18} />
              <span>{isAccountType ? "Thêm Tài Khoản" : "Thêm Key"}</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tồn Kho</p>
                  <p className="text-2xl font-bold text-green-600">
                    {inStockCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  {isAccountType ? (
                    <User className="text-green-600" size={24} />
                  ) : (
                    <KeyIcon className="text-green-600" size={24} />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Đã Bán</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {soldCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("in_stock")}
                className={`px-6 py-3 font-medium ${
                  activeTab === "in_stock"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tồn Kho ({inStockCount})
              </button>
              <button
                onClick={() => setActiveTab("sold")}
                className={`px-6 py-3 font-medium ${
                  activeTab === "sold"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Đã Bán ({soldCount})
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <input
              type="text"
              placeholder={
                isAccountType
                  ? "Tìm kiếm theo username..."
                  : "Tìm kiếm theo key code..."
              }
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Trạng thái
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="in_stock">Tồn kho</option>
                  <option value="sold">Đã bán</option>
                </select>
              </div>

              {isAccountType && (
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tình trạng hết hạn
                  </label>
                  <select
                    value={expirationFilter}
                    onChange={(e) => setExpirationFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tất cả</option>
                    <option value="active">Còn hạn</option>
                    <option value="expiring">Sắp hết (≤7 ngày)</option>
                    <option value="expired">Đã hết hạn</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          {filteredKeys.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {isAccountType ? (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Username
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Password
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Ngày Tạo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Hết Hạn
                        </th>
                      </>
                    ) : (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Key Code
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Giá
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày Tạo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredKeys.map((key) => (
                    <tr key={key._id} className="hover:bg-gray-50">
                      {isAccountType ? (
                        <>
                          <td className="px-4 py-3 max-w-[200px]">
                            <div className="flex items-center gap-2">
                              <User
                                size={16}
                                className="text-gray-400 flex-shrink-0"
                              />
                              <span className="font-medium text-gray-900 break-all">
                                {key.username}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-[200px]">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-gray-600 break-all">
                                {showPasswords[key._id]
                                  ? key.password
                                  : "••••••••"}
                              </span>
                              <button
                                onClick={() =>
                                  togglePasswordVisibility(key._id)
                                }
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showPasswords[key._id] ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {key.createdDate
                              ? new Date(key.createdDate).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {key.expirationDate ? (
                              <div className="flex flex-col">
                                <span
                                  className={`text-sm ${getExpirationColor(
                                    key.expirationDate
                                  )}`}
                                >
                                  {new Date(
                                    key.expirationDate
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                                {(() => {
                                  const days = getDaysRemaining(
                                    key.expirationDate
                                  );
                                  if (days <= 0) {
                                    return (
                                      <span className="text-xs text-red-600 font-medium">
                                        Đã hết hạn
                                      </span>
                                    );
                                  } else if (days <= 7) {
                                    return (
                                      <span className="text-xs text-yellow-600 font-medium">
                                        Còn {days} ngày
                                      </span>
                                    );
                                  }
                                  return (
                                    <span className="text-xs text-gray-500">
                                      Còn {days} ngày
                                    </span>
                                  );
                                })()}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                        </>
                      ) : (
                        <td className="px-4 py-3 max-w-xs">
                          <div className="flex items-center gap-2">
                            <KeyIcon
                              size={16}
                              className="text-gray-400 flex-shrink-0"
                            />
                            <span className="font-mono text-sm text-gray-900 break-all">
                              {key.keyCode}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {key.price?.toLocaleString() || 0}{" "}
                        {key.currency || "VND"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(key.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {key.status === "in_stock" ? (
                            <>
                              <button
                                onClick={() => handleSell(key)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Bán"
                              >
                                <ShoppingCart size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(key._id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Xóa"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleViewInvoice(key)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Xem hóa đơn"
                              >
                                <FileText size={18} />
                              </button>
                              <button
                                onClick={() => handleRestock(key._id)}
                                className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                                title="Thu hồi về kho"
                              >
                                <RotateCcw size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                {isAccountType ? (
                  <User className="text-gray-400" size={32} />
                ) : (
                  <KeyIcon className="text-gray-400" size={32} />
                )}
              </div>
              <p className="text-gray-500 text-lg">
                {searchText
                  ? "Không tìm thấy kết quả nào"
                  : activeTab === "in_stock"
                  ? `Chưa có ${isAccountType ? "tài khoản" : "key"} trong kho`
                  : `Chưa có ${
                      isAccountType ? "tài khoản" : "key"
                    } nào được bán`}
              </p>
              {!searchText && activeTab === "in_stock" && (
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus size={18} />
                  <span>
                    {isAccountType
                      ? "Thêm Tài Khoản Đầu Tiên"
                      : "Thêm Key Đầu Tiên"}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <KeyModal
        show={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        userId={userId}
        categories={[category]}
        onSuccess={fetchData}
      />

      <SellKeyModal
        show={showSellModal}
        onClose={() => {
          setShowSellModal(false);
          setSelectedKey(null);
        }}
        selectedKey={selectedKey}
        userId={userId}
        onSuccess={fetchData}
      />

      <InvoiceModal
        show={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setSelectedKey(null);
        }}
        selectedKey={selectedKey}
      />
    </div>
  );
};

export default CategoryDetailPage;
