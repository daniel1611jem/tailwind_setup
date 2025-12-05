import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { accountService } from "../services/accountService";
import { proxyService } from "../services/proxyService";
import { columnService } from "../services/columnService";
import { settingsService } from "../services/settingsService";
import { userService } from "../services/userService";
import toast from "react-hot-toast";
import ChatBox from "../components/ChatBox";

const AccountListEditable = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [columns, setColumns] = useState([]);
  const [allProxies, setAllProxies] = useState([]);
  const [availableProxies, setAvailableProxies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState(null);
  const [pendingSaves, setPendingSaves] = useState(new Map());
  const [filterText, setFilterText] = useState("");
  const [selectedUser, setSelectedUser] = useState("all"); // 'all' hoặc userId
  const [isSaving, setIsSaving] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState(null);

  // Modals
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showProxyManager, setShowProxyManager] = useState(false);
  const [showUserManager, setShowUserManager] = useState(false);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    accountId: null,
  });
  const [deleteCode, setDeleteCode] = useState("");

  // Column form
  const [editingColumn, setEditingColumn] = useState(null);
  const [columnForm, setColumnForm] = useState({
    label: "",
    type: "text",
    options: [],
    visible: true,
    width: "auto",
    autoGenerateCategory: false,
    successValue: "",
    durationDays: 30,
  });

  // Proxy form
  const [editingProxy, setEditingProxy] = useState(null);
  const [proxyForm, setProxyForm] = useState({
    name: "",
    ip: "",
    port: "",
    username: "",
    password: "",
    type: "http",
    country: "",
    status: "active",
    notes: "",
  });

  // User form
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    color: "#3B82F6",
    notes: "",
    status: "active",
  });

  const [deleteColumnModal, setDeleteColumnModal] = useState({
    show: false,
    columnId: null,
  });

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailAccount, setDetailAccount] = useState(null);
  const [privateNote, setPrivateNote] = useState("");
  const [detailForm, setDetailForm] = useState({}); // Form data cho edit

  // Rules modal
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Media modal
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaAccount, setMediaAccount] = useState(null);
  const [accountMedia, setAccountMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaUploadForm, setMediaUploadForm] = useState({
    file: null,
    description: "",
    type: "shared",
  });

  // New account user selection
  const [newAccountUser, setNewAccountUser] = useState("");

  // Create Profile Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createProfileName, setCreateProfileName] = useState("");
  const [createProfileUser, setCreateProfileUser] = useState("");

  const saveTimerRef = useRef(null);
  const editingCellDataRef = useRef(null); // Lưu data của ô đang edit
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-save interval - chỉ chạy khi không có ô nào đang edit
  useEffect(() => {
    const interval = setInterval(() => {
      if (!editingCell && pendingSaves.size > 0) {
        savePendingChanges();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [editingCell, pendingSaves]);

  useEffect(() => {
    // Filter by user
    let filtered = accounts;

    if (selectedUser !== "all") {
      filtered = filtered.filter(
        (acc) => acc.userId?._id === selectedUser || acc.userId === selectedUser
      );
    }

    // Filter by text
    if (filterText.trim()) {
      const searchLower = filterText.toLowerCase();
      filtered = filtered.filter((account) => {
        return Object.keys(account.customFields || {}).some((key) => {
          const value = account.customFields[key];
          if (value && typeof value === "string") {
            return value.toLowerCase().includes(searchLower);
          }
          if (value && typeof value === "number") {
            return value.toString().includes(searchLower);
          }
          return false;
        });
      });
    }

    setFilteredAccounts(filtered);
  }, [filterText, accounts, selectedUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsData, columnsData, proxiesData, usersData] =
        await Promise.all([
          accountService.getAllAccounts(),
          columnService.getAllColumns(),
          proxyService.getAllProxies().catch(() => []),
          userService.getAllUsers().catch(() => []),
        ]);

      setAccounts(accountsData);
      setFilteredAccounts(accountsData);
      setUsers(usersData);

      // Set default user nếu chưa có
      if (usersData.length > 0 && !newAccountUser) {
        setNewAccountUser(usersData[0]._id);
      }

      const customCols = columnsData.map((col) => ({
        _id: col._id,
        name: col.name,
        label: col.label,
        type: col.type,
        visible: col.visible,
        options: col.options,
        width: col.width,
        isCustom: true,
      }));
      setColumns(customCols);

      setAllProxies(proxiesData);
      setAvailableProxies(proxiesData.filter((p) => !p.assignedTo));
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellEdit = (accountId, field, value) => {
    // Lưu vào ref để dùng khi manual save
    editingCellDataRef.current = { accountId, field, value };

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc._id === accountId) {
          return {
            ...acc,
            customFields: {
              ...acc.customFields,
              [field]: value,
            },
          };
        }
        return acc;
      })
    );

    setPendingSaves((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(accountId) || {};
      newMap.set(accountId, {
        ...existing,
        customFields: {
          ...(existing.customFields || {}),
          [field]: value,
        },
      });
      return newMap;
    });
  };

  const savePendingChanges = useCallback(
    async (showAlert = false) => {
      if (pendingSaves.size === 0) return;

      setIsSaving(true);
      const saves = Array.from(pendingSaves.entries());
      setPendingSaves(new Map());

      try {
        for (const [accountId, changes] of saves) {
          try {
            // LẤY TOÀN BỘ customFields từ state để tránh mất dữ liệu
            const account = accounts.find((acc) => acc._id === accountId);
            if (account) {
              // Gửi TOÀN BỘ customFields thay vì chỉ pending changes
              const fullData = {
                ...changes,
                customFields: account.customFields, // Toàn bộ fields hiện tại
              };
              await accountService.updateAccount(accountId, fullData);
            } else {
              // Fallback: nếu không tìm thấy account trong state
              await accountService.updateAccount(accountId, changes);
            }
            console.log(`✓ Đã lưu tài khoản ${accountId}`);
          } catch (err) {
            console.error(`✗ Lỗi lưu tài khoản ${accountId}:`, err);
          }
        }
        if (showAlert && saves.length > 0) {
          console.log(`✓ Đã lưu ${saves.length} thay đổi!`);
        }
      } finally {
        setIsSaving(false);
      }
    },
    [pendingSaves, accounts]
  );

  const handleManualSave = async () => {
    // Nếu đang edit ô, lưu luôn giá trị ô đó
    if (editingCell && editingCellDataRef.current) {
      const { accountId, field, value } = editingCellDataRef.current;

      // Cập nhật pendingSaves với giá trị mới nhất
      setPendingSaves((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(accountId) || {};
        newMap.set(accountId, {
          ...existing,
          customFields: {
            ...(existing.customFields || {}),
            [field]: value,
          },
        });
        return newMap;
      });

      // Clear editing state
      setEditingCell(null);
      editingCellDataRef.current = null;

      // Đợi React update state
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    if (pendingSaves.size === 0 && !editingCellDataRef.current) {
      return;
    }

    await savePendingChanges(false);
  };

  const addNewRow = () => {
    if (users.length === 0) {
      toast.error("⚠️ Vui lòng tạo User trước!");
      return;
    }
    setCreateProfileUser(newAccountUser || users[0]._id);
    setCreateProfileName("");
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

      // Tìm cột tên và đặt giá trị
      const nameColumn = columns.find(
        (col) => col.name === "ten" || col.label.toLowerCase() === "tên"
      );
      if (nameColumn) {
        customFields[nameColumn.name] = createProfileName;
      }

      const newAccount = {
        customFields,
        userId: createProfileUser,
        personalGmail: "",
        studentGmail: "",
        commonPassword: "",
        name: createProfileName,
        email: "",
        username: "",
        password: "",
      };
      const created = await accountService.createAccount(newAccount);
      setAccounts((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setCreateProfileName("");
      toast.success("✓ Đã tạo profile mới!");
    } catch (err) {
      toast.error("Không thể tạo profile: " + err.message);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteModal({ show: true, accountId: id });
    setDeleteCode("");
  };

  const handleDeleteConfirm = async () => {
    try {
      const result = await settingsService.verifyDeleteCode(deleteCode);

      if (result.valid) {
        await accountService.deleteAccount(deleteModal.accountId);
        setAccounts((prev) =>
          prev.filter((acc) => acc._id !== deleteModal.accountId)
        );
        setDeleteModal({ show: false, accountId: null });
        setDeleteCode("");
        toast.success("✓ Đã xóa tài khoản");
      } else {
        toast.error("❌ Mã bảo vệ không đúng!");
      }
    } catch (err) {
      toast.error("Lỗi khi xóa tài khoản");
    }
  };

  const toggleColumnVisibility = async (columnId) => {
    const column = columns.find((c) => c._id === columnId);
    if (!column) return;

    try {
      await columnService.updateColumn(columnId, { visible: !column.visible });
      setColumns((prev) =>
        prev.map((c) =>
          c._id === columnId ? { ...c, visible: !c.visible } : c
        )
      );
    } catch (err) {
      console.error("Error toggling column:", err);
    }
  };

  // Column reordering
  const handleColumnDragStart = (e, column) => {
    setDraggedColumn(column);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleColumnDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleColumnDrop = async (e, targetColumn) => {
    e.preventDefault();

    if (!draggedColumn || draggedColumn._id === targetColumn._id) {
      setDraggedColumn(null);
      return;
    }

    const draggedIndex = columns.findIndex((c) => c._id === draggedColumn._id);
    const targetIndex = columns.findIndex((c) => c._id === targetColumn._id);

    const newColumns = [...columns];
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, draggedColumn);

    // Update order
    const updatedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index,
    }));

    setColumns(updatedColumns);
    setDraggedColumn(null);

    // Save to backend
    try {
      // LƯU CÁC THAY ĐỔI PENDING TRƯỚC KHI REORDER
      if (pendingSaves.size > 0) {
        await savePendingChanges(false);
      }

      const updates = updatedColumns.map((col) => ({
        id: col._id,
        order: col.order,
      }));

      await columnService.reorderColumns(updates);
    } catch (err) {
      console.error("Error reordering columns:", err);
      toast.error("Lỗi khi sắp xếp cột");
      fetchData(); // Reload nếu lỗi
    }
  };

  // Column Management
  const openColumnForm = (column = null) => {
    if (column) {
      setEditingColumn(column);
      setColumnForm({
        label: column.label,
        type: column.type,
        options: column.options || [],
        visible: column.visible,
        width: column.width || "auto",
        autoGenerateCategory: column.autoGenerateCategory || false,
        successValue: column.successValue || "",
        durationDays: column.durationDays || 30,
      });
    } else {
      setEditingColumn(null);
      setColumnForm({
        label: "",
        type: "text",
        options: [],
        visible: true,
        width: "auto",
        autoGenerateCategory: false,
        successValue: "",
        durationDays: 30,
      });
    }
  };

  const handleColumnSubmit = async (e) => {
    e.preventDefault();
    try {
      // LƯU CÁC THAY ĐỔI PENDING TRƯỚC KHI THÊM CỘT MỚI
      if (pendingSaves.size > 0) {
        await savePendingChanges(false);
      }

      // Tự động tạo name từ label
      const name = columnForm.label
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");

      const columnData = {
        name,
        label: columnForm.label,
        type: columnForm.type,
        options: columnForm.options.filter((o) => o.trim()), // Lọc các dòng trống khi lưu
        visible: columnForm.visible,
        width: columnForm.width,
        order: columns.length,
        autoGenerateCategory: columnForm.autoGenerateCategory,
        successValue: columnForm.successValue,
        durationDays: columnForm.durationDays,
        userId: newAccountUser || users[0]?._id,
      };

      if (editingColumn) {
        await columnService.updateColumn(editingColumn._id, columnData);
      } else {
        await columnService.createColumn(columnData);
      }

      fetchData();
      setShowColumnManager(false);
      openColumnForm();
    } catch (err) {
      toast.error("Lỗi: " + err.message);
    }
  };

  const handleDeleteColumn = (columnId) => {
    setDeleteColumnModal({ show: true, columnId });
    setDeleteCode("");
  };

  const handleDeleteColumnConfirm = async () => {
    try {
      const result = await settingsService.verifyDeleteCode(deleteCode);

      if (result.valid) {
        // LƯU CÁC THAY ĐỔI PENDING TRƯỚC KHI XÓA CỘT
        if (pendingSaves.size > 0) {
          await savePendingChanges(false);
        }

        await columnService.deleteColumn(deleteColumnModal.columnId);
        fetchData();
        setDeleteColumnModal({ show: false, columnId: null });
        setDeleteCode("");
        toast.success("✓ Đã xóa cột");
      } else {
        toast.error("❌ Mã bảo vệ không đúng!");
      }
    } catch (err) {
      toast.error("Không thể xóa cột");
    }
  };

  // Proxy Management
  const openProxyForm = (proxy = null) => {
    if (proxy) {
      setEditingProxy(proxy);
      setProxyForm({
        name: proxy.name || "",
        ip: proxy.ip,
        port: proxy.port,
        username: proxy.username || "",
        password: proxy.password || "",
        type: proxy.type,
        country: proxy.country || "",
        status: proxy.status,
        notes: proxy.notes || "",
      });
    } else {
      setEditingProxy(null);
      setProxyForm({
        name: "",
        ip: "",
        port: "",
        username: "",
        password: "",
        type: "http",
        country: "",
        status: "active",
        notes: "",
      });
    }
  };

  const handleProxySubmit = async (e) => {
    e.preventDefault();
    try {
      // LƯU CÁC THAY ĐỔI PENDING
      if (pendingSaves.size > 0) {
        await savePendingChanges(false);
      }

      if (editingProxy) {
        await proxyService.updateProxy(editingProxy._id, proxyForm);
      } else {
        await proxyService.createProxy(proxyForm);
      }
      fetchData();
      openProxyForm();
    } catch (err) {
      toast.error("Lỗi: " + err.message);
    }
  };

  const handleDeleteProxy = async (id) => {
    if (window.confirm("Xóa proxy này?")) {
      try {
        // LƯU CÁC THAY ĐỔI PENDING
        if (pendingSaves.size > 0) {
          await savePendingChanges(false);
        }

        await proxyService.deleteProxy(id);
        fetchData();
        toast.success("✓ Đã xóa proxy");
      } catch (err) {
        toast.error("Không thể xóa proxy");
      }
    }
  };

  const handleUnassignProxy = async (id) => {
    try {
      // LƯU CÁC THAY ĐỔI PENDING
      if (pendingSaves.size > 0) {
        await savePendingChanges(false);
      }

      await proxyService.unassignProxy(id);
      fetchData();
      toast.success("✓ Đã hủy gán proxy");
    } catch (err) {
      toast.error("Không thể hủy gán proxy");
    }
  };

  // User Management
  const openUserForm = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        name: user.name,
        email: user.email || "",
        color: user.color || "#3B82F6",
        notes: user.notes || "",
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: "",
        email: "",
        color: "#3B82F6",
        notes: "",
        status: "active",
      });
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      // LƯU CÁC THAY ĐỔI PENDING
      if (pendingSaves.size > 0) {
        await savePendingChanges(false);
      }

      if (editingUser) {
        await userService.updateUser(editingUser._id, userForm);
      } else {
        await userService.createUser(userForm);
      }
      fetchData();
      openUserForm();
    } catch (err) {
      toast.error("Lỗi: " + err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    const accountsCount = accounts.filter(
      (acc) => acc.userId === id || acc.userId?._id === id
    ).length;

    if (accountsCount > 0) {
      toast.error(
        `❌ Không thể xóa! User này đang quản lý ${accountsCount} profile.`
      );
      return;
    }

    if (window.confirm("Xóa user này?")) {
      try {
        // LƯU CÁC THAY ĐỔI PENDING
        if (pendingSaves.size > 0) {
          await savePendingChanges(false);
        }

        await userService.deleteUser(id);
        fetchData();
        toast.success("✓ Đã xóa user");
      } catch (err) {
        toast.error("Không thể xóa user");
      }
    }
  };

  const copyToClipboard = async (text, fieldName = "") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`✓ Đã copy ${fieldName}`);
    } catch (err) {
      // Fallback cho trình duyệt cũ
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success(`✓ Đã copy ${fieldName}`);
    }
  };

  // Detail Modal - Hiển thị đầy đủ thông tin + cho phép edit
  const openDetailModal = (account) => {
    setDetailAccount(account);
    setPrivateNote(account.privateNote || "");

    // Khởi tạo form với dữ liệu hiện tại
    // Ensure customFields is plain object
    const customFieldsObj = account.customFields
      ? typeof account.customFields.toObject === "function"
        ? account.customFields.toObject()
        : { ...account.customFields }
      : {};

    setDetailForm({
      ...customFieldsObj,
      privateNote: account.privateNote || "",
    });

    setShowDetailModal(true);
  };

  const saveDetailChanges = async () => {
    try {
      const { privateNote: noteFromForm, ...customFields } = detailForm;

      // Cập nhật cả customFields và privateNote
      const fullData = {
        customFields: customFields,
        privateNote: noteFromForm,
      };

      await accountService.updateAccount(detailAccount._id, fullData);

      // Cập nhật local state
      setAccounts((prev) =>
        prev.map((acc) =>
          acc._id === detailAccount._id
            ? {
                ...acc,
                customFields: customFields,
                privateNote: noteFromForm,
              }
            : acc
        )
      );

      setShowDetailModal(false);
      toast.success("✓ Đã lưu thay đổi");
    } catch (err) {
      toast.error("Lỗi khi lưu: " + err.message);
    }
  };

  // Media Modal
  const openMediaModal = async (account) => {
    setMediaAccount(account);
    setShowMediaModal(true);
    setMediaLoading(true);
    setMediaUploadForm({ file: null, description: "", type: "shared" });

    await loadAccountMedia(account);
  };

  const loadAccountMedia = async (account) => {
    setMediaLoading(true);
    try {
      const { mediaService } = await import("../services/mediaService");
      const accountName =
        account.customFields?.["Tên"] ||
        account.name ||
        `Account_${account._id}`;
      const allMedia = await mediaService.getAllMedia();

      // Filter media có tag chứa tên account
      const filtered = allMedia.filter(
        (media) => media.tags && media.tags.some((tag) => tag === accountName)
      );

      setAccountMedia(filtered);
    } catch (err) {
      console.error("Error loading media:", err);
      toast.error("Lỗi khi tải ảnh: " + err.message);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleMediaUpload = async (e) => {
    e.preventDefault();

    if (!mediaUploadForm.file) {
      toast.error("⚠️ Vui lòng chọn file!");
      return;
    }

    setUploadingMedia(true);

    try {
      const { mediaService } = await import("../services/mediaService");
      const accountName =
        mediaAccount.customFields?.["Tên"] ||
        mediaAccount.name ||
        `Account_${mediaAccount._id}`;

      const formData = new FormData();
      formData.append("file", mediaUploadForm.file);
      formData.append("type", mediaUploadForm.type);
      formData.append("description", mediaUploadForm.description);
      formData.append("tags", accountName); // Tag = tên profile

      await mediaService.uploadMedia(formData);

      // Reset form
      setMediaUploadForm({ file: null, description: "", type: "shared" });
      document.getElementById("media-file-input").value = "";

      // Reload media
      await loadAccountMedia(mediaAccount);

      toast.success("✓ Upload thành công!");
    } catch (err) {
      console.error("Error uploading:", err);
      toast.error("Lỗi upload: " + err.message);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm("Xóa ảnh này?")) return;

    try {
      const { mediaService } = await import("../services/mediaService");
      await mediaService.deleteMedia(mediaId);
      await loadAccountMedia(mediaAccount);
      toast.success("✓ Đã xóa!");
    } catch (err) {
      toast.error("Lỗi khi xóa: " + err.message);
    }
  };

  const renderEditableCell = (account, column) => {
    const value = account.customFields?.[column.name] ?? "";
    const isEditing = editingCell === `${account._id}-${column.name}`;

    if (column.type === "select") {
      return (
        <div className="flex items-center group">
          <button
            onClick={() => copyToClipboard(value, column.label)}
            className="opacity-0 group-hover:opacity-100 mr-1 px-1 py-0.5 text-xs text-gray-500 hover:text-blue-600 transition"
            title="Copy"
          >
            📋
          </button>
          <select
            value={value}
            onChange={(e) =>
              handleCellEdit(account._id, column.name, e.target.value)
            }
            className="flex-1 px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 bg-transparent text-sm"
          >
            {column.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="flex items-center group">
        <button
          onClick={() => copyToClipboard(value, column.label)}
          className="opacity-0 group-hover:opacity-100 mr-1 px-1 py-0.5 text-xs text-gray-500 hover:text-blue-600 transition"
          title="Copy"
        >
          📋
        </button>
        <input
          type={column.type === "password" ? "text" : column.type}
          value={value}
          onChange={(e) => {
            const newValue =
              column.type === "number"
                ? Number(e.target.value)
                : e.target.value;
            handleCellEdit(account._id, column.name, newValue);
          }}
          onFocus={() => setEditingCell(`${account._id}-${column.name}`)}
          onBlur={() => {
            setEditingCell(null);
            editingCellDataRef.current = null; // Clear ref khi blur
          }}
          className={`flex-1 px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 bg-transparent text-sm ${
            isEditing ? "bg-blue-50" : ""
          }`}
        />
      </div>
    );
  };

  const renderProxyCell = (account) => {
    const currentProxy = account.proxy;
    const displayText = currentProxy
      ? `${currentProxy.name ? currentProxy.name + " - " : ""}${
          currentProxy.ip
        }:${currentProxy.port}`
      : "Không dùng";

    return (
      <div className="flex items-center group">
        <button
          onClick={() => {
            if (currentProxy) {
              const proxyString = `${currentProxy.ip}:${currentProxy.port}${
                currentProxy.username ? ":" + currentProxy.username : ""
              }${currentProxy.password ? ":" + currentProxy.password : ""}`;
              copyToClipboard(proxyString, "Proxy");
            }
          }}
          className={`${
            currentProxy ? "opacity-0 group-hover:opacity-100" : "invisible"
          } mr-1 px-1 py-0.5 text-xs text-gray-500 hover:text-blue-600 transition`}
          title="Copy proxy"
          disabled={!currentProxy}
        >
          📋
        </button>
        <select
          value={currentProxy?._id || ""}
          onChange={async (e) => {
            const proxyId = e.target.value;

            // LƯU CÁC THAY ĐỔI PENDING
            if (pendingSaves.size > 0) {
              await savePendingChanges(false);
            }

            if (proxyId) {
              await proxyService.assignProxy(proxyId, account._id);
              fetchData();
            } else if (currentProxy) {
              await proxyService.unassignProxy(currentProxy._id);
              fetchData();
            }
          }}
          className="flex-1 px-2 py-1 text-xs border-0 focus:ring-2 focus:ring-blue-500 bg-transparent"
        >
          <option value="">Không dùng</option>
          {currentProxy && (
            <option value={currentProxy._id}>
              ✓ {currentProxy.name ? currentProxy.name + " - " : ""}
              {currentProxy.ip}:{currentProxy.port}
            </option>
          )}
          {availableProxies.map((proxy) => (
            <option key={proxy._id} value={proxy._id}>
              {proxy.name ? proxy.name + " - " : ""}
              {proxy.ip}:{proxy.port}{" "}
              {proxy.country ? `(${proxy.country})` : ""}
            </option>
          ))}
        </select>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Quản Lý Tài Khoản MMO
        </h1>
        <div className="flex space-x-3">
          {pendingSaves.size > 0 && (
            <button
              onClick={handleManualSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition flex items-center gap-2 disabled:bg-gray-400"
            >
              {isSaving
                ? "⏳ Đang lưu..."
                : `💾 Lưu ngay (${pendingSaves.size})`}
            </button>
          )}
          <button
            onClick={() => navigate("/media")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition"
          >
            Quản lý Media
          </button>
          <button
            onClick={() => navigate("/paystub")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition"
          >
            💰 Paystub Editor
          </button>
          <button
            onClick={() => setShowRulesModal(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded transition"
          >
            📖 Quy tắc
          </button>
          <button
            onClick={() => {
              setShowUserManager(true);
              openUserForm();
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded transition"
          >
            Quản lý User
          </button>
          <button
            onClick={() => {
              setShowProxyManager(true);
              openProxyForm();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition"
          >
            Quản lý Proxy
          </button>
          <button
            onClick={() => {
              setShowColumnManager(true);
              openColumnForm();
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition"
          >
            Quản lý Cột
          </button>
          <button
            onClick={() => setShowColumnToggle(!showColumnToggle)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition"
          >
            Ẩn/Hiện Cột
          </button>
          <button
            onClick={() => setShowChatBox(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded transition flex items-center space-x-2"
          >
            <span>💬</span>
            <span>Ghi chú</span>
          </button>
        </div>
      </div>

      {/* Filter và Add Row */}
      <div className="mb-4 flex gap-3">
        {/* User Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Lọc theo User:
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả ({accounts.length})</option>
            {users.map((user) => {
              const count = accounts.filter(
                (acc) => acc.userId?._id === user._id || acc.userId === user._id
              ).length;
              return (
                <option key={user._id} value={user._id}>
                  {user.name} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* User selection for new account */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Profile mới cho:
          </label>
          <select
            value={newAccountUser}
            onChange={(e) => setNewAccountUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {users.length === 0 && <option value="">Chưa có user</option>}
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
          <button
            onClick={addNewRow}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
          >
            ➕ Thêm Dòng Mới
          </button>
        </div>
      </div>

      {/* Column Toggle Panel */}
      {showColumnToggle && (
        <div className="mb-4 p-4 bg-white shadow-md rounded-lg border border-gray-200">
          <h3 className="font-bold mb-3 text-gray-700">Chọn cột hiển thị:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {columns.map((col) => (
              <label
                key={col._id}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={() => toggleColumnVisibility(col._id)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex items-center space-x-3">
        <input
          type="text"
          placeholder="Tìm kiếm trong bảng..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {filterText && (
          <button
            onClick={() => setFilterText("")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition"
          >
            Xóa
          </button>
        )}
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {filteredAccounts.length} / {accounts.length} tài khoản
        </span>
      </div>

      {pendingSaves.size > 0 && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded flex justify-between items-center">
          <span>
            Có {pendingSaves.size} thay đổi chưa lưu. Tự động lưu sau 10 giây...
          </span>
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition disabled:bg-gray-400"
          >
            {isSaving ? "Đang lưu..." : "Lưu ngay"}
          </button>
        </div>
      )}

      {columns.length === 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            Chưa có cột nào. Click <strong>"Quản lý Cột"</strong> để tạo cột cho
            bảng.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                style={{ width: "50px" }}
              >
                Chi tiết
              </th>
              <th
                className="px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                style={{ width: "80px" }}
              >
                Quản lý Ảnh
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-yellow-50"
                style={{ width: "200px" }}
              >
                📧 Gmail Cá Nhân
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-blue-50"
                style={{ width: "200px" }}
              >
                🎓 Gmail Sinh Viên
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-green-50"
                style={{ width: "150px" }}
              >
                🔑 Mật Khẩu Chung
              </th>
              {columns
                .filter((col) => col.visible)
                .map((col) => (
                  <>
                    <th
                      key={col._id}
                      draggable
                      onDragStart={(e) => handleColumnDragStart(e, col)}
                      onDragOver={handleColumnDragOver}
                      onDrop={(e) => handleColumnDrop(e, col)}
                      className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-move hover:bg-gray-100 transition ${
                        draggedColumn?._id === col._id
                          ? "opacity-50 bg-blue-100"
                          : ""
                      }`}
                      style={{
                        width: col.width === "auto" ? "auto" : `${col.width}px`,
                      }}
                      title="Kéo để sắp xếp lại"
                    >
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">⋮⋮</span>
                        {col.label}
                      </span>
                    </th>
                    {col.type === "select" && col.autoGenerateCategory && (
                      <>
                        <th
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-indigo-50"
                          style={{ width: "200px" }}
                        >
                          👤 Tên ĐN ({col.label})
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-purple-50"
                          style={{ width: "200px" }}
                        >
                          📝 Tên TK ({col.label})
                        </th>
                      </>
                    )}
                  </>
                ))}
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                style={{ width: "150px" }}
              >
                Proxy
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                style={{ width: "120px" }}
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAccounts.length === 0 && columns.length > 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.filter((c) => c.visible).length +
                    7 +
                    columns.filter(
                      (c) =>
                        c.visible &&
                        c.type === "select" &&
                        c.autoGenerateCategory
                    ).length *
                      2
                  }
                  className="px-6 py-4 text-center text-gray-500"
                >
                  {filterText
                    ? "Không tìm thấy kết quả"
                    : 'Chưa có tài khoản. Click "Thêm Dòng Mới" để bắt đầu!'}
                </td>
              </tr>
            ) : (
              filteredAccounts.map((account) => {
                const accountUser = users.find(
                  (u) =>
                    u._id === account.userId || u._id === account.userId?._id
                );

                return (
                  <tr
                    key={account._id}
                    className="hover:bg-gray-50 transition"
                    style={{
                      borderLeft: accountUser
                        ? `4px solid ${accountUser.color}`
                        : "none",
                    }}
                  >
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => openDetailModal(account)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-lg"
                        title="Ghi chú riêng"
                      >
                        ⓘ
                      </button>
                    </td>
                    <td className="px-2 py-2 text-center relative">
                      {accountUser && (
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1"
                          style={{ backgroundColor: accountUser.color }}
                          title={`User: ${accountUser.name}`}
                        />
                      )}
                      <button
                        onClick={() => openMediaModal(account)}
                        className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                        title="Quản lý ảnh"
                      >
                        🖼️ Ảnh
                      </button>
                    </td>
                    <td className="px-4 py-2 bg-yellow-50">
                      <input
                        type="email"
                        value={account.personalGmail || ""}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setAccounts((prev) =>
                            prev.map((acc) =>
                              acc._id === account._id
                                ? { ...acc, personalGmail: newValue }
                                : acc
                            )
                          );
                          setPendingSaves((prev) => {
                            const newMap = new Map(prev);
                            const existing = newMap.get(account._id) || {};
                            newMap.set(account._id, {
                              ...existing,
                              personalGmail: newValue,
                            });
                            return newMap;
                          });
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 text-sm"
                        placeholder="email@gmail.com"
                      />
                    </td>
                    <td className="px-4 py-2 bg-blue-50">
                      <input
                        type="email"
                        value={account.studentGmail || ""}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setAccounts((prev) =>
                            prev.map((acc) =>
                              acc._id === account._id
                                ? { ...acc, studentGmail: newValue }
                                : acc
                            )
                          );
                          setPendingSaves((prev) => {
                            const newMap = new Map(prev);
                            const existing = newMap.get(account._id) || {};
                            newMap.set(account._id, {
                              ...existing,
                              studentGmail: newValue,
                            });
                            return newMap;
                          });
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="student@edu.vn"
                      />
                    </td>
                    <td className="px-4 py-2 bg-green-50">
                      <input
                        type="text"
                        value={account.commonPassword || ""}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setAccounts((prev) =>
                            prev.map((acc) =>
                              acc._id === account._id
                                ? { ...acc, commonPassword: newValue }
                                : acc
                            )
                          );
                          setPendingSaves((prev) => {
                            const newMap = new Map(prev);
                            const existing = newMap.get(account._id) || {};
                            newMap.set(account._id, {
                              ...existing,
                              commonPassword: newValue,
                            });
                            return newMap;
                          });
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Mật khẩu..."
                      />
                    </td>
                    {columns
                      .filter((col) => col.visible)
                      .map((col) => (
                        <>
                          <td key={col._id} className="px-4 py-2">
                            {renderEditableCell(account, col)}
                          </td>
                          {col.type === "select" &&
                            col.autoGenerateCategory && (
                              <>
                                <td className="px-4 py-2 bg-indigo-50">
                                  <div className="text-sm text-gray-700">
                                    {account.generatedAccounts?.[col.name]
                                      ?.username ||
                                      account.studentGmail || (
                                        <span className="text-gray-400 italic">
                                          Chưa có
                                        </span>
                                      )}
                                  </div>
                                </td>
                                <td className="px-4 py-2 bg-purple-50">
                                  <div className="text-sm text-gray-700">
                                    {account.generatedAccounts?.[col.name]
                                      ?.accountName ||
                                      (account.studentGmail
                                        ? account.studentGmail.split("@")[0]
                                        : null) || (
                                        <span className="text-gray-400 italic">
                                          Chưa có
                                        </span>
                                      )}
                                  </div>
                                </td>
                              </>
                            )}
                        </>
                      ))}
                    <td className="px-4 py-2">{renderProxyCell(account)}</td>
                    <td className="px-4 py-2 text-sm">
                      <button
                        onClick={() => handleDeleteClick(account._id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <p>
          💡 <strong>Click</strong> vào ô để chỉnh sửa trực tiếp. Thay đổi sẽ tự
          động lưu sau 10 giây hoặc click nút "Lưu ngay".
        </p>
        <p>
          🔄 <strong>Kéo thả</strong> tiêu đề cột (⋮⋮) để sắp xếp lại vị trí các
          cột.
        </p>
      </div>

      {/* Detail Modal - Chỉ ghi chú riêng */}
      {showDetailModal && detailAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Sticky Header - Nhỏ gọn */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 flex justify-between items-center rounded-t-lg z-10 shadow-md">
              <h2 className="text-lg font-bold">Chi tiết Profile</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold leading-none w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6">
              {/* User Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: detailAccount.userId?.color || "#3B82F6",
                    }}
                  ></div>
                  <div>
                    <p className="text-sm text-gray-600">Quản lý bởi:</p>
                    <p className="font-semibold text-lg">
                      {detailAccount.userId?.name || "Chưa xác định"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Fields - Editable */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
                  📝 Thông tin chi tiết
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {columns
                    .filter((col) => col.visible)
                    .map((column) => {
                      const fieldValue = detailForm[column.name];
                      const displayValue =
                        fieldValue !== undefined && fieldValue !== null
                          ? String(fieldValue)
                          : "";

                      return (
                        <div key={column._id} className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {column.label}
                          </label>
                          <div className="flex gap-2">
                            {column.type === "select" ? (
                              <select
                                value={displayValue}
                                onChange={(e) =>
                                  setDetailForm({
                                    ...detailForm,
                                    [column.name]: e.target.value,
                                  })
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {column.options?.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={
                                  column.type === "password"
                                    ? "text"
                                    : column.type
                                }
                                value={displayValue}
                                onChange={(e) => {
                                  const value =
                                    column.type === "number"
                                      ? e.target.value === ""
                                        ? ""
                                        : Number(e.target.value)
                                      : e.target.value;
                                  setDetailForm({
                                    ...detailForm,
                                    [column.name]: value,
                                  });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Nhập ${column.label.toLowerCase()}...`}
                              />
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(displayValue, column.label)
                              }
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
                              title={`Copy ${column.label}`}
                            >
                              📋
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Proxy Info */}
              {detailAccount.proxy && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-bold text-lg mb-3 text-gray-800">
                    🌐 Proxy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Tên:</p>
                      <div className="flex gap-2">
                        <p className="font-semibold flex-1">
                          {detailAccount.proxy.name || "Không có"}
                        </p>
                        {detailAccount.proxy.name && (
                          <button
                            onClick={() =>
                              copyToClipboard(
                                detailAccount.proxy.name,
                                "Tên proxy"
                              )
                            }
                            className="px-2 py-1 bg-white hover:bg-gray-100 rounded text-xs"
                          >
                            📋
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">IP:Port:</p>
                      <div className="flex gap-2">
                        <p className="font-semibold flex-1">
                          {detailAccount.proxy.ip}:{detailAccount.proxy.port}
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${detailAccount.proxy.ip}:${detailAccount.proxy.port}`,
                              "IP:Port"
                            )
                          }
                          className="px-2 py-1 bg-white hover:bg-gray-100 rounded text-xs"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    {detailAccount.proxy.username && (
                      <div>
                        <p className="text-sm text-gray-600">Username:</p>
                        <div className="flex gap-2">
                          <p className="font-semibold flex-1">
                            {detailAccount.proxy.username}
                          </p>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                detailAccount.proxy.username,
                                "Username"
                              )
                            }
                            className="px-2 py-1 bg-white hover:bg-gray-100 rounded text-xs"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    )}
                    {detailAccount.proxy.password && (
                      <div>
                        <p className="text-sm text-gray-600">Password:</p>
                        <div className="flex gap-2">
                          <p className="font-semibold flex-1">
                            {detailAccount.proxy.password}
                          </p>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                detailAccount.proxy.password,
                                "Password"
                              )
                            }
                            className="px-2 py-1 bg-white hover:bg-gray-100 rounded text-xs"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">
                        Full Proxy String:
                      </p>
                      <div className="flex gap-2">
                        <p className="font-semibold flex-1 font-mono text-sm bg-white p-2 rounded">
                          {detailAccount.proxy.ip}:{detailAccount.proxy.port}
                          {detailAccount.proxy.username &&
                            `:${detailAccount.proxy.username}`}
                          {detailAccount.proxy.password &&
                            `:${detailAccount.proxy.password}`}
                        </p>
                        <button
                          onClick={() => {
                            const proxyString = `${detailAccount.proxy.ip}:${
                              detailAccount.proxy.port
                            }${
                              detailAccount.proxy.username
                                ? ":" + detailAccount.proxy.username
                                : ""
                            }${
                              detailAccount.proxy.password
                                ? ":" + detailAccount.proxy.password
                                : ""
                            }`;
                            copyToClipboard(proxyString, "Full Proxy");
                          }}
                          className="px-2 py-1 bg-white hover:bg-gray-100 rounded text-xs"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Private Note */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔒 Ghi chú riêng (chỉ bạn nhìn thấy)
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={detailForm.privateNote || ""}
                    onChange={(e) =>
                      setDetailForm({
                        ...detailForm,
                        privateNote: e.target.value,
                      })
                    }
                    rows={4}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập ghi chú riêng của bạn..."
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(detailForm.privateNote || "", "Ghi chú")
                    }
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition h-fit"
                    title="Copy ghi chú"
                  >
                    📋
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Ngày tạo:</p>
                    <p>
                      {new Date(detailAccount.createdAt).toLocaleString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Cập nhật lần cuối:</p>
                    <p>
                      {new Date(detailAccount.updatedAt).toLocaleString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Đóng
                </button>
                <button
                  onClick={saveDetailChanges}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <span>💾</span>
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Modal */}
      {showMediaModal && mediaAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  🖼️ Quản lý ảnh
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Ảnh của:{" "}
                  <span className="font-semibold">
                    {mediaAccount.customFields?.["Tên"] ||
                      mediaAccount.name ||
                      "Chưa đặt tên"}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowMediaModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Upload Form */}
              <form
                onSubmit={handleMediaUpload}
                className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200"
              >
                <h3 className="font-bold mb-3 text-lg">📤 Upload ảnh mới</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn file *
                    </label>
                    <input
                      id="media-file-input"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                      onChange={(e) =>
                        setMediaUploadForm({
                          ...mediaUploadForm,
                          file: e.target.files[0],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ảnh (jpg, png, gif) hoặc tài liệu (pdf, doc, txt, zip) -
                      Max 10MB
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại
                    </label>
                    <select
                      value={mediaUploadForm.type}
                      onChange={(e) =>
                        setMediaUploadForm({
                          ...mediaUploadForm,
                          type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="shared">Ảnh chung</option>
                      <option value="document">Tài liệu</option>
                      <option value="private">Ảnh riêng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <input
                      type="text"
                      value={mediaUploadForm.description}
                      onChange={(e) =>
                        setMediaUploadForm({
                          ...mediaUploadForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Mô tả ngắn..."
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={uploadingMedia || !mediaUploadForm.file}
                    className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {uploadingMedia ? "⏳ Đang upload..." : "📤 Upload"}
                  </button>
                  <p className="text-xs text-gray-600">
                    Tag tự động:{" "}
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                      {mediaAccount.customFields?.["Tên"] || "Tên profile"}
                    </span>
                  </p>
                </div>
              </form>

              {/* Media Grid */}
              {mediaLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Đang tải ảnh...</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">
                      Ảnh đã upload ({accountMedia.length})
                    </h3>
                  </div>

                  {accountMedia.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500">📭 Chưa có ảnh nào</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Upload ảnh đầu tiên ở form bên trên
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {accountMedia.map((media) => {
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(
                          media.filename
                        );

                        return (
                          <div
                            key={media._id}
                            className="border rounded-lg overflow-hidden hover:shadow-lg transition group"
                          >
                            {isImage ? (
                              <div className="aspect-square bg-gray-100 relative">
                                <img
                                  src={media.url}
                                  alt={media.originalName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                                <span className="text-4xl">📄</span>
                              </div>
                            )}

                            <div className="p-3">
                              <p
                                className="text-xs text-gray-700 truncate font-medium"
                                title={media.originalName}
                              >
                                {media.originalName}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {(media.size / 1024).toFixed(1)} KB
                              </p>
                              {media.description && (
                                <p
                                  className="text-xs text-gray-600 mt-1 truncate"
                                  title={media.description}
                                >
                                  {media.description}
                                </p>
                              )}

                              <div className="flex gap-1 mt-2">
                                <button
                                  onClick={() =>
                                    copyToClipboard(media.url, "URL ảnh")
                                  }
                                  className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                >
                                  📋 Copy
                                </button>
                                <button
                                  onClick={() => handleDeleteMedia(media._id)}
                                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
                                  title="Xóa"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Manager Modal */}
      {showUserManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                👥 Quản Lý User
              </h2>
              <button
                onClick={() => setShowUserManager(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Form */}
              <form
                onSubmit={handleUserSubmit}
                className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200"
              >
                <h3 className="font-bold mb-4 text-lg">
                  {editingUser ? "Sửa User" : "Thêm User Mới"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên User *
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.name}
                      onChange={(e) =>
                        setUserForm({ ...userForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Tên user..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) =>
                        setUserForm({ ...userForm, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Màu đại diện
                    </label>
                    <input
                      type="color"
                      value={userForm.color}
                      onChange={(e) =>
                        setUserForm({ ...userForm, color: e.target.value })
                      }
                      className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={userForm.status}
                      onChange={(e) =>
                        setUserForm({ ...userForm, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      value={userForm.notes}
                      onChange={(e) =>
                        setUserForm({ ...userForm, notes: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ghi chú về user..."
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => openUserForm()}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
                  >
                    {editingUser ? "Cập nhật" : "Thêm mới"}
                  </button>
                </div>
              </form>

              {/* List */}
              <div>
                <h3 className="font-bold mb-3 text-lg">
                  Danh sách User ({users.length})
                </h3>
                <div className="space-y-2">
                  {users.map((user) => {
                    const accountsCount = accounts.filter(
                      (acc) =>
                        acc.userId?._id === user._id || acc.userId === user._id
                    ).length;

                    return (
                      <div
                        key={user._id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className="w-8 h-8 rounded-full"
                              style={{ backgroundColor: user.color }}
                              title={`Màu: ${user.color}`}
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">
                                {user.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {user.email && <span>{user.email} • </span>}
                                <span
                                  className={
                                    user.status === "active"
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }
                                >
                                  {user.status === "active"
                                    ? "✓ Active"
                                    : "○ Inactive"}
                                </span>
                                <span className="ml-2">
                                  • {accountsCount} profile
                                </span>
                              </div>
                              {user.notes && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {user.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => openUserForm(user)}
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                              disabled={accountsCount > 0}
                              title={
                                accountsCount > 0
                                  ? `Đang quản lý ${accountsCount} profile`
                                  : "Xóa user"
                              }
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {users.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      Chưa có user nào. Thêm user đầu tiên!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Column Manager Modal */}
      {showColumnManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Quản Lý Cột</h2>
              <button
                onClick={() => setShowColumnManager(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Form */}
              <form
                onSubmit={handleColumnSubmit}
                className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <h3 className="font-bold mb-4 text-lg">
                  {editingColumn ? "Sửa Cột" : "Thêm Cột Mới"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên hiển thị <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={columnForm.label}
                      onChange={(e) =>
                        setColumnForm({ ...columnForm, label: e.target.value })
                      }
                      placeholder="vd: Số điện thoại"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ID sẽ được tự động tạo từ tên này
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kiểu dữ liệu
                    </label>
                    <select
                      value={columnForm.type}
                      onChange={(e) =>
                        setColumnForm({ ...columnForm, type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="password">Password</option>
                      <option value="date">Date</option>
                      <option value="select">Select (Dropdown)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Độ rộng
                    </label>
                    <select
                      value={columnForm.width}
                      onChange={(e) =>
                        setColumnForm({ ...columnForm, width: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="auto">Auto</option>
                      <option value="100">100px</option>
                      <option value="150">150px</option>
                      <option value="200">200px</option>
                      <option value="250">250px</option>
                      <option value="300">300px</option>
                    </select>
                  </div>

                  {columnForm.type === "select" && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options (mỗi dòng 1 option)
                        </label>
                        <textarea
                          value={columnForm.options.join("\n")}
                          onChange={(e) => {
                            const lines = e.target.value.split("\n");
                            setColumnForm({
                              ...columnForm,
                              options: lines,
                            });
                          }}
                          rows="6"
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-y min-h-[100px] font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Nhấn Enter để xuống dòng. Các dòng trống sẽ tự động
                          loại bỏ khi lưu.
                        </p>
                      </div>

                      <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <label className="flex items-center mb-3">
                          <input
                            type="checkbox"
                            checked={columnForm.autoGenerateCategory}
                            onChange={(e) =>
                              setColumnForm({
                                ...columnForm,
                                autoGenerateCategory: e.target.checked,
                              })
                            }
                            className="mr-2 w-4 h-4"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            🎯 Tự động tạo danh mục trong kho & lưu khi thành
                            công
                          </span>
                        </label>

                        {columnForm.autoGenerateCategory && (
                          <div className="ml-6 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá trị thành công (Success Value)
                              </label>
                              <input
                                type="text"
                                value={columnForm.successValue}
                                onChange={(e) =>
                                  setColumnForm({
                                    ...columnForm,
                                    successValue: e.target.value,
                                  })
                                }
                                placeholder="vd: Thành công"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Khi cột này có giá trị này, tự động thêm vào kho
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thời hạn (ngày)
                              </label>
                              <input
                                type="number"
                                value={columnForm.durationDays}
                                onChange={(e) =>
                                  setColumnForm({
                                    ...columnForm,
                                    durationDays:
                                      parseInt(e.target.value) || 30,
                                  })
                                }
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Số ngày ưu đãi có hiệu lực
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={columnForm.visible}
                        onChange={(e) =>
                          setColumnForm({
                            ...columnForm,
                            visible: e.target.checked,
                          })
                        }
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">
                        Hiển thị cột này
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => openColumnForm()}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    {editingColumn ? "Cập nhật" : "Thêm"}
                  </button>
                </div>
              </form>

              {/* List */}
              <div>
                <h3 className="font-bold mb-3 text-lg">Danh sách cột</h3>
                {columns.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có cột nào
                  </p>
                ) : (
                  <div className="space-y-2">
                    {columns.map((col) => (
                      <div
                        key={col._id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {col.label}
                            {col.autoGenerateCategory && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                🎯 Auto Kho
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Type: {col.type} | Width:{" "}
                            {col.width === "auto" ? "Auto" : col.width + "px"} |{" "}
                            {col.visible ? "Hiển thị" : "Ẩn"}
                            {col.autoGenerateCategory && col.successValue && (
                              <span className="block text-xs text-blue-600 mt-1">
                                Success: "{col.successValue}" →{" "}
                                {col.durationDays} ngày
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openColumnForm(col)}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteColumn(col._id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 font-medium"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proxy Manager Modal */}
      {showProxyManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Quản Lý Proxy
              </h2>
              <button
                onClick={() => setShowProxyManager(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Form */}
              <form
                onSubmit={handleProxySubmit}
                className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <h3 className="font-bold mb-4 text-lg">
                  {editingProxy ? "Sửa Proxy" : "Thêm Proxy Mới"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên proxy
                    </label>
                    <input
                      type="text"
                      value={proxyForm.name}
                      onChange={(e) =>
                        setProxyForm({ ...proxyForm, name: e.target.value })
                      }
                      placeholder="vd: Proxy US 1, Proxy VN..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={proxyForm.ip}
                      onChange={(e) =>
                        setProxyForm({ ...proxyForm, ip: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Port <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={proxyForm.port}
                      onChange={(e) =>
                        setProxyForm({ ...proxyForm, port: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={proxyForm.username}
                      onChange={(e) =>
                        setProxyForm({ ...proxyForm, username: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="text"
                      value={proxyForm.password}
                      onChange={(e) =>
                        setProxyForm({ ...proxyForm, password: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={proxyForm.type}
                      onChange={(e) =>
                        setProxyForm({ ...proxyForm, type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="http">HTTP</option>
                      <option value="https">HTTPS</option>
                      <option value="socks4">SOCKS4</option>
                      <option value="socks5">SOCKS5</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={proxyForm.country}
                      onChange={(e) =>
                        setProxyForm({ ...proxyForm, country: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={proxyForm.notes}
                      onChange={(e) =>
                        setProxyForm({ ...proxyForm, notes: e.target.value })
                      }
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => openProxyForm()}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                  >
                    {editingProxy ? "Cập nhật" : "Thêm"}
                  </button>
                </div>
              </form>

              {/* List */}
              <div>
                <h3 className="font-bold mb-3 text-lg">Danh sách proxy</h3>
                {allProxies.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có proxy nào
                  </p>
                ) : (
                  <div className="space-y-2">
                    {allProxies.map((proxy) => {
                      const proxyString = `${proxy.ip}:${proxy.port}${
                        proxy.username ? ":" + proxy.username : ""
                      }${proxy.password ? ":" + proxy.password : ""}`;

                      return (
                        <div
                          key={proxy._id}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              {proxy.name && (
                                <div className="font-bold text-gray-800 mb-1 flex items-center group">
                                  <button
                                    onClick={() =>
                                      copyToClipboard(proxy.name, "Tên")
                                    }
                                    className="opacity-0 group-hover:opacity-100 mr-2 text-xs text-gray-500 hover:text-blue-600"
                                    title="Copy tên"
                                  >
                                    📋
                                  </button>
                                  {proxy.name}
                                </div>
                              )}
                              <div className="font-medium flex items-center group">
                                <button
                                  onClick={() =>
                                    copyToClipboard(proxyString, "Proxy đầy đủ")
                                  }
                                  className="opacity-0 group-hover:opacity-100 mr-2 text-xs text-gray-500 hover:text-blue-600"
                                  title="Copy toàn bộ"
                                >
                                  📋
                                </button>
                                <span className="text-blue-700">
                                  {proxy.ip}:{proxy.port}
                                </span>
                                {(proxy.username || proxy.password) && (
                                  <span className="text-gray-500 text-sm ml-2">
                                    (có auth)
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 space-y-1">
                                {proxy.username && (
                                  <div className="flex items-center group">
                                    <button
                                      onClick={() =>
                                        copyToClipboard(
                                          proxy.username,
                                          "Username"
                                        )
                                      }
                                      className="opacity-0 group-hover:opacity-100 mr-2 text-gray-500 hover:text-blue-600"
                                      title="Copy username"
                                    >
                                      📋
                                    </button>
                                    <span>User: {proxy.username}</span>
                                  </div>
                                )}
                                {proxy.password && (
                                  <div className="flex items-center group">
                                    <button
                                      onClick={() =>
                                        copyToClipboard(
                                          proxy.password,
                                          "Password"
                                        )
                                      }
                                      className="opacity-0 group-hover:opacity-100 mr-2 text-gray-500 hover:text-blue-600"
                                      title="Copy password"
                                    >
                                      📋
                                    </button>
                                    <span>Pass: {proxy.password}</span>
                                  </div>
                                )}
                                <div>
                                  {proxy.type.toUpperCase()} |{" "}
                                  {proxy.country || "N/A"} |
                                  {proxy.assignedTo ? (
                                    <span className="text-blue-600">
                                      {" "}
                                      Đã gán
                                    </span>
                                  ) : (
                                    <span className="text-green-600">
                                      {" "}
                                      Khả dụng
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-1 ml-4">
                              {proxy.assignedTo && (
                                <button
                                  onClick={() => handleUnassignProxy(proxy._id)}
                                  className="px-3 py-1 text-xs text-orange-600 hover:text-orange-800 font-medium whitespace-nowrap"
                                >
                                  Hủy gán
                                </button>
                              )}
                              <button
                                onClick={() => openProxyForm(proxy)}
                                className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteProxy(proxy._id)}
                                className="px-3 py-1 text-xs text-red-600 hover:text-red-800 font-medium whitespace-nowrap"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-red-600">
              Xác nhận xóa tài khoản
            </h3>
            <p className="mb-4 text-gray-700">
              Để xóa tài khoản này, vui lòng nhập mã bảo vệ:
            </p>
            <input
              type="password"
              value={deleteCode}
              onChange={(e) => setDeleteCode(e.target.value)}
              placeholder="Nhập mã bảo vệ..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              onKeyPress={(e) => e.key === "Enter" && handleDeleteConfirm()}
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteModal({ show: false, accountId: null });
                  setDeleteCode("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Xóa
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Mã mặc định: admin123 (thay đổi trong MongoDB)
            </p>
          </div>
        </div>
      )}

      {/* Delete Column Modal */}
      {deleteColumnModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-red-600">
              Xác nhận xóa cột
            </h3>
            <p className="mb-4 text-gray-700">
              Để xóa cột này, vui lòng nhập mã bảo vệ:
            </p>
            <input
              type="password"
              value={deleteCode}
              onChange={(e) => setDeleteCode(e.target.value)}
              placeholder="Nhập mã bảo vệ..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              onKeyPress={(e) =>
                e.key === "Enter" && handleDeleteColumnConfirm()
              }
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteColumnModal({ show: false, columnId: null });
                  setDeleteCode("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteColumnConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Xóa
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Mã mặc định: admin123 (thay đổi trong MongoDB)
            </p>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-2xl font-bold">📖 Quy tắc sử dụng</h2>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Rule 1 */}
              <div className="border-l-4 border-cyan-500 pl-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  1. Bảo mật tài khoản
                </h3>
                <div className="text-gray-700 space-y-2 text-sm leading-relaxed">
                  <p>• Không chia sẻ thông tin đăng nhập với người khác</p>
                  <p>• Thay đổi mật khẩu định kỳ mỗi 3 tháng</p>
                  <p>
                    • Sử dụng mật khẩu mạnh (ít nhất 8 ký tự, bao gồm chữ hoa,
                    chữ thường, số và ký tự đặc biệt)
                  </p>
                  <p>• Không lưu mật khẩu ở nơi công khai</p>
                </div>
              </div>

              {/* Rule 2 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  2. Quản lý dữ liệu
                </h3>
                <div className="text-gray-700 space-y-2 text-sm leading-relaxed">
                  <p>• Luôn kiểm tra kỹ trước khi xóa profile</p>
                  <p>• Backup dữ liệu quan trọng định kỳ</p>
                  <p>• Không nhập thông tin sai vào các trường quan trọng</p>
                  <p>• Sử dụng "Ghi chú riêng" để lưu thông tin bổ sung</p>
                </div>
              </div>

              {/* Rule 3 */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  3. Sử dụng Proxy
                </h3>
                <div className="text-gray-700 space-y-2 text-sm leading-relaxed">
                  <p>• Kiểm tra proxy hoạt động trước khi gán cho profile</p>
                  <p>
                    • Không sử dụng chung 1 proxy cho nhiều profile cùng lúc
                  </p>
                  <p>• Thay đổi proxy khi phát hiện bị block</p>
                  <p>• Ghi rõ thông tin proxy (tên, quốc gia) để dễ quản lý</p>
                </div>
              </div>

              {/* Rule 4 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  4. Upload Media
                </h3>
                <div className="text-gray-700 space-y-2 text-sm leading-relaxed">
                  <p>• Chỉ upload file ảnh có dung lượng &lt; 5MB</p>
                  <p>• Đặt tên file có ý nghĩa (ví dụ: avatar_profile1.jpg)</p>
                  <p>• Phân loại đúng type: Shared hoặc Private</p>
                  <p>
                    • Thêm mô tả chi tiết cho mỗi file để dễ tìm kiếm sau này
                  </p>
                </div>
              </div>

              {/* Rule 5 */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  5. Làm việc nhóm
                </h3>
                <div className="text-gray-700 space-y-2 text-sm leading-relaxed">
                  <p>• Mỗi user chỉ quản lý profile được gán cho mình</p>
                  <p>• Không xóa hoặc sửa profile của user khác</p>
                  <p>• Thông báo với admin khi cần thay đổi quyền hạn</p>
                  <p>
                    • Sử dụng filter "Lọc theo User" để xem profile của mình
                  </p>
                </div>
              </div>

              {/* Rule 6 */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  6. Cảnh báo quan trọng
                </h3>
                <div className="text-gray-700 space-y-2 text-sm leading-relaxed">
                  <p>
                    ⚠️ <strong>Không xóa cột mặc định</strong> của hệ thống
                  </p>
                  <p>
                    ⚠️ <strong>Luôn lưu thay đổi</strong> trước khi đóng trình
                    duyệt
                  </p>
                  <p>
                    ⚠️ <strong>Kiểm tra kỹ</strong> trước khi nhập mã xóa
                    profile/cột
                  </p>
                  <p>
                    ⚠️ <strong>Không reload trang</strong> khi đang có thay đổi
                    chưa lưu
                  </p>
                </div>
              </div>

              {/* Footer Note */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 text-center">
                  💡 <strong>Mẹo:</strong> Sử dụng nút "Lưu ngay" khi cần lưu
                  thay đổi ngay lập tức thay vì chờ auto-save 10 giây.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ChatBox Modal */}
      <ChatBox isOpen={showChatBox} onClose={() => setShowChatBox(false)} />

      {/* Create Profile Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="border-b px-6 py-4">
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
                <p className="text-xs text-gray-500 mt-1">
                  Nhấn Enter để tạo nhanh
                </p>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateProfileName("");
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

export default AccountListEditable;
