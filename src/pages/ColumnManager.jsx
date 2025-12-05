import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { columnService } from "../services/columnService";
import toast from "react-hot-toast";
import { exportToJSON, importFromJSON } from "../utils/importExport";
import { Download, Upload } from "lucide-react";

const ColumnManager = () => {
  const [columns, setColumns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    label: "",
    type: "text",
    options: [],
    required: false,
    visible: true,
    width: 150,
  });

  useEffect(() => {
    fetchColumns();
  }, []);

  const fetchColumns = async () => {
    try {
      const data = await columnService.getAllColumns();
      setColumns(data);
    } catch (err) {
      console.error("Error fetching columns:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const columnData = {
        ...formData,
        order: columns.length,
      };

      await columnService.createColumn(columnData);
      resetForm();
      fetchColumns();
      toast.success("✓ Đã tạo cột mới");
    } catch (err) {
      toast.error("Lỗi: " + err.message);
    }
  };

  const handleInlineUpdate = async (columnId, field, value) => {
    try {
      const column = columns.find((c) => c._id === columnId);
      const updatedData = { ...column, [field]: value };
      await columnService.updateColumn(columnId, updatedData);
      fetchColumns();
      toast.success("✓ Đã cập nhật");
    } catch (err) {
      toast.error("Không thể cập nhật");
    }
  };

  const toggleEdit = (columnId) => {
    setEditingColumnId(editingColumnId === columnId ? null : columnId);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa cột này? Dữ liệu trong cột sẽ bị mất!")) {
      try {
        await columnService.deleteColumn(id);
        fetchColumns();
        toast.success("✓ Đã xóa cột");
      } catch (err) {
        toast.error("Không thể xóa cột");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      label: "",
      type: "text",
      options: [],
      required: false,
      visible: true,
      width: 150,
    });
    setShowForm(false);
  };

  const handleExport = () => {
    exportToJSON(columns, "columns");
    toast.success("✓ Đã xuất cấu hình cột");
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
      for (const column of data) {
        try {
          // Remove _id to create new columns
          const { _id, ...columnData } = column;
          await columnService.createColumn(columnData);
          successCount++;
        } catch (err) {
          console.error("Error importing column:", err);
        }
      }

      toast.success(`✓ Đã nhập ${successCount}/${data.length} cột`);
      fetchColumns();
    } catch (err) {
      toast.error(err.message || "Không thể nhập dữ liệu");
    }

    e.target.value = "";
  };

  const typeOptions = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "email", label: "Email" },
    { value: "password", label: "Password" },
    { value: "date", label: "Date" },
    { value: "select", label: "Select (Dropdown)" },
    { value: "proxy", label: "Proxy" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Quản Lý Cột</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-100 transition"
            title="Xuất cấu hình"
          >
            <Download size={18} />
            <span>Xuất</span>
          </button>

          <label
            className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-300 text-green-700 rounded-md hover:bg-green-100 transition cursor-pointer"
            title="Nhập cấu hình"
          >
            <Upload size={18} />
            <span>Nhập</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            + Thêm Cột Mới
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Thêm Cột Mới</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên cột (ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="vd: phone_number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Không dấu, không space, chỉ a-z, 0-9, _
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhãn hiển thị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  placeholder="vd: Số điện thoại"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kiểu dữ liệu <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Độ rộng (px)
                </label>
                <input
                  type="number"
                  value={formData.width}
                  onChange={(e) =>
                    setFormData({ ...formData, width: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {formData.type === "select" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Options (mỗi dòng 1 option)
                </label>
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        options: [
                          "Mặc định",
                          "Chưa làm",
                          "Thành công",
                          "Thất bại",
                        ],
                      })
                    }
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    💡 Dùng mẫu trạng thái (Mặc định, Chưa làm, Thành công, Thất
                    bại)
                  </button>
                </div>
                <textarea
                  value={formData.options.join("\n")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      options: e.target.value
                        .split("\n")
                        .filter((o) => o.trim()),
                    })
                  }
                  rows="4"
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.required}
                  onChange={(e) =>
                    setFormData({ ...formData, required: e.target.checked })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Bắt buộc</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.visible}
                  onChange={(e) =>
                    setFormData({ ...formData, visible: e.target.checked })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Hiển thị</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Thêm
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nhãn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Kiểu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Width
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hiển thị
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {columns.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Chưa có cột tùy chỉnh nào
                </td>
              </tr>
            ) : (
              columns.map((column) => (
                <>
                  <tr key={column._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {column.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {column.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.width}px
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {column.visible ? (
                        <span className="text-green-600">✓ Có</span>
                      ) : (
                        <span className="text-gray-400">✗ Không</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleEdit(column._id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        {editingColumnId === column._id ? "Đóng" : "Sửa"}
                      </button>
                      <button
                        onClick={() => handleDelete(column._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                  {editingColumnId === column._id && (
                    <tr className="bg-gray-50">
                      <td colSpan="6" className="px-6 py-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nhãn hiển thị
                              </label>
                              <input
                                type="text"
                                defaultValue={column.label}
                                onBlur={(e) =>
                                  handleInlineUpdate(
                                    column._id,
                                    "label",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kiểu dữ liệu
                              </label>
                              <select
                                defaultValue={column.type}
                                onChange={(e) =>
                                  handleInlineUpdate(
                                    column._id,
                                    "type",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                {typeOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Độ rộng (px)
                              </label>
                              <input
                                type="number"
                                defaultValue={column.width}
                                onBlur={(e) =>
                                  handleInlineUpdate(
                                    column._id,
                                    "width",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          </div>

                          {column.type === "select" && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Options (mỗi dòng 1 option)
                              </label>
                              <div className="mb-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    const textarea =
                                      e.target.closest(
                                        "div"
                                      ).nextElementSibling;
                                    textarea.value =
                                      "Mặc định\nChưa làm\nThành công\nThất bại";
                                    handleInlineUpdate(column._id, "options", [
                                      "Mặc định",
                                      "Chưa làm",
                                      "Thành công",
                                      "Thất bại",
                                    ]);
                                  }}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  💡 Dùng mẫu trạng thái (Mặc định, Chưa làm,
                                  Thành công, Thất bại)
                                </button>
                              </div>
                              <textarea
                                key={column._id}
                                defaultValue={(column.options || []).join("\n")}
                                onBlur={(e) =>
                                  handleInlineUpdate(
                                    column._id,
                                    "options",
                                    e.target.value
                                      .split("\n")
                                      .filter((o) => o.trim())
                                  )
                                }
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          )}

                          <div className="flex items-center space-x-6">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                defaultChecked={column.required}
                                onChange={(e) =>
                                  handleInlineUpdate(
                                    column._id,
                                    "required",
                                    e.target.checked
                                  )
                                }
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700">
                                Bắt buộc
                              </span>
                            </label>

                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                defaultChecked={column.visible}
                                onChange={(e) =>
                                  handleInlineUpdate(
                                    column._id,
                                    "visible",
                                    e.target.checked
                                  )
                                }
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700">
                                Hiển thị
                              </span>
                            </label>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ColumnManager;
