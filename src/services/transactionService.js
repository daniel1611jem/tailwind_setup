import axios from "axios";

const API_URL = "http://localhost:5000/api/transactions";

export const transactionService = {
  // Lấy tất cả giao dịch
  getAllTransactions: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Lấy giao dịch theo account
  getTransactionsByAccount: async (accountId) => {
    const response = await axios.get(`${API_URL}/account/${accountId}`);
    return response.data;
  },

  // Tạo giao dịch bán hàng
  createTransaction: async (transactionData) => {
    const response = await axios.post(API_URL, transactionData);
    return response.data;
  },

  // Cập nhật trạng thái giao dịch
  updateTransaction: async (id, updateData) => {
    const response = await axios.patch(`${API_URL}/${id}`, updateData);
    return response.data;
  },

  // Gia hạn giao dịch
  extendTransaction: async (id, duration, notes, updatedBy) => {
    const response = await axios.patch(`${API_URL}/${id}/extend`, {
      duration,
      notes,
      updatedBy,
    });
    return response.data;
  },

  // Xóa giao dịch
  deleteTransaction: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
};
