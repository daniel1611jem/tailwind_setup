import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  FolderPlus,
  Package,
  DollarSign,
  Search,
  Filter,
  Tag,
  Key as KeyIcon,
  Edit2,
  Trash2,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { categoryService } from "../services/categoryService";
import { keyService } from "../services/keyService";
import { userService } from "../services/userService";
import {
  CategoryModal,
  KeyModal,
  SellKeyModal,
  InvoiceModal,
} from "../components/KeyModals";

const KeyManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("categories"); // categories, keys, sold

  // Data states
  const [categories, setCategories] = useState([]);
  const [keys, setKeys] = useState([]);
  const [users, setUsers] = useState([]);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");
  const [categoryTypeFilter, setCategoryTypeFilter] = useState("all");

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, keysData, usersData] = await Promise.all([
        categoryService.getAllCategories(),
        keyService.getAllKeys(),
        userService.getAllUsers().catch(() => []),
      ]);

      setCategories(categoriesData);
      setKeys(keysData);
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      try {
        await categoryService.deleteCategory(id);
        toast.success("Đã xóa danh mục");
        fetchData();
      } catch (err) {
        toast.error("Không thể xóa danh mục");
      }
    }
  };

  const handleDeleteKey = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa key này?")) {
      try {
        await keyService.deleteKey(id);
        toast.success("Đã xóa key");
        fetchData();
      } catch (err) {
        toast.error("Không thể xóa key");
      }
    }
  };

  const handleSellKey = (key) => {
    setSelectedKey(key);
    setShowSellModal(true);
  };

  const handleViewInvoice = (key) => {
    setSelectedKey(key);
    setShowInvoiceModal(true);
  };

  const filteredKeys = keys.filter((key) => {
    const matchSearch = key.keyCode
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchCategory =
      selectedCategory === "all" || key.categoryId?._id === selectedCategory;
    const matchUser =
      selectedUser === "all" || key.userId?._id === selectedUser;

    if (activeTab === "keys") {
      return (
        matchSearch && matchCategory && matchUser && key.status === "in_stock"
      );
    } else if (activeTab === "sold") {
      return matchSearch && matchCategory && matchUser && key.status === "sold";
    }
    return false;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600 mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft size={20} />
              <span>Quay lại</span>
            </button>

            <h1 className="text-xl font-bold text-gray-900">Quản Lý Key</h1>

            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === "categories"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FolderPlus size={20} />
              <span>Danh Mục</span>
            </button>
            <button
              onClick={() => setActiveTab("keys")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === "keys"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Package size={20} />
              <span>
                Tồn Kho ({keys.filter((k) => k.status === "in_stock").length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("sold")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === "sold"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <DollarSign size={20} />
              <span>
                Đã Bán ({keys.filter((k) => k.status === "sold").length})
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Categories Tab */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                {/* Actions & Filters */}
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowCategoryModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    <Plus size={18} />
                    <span>Thêm Danh Mục</span>
                  </button>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Tìm kiếm danh mục..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-48">
                      <select
                        value={categoryTypeFilter}
                        onChange={(e) => setCategoryTypeFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Tất cả loại</option>
                        <option value="key">Key</option>
                        <option value="account">Tài khoản</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Categories List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Danh Mục
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories
                      .filter((category) => {
                        const matchSearch =
                          !searchText ||
                          category.name
                            .toLowerCase()
                            .includes(searchText.toLowerCase()) ||
                          category.description
                            ?.toLowerCase()
                            .includes(searchText.toLowerCase());
                        const matchType =
                          categoryTypeFilter === "all" ||
                          category.type === categoryTypeFilter;
                        return matchSearch && matchType;
                      })
                      .map((category) => {
                        const categoryKeys = keys.filter(
                          (k) => k.categoryId?._id === category._id
                        );
                        const inStock = categoryKeys.filter(
                          (k) => k.status === "in_stock"
                        ).length;
                        const sold = categoryKeys.filter(
                          (k) => k.status === "sold"
                        ).length;

                        return (
                          <div
                            key={category._id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                            onClick={() =>
                              (window.location.href = `/category/${category._id}`)
                            }
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div
                                  className="w-4 h-4 rounded flex-shrink-0"
                                  style={{ backgroundColor: category.color }}
                                />
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {category.name}
                                </h4>
                              </div>
                              <div
                                className="flex gap-1 flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    setEditingItem(category);
                                    setShowCategoryModal(true);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteCategory(category._id)
                                  }
                                  className="p-1 text-gray-400 hover:text-red-600 transition"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="mb-2">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  category.type === "key"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {category.type === "key" ? "Key" : "Tài khoản"}
                              </span>
                            </div>
                            {category.description && (
                              <p className="text-sm text-gray-600 mb-3 break-words overflow-hidden line-clamp-2">
                                {category.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-sm border-t pt-3">
                              <div className="text-green-600 font-medium">
                                Tồn: {inStock}
                              </div>
                              <div className="text-blue-600 font-medium">
                                Bán: {sold}
                              </div>
                              <div className="text-gray-600 font-medium">
                                Tổng: {categoryKeys.length}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Keys & Sold Tabs */}
            {(activeTab === "keys" || activeTab === "sold") && (
              <div className="space-y-4">
                {/* Actions & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  {activeTab === "keys" && (
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setShowKeyModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      <Plus size={18} />
                      <span>Thêm Key</span>
                    </button>
                  )}

                  <div className="flex-1 flex gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Tìm kiếm key..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Category Filter */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tất cả danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Keys Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Key Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Danh Mục
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Giá
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Ngày Tạo
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Thao Tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredKeys.map((key) => (
                        <tr key={key._id} className="hover:bg-gray-50">
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
                          <td className="px-4 py-3 max-w-[150px]">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded flex-shrink-0"
                                style={{
                                  backgroundColor: key.categoryId?.color,
                                }}
                              />
                              <span className="text-sm text-gray-600 truncate">
                                {key.categoryId?.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {key.price?.toLocaleString() || 0}{" "}
                            {key.currency || "VND"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(key.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {activeTab === "keys" ? (
                                <>
                                  <button
                                    onClick={() => handleSellKey(key)}
                                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                                  >
                                    <DollarSign size={14} />
                                    <span>Bán</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteKey(key._id)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleViewInvoice(key)}
                                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                                >
                                  <FileText size={14} />
                                  <span>Hóa Đơn</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredKeys.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    {searchText || selectedCategory !== "all"
                      ? "Không tìm thấy key nào"
                      : activeTab === "keys"
                      ? "Chưa có key trong kho"
                      : "Chưa có key nào được bán"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CategoryModal
        show={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        userId={users[0]?._id} // In production, get from auth
        onSuccess={fetchData}
      />

      <KeyModal
        show={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        userId={users[0]?._id} // In production, get from auth
        categories={categories}
        onSuccess={fetchData}
      />

      <SellKeyModal
        show={showSellModal}
        onClose={() => {
          setShowSellModal(false);
          setSelectedKey(null);
        }}
        selectedKey={selectedKey}
        userId={users[0]?._id} // In production, get from auth
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

export default KeyManager;
