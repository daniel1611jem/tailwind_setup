import { useState, useEffect } from 'react';
import { mediaService } from '../services/mediaService';
import { exifService } from '../services/exifService';
import EXIFEditor from '../components/EXIFEditor';
import ImageCropper from '../components/ImageCropper';
import ImageConverter from '../components/ImageConverter';
import { toast } from '../components/Toast';

const MediaManager = () => {
  const [activeTab, setActiveTab] = useState('shared');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  
  // Upload form
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  
  // Preview modal
  const [previewMedia, setPreviewMedia] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [showExifEditor, setShowExifEditor] = useState(false);
  const [exifFile, setExifFile] = useState(null);
  const [exifImageUrl, setExifImageUrl] = useState(null);
  const [loadingExif, setLoadingExif] = useState(false);
  
  // Image Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [cropperFile, setCropperFile] = useState(null);
  const [cropperImageUrl, setCropperImageUrl] = useState(null);

  // Image Converter state
  const [showConverter, setShowConverter] = useState(false);
  const [converterFile, setConverterFile] = useState(null);
  const [converterImageUrl, setConverterImageUrl] = useState(null);

  const tabs = [
    { id: 'shared', label: 'Ảnh chung', icon: '🖼️' },
    { id: 'document', label: 'Tài liệu', icon: '📄' },
    { id: 'private', label: 'Ảnh riêng', icon: '🔒' }
  ];

  useEffect(() => {
    fetchMedia();
  }, [activeTab]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const data = await mediaService.getMediaByType(activeTab);
      setMedia(data);
    } catch (err) {
      console.error('Error fetching media:', err);
      toast.error('Lỗi khi tải media');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      toast.info(`Đã chọn: ${file.name}`);
    }
  };

  const openExifEditor = async (item) => {
    try {
      setLoadingExif(true);
      
      // Tạo một file object từ URL để edit EXIF
      // Thêm no-cors mode và cache busting
      const imageUrl = `${item.url}?t=${Date.now()}`;
      
      const response = await fetch(imageUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const file = new File([blob], item.originalName, { type: item.mimeType || 'image/jpeg' });
      
      setExifFile(file);
      setExifImageUrl(item.url);
      setShowExifEditor(true);
    } catch (err) {
      console.error('Error loading image for EXIF:', err);
      
      // Hiển thị lỗi chi tiết hơn với options
      const errorMsg = err.message || 'Unknown error';
      const isCorsError = errorMsg.includes('CORS') || errorMsg.includes('fetch') || errorMsg.includes('Failed');
      
      if (isCorsError) {
        const useLocalFile = window.confirm(
          `❌ Không thể tải ảnh từ server (lỗi CORS).\n\n` +
          `Bạn có muốn upload ảnh từ máy tính để chỉnh sửa EXIF không?\n\n` +
          `(Xem file FIX_S3_CORS.md để biết cách fix lỗi này vĩnh viễn)`
        );
        
        if (useLocalFile) {
          // Mở file picker
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/jpeg,image/jpg,image/png,image/tiff';
          input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
              const previewUrl = URL.createObjectURL(file);
              setExifFile(file);
              setExifImageUrl(previewUrl);
              setShowExifEditor(true);
              toast.info('Đã mở EXIF Editor với ảnh từ máy');
            }
          };
          input.click();
        }
      } else {
        toast.error(`Lỗi khi tải ảnh: ${errorMsg}`);
      }
    } finally {
      setLoadingExif(false);
    }
  };

  const handleExifSave = async (editedExifData) => {
    try {
      toast.info('Đang xử lý EXIF...');
      
      // Gửi lên server để ghi EXIF
      const modifiedBlob = await exifService.writeExif(exifFile, editedExifData);
      
      // Download file đã chỉnh sửa
      const url = URL.createObjectURL(modifiedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exifFile.name.replace(/(\.[^.]+)$/, '_exif$1');
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('✓ Đã lưu file với EXIF mới! File đã được tải về.', 4000);
      setShowExifEditor(false);
      
      // Hỏi user có muốn upload lại lên server không
      setTimeout(() => {
        const shouldUpload = window.confirm(
          'File với EXIF mới đã được tải về máy.\n\n' +
          'Bạn có muốn upload file này lên server để thay thế ảnh cũ không?\n\n' +
          '(Bạn cũng có thể upload thủ công sau)'
        );
        
        if (shouldUpload) {
          handleUploadModifiedFile(modifiedBlob);
        }
      }, 500);
      
    } catch (error) {
      console.error('Error saving EXIF:', error);
      toast.error('Lỗi khi lưu EXIF: ' + error.message);
    }
  };

  const handleUploadModifiedFile = async (blob) => {
    try {
      toast.info('Đang upload file mới lên server...');
      
      // Convert blob to file
      const file = new File([blob], exifFile.name, { type: blob.type });
      
      // Upload lên server
      await mediaService.uploadMedia(file, activeTab, 'EXIF modified', '');
      
      toast.success('✓ Đã upload file mới lên server!');
      
      // Refresh media list
      fetchMedia();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Lỗi khi upload: ' + err.message);
    }
  };

  const openCropper = async (item) => {
    try {
      // Load image from URL
      const imageUrl = `${item.url}?t=${Date.now()}`;
      const response = await fetch(imageUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const file = new File([blob], item.originalName, { type: item.mimeType || 'image/jpeg' });
      
      setCropperFile(file);
      setCropperImageUrl(item.url);
      setShowCropper(true);
    } catch (err) {
      console.error('Error loading image for cropping:', err);
      
      // Fallback: allow user to select local file
      const useLocalFile = window.confirm(
        `❌ Không thể tải ảnh từ server.\n\n` +
        `Bạn có muốn chọn ảnh từ máy tính để cắt không?`
      );
      
      if (useLocalFile) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const previewUrl = URL.createObjectURL(file);
            setCropperFile(file);
            setCropperImageUrl(previewUrl);
            setShowCropper(true);
            toast.info('Đã mở Image Cropper với ảnh từ máy');
          }
        };
        input.click();
      }
    }
  };

  const handleCropSave = (croppedFile, cropInfo) => {
    // Download cropped image
    const url = URL.createObjectURL(croppedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = croppedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`✓ Đã tải xuống ảnh đã cắt: ${croppedFile.name}`);
    setShowCropper(false);
  };

  const openConverter = async (item) => {
    try {
      // Load image from URL
      const imageUrl = `${item.url}?t=${Date.now()}`;
      const response = await fetch(imageUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const file = new File([blob], item.originalName, { type: item.mimeType || 'image/jpeg' });
      
      setConverterFile(file);
      setConverterImageUrl(item.url);
      setShowConverter(true);
    } catch (err) {
      console.error('Error loading image for conversion:', err);
      
      // Fallback: allow user to select local file
      const useLocalFile = window.confirm(
        `❌ Không thể tải ảnh từ server.\n\n` +
        `Bạn có muốn chọn ảnh từ máy tính để chuyển đổi không?`
      );
      
      if (useLocalFile) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const previewUrl = URL.createObjectURL(file);
            setConverterFile(file);
            setConverterImageUrl(previewUrl);
            setShowConverter(true);
            toast.info('Đã mở Image Converter với ảnh từ máy');
          }
        };
        input.click();
      }
    }
  };

  const handleConvertSave = (convertedFile, blob) => {
    toast.success(`✓ File đã được tải xuống: ${convertedFile.name}`);
    setShowConverter(false);
  };


  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning('Vui lòng chọn file!');
      return;
    }

    try {
      setUploadProgress(true);
      await mediaService.uploadMedia(selectedFile, activeTab, description, tags);
      
      // Reset form
      setSelectedFile(null);
      setDescription('');
      setTags('');
      document.getElementById('fileInput').value = '';
      
      // Refresh list
      fetchMedia();
      toast.success('✓ Upload thành công!');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Lỗi khi upload: ' + err.message);
    } finally {
      setUploadProgress(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa file này?')) return;

    try {
      await mediaService.deleteMedia(id);
      fetchMedia();
      toast.success('✓ Đã xóa file');
    } catch (err) {
      toast.error('Lỗi khi xóa: ' + err.message);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('✓ Đã copy URL', 2000);
  };

  const downloadImage = async (item) => {
    try {
      toast.info('Đang tải xuống...');
      
      // Fetch với CORS headers
      const response = await fetch(item.url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = item.originalName || 'download';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup sau một chút để đảm bảo download hoàn tất
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('✓ Đã tải xuống: ' + item.originalName);
    } catch (err) {
      console.error('Download error:', err);
      
      // Fallback: Open in new tab nếu CORS fail
      if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
        toast.warning('Đang mở ảnh trong tab mới...');
        window.open(item.url, '_blank');
      } else {
        toast.error('Lỗi khi tải xuống: ' + err.message);
      }
    }
  };

  const openPreview = (item) => {
    setPreviewMedia(item);
    setShowPreview(true);
  };

  const isImage = (mimeType) => {
    return mimeType && mimeType.startsWith('image/');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản Lý Media</h1>
        <a
          href="/"
          className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition"
        >
          Về trang chủ
        </a>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* EXIF Editor Quick Access */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg mb-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">📸</span>
            <div>
              <h3 className="font-bold text-gray-800">EXIF Editor</h3>
              <p className="text-sm text-gray-600">Chỉnh sửa metadata của ảnh trực tiếp từ máy tính</p>
            </div>
          </div>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/jpeg,image/jpg,image/png,image/tiff';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  // Kiểm tra file type
                  if (!file.type.startsWith('image/')) {
                    toast.warning('Vui lòng chọn file ảnh!');
                    return;
                  }
                  // Tạo preview URL
                  const previewUrl = URL.createObjectURL(file);
                  setExifFile(file);
                  setExifImageUrl(previewUrl);
                  setShowExifEditor(true);
                }
              };
              input.click();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition flex items-center space-x-2"
          >
            <span>📁</span>
            <span>Chọn ảnh từ máy</span>
          </button>
        </div>
      </div>

      {/* Image Cropper Quick Access */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg mb-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">✂️</span>
            <div>
              <h3 className="font-bold text-gray-800">Cắt ảnh thông minh</h3>
              <p className="text-sm text-gray-600">Cắt ảnh theo khung thiết bị: iPhone, Samsung, Social Media...</p>
            </div>
          </div>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  if (!file.type.startsWith('image/')) {
                    toast.warning('Vui lòng chọn file ảnh!');
                    return;
                  }
                  const previewUrl = URL.createObjectURL(file);
                  setCropperFile(file);
                  setCropperImageUrl(previewUrl);
                  setShowCropper(true);
                }
              };
              input.click();
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition flex items-center space-x-2"
          >
            <span>📁</span>
            <span>Chọn ảnh từ máy</span>
          </button>
        </div>
      </div>

      {/* Image Converter Quick Access */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg mb-6 border border-teal-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🔄</span>
            <div>
              <h3 className="font-bold text-gray-800">Chuyển đổi định dạng ảnh</h3>
              <p className="text-sm text-gray-600">Đổi PNG ↔ JPG ↔ WebP với tùy chỉnh chất lượng</p>
            </div>
          </div>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  if (!file.type.startsWith('image/')) {
                    toast.warning('Vui lòng chọn file ảnh!');
                    return;
                  }
                  const previewUrl = URL.createObjectURL(file);
                  setConverterFile(file);
                  setConverterImageUrl(previewUrl);
                  setShowConverter(true);
                }
              };
              input.click();
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition flex items-center space-x-2"
          >
            <span>📁</span>
            <span>Chọn ảnh từ máy</span>
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
        <h3 className="font-bold text-lg mb-4">Upload File</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file
            </label>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.txt,.zip"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả file..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (optional)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploadProgress}
              className={`w-full py-2 px-4 rounded-md text-white font-medium transition ${
                !selectedFile || uploadProgress
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {uploadProgress ? 'Đang upload...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-xl text-gray-600">Đang tải...</div>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">Chưa có file nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map(item => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition"
            >
              {/* Thumbnail */}
              <div
                className="h-48 bg-gray-100 flex items-center justify-center cursor-pointer"
                onClick={() => openPreview(item)}
              >
                {isImage(item.mimeType) ? (
                  <img
                    src={item.url}
                    alt={item.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl">
                    {item.mimeType?.includes('pdf') ? '📄' : '📦'}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 truncate" title={item.originalName}>
                  {item.originalName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(item.size)}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-600 mt-1 truncate" title={item.description}>
                    {item.description}
                  </p>
                )}
                
                {/* Actions */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {isImage(item.mimeType) && (
                    <>
                      <button
                        onClick={() => openCropper(item)}
                        className="flex-1 min-w-[45%] text-xs bg-green-100 text-green-700 py-1 px-2 rounded hover:bg-green-200 transition"
                        title="Cắt ảnh"
                      >
                        ✂️ Cắt
                      </button>
                      <button
                        onClick={() => openConverter(item)}
                        className="flex-1 min-w-[45%] text-xs bg-teal-100 text-teal-700 py-1 px-2 rounded hover:bg-teal-200 transition"
                        title="Đổi định dạng ảnh"
                      >
                        🔄 Đổi
                      </button>
                      <button
                        onClick={() => openExifEditor(item)}
                        disabled={loadingExif}
                        className={`flex-1 min-w-[45%] text-xs py-1 px-2 rounded transition ${
                          loadingExif
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                        title="Chỉnh sửa EXIF"
                      >
                        {loadingExif ? '⏳' : '📸'} EXIF
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => downloadImage(item)}
                    className="flex-1 min-w-[45%] text-xs bg-indigo-100 text-indigo-700 py-1 px-2 rounded hover:bg-indigo-200 transition"
                    title="Tải xuống"
                  >
                    ⬇️ Tải
                  </button>
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="flex-1 min-w-[45%] text-xs bg-blue-100 text-blue-700 py-1 px-2 rounded hover:bg-blue-200 transition"
                    title="Copy URL"
                  >
                    📋 URL
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="w-full text-xs bg-red-100 text-red-700 py-1 px-2 rounded hover:bg-red-200 transition"
                    title="Xóa"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">{previewMedia.originalName}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadImage(previewMedia)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition flex items-center space-x-1"
                >
                  <span>⬇️</span>
                  <span>Tải xuống</span>
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold px-2"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Preview */}
              {isImage(previewMedia.mimeType) ? (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.originalName}
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-8xl mb-4">
                    {previewMedia.mimeType?.includes('pdf') ? '📄' : '📦'}
                  </div>
                  <p className="text-gray-600 mb-4">Không thể preview file này</p>
                  <a
                    href={previewMedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  >
                    Mở file
                  </a>
                </div>
              )}

              {/* Info */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex">
                  <span className="font-medium w-24">Kích thước:</span>
                  <span>{formatFileSize(previewMedia.size)}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-24">Loại:</span>
                  <span>{previewMedia.mimeType}</span>
                </div>
                {previewMedia.description && (
                  <div className="flex">
                    <span className="font-medium w-24">Mô tả:</span>
                    <span>{previewMedia.description}</span>
                  </div>
                )}
                {previewMedia.tags && previewMedia.tags.length > 0 && (
                  <div className="flex">
                    <span className="font-medium w-24">Tags:</span>
                    <span>{previewMedia.tags.join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="font-medium w-24">URL:</span>
                  <input
                    type="text"
                    value={previewMedia.url}
                    readOnly
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                  <button
                    onClick={() => copyUrl(previewMedia.url)}
                    className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading EXIF Modal */}
      {loadingExif && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
              <div className="text-lg font-semibold text-gray-800">Đang tải ảnh...</div>
              <div className="text-sm text-gray-600">Vui lòng đợi trong giây lát</div>
            </div>
          </div>
        </div>
      )}

      {/* EXIF Editor Modal */}
      {showExifEditor && exifFile && (
        <EXIFEditor
          imageFile={exifFile}
          imageUrl={exifImageUrl}
          onClose={() => {
            setShowExifEditor(false);
            // Cleanup object URL nếu là local file
            if (exifImageUrl && exifImageUrl.startsWith('blob:')) {
              URL.revokeObjectURL(exifImageUrl);
            }
          }}
          onSave={handleExifSave}
        />
      )}

      {/* Image Cropper Modal */}
      {showCropper && cropperFile && (
        <ImageCropper
          imageFile={cropperFile}
          imageUrl={cropperImageUrl}
          onClose={() => {
            setShowCropper(false);
            // Cleanup object URL nếu là local file
            if (cropperImageUrl && cropperImageUrl.startsWith('blob:')) {
              URL.revokeObjectURL(cropperImageUrl);
            }
          }}
          onSave={handleCropSave}
        />
      )}

      {/* Image Converter */}
      {showConverter && (
        <ImageConverter
          imageFile={converterFile}
          imageUrl={converterImageUrl}
          onClose={() => setShowConverter(false)}
          onSave={handleConvertSave}
        />
      )}
    </div>
  );
};

export default MediaManager;
