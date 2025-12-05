import { useState } from 'react';
import toast from 'react-hot-toast';

const ImageCropper = ({ imageFile, imageUrl, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);

  const handleQuickCrop = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success('Tính năng đang được nâng cấp!');
      setLoading(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">✂️ Image Cropper</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🚧</div>
          <p className="text-lg mb-4">Chức năng đang được nâng cấp với tính năng kéo chọn vùng cắt!</p>
          <p className="text-sm text-gray-600 mb-6">Vui lòng đợi một chút...</p>
          
          {imageUrl && (
            <img src={imageUrl} alt="Preview" className="max-w-full max-h-64 mx-auto rounded mb-4" />
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Đóng
          </button>
          <button
            onClick={handleQuickCrop}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Đang xử lý...' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
