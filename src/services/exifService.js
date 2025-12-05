import axios from 'axios';

const API_URL = '/api/exif';

export const exifService = {
  // Đọc EXIF từ file (client-side sẽ dùng ExifReader)
  // Server-side API để xử lý với ExifTool
  
  // Gửi file lên server để đọc EXIF bằng ExifTool
  readExifServer: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(`${API_URL}/read`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Gửi file + edited data lên server để ghi EXIF
  writeExif: async (file, exifData) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('exifData', JSON.stringify(exifData));
    
    const response = await axios.post(`${API_URL}/write`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'blob' // Nhận file đã chỉnh sửa
    });
    return response.data;
  },

  // Validate EXIF data
  validateExif: async (exifData) => {
    const response = await axios.post(`${API_URL}/validate`, { exifData });
    return response.data;
  },

  // So sánh EXIF giữa 2 file
  compareExif: async (file1, file2) => {
    const formData = new FormData();
    formData.append('image1', file1);
    formData.append('image2', file2);
    
    const response = await axios.post(`${API_URL}/compare`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Xóa toàn bộ EXIF
  removeAllExif: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(`${API_URL}/remove-all`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'blob'
    });
    return response.data;
  },

  // Download file đã chỉnh sửa
  downloadModifiedImage: (blob, originalFilename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `modified_${originalFilename}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
