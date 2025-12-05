import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const ChatBox = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    const savedPinned = localStorage.getItem('pinnedMessages');
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Error loading messages:', e);
      }
    }
    
    if (savedPinned) {
      try {
        setPinnedMessages(JSON.parse(savedPinned));
      } catch (e) {
        console.error('Error loading pinned messages:', e);
      }
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('pinnedMessages', JSON.stringify(pinnedMessages));
  }, [pinnedMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) {
      toast.error('Vui lòng nhập tin nhắn!');
      return;
    }

    const newMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      isPinned: false
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    toast.success('✓ Đã gửi tin nhắn');
  };

  const handlePinMessage = (messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    // Check if already pinned
    if (pinnedMessages.find(p => p.id === messageId)) {
      // Unpin
      setPinnedMessages(prev => prev.filter(p => p.id !== messageId));
      toast.success('✓ Đã bỏ ghim');
    } else {
      // Check limit
      if (pinnedMessages.length >= 3) {
        toast.error('❌ Tối đa 3 tin nhắn ghim! Vui lòng bỏ ghim tin cũ.');
        return;
      }
      
      // Pin
      setPinnedMessages(prev => [...prev, message]);
      toast.success('✓ Đã ghim tin nhắn');
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (!window.confirm('Xóa tin nhắn này?')) return;
    
    setMessages(prev => prev.filter(m => m.id !== messageId));
    setPinnedMessages(prev => prev.filter(p => p.id !== messageId));
    toast.success('✓ Đã xóa tin nhắn');
  };

  const handleClearAll = () => {
    if (!window.confirm('Xóa TẤT CẢ tin nhắn? Hành động này không thể hoàn tác!')) return;
    
    setMessages([]);
    setPinnedMessages([]);
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('pinnedMessages');
    toast.success('✓ Đã xóa tất cả tin nhắn');
  };

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPinned = (messageId) => {
    return pinnedMessages.some(p => p.id === messageId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">💬</span>
            <div>
              <h2 className="text-xl font-bold">Ghi chú & Chat</h2>
              <p className="text-sm text-purple-100">{messages.length} tin nhắn • {pinnedMessages.length}/3 ghim</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded text-sm font-medium transition"
                title="Xóa tất cả"
              >
                🗑️ Xóa hết
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Pinned Messages */}
        {pinnedMessages.length > 0 && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-yellow-600 font-semibold text-sm">📌 Tin nhắn ghim ({pinnedMessages.length}/3)</span>
            </div>
            <div className="space-y-2">
              {pinnedMessages.map(msg => (
                <div key={msg.id} className="bg-white rounded p-2 border border-yellow-300 text-sm">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-800 flex-1">{msg.text}</p>
                    <button
                      onClick={() => handlePinMessage(msg.id)}
                      className="ml-2 text-yellow-600 hover:text-yellow-800"
                      title="Bỏ ghim"
                    >
                      📌
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatTimestamp(msg.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-500 text-lg">Chưa có tin nhắn nào</p>
              <p className="text-gray-400 text-sm mt-2">Gửi tin nhắn đầu tiên để bắt đầu!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isPinned(msg.id) ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-white'
                } rounded-lg p-3 shadow-sm hover:shadow-md transition group`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="text-gray-800 flex-1 break-words">{msg.text}</p>
                  <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handlePinMessage(msg.id)}
                      className={`p-1.5 rounded hover:bg-gray-100 ${
                        isPinned(msg.id) ? 'text-yellow-600' : 'text-gray-400'
                      }`}
                      title={isPinned(msg.id) ? 'Bỏ ghim' : 'Ghim tin nhắn'}
                    >
                      {isPinned(msg.id) ? '📌' : '📍'}
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      title="Xóa tin nhắn"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    🕐 {formatTimestamp(msg.timestamp)}
                  </p>
                  {isPinned(msg.id) && (
                    <span className="text-xs text-yellow-600 font-medium">
                      📌 Đã ghim
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn hoặc ghi chú..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={500}
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-medium"
            >
              📤 Gửi
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              {inputMessage.length}/500 ký tự
            </p>
            <p className="text-xs text-gray-400">
              💡 Ghim tối đa 3 tin nhắn quan trọng
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
