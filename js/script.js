
// const BACKEND_API = "http://localhost:5000";
const BACKEND_API = "https://hong-drama-backend.onrender.com";
let localFilesBase64 = [];

window.onload = function () {
    loadCategories();
    loadPosts();
};

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function openModal(imgSrc) {
    const modal = document.getElementById('imageModal');
    document.getElementById('modalImg').src = imgSrc;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('imageModal').classList.remove('show');
    document.body.style.overflow = 'auto';
}

function switchTab(tabName) {
    document.getElementById('page-home').style.display = tabName === 'home' ? 'block' : 'none';
    document.getElementById('page-create').style.display = tabName === 'create' ? 'block' : 'none';

    document.getElementById('btn-home').classList.toggle('active', tabName === 'home');
    document.getElementById('btn-create').classList.toggle('active', tabName === 'create');

    if (tabName === 'home') loadPosts(document.getElementById('categoryFilter').value);
}

// --- CẬP NHẬT: Hàm tự động bóc tách và chuyển đổi mọi link trong ô text ---
function extractAndConvertLinks(inputText) {
    if (!inputText) return [];
    // Dò tìm tất cả đoạn text bắt đầu bằng http:// hoặc https:// (bỏ qua dấu phẩy, khoảng trắng, xuống dòng)
    const urls = inputText.match(/(https?:\/\/[^\s,]+)/g) || [];

    return urls.map(url => {
        const gDriveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)\/view|id=([a-zA-Z0-9_-]+)/;
        const match = url.match(gDriveRegex);
        return match ? `https://drive.google.com/uc?id=${match[1] || match[2]}` : url.trim();
    });
}

document.getElementById('imageFile').addEventListener('change', async function (e) {
    const files = Array.from(e.target.files);
    localFilesBase64 = [];
    for (let file of files) {
        if (file.size > 10 * 1024 * 1024) {
            showToast(`File "${file.name}" vượt quá 10MB!`, 'error');
            this.value = ''; updatePreview(); return;
        }
    }
    const readPromises = files.map(file => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.readAsDataURL(file);
    }));
    localFilesBase64 = await Promise.all(readPromises);
    updatePreview();
});

function generateGalleryHtml(imageUrls) {
        if (!imageUrls || imageUrls.length === 0) return '';
        const isSingle = imageUrls.length === 1 ? 'single-image' : '';
        let html = `<div class="image-gallery ${isSingle}">`;

        imageUrls.forEach(url => {
            html += `
                <div class="img-wrapper" onclick="openModal(this.querySelector('img').src)">
                    <img src="${url}" onerror="this.onerror=null; this.src='../css/anhbiloi.png'">
                    <span class="expand-icon">🔍</span>
                </div>
            `;
        });
        html += `</div>`;
        return html;
    }

// --- CẬP NHẬT: Cải thiện cách gộp link ảnh ---
function updatePreview() {
    document.getElementById('previewAuthor').innerText = `👤 ${document.getElementById('author').value.trim() || 'Người ẩn danh'}`;
    document.getElementById('previewCategory').innerText = `🏷️ ${document.getElementById('category').value.trim() || 'Danh mục'}`;
    document.getElementById('previewText').innerText = document.getElementById('content').value.trim() || 'Nội dung hiển thị tại đây...';

    let allLinks = [...localFilesBase64];
    const linksInput = document.getElementById('imageLink').value;

    // Gọi hàm bóc tách link thông minh
    const textLinks = extractAndConvertLinks(linksInput);
    allLinks = allLinks.concat(textLinks);

    document.getElementById('previewGallery').innerHTML = generateGalleryHtml(allLinks);
}

async function loadCategories() {
    try {
        const res = await fetch(`${BACKEND_API}/api/categories`);
        const categories = await res.json();
        const datalist = document.getElementById('categoryList');
        const filterSelect = document.getElementById('categoryFilter');
        datalist.innerHTML = '';
        filterSelect.innerHTML = '<option value="">🌟 Tất cả drama</option>';
        categories.forEach(cat => {
            if (cat) {
                datalist.innerHTML += `<option value="${cat}">`;
                filterSelect.innerHTML += `<option value="${cat}">🏷️ ${cat}</option>`;
            }
        });
    } catch (err) { console.error("Lỗi tải danh mục:", err); }
}

async function loadPosts(selectedCategory = '') {
    const feed = document.getElementById('feed');
    feed.innerHTML = '<p class="loading">Đang tải...</p>';
    try {
        let url = `${BACKEND_API}/api/posts` + (selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : '');
        const res = await fetch(url);
        const posts = await res.json();
        feed.innerHTML = posts.length === 0 ? '<p class="loading">Chưa có drama nào.</p>' : '';

        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'post-card';
            card.innerHTML = `
                    <div class="post-header">
                        <div class="post-author">👤 ${post.author}</div>
                        <div class="post-category">${post.category}</div>
                    </div>
                    <div class="post-content">${post.content}</div>
                    ${generateGalleryHtml(post.images)}
                `;
            feed.appendChild(card);
        });
    } catch (err) { feed.innerHTML = `<p style="color:red">Lỗi kết nối dữ liệu: ${err.message}</p>`; }
}

// --- CẬP NHẬT: Gửi link ảnh đã được bóc tách lên server ---
function submitPost() {
    const author = document.getElementById('author').value.trim() || 'Người ẩn danh';
    const category = document.getElementById('category').value.trim();
    const content = document.getElementById('content').value.trim();
    const linksInput = document.getElementById('imageLink').value;

    if (!content || !category) return showToast('Vui lòng điền Đầy đủ Danh mục và Nội dung!', 'error');

    let finalImages = [...localFilesBase64];

    // Gọi hàm bóc tách link thông minh
    const textLinks = extractAndConvertLinks(linksInput);
    finalImages = finalImages.concat(textLinks);

    const payload = { author, category, content, images: finalImages };

    showToast('⏳ Đang xử lý tải ảnh và đăng bài...', 'info');

    document.getElementById('category').value = '';
    document.getElementById('content').value = '';
    document.getElementById('imageLink').value = '';
    document.getElementById('imageFile').value = '';
    localFilesBase64 = [];
    updatePreview();
    switchTab('home');

    fetch(`${BACKEND_API}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => {
            if (!res.ok) throw new Error("Lỗi Server");
            return res.json();
        })
        .then(() => {
            showToast('✅ Đăng bài thành công!', 'success');
            loadCategories();
            loadPosts();
        })
        .catch(err => {
            showToast('❌ Lỗi đăng bài: ' + err.message, 'error');
        });
}
