import axios from 'axios';

const API_URL = '/api/columns';

export const columnService = {
  // Lấy tất cả cấu hình cột
  getAllColumns: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Lấy cột theo ID
  getColumnById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Tạo cột mới
  createColumn: async (columnData) => {
    const response = await axios.post(API_URL, columnData);
    return response.data;
  },

  // Cập nhật cột
  updateColumn: async (id, columnData) => {
    const response = await axios.put(`${API_URL}/${id}`, columnData);
    return response.data;
  },

  // Xóa cột
  deleteColumn: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Sắp xếp lại cột
  reorderColumns: async (columns) => {
    const response = await axios.post(`${API_URL}/reorder`, { columns });
    return response.data;
  }
};
