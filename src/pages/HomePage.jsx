import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { accountService } from "../services/accountService";
import { userService } from "../services/userService";
import {
  Plus,
  Settings,
  Users,
  Globe,
  Columns,
  Image,
  FileText,
  Search,
  Filter,
  ChevronRight,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Minus,
  Package,
  Download,
  Upload,
  LayoutGrid,
  List,
} from "lucide-react";
import toast from "react-hot-toast";
import { exportToJSON, importFromJSON } from "../utils/importExport";

const HomePage = () => {
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [viewMode, setViewMode] = useState("card"); // "card" or "list"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createProfileName, setCreateProfileName] = useState("");
  const [createProfileUser, setCreateProfileUser] = useState("");
  const [studentGmails, setStudentGmails] = useState([""]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [searchText, selectedUser, accounts]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsData, usersData] = await Promise.all([
        accountService.getAllAccounts(),
        userService.getAllUsers().catch(() => []),
      ]);

      setAccounts(accountsData);
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = [...accounts];

    if (selectedUser !== "all") {
      filtered = filtered.filter(
        (acc) => acc.userId?._id === selectedUser || acc.userId === selectedUser
      );
    }

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((account) => {
        const name = account.customFields?.["Tên"] || "";
        return name.toLowerCase().includes(searchLower);
      });
    }

    setFilteredAccounts(filtered);
  };

  const handleExport = () => {
    exportToJSON(accounts, "accounts");
    toast.success("✓ Đã xuất dữ liệu");
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

      // Import accounts
      let successCount = 0;
      for (const account of data) {
        try {
          await accountService.createAccount(account);
          successCount++;
        } catch (err) {
          console.error("Error importing account:", err);
        }
      }

      toast.success(`✓ Đã nhập ${successCount}/${data.length} tài khoản`);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Không thể nhập dữ liệu");
    }

    e.target.value = "";
  };

  const handleOpenCreateModal = () => {
    if (users.length === 0) {
      toast.error("⚠️ Vui lòng tạo User trước!");
      return;
    }
    setCreateProfileUser(users[0]._id);
    setCreateProfileName("");
    setStudentGmails([""]);
    setShowCreateModal(true);
  };

  const handleCreateProfile = async () => {
    if (!createProfileName.trim()) {
      toast.error("⚠️ Vui lòng nhập tên profile!");
      return;
    }

    if (!createProfileUser) {
      toast.error("⚠️ Vui lòng chọn User quản lý!");
      return;
    }

    try {
      const newAccount = {
        name: createProfileName,
        userId: createProfileUser,
        personalGmail: "",
        studentGmail: "",
        studentGmails: studentGmails.filter(email => email.trim() !== ""),
        commonPassword: "",
        email: "",
        username: "",
        password: "",
        phoneNumber: "",
        ssn: "",
        dateOfBirth: "",
        customFields: {},
      };
      const created = await accountService.createAccount(newAccount);
      setAccounts((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setCreateProfileName("");
      setStudentGmails([""]);
      toast.success("✓ Đã tạo profile mới!");
    } catch (err) {
      toast.error("Không thể tạo profile: " + err.message);
    }
  };

  const addStudentGmail = () => {
    setStudentGmails([...studentGmails, ""]);
  };

  const removeStudentGmail = (index) => {
    setStudentGmails(studentGmails.filter((_, i) => i !== index));
  };

  const updateStudentGmail = (index, value) => {
    const updated = [...studentGmails];
    updated[index] = value;
    setStudentGmails(updated);
  };

  const getUserById = (userId) => {
    if (typeof userId === "object") {
      return users.find((u) => u._id === userId._id);
    }
    return users.find((u) => u._id === userId);
  };

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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                MMO Account Manager
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredAccounts.length} / {accounts.length} profiles
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/columns")}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                title="Quản lý cột"
              >
                <Columns size={18} />
                <span className="hidden sm:inline">Cột</span>
              </button>

              <button
                onClick={() => navigate("/inventory")}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-300 text-green-700 rounded-md hover:bg-green-100 transition"
                title="Quản lý Kho"
              >
                <Package size={18} />
                <span className="hidden sm:inline">Kho</span>
              </button>

              <button
                onClick={() => navigate("/proxies")}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                title="Quản lý Proxy"
              >
                <Globe size={18} />
                <span className="hidden sm:inline">Proxy</span>
              </button>

              <button
                onClick={() => navigate("/media")}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                title="Quản lý Media"
              >
                <Image size={18} />
                <span className="hidden sm:inline">Media</span>
              </button>

              <button
                onClick={() => navigate("/keys")}
                className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-300 text-purple-700 rounded-md hover:bg-purple-100 transition"
                title="Quản lý Key"
              >
                <FileText size={18} />
                <span className="hidden sm:inline">Key</span>
              </button>

              <button
                onClick={() => navigate("/paystub")}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                title="Paystub Editor"
              >
                <FileText size={18} />
                <span className="hidden sm:inline">Paystub</span>
              </button>

              <button
                onClick={() => navigate("/settings")}
                className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-300 text-purple-700 rounded-md hover:bg-purple-100 transition"
                title="Cài đặt AI"
              >
                <span className="text-lg">⚙️</span>
                <span className="hidden sm:inline">Settings</span>
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
              >
                <Plus size={18} />
                <span>Thêm Profile</span>
              </button>

              <div className="flex items-center gap-2 border-l border-gray-300 pl-2 ml-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-100 transition"
                  title="Xuất dữ liệu"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Xuất</span>
                </button>

                <label
                  className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-300 text-green-700 rounded-md hover:bg-green-100 transition cursor-pointer"
                  title="Nhập dữ liệu"
                >
                  <Upload size={18} />
                  <span className="hidden sm:inline">Nhập</span>
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

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên profile..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* User Filter */}
            <div className="sm:w-64 relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none"
              >
                <option value="all">Tất cả users</option>
                {users.map((user) => {
                  const count = accounts.filter(
                    (acc) =>
                      acc.userId?._id === user._id || acc.userId === user._id
                  ).length;
                  return (
                    <option key={user._id} value={user._id}>
                      {user.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("card")}
                className={`px-3 py-2 transition ${
                  viewMode === "card"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                title="Xem dạng thẻ"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 transition ${
                  viewMode === "list"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                title="Xem dạng danh sách"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid or List View */}
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <p className="text-gray-600 text-lg">
              {searchText || selectedUser !== "all"
                ? "Không tìm thấy profile nào"
                : "Chưa có profile nào"}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {!(searchText || selectedUser !== "all") &&
                'Click "Thêm Profile" để bắt đầu'}
            </p>
          </div>
        ) : viewMode === "list" ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên Profile
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Proxy
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAccounts.map((account) => {
                  const user = getUserById(account.userId);
                  const profileName =
                    account.customFields?.["Tên"] || "Chưa đặt tên";

                  return (
                    <tr
                      key={account._id}
                      onClick={() => navigate(`/account/${account._id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {profileName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {user && (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: user.color }}
                            />
                            <span className="text-sm text-gray-600">
                              {user.name}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe size={14} />
                          <span>
                            {account.proxy
                              ? `${account.proxy.ip}:${account.proxy.port}`
                              : "No proxy"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(account.customFields || {}).map(
                            ([key, value]) => {
                              if (value === "Thành công") {
                                return (
                                  <span
                                    key={key}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs"
                                  >
                                    <CheckCircle size={10} />
                                    {key}
                                  </span>
                                );
                              }
                              if (value === "Thất bại") {
                                return (
                                  <span
                                    key={key}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs"
                                  >
                                    <XCircle size={10} />
                                    {key}
                                  </span>
                                );
                              }
                              if (value === "Chưa làm") {
                                return (
                                  <span
                                    key={key}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded text-xs"
                                  >
                                    <Clock size={10} />
                                    {key}
                                  </span>
                                );
                              }
                              if (value === "Đã bán") {
                                return (
                                  <span
                                    key={key}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                                  >
                                    <Package size={10} />
                                    {key}
                                  </span>
                                );
                              }
                              return null;
                            }
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">
                        {new Date(account.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAccounts.map((account) => {
              const user = getUserById(account.userId);
              const profileName =
                account.customFields?.["Tên"] || "Chưa đặt tên";

              return (
                <div
                  key={account._id}
                  className="bg-white rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-md transition cursor-pointer group"
                  onClick={() => navigate(`/account/${account._id}`)}
                >
                  <div className="p-5">
                    {/* User Badge */}
                    {user && (
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: user.color }}
                        />
                        <span className="text-xs text-gray-500 font-medium">
                          {user.name}
                        </span>
                      </div>
                    )}

                    {/* Profile Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {profileName}
                    </h3>

                    {/* Proxy Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Globe size={14} />
                      <span className="truncate">
                        {account.proxy
                          ? `${account.proxy.ip}:${account.proxy.port}`
                          : "No proxy"}
                      </span>
                    </div>

                    {/* App Status */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(account.customFields || {}).map(
                        ([key, value]) => {
                          if (value === "Thành công") {
                            return (
                              <div
                                key={key}
                                className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
                              >
                                <CheckCircle size={12} />
                                <span>{key}</span>
                              </div>
                            );
                          }
                          if (value === "Thất bại") {
                            return (
                              <div
                                key={key}
                                className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs"
                              >
                                <XCircle size={12} />
                                <span>{key}</span>
                              </div>
                            );
                          }
                          if (value === "Chưa làm") {
                            return (
                              <div
                                key={key}
                                className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs"
                              >
                                <Clock size={12} />
                                <span>{key}</span>
                              </div>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {new Date(account.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                      <ChevronRight
                        size={18}
                        className="text-gray-400 group-hover:text-gray-900 transition"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Action Button - User Management */}
      <button
        onClick={() => {
          // TODO: Open user management modal
          toast.info("Đang phát triển...");
        }}
        className="fixed bottom-6 right-6 p-4 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition"
        title="Quản lý Users"
      >
        <Users size={24} />
      </button>

      {/* Create Profile Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b px-6 py-4 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                Tạo Profile Mới
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Quản Lý
                </label>
                <select
                  value={createProfileUser}
                  onChange={(e) => setCreateProfileUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Profile <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createProfileName}
                  onChange={(e) => setCreateProfileName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCreateProfile();
                    }
                  }}
                  placeholder="Nhập tên profile..."
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mail Cá Nhân
                  </label>
                  <input
                    type="email"
                    placeholder="personal@gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật Khẩu Dùng Chung
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mail Sinh Viên
                  <button
                    type="button"
                    onClick={addStudentGmail}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    + Thêm
                  </button>
                </label>
                {studentGmails.map((email, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateStudentGmail(index, e.target.value)}
                      placeholder="student@edu.com"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    {studentGmails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStudentGmail(index)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                      >
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SSN
                  </label>
                  <input
                    type="text"
                    placeholder="XXX-XX-XXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày Sinh
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Trạng Thái Dịch Vụ</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">GitHub</label>
                    <select className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900">
                      <option value="">--</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Gemini</label>
                    <select className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900">
                      <option value="">--</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Canva</label>
                    <select className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900">
                      <option value="">--</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Figma</label>
                    <select className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900">
                      <option value="">--</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">ChatGPT</label>
                    <select className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900">
                      <option value="">--</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cursor</label>
                    <select className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900">
                      <option value="">--</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Azure</label>
                    <select className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900">
                      <option value="">--</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                💡 Các trường này có thể được tự động sinh bởi AI Profile Generator
              </p>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateProfileName("");
                  setStudentGmails([""]);
                }}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateProfile}
                className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
              >
                Tạo Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
