import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary'; 

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors({
    origin: 'https://nhanthichcode.github.io',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const PostSchema = new mongoose.Schema({
    author: { type: String, default: 'Người ẩn danh' },
    content: { type: String, required: true },
    category: { type: String, required: true },
    images: { type: [String], default: [] }, 
    createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', PostSchema);

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Post.distinct('category');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/posts', async (req, res) => {
    try {
        const { category } = req.query; 
        const filter = category ? { category: category } : {};
        const posts = await Post.find(filter).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CẬP NHẬT: Xử lý Upload Bỏ qua ảnh lỗi (Fault Tolerance) ---
app.post('/api/posts', async (req, res) => {
    try {
        const { author, content, images, category } = req.body;
        
        if (!content || !category) {
            return res.status(400).json({ error: 'Nội dung và danh mục không được để trống' });
        }

        let finalImageUrls = [];

        if (images && Array.isArray(images) && images.length > 0) {
            const uploadPromises = images.map(async (img) => {
                if (img.startsWith('data:image')) {
                    try {
                        // Thử tải ảnh lên Cloudinary
                        const uploadResult = await cloudinary.uploader.upload(img, {
                            folder: 'drama_posts', 
                        });
                        return uploadResult.secure_url;
                    } catch (uploadErr) {
                        // NẾU ẢNH LỖI (Ví dụ quá lớn): Log ra server và trả về null thay vì phá vỡ toàn bộ
                        console.log("⚠️ Đã bỏ qua 1 ảnh lỗi:", uploadErr.message);
                        return null; 
                    }
                } else {
                    return img; // Link web bình thường (Google Drive) thì giữ nguyên
                }
            });

            // Chờ tất cả ảnh xử lý xong (kể cả ảnh thành công lẫn ảnh trả về null)
            const results = await Promise.all(uploadPromises);

            // Lọc ra chỉ lấy các đường link hợp lệ (khác null)
            finalImageUrls = results.filter(url => url !== null);
        }

        const newPost = new Post({ 
            author, 
            content, 
            category,
            images: finalImageUrls 
        });
        
        await newPost.save();
        
        // Trả về thông báo kèm số lượng ảnh tải thành công để Front-end biết
        res.status(201).json({ 
            message: 'Lưu bài đăng thành công!',
            uploadedImagesCount: finalImageUrls.length
        });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi Server: ' + err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy tại port ${PORT}, Hãy mở trình duyệt để truy cập`));