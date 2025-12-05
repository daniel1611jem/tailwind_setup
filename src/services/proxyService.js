import axios from 'axios';

const API_URL = '/api/proxies';

export const proxyService = {
  // Lấy tất cả proxy
  getAllProxies: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Lấy proxy khả dụng (chưa assign)
  getAvailableProxies: async () => {
    const response = await axios.get(`${API_URL}/available`);
    return response.data;
  },

  // Lấy proxy theo ID
  getProxyById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Tạo proxy mới
  createProxy: async (proxyData) => {
    const response = await axios.post(API_URL, proxyData);
    return response.data;
  },

  // Cập nhật proxy
  updateProxy: async (id, proxyData) => {
    const response = await axios.put(`${API_URL}/${id}`, proxyData);
    return response.data;
  },

  // Xóa proxy
  deleteProxy: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Gán proxy cho account
  assignProxy: async (proxyId, accountId) => {
    const response = await axios.post(`${API_URL}/${proxyId}/assign/${accountId}`);
    return response.data;
  },

  // Hủy gán proxy
  unassignProxy: async (proxyId) => {
    const response = await axios.post(`${API_URL}/${proxyId}/unassign`);
    return response.data;
  }
};
