import axios from "axios";

const API_URL = "/api/accounts";

export const accountService = {
  // Lấy tất cả tài khoản
  getAllAccounts: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Lấy tài khoản theo ID
  getAccountById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Tạo tài khoản mới
  createAccount: async (accountData) => {
    try {
      console.log("Creating account with data:", accountData);
      const response = await axios.post(API_URL, accountData);
      console.log("Account created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Create account error:", error);
      console.error("Error response:", error.response);
      // Throw a more detailed error
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown error creating account";
      throw new Error(errorMessage);
    }
  },

  // Cập nhật tài khoản
  updateAccount: async (id, accountData) => {
    const response = await axios.put(`${API_URL}/${id}`, accountData);
    return response.data;
  },

  // Xóa tài khoản
  deleteAccount: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Generate AI Profile
  generateProfile: async (proxyId, accountId, city, state) => {
    const response = await axios.post(`${API_URL}/generate-profile`, {
      proxyId,
      accountId,
      city,
      state,
    });
    return response.data;
  },
};
