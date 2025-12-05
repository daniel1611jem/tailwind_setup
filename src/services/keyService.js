import axios from "axios";

const API_URL = "http://localhost:5000/api/keys";

export const keyService = {
  // Lấy tất cả keys
  getAllKeys: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Lấy keys theo category
  getKeysByCategory: async (categoryId) => {
    const response = await axios.get(`${API_URL}/category/${categoryId}`);
    return response.data;
  },

  // Lấy keys theo service
  getKeysByService: async (serviceId) => {
    const response = await axios.get(`${API_URL}/service/${serviceId}`);
    return response.data;
  },

  // Lấy key theo ID
  getKeyById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Tạo key mới (single hoặc bulk)
  createKey: async (keyData) => {
    const response = await axios.post(API_URL, keyData);
    return response.data;
  },

  // Cập nhật key
  updateKey: async (id, updateData) => {
    const response = await axios.patch(`${API_URL}/${id}`, updateData);
    return response.data;
  },

  // Bán key
  sellKey: async (id, saleData) => {
    const response = await axios.post(`${API_URL}/${id}/sell`, saleData);
    return response.data;
  },

  // Xóa key
  deleteKey: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
};
