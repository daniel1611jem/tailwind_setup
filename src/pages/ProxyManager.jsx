import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { proxyService } from "../services/proxyService";
import { userService } from "../services/userService";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Trash2,
  Save,
  X,
  CheckSquare,
  Square,
  Zap,
  Download,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { exportToJSON, importFromJSON } from "../utils/importExport";

const ProxyManager = () => {
  const [proxies, setProxies] = useState([]);
  const [filteredProxies, setFilteredProxies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAssigned, setFilterAssigned] = useState("all");
  const [selectedProxies, setSelectedProxies] = useState([]);
  const [quickInput, setQuickInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProxies();
    fetchUsers();
  }, []);

  useEffect(() => {
    filterProxies();
  }, [proxies, searchText, filterStatus, filterAssigned]);

  const fetchProxies = async () => {
    try {
      setLoading(true);
      const data = await proxyService.getAllProxies();
      setProxies(data);
    } catch (err) {
      console.error("Error fetching proxies:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const filterProxies = () => {
    let filtered = [...proxies];

    // Filter by search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (proxy) =>
          proxy.ip.toLowerCase().includes(searchLower) ||
          proxy.country?.toLowerCase().includes(searchLower) ||
          proxy.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((proxy) => proxy.status === filterStatus);
    }

    // Filter by assignment
    if (filterAssigned === "assigned") {
      filtered = filtered.filter((proxy) => proxy.assignedTo);
    } else if (filterAssigned === "available") {
      filtered = filtered.filter((proxy) => !proxy.assignedTo);
    }

    setFilteredProxies(filtered);
  };

  const handleQuickAdd = async () => {
    if (!quickInput.trim()) return;

    try {
      // Format: ip:port:username:password hoặc ip:port
      const parts = quickInput.split(":");
      if (parts.length < 2) {
        toast.error("Format: ip:port:username:password");
        return;
      }

      const proxyData = {
        ip: parts[0].trim(),
        port: parts[1].trim(),
        username: parts[2]?.trim() || "",
        password: parts[3]?.trim() || "",
        type: "http",
        status: "active",
      };

      await proxyService.createProxy(proxyData);
      toast.success("✓ Đã thêm proxy");
      setQuickInput("");
      fetchProxies();
    } catch (err) {
      toast.error("Lỗi: " + err.message);
    }
  };

  const handleInlineUpdate = async (id, field, value) => {
    try {
      await proxyService.updateProxy(id, { [field]: value });
      fetchProxies();
    } catch (err) {
      toast.error("Không thể cập nhật");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa proxy này?")) {
      try {
        await proxyService.deleteProxy(id);
        fetchProxies();
        setSelectedProxies((prev) => prev.filter((p) => p !== id));
        toast.success("Đã xóa proxy");
      } catch (err) {
        toast.error("Không thể xóa proxy");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProxies.length === 0) {
      toast.error("Chưa chọn proxy nào");
      return;
    }

    if (!window.confirm(`Xóa ${selectedProxies.length} proxy đã chọn?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedProxies.map((id) => proxyService.deleteProxy(id))
      );
      fetchProxies();
      setSelectedProxies([]);
      toast.success(`Đã xóa ${selectedProxies.length} proxy`);
    } catch (err) {
      toast.error("Có lỗi khi xóa");
    }
  };

  const toggleSelectAll = () => {
    if (selectedProxies.length === filteredProxies.length) {
      setSelectedProxies([]);
    } else {
      setSelectedProxies(filteredProxies.map((p) => p._id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedProxies((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    exportToJSON(proxies, "proxies");
    toast.success("✓ Đã xuất danh sách proxy");
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromJSON(file);
      if (!Array.isArray(data)) {
        toast.error("File không đúng định dạng");
        return;
      }

      let successCount = 0;
      for (const proxy of data) {
        try {
          const { _id, ...proxyData } = proxy;
          await proxyService.createProxy(proxyData);
          successCount++;
        } catch (err) {
          console.error("Error importing proxy:", err);
        }
      }

      toast.success(`✓ Đã nhập ${successCount}/${data.length} proxy`);
      fetchProxies();
    } catch (err) {
      toast.error(err.message || "Không thể nhập dữ liệu");
    }

    e.target.value = "";
  };

  const handleAssign = async (proxyId, userId) => {
    try {
      // Find account with this userId
      const accounts = await fetch(`/api/accounts?userId=${userId}`).then((r) =>
        r.json()
      );
      if (accounts.length === 0) {
        toast.error("User chưa có account nào");
        return;
      }
      // Assign to first account of this user
      await proxyService.assignProxy(proxyId, accounts[0]._id);
      fetchProxies();
      toast.success("✓ Đã gán proxy");
    } catch (err) {
      toast.error("Không thể gán proxy");
    }
  };

  const handleUnassign = async (id) => {
    try {
      await proxyService.unassignProxy(id);
      fetchProxies();
      toast.success("✓ Đã hủy gán proxy");
    } catch (err) {
      toast.error("Không thể hủy gán proxy");
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      error: "bg-red-100 text-red-800",
    };
    return colors[status] || colors.inactive;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-2"
              >
                <ArrowLeft size={20} />
                <span>Quay lại</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản Lý Proxy
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredProxies.length} / {proxies.length} proxies
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Zap
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="ip:port:user:pass"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleQuickAdd()}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <button
                onClick={handleQuickAdd}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
              >
                <Plus size={18} />
                <span>Thêm</span>
              </button>

              <div className="flex items-center gap-2 border-l border-gray-300 pl-2 ml-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-100 transition"
                  title="Xuất danh sách"
                >
                  <Download size={18} />
                </button>

                <label
                  className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-300 text-green-700 rounded-md hover:bg-green-100 transition cursor-pointer"
                  title="Nhập danh sách"
                >
                  <Upload size={18} />
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm theo IP, country, notes..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none"
                >
                  <option value="all">Tất cả status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>

            {/* Assignment Filter */}
            <div>
              <select
                value={filterAssigned}
                onChange={(e) => setFilterAssigned(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="all">Tất cả</option>
                <option value="available">Khả dụng</option>
                <option value="assigned">Đã gán</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProxies.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Đã chọn:{" "}
                <span className="font-semibold">{selectedProxies.length}</span>{" "}
                proxy
              </span>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                <Trash2 size={16} />
                <span>Xóa đã chọn</span>
              </button>
            </div>
          )}
        </div>

        {/* Proxy List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-500 hover:text-gray-900"
                  >
                    {selectedProxies.length === filteredProxies.length &&
                    filteredProxies.length > 0 ? (
                      <CheckSquare size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Proxy Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <p className="text-gray-600 mt-2">Đang tải...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProxies.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchText ||
                    filterStatus !== "all" ||
                    filterAssigned !== "all"
                      ? "Không tìm thấy proxy nào"
                      : "Chưa có proxy nào"}
                  </td>
                </tr>
              ) : (
                filteredProxies.map((proxy) => {
                  const isEditing = editingId === proxy._id;
                  return (
                    <tr
                      key={proxy._id}
                      className={`hover:bg-gray-50 transition ${
                        selectedProxies.includes(proxy._id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleSelect(proxy._id)}
                          className="text-gray-500 hover:text-gray-900"
                        >
                          {selectedProxies.includes(proxy._id) ? (
                            <CheckSquare size={18} className="text-gray-900" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {proxy.ip}:{proxy.port}
                        </div>
                        {proxy.username && (
                          <div className="text-xs text-gray-500">
                            {proxy.username}:{proxy.password?.substring(0, 3)}
                            ***
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            defaultValue={proxy.type}
                            onBlur={(e) =>
                              handleInlineUpdate(
                                proxy._id,
                                "type",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="http">HTTP</option>
                            <option value="https">HTTPS</option>
                            <option value="socks4">SOCKS4</option>
                            <option value="socks5">SOCKS5</option>
                          </select>
                        ) : (
                          <span className="text-sm text-gray-900 uppercase font-mono">
                            {proxy.type}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            defaultValue={proxy.country || ""}
                            onBlur={(e) =>
                              handleInlineUpdate(
                                proxy._id,
                                "country",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="VN"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">
                            {proxy.country || "-"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            defaultValue={proxy.status}
                            onBlur={(e) =>
                              handleInlineUpdate(
                                proxy._id,
                                "status",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="error">Error</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 inline-flex text-xs font-medium rounded ${
                              proxy.status === "active"
                                ? "bg-gray-900 text-white"
                                : proxy.status === "inactive"
                                ? "bg-gray-200 text-gray-600"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {proxy.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {proxy.assignedTo ? (
                          <div>
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    users.find(
                                      (u) => u._id === proxy.assignedTo
                                    )?.color || "#6B7280",
                                }}
                              ></span>
                              <span className="text-gray-900">
                                {users.find((u) => u._id === proxy.assignedTo)
                                  ?.name || "Unknown"}
                              </span>
                            </div>
                            <button
                              onClick={() => handleUnassign(proxy._id)}
                              className="text-xs text-gray-600 hover:text-gray-900 mt-1 block"
                            >
                              Hủy gán
                            </button>
                          </div>
                        ) : (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssign(proxy._id, e.target.value);
                              }
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-600"
                            defaultValue=""
                          >
                            <option value="">Chọn user...</option>
                            {users.map((user) => (
                              <option key={user._id} value={user._id}>
                                {user.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            defaultValue={proxy.notes || ""}
                            onBlur={(e) =>
                              handleInlineUpdate(
                                proxy._id,
                                "notes",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Ghi chú..."
                          />
                        ) : (
                          <span className="text-sm text-gray-600">
                            {proxy.notes || "-"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {isEditing ? (
                          <button
                            onClick={() => setEditingId(null)}
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-900 mr-3"
                          >
                            <Save size={14} />
                            <span>Xong</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingId(proxy._id)}
                            className="text-gray-400 hover:text-gray-900 mr-3"
                          >
                            ✏️
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(proxy._id)}
                          className="text-red-400 hover:text-red-900"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProxyManager;
