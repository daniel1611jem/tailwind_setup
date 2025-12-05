import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { accountService } from "../services/accountService";
import { userService } from "../services/userService";
import { columnService } from "../services/columnService";
import { transactionService } from "../services/transactionService";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Search,
  Filter,
  Tag,
  Clock,
  History,
} from "lucide-react";
import toast from "react-hot-toast";
import SellModal from "../components/SellModal";
import StatusModal from "../components/StatusModal";
import HistoryModal from "../components/HistoryModal";
import ExtendModal from "../components/ExtendModal";

const InventoryPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedColumn, setSelectedColumn] = useState("all");
  const [filteredAccounts, setFilteredAccounts] = useState([]);

  // Modal states
  const [showSellModal, setShowSellModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  const [sellForm, setSellForm] = useState({
    buyerName: "",
    buyerContact: "",
    amount: "",
    paymentMethod: "Chuyển khoản",
    duration: "12",
    registrationDate: new Date().toISOString().split("T")[0],
    expirationDate: "",
    apps: [],
    notes: "",
  });

  const [statusForm, setStatusForm] = useState({
    status: "active",
    notes: "",
    action: "status_changed",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [searchText, selectedUser, selectedColumn, activeTab, accounts]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsData, usersData, columnsData] = await Promise.all([
        accountService.getAllAccounts(),
        userService.getAllUsers().catch(() => []),
        columnService.getAllColumns().catch(() => []),
      ]);

      setAccounts(accountsData);
      setUsers(usersData);
      setColumns(columnsData.filter((col) => col.type === "select"));
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = [...accounts];

    // Filter by tab
    if (activeTab === "inventory") {
      filtered = filtered.filter((account) =>
        Object.values(account.customFields || {}).some(
          (value) => value === "Thành công"
        )
      );
    } else if (activeTab === "sold") {
      filtered = filtered.filter((account) =>
        Object.values(account.customFields || {}).some(
          (value) => value === "Đã bán"
        )
      );
    }

    // Filter by column/app
    if (selectedColumn !== "all") {
      filtered = filtered.filter((account) => {
        const fieldValue = account.customFields?.[selectedColumn];
        return (
          fieldValue === "Thành công" ||
          (activeTab === "sold" && fieldValue === "Đã bán")
        );
      });
    }

    // Filter by user
    if (selectedUser !== "all") {
      filtered = filtered.filter(
        (acc) => acc.userId?._id === selectedUser || acc.userId === selectedUser
      );
    }

    // Filter by search
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((account) => {
        const name = account.customFields?.["Tên"] || "";
        return name.toLowerCase().includes(searchLower);
      });
    }

    setFilteredAccounts(filtered);
  };

  const getUserById = (userId) => {
    if (typeof userId === "object") {
      return users.find((u) => u._id === userId._id);
    }
    return users.find((u) => u._id === userId);
  };

  const getAvailableApps = (account) => {
    const apps = [];
    Object.entries(account.customFields || {}).forEach(([key, value]) => {
      if (value === "Thành công") {
        apps.push(key);
      }
    });
    return apps;
  };

  const getSoldApps = (account) => {
    const apps = [];
    Object.entries(account.customFields || {}).forEach(([key, value]) => {
      if (value === "Đã bán") {
        apps.push(key);
      }
    });
    return apps;
  };

  const handleOpenSellModal = (account) => {
    const apps = getAvailableApps(account);
    setSelectedAccount(account);
    setSellForm({
      buyerName: "",
      buyerContact: "",
      amount: "",
      paymentMethod: "Chuyển khoản",
      duration: "12",
      registrationDate: new Date().toISOString().split("T")[0],
      expirationDate: "",
      apps: apps,
      notes: "",
    });
    setShowSellModal(true);
  };

  const handleOpenStatusModal = async (account) => {
    setSelectedAccount(account);
    setStatusForm({
      status: "active",
      notes: "",
      action: "status_changed",
    });

    // Lấy giao dịch của account này
    try {
      const txData = await transactionService.getTransactionsByAccount(
        account._id
      );
      setTransactions(txData);
      if (txData.length > 0) {
        setCurrentTransaction(txData[0]); // Lấy giao dịch mới nhất
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }

    setShowStatusModal(true);
  };

  const handleOpenHistoryModal = async (account) => {
    setSelectedAccount(account);
    try {
      const txData = await transactionService.getTransactionsByAccount(
        account._id
      );
      setTransactions(txData);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      toast.error("Không thể tải lịch sử giao dịch");
    }
    setShowHistoryModal(true);
  };

  const handleSell = async (e) => {
    e.preventDefault();

    if (!sellForm.buyerName || !sellForm.amount || sellForm.apps.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const transactionData = {
        accountId: selectedAccount._id,
        buyerName: sellForm.buyerName,
        buyerContact: sellForm.buyerContact || "",
        amount: parseFloat(sellForm.amount),
        paymentMethod: sellForm.paymentMethod,
        duration: parseInt(sellForm.duration),
        registrationDate: sellForm.registrationDate,
        apps: sellForm.apps,
        notes: sellForm.notes || "",
        createdBy: selectedAccount.userId,
      };

      // Only add expirationDate if it's not empty
      if (sellForm.expirationDate) {
        transactionData.expirationDate = sellForm.expirationDate;
      }

      await transactionService.createTransaction(transactionData);

      toast.success("Đã tạo giao dịch bán hàng thành công!");
      setShowSellModal(false);
      setSellForm({
        buyerName: "",
        buyerContact: "",
        amount: "",
        paymentMethod: "Chuyển khoản",
        duration: "12",
        registrationDate: new Date().toISOString().split("T")[0],
        expirationDate: "",
        apps: [],
        notes: "",
      });
      fetchData();
    } catch (err) {
      console.error("Error creating transaction:", err);
      toast.error(err.response?.data?.message || "Không thể tạo giao dịch");
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    if (!currentTransaction) {
      toast.error("Không tìm thấy giao dịch");
      return;
    }

    try {
      const apps = getSoldApps(selectedAccount);
      await transactionService.updateTransaction(currentTransaction._id, {
        status: statusForm.status,
        notes: statusForm.notes,
        action: statusForm.action,
        updatedBy: selectedAccount.userId,
        apps:
          statusForm.status === "returned" || statusForm.status === "refunded"
            ? apps
            : undefined,
      });

      toast.success("Đã cập nhật trạng thái!");
      setShowStatusModal(false);
      fetchData();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleOpenExtendModal = () => {
    setShowStatusModal(false);
    setShowExtendModal(true);
  };

  const handleExtend = async (duration, notes) => {
    if (!currentTransaction) {
      toast.error("Không tìm thấy giao dịch");
      return;
    }

    try {
      await transactionService.extendTransaction(
        currentTransaction._id,
        duration,
        notes,
        selectedAccount.userId
      );

      toast.success(`Đã gia hạn thêm ${duration} tháng!`);
      setShowExtendModal(false);

      // Refresh transaction data
      const txData = await transactionService.getTransactionsByAccount(
        selectedAccount._id
      );
      setTransactions(txData);
      const updatedTx = txData.find((tx) => tx._id === currentTransaction._id);
      if (updatedTx) {
        setCurrentTransaction(updatedTx);
      }

      fetchData();
    } catch (err) {
      console.error("Error extending transaction:", err);
      toast.error(err.response?.data?.message || "Không thể gia hạn");
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
                Quản Lý Kho Hàng
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredAccounts.length} tài khoản
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-4 py-3 font-medium transition ${
                activeTab === "inventory"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Package size={18} />
                <span>Tồn kho</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                  {
                    accounts.filter((acc) =>
                      Object.values(acc.customFields || {}).some(
                        (v) => v === "Thành công"
                      )
                    ).length
                  }
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("sold")}
              className={`px-4 py-3 font-medium transition ${
                activeTab === "sold"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign size={18} />
                <span>Đã bán</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {
                    accounts.filter((acc) =>
                      Object.values(acc.customFields || {}).some(
                        (v) => v === "Đã bán"
                      )
                    ).length
                  }
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* Column Filter */}
            <div className="relative">
              <Tag
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="all">Tất cả danh mục</option>
                {columns.map((col) => (
                  <option key={col._id} value={col.label}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User Filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="all">Tất cả users</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-4">
              {activeTab === "inventory" ? (
                <Package size={48} className="mx-auto" />
              ) : (
                <DollarSign size={48} className="mx-auto" />
              )}
            </div>
            <p className="text-gray-600 text-lg">
              {activeTab === "inventory"
                ? "Chưa có hàng tồn kho"
                : "Chưa có tài khoản đã bán"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAccounts.map((account) => {
              const user = getUserById(account.userId);
              const profileName =
                account.customFields?.["Tên"] || "Chưa đặt tên";
              const apps =
                activeTab === "inventory"
                  ? getAvailableApps(account)
                  : getSoldApps(account);

              return (
                <div
                  key={account._id}
                  className="bg-white rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-md transition group"
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

                    {/* App Badges */}
                    <div className="flex flex-wrap gap-1 mb-3 min-h-[60px]">
                      {apps.map((app) => (
                        <span
                          key={app}
                          className={`text-xs px-2 py-1 rounded ${
                            activeTab === "sold"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {app}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      {activeTab === "inventory" ? (
                        <button
                          onClick={() => handleOpenSellModal(account)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                        >
                          <DollarSign size={14} />
                          <span>Bán</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenStatusModal(account)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition text-sm"
                          >
                            <Clock size={14} />
                            <span>Trạng thái</span>
                          </button>
                          <button
                            onClick={() => handleOpenHistoryModal(account)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-sm"
                          >
                            <History size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <SellModal
        show={showSellModal}
        onClose={() => setShowSellModal(false)}
        account={selectedAccount}
        availableApps={selectedAccount ? getAvailableApps(selectedAccount) : []}
        sellForm={sellForm}
        setSellForm={setSellForm}
        onSubmit={handleSell}
      />

      <StatusModal
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        account={selectedAccount}
        transaction={currentTransaction}
        statusForm={statusForm}
        setStatusForm={setStatusForm}
        onSubmit={handleUpdateStatus}
        onOpenExtendModal={handleOpenExtendModal}
      />

      <HistoryModal
        show={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        account={selectedAccount}
        transactions={transactions}
      />

      <ExtendModal
        show={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        transaction={currentTransaction}
        onExtend={handleExtend}
      />
    </div>
  );
};

export default InventoryPage;
