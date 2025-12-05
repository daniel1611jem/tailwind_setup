import { useState } from 'react';
import toast from 'react-hot-toast';

const ImageConverter = ({ imageFile, imageUrl, onClose, onSave }) => {
  const [outputFormat, setOutputFormat] = useState('jpeg');
  const [quality, setQuality] = useState(0.92);
  const [converting, setConverting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const formats = [
    { value: 'jpeg', label: 'JPEG/JPG', ext: '.jpg', mimeType: 'image/jpeg' },
    { value: 'png', label: 'PNG', ext: '.png', mimeType: 'image/png' },
    { value: 'webp', label: 'WebP', ext: '.webp', mimeType: 'image/webp' }
  ];

  const qualityPresets = [
    { value: 1.0, label: 'Tốt nhất (100%)' },
    { value: 0.95, label: 'Cao (95%)' },
    { value: 0.92, label: 'Khuyến nghị (92%)' },
    { value: 0.85, label: 'Tốt (85%)' },
    { value: 0.75, label: 'Trung bình (75%)' },
    { value: 0.60, label: 'Thấp (60%)' }
  ];

  const getOriginalFormat = () => {
    if (!imageFile) return 'unknown';
    const ext = imageFile.name.split('.').pop().toLowerCase();
    if (ext === 'jpg' || ext === 'jpeg') return 'jpeg';
    if (ext === 'png') return 'png';
    if (ext === 'webp') return 'webp';
    return ext;
  };

  const getFormatInfo = (format) => {
    return formats.find(f => f.value === format);
  };

  const estimateFileSize = () => {
    if (!imageFile) return 'N/A';
    
    const originalSize = imageFile.size;
    const originalFormat = getOriginalFormat();
    
    // Estimate based on format and quality
    let estimatedSize = originalSize;
    
    if (outputFormat === 'jpeg') {
      estimatedSize = originalSize * quality;
      if (originalFormat === 'png') {
        estimatedSize *= 0.7; // PNG to JPEG usually smaller
      }
    } else if (outputFormat === 'png') {
      if (originalFormat === 'jpeg') {
        estimatedSize *= 1.3; // JPEG to PNG usually larger
      }
    } else if (outputFormat === 'webp') {
      estimatedSize = originalSize * quality * 0.75; // WebP usually smaller
    }
    
    return formatFileSize(estimatedSize);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleConvert = async () => {
    if (!imageFile && !imageUrl) {
      toast.error('Không có ảnh để chuyển đổi!');
      return;
    }

    setConverting(true);

    try {
      // Load image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl || URL.createObjectURL(imageFile);
      });

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      
      // Fill white background for JPEG (no transparency)
      if (outputFormat === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);

      // Convert to blob
      const formatInfo = getFormatInfo(outputFormat);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Lỗi khi chuyển đổi ảnh!');
          setConverting(false);
          return;
        }

        // Create preview
        const previewURL = URL.createObjectURL(blob);
        setPreviewUrl(previewURL);

        // Create file object
        const originalName = imageFile?.name || 'image';
        const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        const newFileName = `${baseName}_converted${formatInfo.ext}`;
        
        const convertedFile = new File([blob], newFileName, {
          type: formatInfo.mimeType,
          lastModified: Date.now()
        });

        // Show success
        toast.success(`✓ Đã chuyển đổi sang ${formatInfo.label}!`);
        
        // Auto download
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = newFileName;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
        }, 100);

        // Call onSave if provided
        if (onSave) {
          onSave(convertedFile, blob);
        }

        setConverting(false);
        
      }, formatInfo.mimeType, quality);

    } catch (error) {
      console.error('Error converting image:', error);
      toast.error('Lỗi khi chuyển đổi: ' + error.message);
      setConverting(false);
    }
  };

  const originalFormat = getOriginalFormat();
  const currentFormatInfo = getFormatInfo(outputFormat);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🔄</span>
            <div>
              <h2 className="text-2xl font-bold">Chuyển đổi định dạng ảnh</h2>
              <p className="text-sm text-green-100">
                {imageFile?.name || 'Image'} ({formatFileSize(imageFile?.size || 0)})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center text-2xl transition"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Format Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-semibold text-gray-600">Định dạng hiện tại:</span>
                <span className="ml-2 text-lg font-bold text-blue-600">
                  {originalFormat.toUpperCase()}
                </span>
              </div>
              <div className="text-3xl">→</div>
              <div>
                <span className="text-sm font-semibold text-gray-600">Định dạng đích:</span>
                <span className="ml-2 text-lg font-bold text-green-600">
                  {outputFormat.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              <span className="font-semibold">Dung lượng dự kiến:</span>
              <span className="ml-2">{estimateFileSize()}</span>
            </div>
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Chọn định dạng đầu ra:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {formats.map(format => (
                <button
                  key={format.value}
                  onClick={() => setOutputFormat(format.value)}
                  className={`p-4 rounded-lg border-2 transition ${
                    outputFormat === format.value
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-green-400'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {format.value === 'jpeg' && '📸'}
                    {format.value === 'png' && '🖼️'}
                    {format.value === 'webp' && '🌐'}
                  </div>
                  <div className="font-bold">{format.label}</div>
                  <div className="text-xs text-gray-500">{format.ext}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (không áp dụng cho PNG) */}
          {outputFormat !== 'png' && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Chất lượng đầu ra:
              </label>
              
              {/* Preset buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {qualityPresets.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => setQuality(preset.value)}
                    className={`px-3 py-2 rounded text-sm transition ${
                      quality === preset.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom slider */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Tùy chỉnh:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.01"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-bold text-green-600 w-12">
                  {Math.round(quality * 100)}%
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                💡 Chất lượng cao hơn = Dung lượng file lớn hơn. Khuyến nghị: 92%
              </p>
            </div>
          )}

          {/* Format Comparison */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">📊 So sánh định dạng:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">JPEG/JPG:</span>
                <span className="text-gray-600">Nhỏ gọn, không hỗ trợ transparent, tốt cho ảnh</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">PNG:</span>
                <span className="text-gray-600">Hỗ trợ transparent, lossless, lớn hơn JPEG</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">WebP:</span>
                <span className="text-gray-600">Nhỏ nhất, hiện đại, hỗ trợ transparent</span>
              </div>
            </div>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Kết quả:</h3>
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Converted preview"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {originalFormat === outputFormat && (
              <span className="text-orange-600 font-medium">
                ⚠️ Định dạng giống nhau - Chỉ thay đổi chất lượng
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleConvert}
              disabled={converting}
              className={`px-6 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                converting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700'
              }`}
            >
              {converting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Đang chuyển đổi...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Chuyển đổi & Tải về</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageConverter;
