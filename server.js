const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Cấu hình giới hạn dung lượng để nhận được ảnh Base64 dung lượng lớn (lên tới 50MB hệ thống nhận)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// BỔ SUNG ĐƯỜNG DẪN KẾT NỐI MONGODB TẠI ĐÂY (Hoặc dùng file .env)
const MONGO_URI = process.env.MONGO_URI || "BỔ_SUNG_ĐƯỜNG_DẪN_CONNECTION_STRING_MONGODB_ATLAS_CỦA_BẠN";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Đã kết nối thành công tới MongoDB Atlas'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Thiết kế cấu trúc dữ liệu cho bài viết Drama
const PostSchema = new mongoose.Schema({
    author: { type: String, default: 'Người ẩn danh' },
    content: { type: String, required: true },
    image: { type: String, default: '' }, // Lưu link ảnh hoặc chuỗi Base64 (<16MB)
    createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', PostSchema);

// API 1: Lấy danh sách toàn bộ bài viết (Mới nhất xếp trên)
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API 2: Nhận bài viết mới từ Frontend gửi lên
app.post('/api/posts', async (req, res) => {
    try {
        const { author, content, image } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: 'Nội dung không được để trống' });
        }

        const newPost = new Post({ author, content, image });
        await newPost.save();
        
        res.status(201).json({ message: 'Lưu bài đăng thành công!' });
    } catch (err) {
        // Trả về lỗi nếu chuỗi ảnh vượt quá 16MB tài liệu của Mongo
        if(err.message.includes("BSONObj size")) {
            return res.status(413).json({ error: 'Ảnh chuyển đổi quá lớn cho Database (Vượt giới hạn 16MB của MongoDB Document).' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Chạy server ở port 5000 hoặc port của nhà cung cấp dịch vụ hosting
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend đang chạy tại port ${PORT}`);
});
