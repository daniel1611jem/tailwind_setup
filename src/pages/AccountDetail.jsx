import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { accountService } from "../services/accountService";
import { columnService } from "../services/columnService";
import {
  ArrowLeft,
  Trash2,
  Save,
  Copy,
  Check,
  Globe,
  User,
  Calendar,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

const AccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [copiedField, setCopiedField] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountData, columnsData] = await Promise.all([
        accountService.getAccountById(id),
        columnService.getAllColumns(),
      ]);

      setAccount(accountData);
      setColumns(columnsData);

      // Initialize edit form
      setEditForm({
        customFields: accountData.customFields || {},
        privateNote: accountData.privateNote || "",
        registrationDates: accountData.registrationDates || {},
        expirationDates: accountData.expirationDates || {},
      });

      setError(null);
    } catch (err) {
      setError("Không thể tải thông tin profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updateData = {
        ...editForm,
        personalGmail: account.personalGmail,
        studentGmail: account.studentGmail,
        studentGmails: account.studentGmails,
        commonPassword: account.commonPassword,
        generatedAccounts: account.generatedAccounts,
        // AI Profile Fields
        fullName: account.fullName,
        age: account.age,
        gender: account.gender,
        address: account.address,
        city: account.city,
        state: account.state,
        zipCode: account.zipCode,
        phoneNumber: account.phoneNumber,
        ssn: account.ssn,
        dateOfBirth: account.dateOfBirth,
        latitude: account.latitude,
        longitude: account.longitude,
        userAgent: account.userAgent,
        // Service Status Fields
        githubStatus: account.githubStatus,
        githubUsername: account.githubUsername,
        githubAccount: account.githubAccount,
        githubPassword: account.githubPassword,
        geminiStatus: account.geminiStatus,
        geminiAccount: account.geminiAccount,
        geminiPassword: account.geminiPassword,
        canvaStatus: account.canvaStatus,
        canvaAccount: account.canvaAccount,
        canvaPassword: account.canvaPassword,
        figmaStatus: account.figmaStatus,
        figmaAccount: account.figmaAccount,
        figmaPassword: account.figmaPassword,
        gptStatus: account.gptStatus,
        gptAccount: account.gptAccount,
        gptPassword: account.gptPassword,
        cursorStatus: account.cursorStatus,
        cursorAccount: account.cursorAccount,
        cursorPassword: account.cursorPassword,
        azureStatus: account.azureStatus,
        azureAccount: account.azureAccount,
        azurePassword: account.azurePassword,
      };
      await accountService.updateAccount(id, updateData);
      setAccount({ ...account, ...editForm });
      setHasChanges(false);
      toast.success("Đã lưu thay đổi");
      fetchData();
    } catch (err) {
      toast.error("Không thể lưu: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc muốn xóa profile này?")) {
      try {
        await accountService.deleteAccount(id);
        toast.success("Đã xóa profile");
        navigate("/");
      } catch (err) {
        toast.error("Không thể xóa profile");
        console.error(err);
      }
    }
  };

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`Đã copy ${fieldName}`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Không thể copy");
    }
  };

  const handleGenerateProfile = async (city, state) => {
    try {
      console.log("🤖 Generating profile with:", {
        proxyId: account.proxy?._id,
        accountId: account._id,
        city,
        state,
      });

      toast.loading("🤖 AI đang sinh profile...");

      const profileData = await accountService.generateProfile(
        account.proxy?._id,
        account._id,
        city,
        state
      );

      console.log("✅ Profile generated:", profileData);

      // ONLY fill AI profile fields, DO NOT touch custom fields
      setAccount({
        ...account,
        fullName: profileData.fullName,
        age: profileData.age,
        gender: profileData.gender,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode,
        phoneNumber: profileData.phoneNumber,
        studentGmail: profileData.studentGmail,
        latitude: profileData.latitude,
        longitude: profileData.longitude,
        userAgent: profileData.userAgent,
      });

      setHasChanges(true);
      setShowLocationModal(false);
      toast.dismiss();
      toast.success("✨ Đã sinh profile thành công!");
    } catch (error) {
      console.error("❌ Generate profile error:", error);
      console.error("Error response:", error.response?.data);
      toast.dismiss();
      toast.error(
        error.response?.data?.message || error.message || "Lỗi sinh profile"
      );
    }
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

  if (error || !account) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-900 mb-4">
            {error || "Không tìm thấy profile"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    );
  }

  const profileName = account.customFields?.["Tên"] || "Chưa đặt tên";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft size={20} />
              <span>Quay lại</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                  hasChanges
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Save size={18} />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profileName}
              </h1>

              {/* User Info */}
              {account.userId && (
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <User size={16} />
                  <span className="text-sm">
                    Quản lý bởi:{" "}
                    <span className="font-medium">{account.userId.name}</span>
                  </span>
                  <div
                    className="w-3 h-3 rounded-full ml-1"
                    style={{ backgroundColor: account.userId.color }}
                  />
                </div>
              )}

              {/* Proxy Info */}
              {account.proxy && (
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-gray-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      Proxy: {account.proxy.ip}:{account.proxy.port}
                    </div>
                    {account.proxy.username && (
                      <div className="text-xs text-gray-500 font-mono">
                        {account.proxy.username}:{account.proxy.password}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const proxyStr = account.proxy.username
                        ? `${account.proxy.ip}:${account.proxy.port}:${account.proxy.username}:${account.proxy.password}`
                        : `${account.proxy.ip}:${account.proxy.port}`;
                      navigator.clipboard.writeText(proxyStr);
                      setCopiedField("proxy");
                      setTimeout(() => setCopiedField(null), 2000);
                      toast.success("✓ Đã copy proxy");
                    }}
                    className="p-2 text-gray-400 hover:text-gray-900 transition"
                  >
                    {copiedField === "proxy" ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Calendar size={14} />
                <span>
                  Tạo: {new Date(account.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="text-xs">
                Cập nhật: {new Date(account.updatedAt).toLocaleString("vi-VN")}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Custom Fields */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin chi tiết
            </h2>

            {/* AI Generate Button - Always visible */}
            <button
              onClick={() => {
                if (
                  account.proxy &&
                  account.proxy.city &&
                  account.proxy.state
                ) {
                  // Proxy đã có location, dùng luôn
                  handleGenerateProfile(
                    account.proxy.city,
                    account.proxy.state
                  );
                } else {
                  // Không có proxy hoặc proxy thiếu location, mở modal chọn
                  setShowLocationModal(true);
                }
              }}
              className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition flex items-center justify-center gap-2"
            >
              <span className="text-lg">🤖</span>
              <span>AI Sinh Profile Tự Động</span>
            </button>

            {/* Fixed Gmail Fields */}
            <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Thông tin Email & Mật khẩu
                </h3>
                {account.proxy && (
                  <div className="text-xs text-gray-600">
                    📍{" "}
                    {account.proxy.city || account.proxy.country || "Unknown"}
                  </div>
                )}
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    📧 Gmail Cá Nhân
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={account.personalGmail || ""}
                      onChange={(e) => {
                        setAccount({
                          ...account,
                          personalGmail: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="email@gmail.com"
                    />
                    {account.personalGmail && (
                      <button
                        onClick={() =>
                          copyToClipboard(
                            account.personalGmail,
                            "Gmail cá nhân"
                          )
                        }
                        className="p-2 hover:bg-yellow-100 rounded transition"
                      >
                        {copiedField === "Gmail cá nhân" ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} className="text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    🎓 Gmail Sinh Viên
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={account.studentGmail || ""}
                      onChange={(e) => {
                        setAccount({
                          ...account,
                          studentGmail: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="student@edu.vn"
                    />
                    {account.studentGmail && (
                      <button
                        onClick={() =>
                          copyToClipboard(
                            account.studentGmail,
                            "Gmail sinh viên"
                          )
                        }
                        className="p-2 hover:bg-blue-100 rounded transition"
                      >
                        {copiedField === "Gmail sinh viên" ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} className="text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    🔑 Mật Khẩu Chung
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={account.commonPassword || ""}
                      onChange={(e) => {
                        setAccount({
                          ...account,
                          commonPassword: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="Mật khẩu..."
                    />
                    {account.commonPassword && (
                      <button
                        onClick={() =>
                          copyToClipboard(
                            account.commonPassword,
                            "Mật khẩu chung"
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded transition"
                      >
                        {copiedField === "Mật khẩu chung" ? (
                          <Check size={16} className="text-gray-900" />
                        ) : (
                          <Copy size={16} className="text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Generated Profile Fields */}
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-purple-700 mb-3">
                    🤖 Thông tin AI
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        👤 Họ Tên
                      </label>
                      <input
                        type="text"
                        value={account.fullName || ""}
                        onChange={(e) => {
                          setAccount({ ...account, fullName: e.target.value });
                          setHasChanges(true);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          🎂 Tuổi
                        </label>
                        <input
                          type="number"
                          value={account.age || ""}
                          onChange={(e) => {
                            setAccount({
                              ...account,
                              age: parseInt(e.target.value) || null,
                            });
                            setHasChanges(true);
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="21"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          ⚧ Giới tính
                        </label>
                        <select
                          value={account.gender || ""}
                          onChange={(e) => {
                            setAccount({ ...account, gender: e.target.value });
                            setHasChanges(true);
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">-</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      🏠 Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={account.address || ""}
                      onChange={(e) => {
                        setAccount({ ...account, address: e.target.value });
                        setHasChanges(true);
                      }}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="123 Main Street Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        🌆 Thành phố
                      </label>
                      <input
                        type="text"
                        value={account.city || ""}
                        onChange={(e) => {
                          setAccount({ ...account, city: e.target.value });
                          setHasChanges(true);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Los Angeles"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        🗺️ Bang
                      </label>
                      <input
                        type="text"
                        value={account.state || ""}
                        onChange={(e) => {
                          setAccount({ ...account, state: e.target.value });
                          setHasChanges(true);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="CA"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        📮 ZIP
                      </label>
                      <input
                        type="text"
                        value={account.zipCode || ""}
                        onChange={(e) => {
                          setAccount({ ...account, zipCode: e.target.value });
                          setHasChanges(true);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="90001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        📱 Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={account.phoneNumber || ""}
                        onChange={(e) => {
                          setAccount({ ...account, phoneNumber: e.target.value });
                          setHasChanges(true);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="(213) 555-1234"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        🔢 SSN
                      </label>
                      <input
                        type="text"
                        value={account.ssn || ""}
                        onChange={(e) => {
                          setAccount({ ...account, ssn: e.target.value });
                          setHasChanges(true);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="XXX-XX-XXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        🎂 Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={account.dateOfBirth || ""}
                        onChange={(e) => {
                          setAccount({ ...account, dateOfBirth: e.target.value });
                          setHasChanges(true);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        📍 Vĩ độ
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={account.latitude || ""}
                        onChange={(e) => {
                          setAccount({
                            ...account,
                            latitude: parseFloat(e.target.value) || null,
                          });
                          setHasChanges(true);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                        placeholder="34.0522"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        📍 Kinh độ
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={account.longitude || ""}
                        onChange={(e) => {
                          setAccount({
                            ...account,
                            longitude: parseFloat(e.target.value) || null,
                          });
                          setHasChanges(true);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                        placeholder="-118.2437"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      🌐 User Agent (Dolphin)
                    </label>
                    <textarea
                      value={account.userAgent || ""}
                      onChange={(e) => {
                        setAccount({ ...account, userAgent: e.target.value });
                        setHasChanges(true);
                      }}
                      rows={2}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 font-mono"
                      placeholder="Mozilla/5.0..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Service Status Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                🔧 Trạng Thái Dịch Vụ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* GitHub */}
                <div className="border border-gray-200 rounded p-3">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    GitHub
                  </label>
                  <select
                    value={account.githubStatus || ""}
                    onChange={(e) => {
                      setAccount({ ...account, githubStatus: e.target.value });
                      setHasChanges(true);
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-2"
                  >
                    <option value="">--</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="error">Error</option>
                  </select>
                  <input
                    type="text"
                    value={account.githubUsername || ""}
                    onChange={(e) => {
                      setAccount({ ...account, githubUsername: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Username"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-1"
                  />
                  <input
                    type="text"
                    value={account.githubAccount || ""}
                    onChange={(e) => {
                      setAccount({ ...account, githubAccount: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Account"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-1"
                  />
                  <input
                    type="password"
                    value={account.githubPassword || ""}
                    onChange={(e) => {
                      setAccount({ ...account, githubPassword: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Password"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                {/* Gemini */}
                <div className="border border-gray-200 rounded p-3">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Gemini
                  </label>
                  <select
                    value={account.geminiStatus || ""}
                    onChange={(e) => {
                      setAccount({ ...account, geminiStatus: e.target.value });
                      setHasChanges(true);
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-2"
                  >
                    <option value="">--</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="error">Error</option>
                  </select>
                  <input
                    type="text"
                    value={account.geminiAccount || ""}
                    onChange={(e) => {
                      setAccount({ ...account, geminiAccount: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Account"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-1"
                  />
                  <input
                    type="password"
                    value={account.geminiPassword || ""}
                    onChange={(e) => {
                      setAccount({ ...account, geminiPassword: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Password"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                {/* Canva */}
                <div className="border border-gray-200 rounded p-3">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Canva
                  </label>
                  <select
                    value={account.canvaStatus || ""}
                    onChange={(e) => {
                      setAccount({ ...account, canvaStatus: e.target.value });
                      setHasChanges(true);
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-2"
                  >
                    <option value="">--</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="error">Error</option>
                  </select>
                  <input
                    type="text"
                    value={account.canvaAccount || ""}
                    onChange={(e) => {
                      setAccount({ ...account, canvaAccount: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Account"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-1"
                  />
                  <input
                    type="password"
                    value={account.canvaPassword || ""}
                    onChange={(e) => {
                      setAccount({ ...account, canvaPassword: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Password"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                {/* Figma */}
                <div className="border border-gray-200 rounded p-3">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Figma
                  </label>
                  <select
                    value={account.figmaStatus || ""}
                    onChange={(e) => {
                      setAccount({ ...account, figmaStatus: e.target.value });
                      setHasChanges(true);
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-2"
                  >
                    <option value="">--</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="error">Error</option>
                  </select>
                  <input
                    type="text"
                    value={account.figmaAccount || ""}
                    onChange={(e) => {
                      setAccount({ ...account, figmaAccount: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Account"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-1"
                  />
                  <input
                    type="password"
                    value={account.figmaPassword || ""}
                    onChange={(e) => {
                      setAccount({ ...account, figmaPassword: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Password"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                {/* ChatGPT */}
                <div className="border border-gray-200 rounded p-3">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    ChatGPT
                  </label>
                  <select
                    value={account.gptStatus || ""}
                    onChange={(e) => {
                      setAccount({ ...account, gptStatus: e.target.value });
                      setHasChanges(true);
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-2"
                  >
                    <option value="">--</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="error">Error</option>
                  </select>
                  <input
                    type="text"
                    value={account.gptAccount || ""}
                    onChange={(e) => {
                      setAccount({ ...account, gptAccount: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Account"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-1"
                  />
                  <input
                    type="password"
                    value={account.gptPassword || ""}
                    onChange={(e) => {
                      setAccount({ ...account, gptPassword: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Password"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                {/* Cursor */}
                <div className="border border-gray-200 rounded p-3">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Cursor
                  </label>
                  <select
                    value={account.cursorStatus || ""}
                    onChange={(e) => {
                      setAccount({ ...account, cursorStatus: e.target.value });
                      setHasChanges(true);
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-2"
                  >
                    <option value="">--</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="error">Error</option>
                  </select>
                  <input
                    type="text"
                    value={account.cursorAccount || ""}
                    onChange={(e) => {
                      setAccount({ ...account, cursorAccount: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Account"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-1"
                  />
                  <input
                    type="password"
                    value={account.cursorPassword || ""}
                    onChange={(e) => {
                      setAccount({ ...account, cursorPassword: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Password"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                {/* Azure */}
                <div className="border border-gray-200 rounded p-3">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Azure
                  </label>
                  <select
                    value={account.azureStatus || ""}
                    onChange={(e) => {
                      setAccount({ ...account, azureStatus: e.target.value });
                      setHasChanges(true);
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-2"
                  >
                    <option value="">--</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="error">Error</option>
                  </select>
                  <input
                    type="text"
                    value={account.azureAccount || ""}
                    onChange={(e) => {
                      setAccount({ ...account, azureAccount: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Account"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-1"
                  />
                  <input
                    type="password"
                    value={account.azurePassword || ""}
                    onChange={(e) => {
                      setAccount({ ...account, azurePassword: e.target.value });
                      setHasChanges(true);
                    }}
                    placeholder="Password"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {columns.map((column) => {
                const value = editForm.customFields?.[column.name] ?? "";
                const isSelectColumn = column.type === "select";
                const showGeneratedFields =
                  isSelectColumn && (column.autoGenerateCategory || true); // Hiển thị cho tất cả select

                return (
                  <div
                    key={column._id}
                    className={`border border-gray-200 rounded-md p-4 ${
                      showGeneratedFields ? "md:col-span-2" : ""
                    }`}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {column.label}
                      {column.autoGenerateCategory && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          🎯 Auto Kho
                        </span>
                      )}
                    </label>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {column.type === "select" ? (
                          <select
                            value={value}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              const updates = {
                                ...editForm,
                                customFields: {
                                  ...editForm.customFields,
                                  [column.name]: newValue,
                                },
                              };

                              // Auto set registration date when status = "Thành công"
                              if (newValue === "Thành công") {
                                const today = new Date()
                                  .toISOString()
                                  .split("T")[0];
                                updates.registrationDates = {
                                  ...editForm.registrationDates,
                                  [column.name]: today,
                                };
                              }

                              setEditForm(updates);
                              setHasChanges(true);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                          >
                            {column.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={column.type}
                            value={value}
                            onChange={(e) => {
                              const newValue =
                                column.type === "number"
                                  ? Number(e.target.value)
                                  : e.target.value;
                              setEditForm({
                                ...editForm,
                                customFields: {
                                  ...editForm.customFields,
                                  [column.name]: newValue,
                                },
                              });
                              setHasChanges(true);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                        )}
                        {value && (
                          <button
                            onClick={() =>
                              copyToClipboard(String(value), column.label)
                            }
                            className="p-2 hover:bg-gray-100 rounded transition flex-shrink-0"
                            title={`Copy ${column.label}`}
                          >
                            {copiedField === column.label ? (
                              <Check size={16} className="text-gray-600" />
                            ) : (
                              <Copy size={16} className="text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Thông tin tài khoản cho select - Có thể collapse */}
                      {showGeneratedFields && (
                        <details className="mt-3 pt-3 border-t border-gray-200">
                          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 select-none">
                            ▼ Thông tin tài khoản
                          </summary>
                          <div className="space-y-3 mt-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên Tài Khoản
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={
                                    account.generatedAccounts?.[column.name]
                                      ?.accountName ||
                                    (account.studentGmail
                                      ? account.studentGmail.split("@")[0]
                                      : "") ||
                                    ""
                                  }
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    setAccount({
                                      ...account,
                                      generatedAccounts: {
                                        ...account.generatedAccounts,
                                        [column.name]: {
                                          ...account.generatedAccounts?.[
                                            column.name
                                          ],
                                          accountName: newValue,
                                        },
                                      },
                                    });
                                    setHasChanges(true);
                                  }}
                                  placeholder="Nhập tên tài khoản..."
                                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                                {(account.generatedAccounts?.[column.name]
                                  ?.accountName ||
                                  account.studentGmail) && (
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        account.generatedAccounts?.[column.name]
                                          ?.accountName ||
                                          account.studentGmail.split("@")[0],
                                        `Tên tài khoản ${column.label}`
                                      )
                                    }
                                    className="p-2 hover:bg-gray-100 rounded transition"
                                  >
                                    {copiedField ===
                                    `Tên tài khoản ${column.label}` ? (
                                      <Check
                                        size={16}
                                        className="text-gray-900"
                                      />
                                    ) : (
                                      <Copy
                                        size={16}
                                        className="text-gray-400"
                                      />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật Khẩu
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={
                                    account.generatedAccounts?.[column.name]
                                      ?.password ||
                                    account.commonPassword ||
                                    ""
                                  }
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    setAccount({
                                      ...account,
                                      generatedAccounts: {
                                        ...account.generatedAccounts,
                                        [column.name]: {
                                          ...account.generatedAccounts?.[
                                            column.name
                                          ],
                                          password: newValue,
                                        },
                                      },
                                    });
                                    setHasChanges(true);
                                  }}
                                  placeholder="Nhập mật khẩu..."
                                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                                {(account.generatedAccounts?.[column.name]
                                  ?.password ||
                                  account.commonPassword) && (
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        account.generatedAccounts?.[column.name]
                                          ?.password || account.commonPassword,
                                        `Mật khẩu ${column.label}`
                                      )
                                    }
                                    className="p-2 hover:bg-gray-100 rounded transition"
                                  >
                                    {copiedField ===
                                    `Mật khẩu ${column.label}` ? (
                                      <Check
                                        size={16}
                                        className="text-gray-900"
                                      />
                                    ) : (
                                      <Copy
                                        size={16}
                                        className="text-gray-400"
                                      />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </details>
                      )}

                      {/* Auto Registration and Expiration for Thành công */}
                      {column.type === "select" && value === "Thành công" && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3 space-y-2">
                          <div>
                            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                              <Calendar size={12} />
                              Ngày đăng ký (Tự động)
                            </label>
                            <input
                              type="date"
                              value={
                                editForm.registrationDates?.[column.name] || ""
                              }
                              readOnly
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                              <Clock size={12} />
                              Thời hạn (tháng)
                            </label>
                            <input
                              type="number"
                              min="1"
                              placeholder="Nhập số tháng..."
                              onChange={(e) => {
                                const months = parseInt(e.target.value) || 0;
                                if (months > 0) {
                                  const regDate = editForm.registrationDates?.[
                                    column.name
                                  ]
                                    ? new Date(
                                        editForm.registrationDates[column.name]
                                      )
                                    : new Date();

                                  const expDate = new Date(regDate);
                                  expDate.setMonth(expDate.getMonth() + months);

                                  setEditForm({
                                    ...editForm,
                                    expirationDates: {
                                      ...editForm.expirationDates,
                                      [column.name]: expDate
                                        .toISOString()
                                        .split("T")[0],
                                    },
                                  });
                                  setHasChanges(true);
                                }
                              }}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                              <Clock size={12} />
                              Ngày hết hạn (Tự tính)
                            </label>
                            <input
                              type="date"
                              value={
                                editForm.expirationDates?.[column.name] || ""
                              }
                              readOnly
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Private Note - Column 2 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ghi chú riêng
            </h2>

            <textarea
              value={editForm.privateNote || ""}
              onChange={(e) => {
                setEditForm({ ...editForm, privateNote: e.target.value });
                setHasChanges(true);
              }}
              rows={20}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 resize-y"
              placeholder="Nhập ghi chú riêng của bạn..."
            />
          </div>
        </div>

        {/* Danger Zone - Delete */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <div className="bg-white rounded-lg border-2 border-red-200 p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-2">
              Danger Zone
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Hành động này không thể hoàn tác. Profile sẽ bị xóa vĩnh viễn.
            </p>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              <Trash2 size={18} />
              <span>Xóa Profile Vĩnh Viễn</span>
            </button>
          </div>
        </div>
      </div>

      {/* Location Selection Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📍 Chọn Vị Trí Để Sinh Profile
              </h2>
              <p className="text-gray-600 mb-6">
                AI sẽ sinh thông tin profile phù hợp với vị trí bạn chọn
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thành phố
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      // Auto-set state based on city
                      const cityStateMap = {
                        "Los Angeles": "CA",
                        "San Diego": "CA",
                        "San Francisco": "CA",
                        "San Jose": "CA",
                        "New York": "NY",
                        Buffalo: "NY",
                        Houston: "TX",
                        Dallas: "TX",
                        Austin: "TX",
                        Miami: "FL",
                        Orlando: "FL",
                        Tampa: "FL",
                        Chicago: "IL",
                        Philadelphia: "PA",
                        Phoenix: "AZ",
                        Seattle: "WA",
                        Boston: "MA",
                        Denver: "CO",
                        Atlanta: "GA",
                        Detroit: "MI",
                        "Las Vegas": "NV",
                      };
                      setSelectedState(cityStateMap[e.target.value] || "");
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Chọn thành phố --</option>
                    <optgroup label="🌴 California">
                      <option value="Los Angeles">Los Angeles</option>
                      <option value="San Diego">San Diego</option>
                      <option value="San Francisco">San Francisco</option>
                      <option value="San Jose">San Jose</option>
                      <option value="Sacramento">Sacramento</option>
                      <option value="Fresno">Fresno</option>
                      <option value="Oakland">Oakland</option>
                    </optgroup>
                    <optgroup label="🗽 New York">
                      <option value="New York">New York City</option>
                      <option value="Buffalo">Buffalo</option>
                      <option value="Rochester">Rochester</option>
                      <option value="Albany">Albany</option>
                    </optgroup>
                    <optgroup label="🤠 Texas">
                      <option value="Houston">Houston</option>
                      <option value="Dallas">Dallas</option>
                      <option value="Austin">Austin</option>
                      <option value="San Antonio">San Antonio</option>
                      <option value="Fort Worth">Fort Worth</option>
                      <option value="El Paso">El Paso</option>
                    </optgroup>
                    <optgroup label="🏖️ Florida">
                      <option value="Miami">Miami</option>
                      <option value="Orlando">Orlando</option>
                      <option value="Tampa">Tampa</option>
                      <option value="Jacksonville">Jacksonville</option>
                    </optgroup>
                    <optgroup label="🏙️ Other Major Cities">
                      <option value="Chicago">Chicago, IL</option>
                      <option value="Philadelphia">Philadelphia, PA</option>
                      <option value="Phoenix">Phoenix, AZ</option>
                      <option value="Seattle">Seattle, WA</option>
                      <option value="Boston">Boston, MA</option>
                      <option value="Denver">Denver, CO</option>
                      <option value="Atlanta">Atlanta, GA</option>
                      <option value="Detroit">Detroit, MI</option>
                      <option value="Las Vegas">Las Vegas, NV</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bang (State Code)
                  </label>
                  <input
                    type="text"
                    value={selectedState}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="Tự động điền khi chọn thành phố"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> AI sẽ tự động sinh địa chỉ, số điện
                    thoại, tọa độ GPS phù hợp với thành phố bạn chọn
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    if (!selectedCity || !selectedState) {
                      toast.error("Vui lòng chọn thành phố");
                      return;
                    }
                    handleGenerateProfile(selectedCity, selectedState);
                  }}
                  disabled={!selectedCity || !selectedState}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🤖 Sinh Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDetail;
