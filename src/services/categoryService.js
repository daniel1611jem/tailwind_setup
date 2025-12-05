import axios from "axios";

const API_URL = "http://localhost:5000/api/categories";

export const categoryService = {
  // Lấy tất cả categories
  getAllCategories: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Lấy category theo ID
  getCategoryById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Tạo category mới
  createCategory: async (categoryData) => {
    const response = await axios.post(API_URL, categoryData);
    return response.data;
  },

  // Cập nhật category
  updateCategory: async (id, updateData) => {
    const response = await axios.patch(`${API_URL}/${id}`, updateData);
    return response.data;
  },

  // Xóa category
  deleteCategory: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
};
