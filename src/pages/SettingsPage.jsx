import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { settingsService } from "../services/settingsService";
import { ArrowLeft, Save, Key } from "lucide-react";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const key = await settingsService.getGeminiApiKey();
      setApiKey(key || "");
    } catch (error) {
      console.error("Error fetching API key:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Vui lòng nhập API key");
      return;
    }

    try {
      setSaving(true);
      await settingsService.saveGeminiApiKey(apiKey);
      toast.success("✓ Đã lưu API key");
    } catch (error) {
      toast.error("Lỗi lưu API key: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-white rounded-lg transition border border-gray-200"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">⚙️ Cài Đặt</h1>
          </div>
        </div>

        {/* API Key Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Key size={24} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Google Gemini API Key
              </h2>
              <p className="text-sm text-gray-600">
                Dùng cho tính năng AI sinh profile tự động
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                📌 Hướng dẫn lấy API key:
              </h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>
                  Truy cập:{" "}
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    https://aistudio.google.com/
                  </a>
                </li>
                <li>Đăng nhập bằng tài khoản Google</li>
                <li>Nhấn "Get API Key" → "Create API Key"</li>
                <li>Copy API key và dán vào ô trên</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Lưu ý:</h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>API key này được lưu trong database</li>
                <li>Gemini API có giới hạn miễn phí: 60 requests/phút</li>
                <li>Không chia sẻ API key của bạn với người khác</li>
              </ul>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              <span>{saving ? "Đang lưu..." : "Lưu Cài Đặt"}</span>
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              🤖 AI Profile Generator
            </h3>
            <p className="text-sm text-gray-600">
              Tự động sinh thông tin profile dựa trên vị trí proxy: tên, tuổi,
              địa chỉ, số điện thoại, email, user agent...
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              📍 Location Matching
            </h3>
            <p className="text-sm text-gray-600">
              AI sẽ chọn địa chỉ, số điện thoại phù hợp với bang/thành phố của
              proxy để tránh bị phát hiện.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
