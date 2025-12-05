import axios from "axios";

const API_URL = "http://localhost:5000/api/key-sales";

export const keySaleService = {
  // Lấy tất cả key sales
  getAllKeySales: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Lấy sale theo key
  getSaleByKey: async (keyId) => {
    const response = await axios.get(`${API_URL}/key/${keyId}`);
    return response.data;
  },

  // Lấy sale theo ID
  getSaleById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Cập nhật sale
  updateSale: async (id, updateData) => {
    const response = await axios.patch(`${API_URL}/${id}`, updateData);
    return response.data;
  },

  // Xóa sale
  deleteSale: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
};
