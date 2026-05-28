
# Trạm Hóng Drama Ẩn Danh

Một ứng dụng web Full-stack cho phép người dùng chia sẻ, đăng tải và đọc các câu chuyện "drama", phốt, hoặc tin tức ẩn danh một cách nhanh chóng và bảo mật.

🔗 **[Xem trang web trực tiếp tại đây](https://nhanthichcode.github.io/Hong-Drama/)**

## Tính năng nổi bật
* **Đăng bài ẩn danh:** Người dùng có thể tự do chia sẻ câu chuyện mà không cần đăng nhập.
* **Phân loại danh mục:** Hỗ trợ gắn thẻ (tag) linh hoạt (Học đường, Showbiz, Công sở...) và bộ lọc thông minh trên bảng tin.
* **Tải ảnh đa phương tiện:** * Hỗ trợ tải lên nhiều ảnh cùng lúc (giới hạn 5MB/ảnh) tối ưu hóa qua Cloudinary.
  * Hỗ trợ tự động nhận diện và trích xuất link ảnh từ văn bản.
* **Xem trước (Preview) Real-time:** Hiển thị bài viết và lưới ảnh ngay lập tức khi đang soạn thảo.
* **Thư viện ảnh (Gallery) & Lightbox:** Lưới ảnh thông minh tự chia bố cục và tính năng xem ảnh toàn màn hình (Full-screen).
* **Trải nghiệm mượt mà (SPA):** Chuyển đổi tab không cần tải lại trang, hiển thị thông báo Toast đẹp mắt.

## Công nghệ sử dụng
Dự án được chia tách theo kiến trúc Microservices để tối ưu hóa hiệu suất và chi phí:

* **Frontend (Client):** HTML5, CSS3, Vanilla JavaScript (Triển khai trên **GitHub Pages**).
* **Backend (Server):** Node.js, Express.js, Cors (Triển khai trên **Render.com**).
* **Cơ sở dữ liệu:** MongoDB Atlas (Lưu trữ nội dung văn bản).
* **Lưu trữ hình ảnh:** Cloudinary API.

## Hướng dẫn cài đặt (Dành cho nhà phát triển)

Nếu bạn muốn tải mã nguồn này về máy để phát triển thêm, hãy làm theo các bước sau:

### 1. Cài đặt Backend
Di chuyển vào nhánh `backend` hoặc thư mục chứa backend:
```bash
    npm install
```    
Tạo file .env ở thư mục gốc của backend và thêm các biến môi trường:

Đoạn mã
MONGO_URI=chuoi_ket_noi_mongodb_cua_ban
CLOUDINARY_CLOUD_NAME=ten_cloud_cua_ban
CLOUDINARY_API_KEY=api_key_cua_ban
CLOUDINARY_API_SECRET=api_secret_cua_ban
PORT=5000
Chạy server:

Bash
node server.js
2. Cài đặt Frontend
Di chuyển vào nhánh main (chứa Frontend). Mở file index.html và đảm bảo biến BACKEND_API trỏ đúng về server local của bạn:

JavaScript
const BACKEND_API = "http://localhost:5000";
Mở file index.html bằng Live Server trên VS Code hoặc trình duyệt bất kỳ để trải nghiệm.

Phát triển bởi [Tên/Biệt danh của bạn]

*(Lưu ý: Nhớ thay dòng `THAY_BẰNG_LINK_GITHUB_PAGES_CỦA_BẠN` thành link thật của bạn nhé).*

---

### Phần 2: Cách đặt link dự án lên đầu trang (Ghim link)

Có 2 cách hiểu về việc "đặt link lên đầu trang". Mình sẽ hướng dẫn bạn cả 2 để dự án trông thật xịn xò:

#### Cách 1: Đặt link ở phần "About" của GitHub (Góc phải trên cùng)
Khi người khác vào kho mã nguồn (Repository) của bạn, cái họ muốn thấy nhất là một nút bấm để vào xem web thật ngay lập tức.
1. Truy cập vào trang chủ Repository của bạn trên GitHub.
2. Nhìn sang cột bên tay phải, bạn sẽ thấy mục **About**. Bấm vào biểu tượng **bánh răng ⚙️** bên cạnh chữ About.
3. Ở khung nhập liệu hiện ra, bạn điền các thông tin sau:
   * **Description:** Ghi một câu giới thiệu ngắn (VD: *Nơi chia sẻ drama ẩn danh cực gắt*).
   * **Website:** Dán cái link GitHub Pages của bạn vào đây (VD: `https://nhanthichcode.github.io/...`).
   * Tích chọn mục **Include in the home page**.
4. Bấm **Save changes**. 
=> *Kết quả: Link web của bạn sẽ sáng lên màu xanh ở ngay đầu cột bên phải, ai vào GitHub của bạn cũng bấm vào chơi được ngay.*

#### Cách 2: Đặt link GitHub của bạn lên thanh Navbar của trang web Trạm Drama
Nếu bạn muốn những người dùng web biết bạn là tác giả và có thể truy cập vào mã nguồn GitHub của bạn, hãy gắn nó lên thanh điều hướng (Navbar) trên cùng của giao diện.

Bạn mở file `index.html`, tìm đến phần `<nav class="navbar">` và bổ sung thêm 1 nút bấm (chứa link dẫn về kho GitHub của bạn) như thế này:

```html
<nav class="navbar">
    <button class="nav-btn active" id="btn-home" onclick="switchTab('home')">🏠 Bảng Tin</button>
    <button class="nav-btn" id="btn-create" onclick="switchTab('create')">✍️ Đăng Bài</button>
    
    <a href="https://github.com/nhanthichcode/Ten-Repo-Cua-Ban" target="_blank" style="margin-left: auto; text-decoration: none;">
        <button class="nav-btn" style="color: #2f3542;">⭐ Mã nguồn GitHub</button>
    </a>
</nav>    