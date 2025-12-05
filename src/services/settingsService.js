import axios from "axios";

const API_URL = "/api/settings";

export const settingsService = {
  // Verify delete code
  verifyDeleteCode: async (code) => {
    const response = await axios.post(`${API_URL}/verify-delete-code`, {
      code,
    });
    return response.data;
  },

  // Get all settings
  getAllSettings: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Get API key
  getGeminiApiKey: async () => {
    try {
      const response = await axios.get(`${API_URL}/gemini-api-key`);
      return response.data.apiKey;
    } catch (error) {
      return "";
    }
  },

  // Save API key
  saveGeminiApiKey: async (apiKey) => {
    const response = await axios.post(`${API_URL}/gemini-api-key`, { apiKey });
    return response.data;
  },
};
