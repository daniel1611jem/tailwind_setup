import axios from 'axios';

const API_URL = '/api/media';

export const mediaService = {
  // Lấy tất cả media
  getAllMedia: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Lấy media theo type
  getMediaByType: async (type) => {
    const response = await axios.get(`${API_URL}?type=${type}`);
    return response.data;
  },

  // Lấy media theo ID
  getMediaById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Upload media
  uploadMedia: async (file, type, description, tags) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('description', description);
    formData.append('tags', tags);
    
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Cập nhật media info
  updateMedia: async (id, description, tags) => {
    const response = await axios.put(`${API_URL}/${id}`, { description, tags });
    return response.data;
  },

  // Xóa media
  deleteMedia: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  }
};
