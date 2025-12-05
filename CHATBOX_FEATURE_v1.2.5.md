# ChatBox - Ghi chú & Chat đơn giản - v1.2.5

## Tính năng

Thêm ChatBox component vào hệ thống để:
- **Ghi chú nhanh**: Lưu các ghi chú, reminder, task list
- **Chat đơn giản**: Dùng chung cho team (không cần user/login)
- **Ghim tin nhắn**: Tối đa 3 tin nhắn quan trọng
- **Lưu trữ local**: Tất cả tin nhắn lưu trong localStorage
- **Timestamp**: Hiển thị thời gian tương đối (vừa xong, 5 phút trước, 2 giờ trước...)

## Files đã tạo/sửa

### 1. src/components/ChatBox.jsx (Mới)

**Component chính với các tính năng:**

#### State Management
```jsx
const [messages, setMessages] = useState([]);           // Tất cả tin nhắn
const [inputMessage, setInputMessage] = useState('');   // Input hiện tại
const [pinnedMessages, setPinnedMessages] = useState([]); // Tin nhắn đã ghim (max 3)
```

#### localStorage Keys
- `chatMessages`: Lưu tất cả tin nhắn
- `pinnedMessages`: Lưu danh sách tin nhắn ghim

#### Message Structure
```javascript
{
  id: 1234567890,              // timestamp
  text: "Nội dung tin nhắn",
  timestamp: "2025-11-27T10:30:00.000Z",
  isPinned: false
}
```

#### Các functions chính

**1. handleSendMessage()**
```jsx
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
```

**2. handlePinMessage(messageId)**
```jsx
const handlePinMessage = (messageId) => {
  const message = messages.find(m => m.id === messageId);
  
  if (pinnedMessages.find(p => p.id === messageId)) {
    // Unpin
    setPinnedMessages(prev => prev.filter(p => p.id !== messageId));
    toast.success('✓ Đã bỏ ghim');
  } else {
    // Check limit
    if (pinnedMessages.length >= 3) {
      toast.error('❌ Tối đa 3 tin nhắn ghim!');
      return;
    }
    
    // Pin
    setPinnedMessages(prev => [...prev, message]);
    toast.success('✓ Đã ghim tin nhắn');
  }
};
```

**3. handleDeleteMessage(messageId)**
```jsx
const handleDeleteMessage = (messageId) => {
  if (!window.confirm('Xóa tin nhắn này?')) return;
  
  setMessages(prev => prev.filter(m => m.id !== messageId));
  setPinnedMessages(prev => prev.filter(p => p.id !== messageId));
  toast.success('✓ Đã xóa tin nhắn');
};
```

**4. handleClearAll()**
```jsx
const handleClearAll = () => {
  if (!window.confirm('Xóa TẤT CẢ tin nhắn?')) return;
  
  setMessages([]);
  setPinnedMessages([]);
  localStorage.removeItem('chatMessages');
  localStorage.removeItem('pinnedMessages');
  toast.success('✓ Đã xóa tất cả tin nhắn');
};
```

**5. formatTimestamp(isoString)**
```jsx
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
```

#### UI Structure

```
┌─────────────────────────────────────────────┐
│ Header                                       │
│ 💬 Ghi chú & Chat                           │
│ 5 tin nhắn • 2/3 ghim          [🗑️][×]     │
├─────────────────────────────────────────────┤
│ Pinned Messages (Sticky)                    │
│ 📌 Tin nhắn ghim (2/3)                      │
│ ┌─────────────────────────────────────┐     │
│ │ Nhớ họp lúc 3pm           [📌]     │     │
│ │ 🕐 2 giờ trước                      │     │
│ └─────────────────────────────────────┘     │
├─────────────────────────────────────────────┤
│ Messages Area (Scrollable)                  │
│                                              │
│ ┌─────────────────────────────────────┐     │
│ │ Tin nhắn 1         [📍][🗑️]        │     │
│ │ 🕐 5 phút trước                     │     │
│ └─────────────────────────────────────┘     │
│                                              │
│ ┌─────────────────────────────────────┐     │
│ │ Tin nhắn 2         [📌][🗑️]        │     │
│ │ 🕐 1 giờ trước     📌 Đã ghim      │     │
│ └─────────────────────────────────────┘     │
│                                              │
├─────────────────────────────────────────────┤
│ Input Area                                   │
│ ┌─────────────────────────┐ [📤 Gửi]       │
│ │ Nhập tin nhắn...        │                │
│ └─────────────────────────┘                │
│ 0/500 ký tự    💡 Ghim max 3 tin           │
└─────────────────────────────────────────────┘
```

### 2. src/pages/AccountListEditable.jsx (Đã sửa)

**Thay đổi:**

1. **Import ChatBox:**
```jsx
import ChatBox from '../components/ChatBox';
```

2. **Thêm state:**
```jsx
const [showChatBox, setShowChatBox] = useState(false);
```

3. **Thêm nút "Ghi chú" trong header:**
```jsx
<button
  onClick={() => setShowChatBox(true)}
  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded transition flex items-center space-x-2"
>
  <span>💬</span>
  <span>Ghi chú</span>
</button>
```

4. **Render ChatBox component:**
```jsx
<ChatBox
  isOpen={showChatBox}
  onClose={() => setShowChatBox(false)}
/>
```

## Cách sử dụng

### 1. Mở ChatBox

Click nút **💬 Ghi chú** trên header của AccountListEditable

### 2. Gửi tin nhắn

1. Nhập nội dung vào ô input (max 500 ký tự)
2. Click **📤 Gửi** hoặc nhấn Enter
3. Tin nhắn xuất hiện với timestamp

### 3. Ghim tin nhắn

1. Hover vào tin nhắn → Xuất hiện nút **📍**
2. Click **📍** → Tin nhắn được ghim lên đầu
3. Icon chuyển thành **📌** (màu vàng)
4. Tối đa 3 tin ghim, nếu đầy phải bỏ ghim tin cũ trước

### 4. Bỏ ghim

1. Click nút **📌** trên tin nhắn đã ghim
2. Hoặc click **📌** trong phần "Tin nhắn ghim" ở đầu

### 5. Xóa tin nhắn

1. Hover vào tin nhắn → Click **🗑️**
2. Confirm → Tin nhắn bị xóa
3. Nếu tin nhắn đã ghim, sẽ tự động bỏ ghim

### 6. Xóa tất cả

1. Click nút **🗑️ Xóa hết** trên header
2. Confirm → Xóa toàn bộ tin nhắn + tin ghim
3. localStorage cũng bị clear

## Use Cases

### 1. Ghi chú công việc
```
💬 Nhớ check proxy của account A123 lúc 5pm
💬 Upload thêm ảnh cho profile John Doe
💬 Liên hệ supplier về batch mới
```

### 2. Task tracking
```
📌 [URGENT] Gia hạn proxy server trước 30/11
💬 Done: Upload 50 ảnh cho campaign X
💬 TODO: Review EXIF data của 100 ảnh mới
```

### 3. Team notes
```
💬 Admin: Đã update column "Status" cho tất cả accounts
💬 Đã thêm 20 proxy mới từ provider Y
📌 LƯU Ý: Không xóa accounts có tag "VIP"
```

### 4. Reminders
```
📌 Meeting: Thứ 6 lúc 2pm - Review performance
💬 Backup database mỗi Chủ Nhật
💬 Check email support hàng ngày
```

## Tính năng nổi bật

### 1. Pinned Messages Area

**Vị trí:** Sticky ở đầu chatbox (dưới header)  
**Màu sắc:** Vàng nhạt (bg-yellow-50)  
**Icon:** 📌  
**Limit:** 3 tin nhắn

**Hiển thị:**
```
📌 Tin nhắn ghim (2/3)
┌────────────────────────────────────┐
│ Nhớ họp meeting lúc 3pm      [📌] │
│ 🕐 2 giờ trước                     │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│ URGENT: Check proxy server   [📌] │
│ 🕐 5 giờ trước                     │
└────────────────────────────────────┘
```

### 2. Relative Timestamps

**Format tự động:**
- `< 1 phút`: "Vừa xong"
- `1-59 phút`: "5 phút trước"
- `1-23 giờ`: "3 giờ trước"
- `1-6 ngày`: "2 ngày trước"
- `≥ 7 ngày`: "27/11/2025 10:30"

### 3. Auto-scroll

- Tự động scroll xuống dưới cùng khi có tin nhắn mới
- Focus vào input khi mở chatbox

### 4. Message Actions (Hover)

Khi hover vào tin nhắn → Hiện 2 nút:
- **📍/📌**: Ghim/Bỏ ghim
- **🗑️**: Xóa tin nhắn

Opacity: 0 → 100% on hover (smooth transition)

### 5. Visual States

**Normal message:**
- Background: White
- Border: None

**Pinned message:**
- Background: Yellow-50
- Border-left: 4px yellow-400
- Icon: 📌 (màu vàng)
- Badge: "📌 Đã ghim"

### 6. Character Counter

Hiển thị: `0/500 ký tự`  
Limit: 500 characters per message

### 7. Empty State

Khi chưa có tin nhắn:
```
        💬
  Chưa có tin nhắn nào
Gửi tin nhắn đầu tiên để bắt đầu!
```

## localStorage Structure

### chatMessages
```json
[
  {
    "id": 1732704600000,
    "text": "Nhớ check proxy lúc 5pm",
    "timestamp": "2025-11-27T10:30:00.000Z",
    "isPinned": false
  },
  {
    "id": 1732708200000,
    "text": "URGENT: Backup database",
    "timestamp": "2025-11-27T11:30:00.000Z",
    "isPinned": true
  }
]
```

### pinnedMessages
```json
[
  {
    "id": 1732708200000,
    "text": "URGENT: Backup database",
    "timestamp": "2025-11-27T11:30:00.000Z",
    "isPinned": true
  }
]
```

## Toast Notifications

**Success:**
- ✓ Đã gửi tin nhắn
- ✓ Đã ghim tin nhắn
- ✓ Đã bỏ ghim
- ✓ Đã xóa tin nhắn
- ✓ Đã xóa tất cả tin nhắn

**Error:**
- Vui lòng nhập tin nhắn! (khi input rỗng)
- ❌ Tối đa 3 tin nhắn ghim! Vui lòng bỏ ghim tin cũ.

## Styling Details

### Color Scheme

**Header Gradient:**
```css
from-purple-600 to-pink-600
```

**Button (Ghi chú):**
```css
from-purple-600 to-pink-600
hover:from-purple-700 hover:to-pink-700
```

**Pinned Area:**
```css
bg-yellow-50
border-yellow-200
text-yellow-600
```

**Message (Normal):**
```css
bg-white
hover:shadow-md
```

**Message (Pinned):**
```css
bg-yellow-50
border-l-4 border-yellow-400
```

### Animations

**Message hover:**
```css
transition
opacity-0 → opacity-100 (actions)
shadow-sm → shadow-md
```

**Auto-scroll:**
```javascript
scrollIntoView({ behavior: 'smooth' })
```

## Testing Checklist

### Basic Functions
- [ ] Click nút "💬 Ghi chú" → ChatBox mở
- [ ] Click nút ×  → ChatBox đóng
- [ ] Nhập tin nhắn → Click Gửi → Tin xuất hiện
- [ ] Nhập rỗng → Click Gửi → Toast error
- [ ] Tin nhắn hiển thị timestamp đúng

### Pin/Unpin
- [ ] Click 📍 → Tin được ghim lên đầu
- [ ] Icon chuyển 📍 → 📌
- [ ] Badge "📌 Đã ghim" xuất hiện
- [ ] Click 📌 → Bỏ ghim → Tin về vị trí cũ
- [ ] Ghim 3 tin → Ghim tin thứ 4 → Toast error
- [ ] Bỏ ghim 1 tin → Có thể ghim tin mới

### Delete
- [ ] Click 🗑️ → Confirm → Tin bị xóa
- [ ] Xóa tin đã ghim → Tin biến khỏi cả 2 vùng
- [ ] Click "🗑️ Xóa hết" → Confirm → Tất cả tin bị xóa
- [ ] Sau khi xóa hết → Hiển thị empty state

### Persistence
- [ ] Gửi tin → Reload page → Tin vẫn còn
- [ ] Ghim tin → Reload page → Tin vẫn ghim
- [ ] Xóa tin → Reload page → Tin không còn
- [ ] Xóa hết → Reload → Empty state

### Character Limit
- [ ] Nhập 500 ký tự → Counter hiển thị "500/500"
- [ ] Không thể nhập quá 500 ký tự

### Timestamp Format
- [ ] Tin mới: "Vừa xong"
- [ ] Tin 5 phút: "5 phút trước"
- [ ] Tin 2 giờ: "2 giờ trước"
- [ ] Tin 3 ngày: "3 ngày trước"
- [ ] Tin > 1 tuần: "27/11/2025 10:30"

## Future Enhancements

### 1. Search/Filter
```jsx
const [searchTerm, setSearchTerm] = useState('');
const filteredMessages = messages.filter(m => 
  m.text.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### 2. Tags/Categories
```jsx
{
  id: 123,
  text: "Message",
  tags: ['urgent', 'work'],
  category: 'reminder'
}
```

### 3. Edit Message
```jsx
const handleEditMessage = (messageId, newText) => {
  setMessages(prev => prev.map(m => 
    m.id === messageId ? { ...m, text: newText, edited: true } : m
  ));
};
```

### 4. Export to File
```jsx
const exportMessages = () => {
  const data = JSON.stringify(messages, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  // Download...
};
```

### 5. Import from File
```jsx
const importMessages = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const imported = JSON.parse(e.target.result);
    setMessages(imported);
  };
  reader.readAsText(file);
};
```

### 6. Rich Text
- Bold, italic, strikethrough
- Links auto-detection
- Emoji picker
- Markdown support

### 7. Attachments
- Upload images
- Attach files
- Voice notes

### 8. Notifications
- Browser notifications
- Badge count (unread messages)

## Version History

- **v1.2.1**: EXIF Editor, Profile system
- **v1.2.2**: GPS coordinate sync
- **v1.2.3**: GPS Ref ExifTool fix
- **v1.2.4**: Remove all alerts → Toast
- **v1.2.5**: **ChatBox - Ghi chú & Chat đơn giản**

---

**Updated:** 2025-11-27  
**Version:** 1.2.5  
**Feature:** ChatBox với ghim tin nhắn (max 3), timestamp, localStorage
