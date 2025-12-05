import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { accountService } from "../services/accountService";
import { columnService } from "../services/columnService";
import { userService } from "../services/userService";
import toast from "react-hot-toast";

const AccountForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [profileName, setProfileName] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [usersData, columnsData] = await Promise.all([
        userService.getAllUsers(),
        columnService.getAllColumns(),
      ]);

      setUsers(usersData);
      setColumns(columnsData);

      if (usersData.length > 0) {
        setSelectedUser(usersData[0]._id);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Không thể tải dữ liệu");
    }
  };

  const handleQuickCreate = async () => {
    if (!profileName.trim()) {
      toast.error("⚠️ Vui lòng nhập tên profile!");
      return;
    }

    if (!selectedUser) {
      toast.error("⚠️ Vui lòng chọn User quản lý!");
      return;
    }

    setLoading(true);
    try {
      // Tạo customFields với giá trị mặc định từ columns
      const customFields = {};
      columns.forEach((col) => {
        if (col.type === "number") {
          customFields[col.name] = 0;
        } else if (col.type === "select" && col.options?.length > 0) {
          customFields[col.name] = col.options[0];
        } else {
          customFields[col.name] = "";
        }
      });

      // Đặt tên vào trường customFields nếu có cột "Tên"
      const nameColumn = columns.find(
        (col) => col.name === "ten" || col.label.toLowerCase() === "tên"
      );
      if (nameColumn) {
        customFields[nameColumn.name] = profileName;
      }

      const newAccount = {
        customFields,
        userId: selectedUser,
        personalGmail: "",
        studentGmail: "",
        commonPassword: "",
        name: profileName,
        email: "",
        username: "",
        password: "",
      };

      const created = await accountService.createAccount(newAccount);
      toast.success("✓ Đã tạo profile mới!");

      // Chuyển đến trang detail của profile vừa tạo
      navigate(`/account/${created._id}`);
    } catch (err) {
      toast.error("Không thể tạo profile: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <span className="text-xl">←</span>
          <span className="font-medium">Quay lại</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">
              ✨ Tạo Profile Mới
            </h1>
            <p className="text-blue-100 text-center mt-2 text-sm">
              Chỉ cần nhập tên, phần còn lại để hệ thống lo!
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* User Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Chọn User Quản Lý
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Profile Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Tên Profile <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Nhập tên profile..."
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !loading) {
                      handleQuickCreate();
                    }
                  }}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Nhấn{" "}
                  <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                    Enter
                  </kbd>{" "}
                  để tạo nhanh
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-lg">ℹ️</span>
                  <span>
                    Sau khi tạo, bạn có thể điền thêm thông tin chi tiết như
                    Email, Gmail sinh viên, Mật khẩu và các trường khác trong
                    trang chi tiết.
                  </span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleQuickCreate}
                disabled={loading || !profileName.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-lg rounded-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Đang tạo...
                  </span>
                ) : (
                  "🚀 Tạo Profile Ngay"
                )}
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Tất cả các trường sẽ được tạo tự động với giá trị mặc định
        </p>
      </div>
    </div>
  );
};

export default AccountForm;
