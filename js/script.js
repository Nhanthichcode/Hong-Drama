const BACKEND_API = "https://hong-drama-backend.onrender.com";
let globalPosts = []; // Lưu trữ mảng bài viết tải về
    let uploadFilesArray = []; // Lưu danh sách các file đang chuẩn bị upload

    window.onload = function() {
        loadCategories();
        loadPosts();
    };

    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 9000);
    }

    function openModal(imgSrc) {
        document.getElementById('modalImg').src = imgSrc;
        document.getElementById('imageModal').classList.add('show');
        document.body.style.overflow = 'hidden'; 
    }
    
    function closeModal() {
        document.getElementById('imageModal').classList.remove('show');
        document.body.style.overflow = 'auto'; 
    }

    // Cơ chế chuyển Tab mượt mà
    function switchTab(tabName) {
        document.getElementById('page-home').style.display = tabName === 'home' ? 'block' : 'none';
        document.getElementById('page-create').style.display = tabName === 'create' ? 'block' : 'none';
        document.getElementById('page-detail').style.display = tabName === 'detail' ? 'block' : 'none';
        
        document.getElementById('btn-home').classList.toggle('active', tabName === 'home');
        document.getElementById('btn-create').classList.toggle('active', tabName === 'create');
        document.getElementById('pageTitle').innerText = tabName === 'detail' ? 'Chi Tiết Drama 🕵️‍♂️' : 'Trạm Hóng Drama 🕵️‍♂️';

        if(tabName === 'home') {
            loadPosts(document.getElementById('categoryFilter').value);
        }
    }

    // === TÍNH NĂNG 1: QUẢN LÝ FILE UPLOAD THÔNG MINH ===
    document.getElementById('imageFile').addEventListener('change', async function(e) {
        const files = Array.from(e.target.files);
        
        for(let file of files) {
            // Kiểm tra trùng tên file (Tránh người dùng chọn 2 lần 1 file)
            if(uploadFilesArray.find(f => f.name === file.name)) continue;

            if (file.size === 0) {
                showToast(`File "${file.name}" bị hỏng hoặc không có dữ liệu!`, 'error');
                continue; // Bỏ qua file này, không đưa vào danh sách
            }    
            
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const isOversize = file.size > 10 * 1024 * 1024; // > 10MB
            
            // Đọc file thành Base64
            const base64 = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = event => resolve(event.target.result);
                reader.readAsDataURL(file);
            });

            uploadFilesArray.push({
                name: file.name,
                size: sizeMB,
                isOversize: isOversize,
                base64: base64
            });
        }
        renderSelectedFiles();
    });

    function removeFile(index) {
        uploadFilesArray.splice(index, 1);
        renderSelectedFiles();
    }

    function renderSelectedFiles() {
        const box = document.getElementById('selectedFilesBox');
        const submitBtn = document.getElementById('submitBtn');
        box.innerHTML = '';
        
        let hasError = false;

        uploadFilesArray.forEach((file, index) => {
            if(file.isOversize) hasError = true;

            box.innerHTML += `
                <div class="file-item ${file.isOversize ? 'error' : ''}">
                    <!-- CẬP NHẬT: Thêm thẻ img để hiển thị ảnh thu nhỏ -->
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${file.base64}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #ced6e0;">
                        
                        <div style="display: flex; flex-direction: column;">
                            <span class="file-name">${file.name}</span>
                            <span class="file-size">${file.size} / 10MB ${file.isOversize ? '(Quá giới hạn 10MB)' : ''}</span>
                        </div>
                    </div>
                    
                    <button class="btn-remove-file" onclick="removeFile(${index})" title="Xóa ảnh này">&times;</button>
                </div>
            `;
        });

        // Khóa nút Đăng nếu có ảnh vượt dung lượng
        submitBtn.disabled = hasError;
        if(hasError) {
            submitBtn.innerText = "⚠️ Vui lòng xóa ảnh quá dung lượng";
            submitBtn.style.backgroundColor = "#747d8c"; // Đổi màu nút thành xám
        } else {
            submitBtn.innerText = "Đăng Bài";
            submitBtn.style.backgroundColor = ""; // Trả lại màu gốc
        }
    }

    function extractAndConvertLinks(inputText) {
        if (!inputText) return [];
        const urls = inputText.match(/(https?:\/\/[^\s,]+)/g) || [];
        return urls.map(url => {
            const gDriveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)\/view|id=([a-zA-Z0-9_-]+)/;
            const match = url.match(gDriveRegex);
            return match ? `https://drive.google.com/uc?id=${match[1] || match[2]}` : url.trim();
        });
    }

    const errorImageBase64 = "../css/anhbiloi.png";

    // === TÍNH NĂNG 3 & 4: RENDER ẢNH CUỘN NGANG (FEED) VS GRID (DETAIL) ===
    function generateGalleryHtml(imageUrls, mode = 'horizontal') {
        if (!imageUrls || imageUrls.length === 0) return '';
        
        if(mode === 'horizontal') {
            // Style cuộn ngang cho Bảng tin
            let html = `<div class="horizontal-gallery">`;
            imageUrls.forEach(url => {
                html += `
                    <div class="img-wrapper">
                        <img src="${url}" onerror="this.onerror=null; this.src='../css/anhbiloi.png'">
                    </div>
                `;
            });
            html += `</div>`;
            return html;
        } else {
            // Style Grid lưới cho Trang chi tiết
            const isSingle = imageUrls.length === 1 ? 'single-image' : '';
            let html = `<div class="grid-gallery ${isSingle}">`;
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
    }

    async function loadCategories() {
        try {
            const res = await fetch(`${BACKEND_API}/api/categories`);
            const categories = await res.json();
            document.getElementById('categoryList').innerHTML = '';
            document.getElementById('categoryFilter').innerHTML = '<option value="">🌟 Tất cả drama</option>';
            categories.forEach(cat => {
                if(cat) { 
                    document.getElementById('categoryList').innerHTML += `<option value="${cat}">`; 
                    document.getElementById('categoryFilter').innerHTML += `<option value="${cat}">🏷️ ${cat}</option>`; 
                }
            });
        } catch (err) {}
    }

    async function loadPosts(selectedCategory = '') {
        const feed = document.getElementById('feed');
        feed.innerHTML = '<p class="loading">Đang tải...</p>';
        try {
            let url = `${BACKEND_API}/api/posts` + (selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : '');
            const res = await fetch(url);
            globalPosts = await res.json(); // Lưu vào mảng toàn cục
            
            feed.innerHTML = globalPosts.length === 0 ? '<p class="loading">Chưa có drama nào.</p>' : '';
            
            globalPosts.forEach((post, index) => {
                const card = document.createElement('div');
                card.className = 'post-card';
                // Bấm vào bất kỳ đâu trên thẻ bài viết cũng sẽ mở chi tiết
                card.onclick = () => viewPostDetail(index); 

                // TÍNH NĂNG 2: Tóm tắt bài viết (cắt bớt nếu quá dài)
                const isLongText = post.content.length > 250;

                card.innerHTML = `
                    <div class="post-header">
                        <div class="post-author">👤 ${post.author}</div>
                        <div class="post-category">${post.category}</div>
                    </div>
                    
                    <div class="post-content ${isLongText ? 'truncate' : ''}" style="white-space: pre-wrap; padding-bottom: 10px;">${post.content}</div>
                    ${isLongText ? `<span class="read-more">Xem thêm...</span>` : ''}
                    
                    ${generateGalleryHtml(post.images, 'horizontal')}
                `;
                feed.appendChild(card);
            });
        } catch (err) { feed.innerHTML = `<p style="color:red">Lỗi kết nối dữ liệu: ${err.message}</p>`; }
    }

    // === TÍNH NĂNG 5: MỞ TRANG CHI TIẾT BÀI VIẾT ===
    function viewPostDetail(index) {
        const post = globalPosts[index];
        if(!post) return;

        const detailBox = document.getElementById('detailContent');
        detailBox.innerHTML = `
            <div class="post-header" style="margin-bottom: 20px;">
                <div class="post-author" style="font-size: 1.2em;">👤 ${post.author}</div>
                <div class="post-category">${post.category}</div>
            </div>
            
            <div class="post-content" style="white-space: pre-wrap; font-size: 1.05em; margin-bottom: 20px;">${post.content}</div>
            
            ${generateGalleryHtml(post.images, 'grid')}
            
            <div style="margin-top: 20px; font-size: 0.8em; color: #a4b0be; text-align: right;">
                ⏰ Đăng lúc: ${new Date(post.createdAt).toLocaleString('vi-VN')}
            </div>
        `;

        switchTab('detail');
        window.scrollTo(0, 0); // Tự động cuộn lên đầu trang
    }

    function submitPost() {
        const author = document.getElementById('author').value.trim() || 'Người ẩn danh';
        const category = document.getElementById('category').value.trim();
        const content = document.getElementById('content').value.trim();
        const linksInput = document.getElementById('imageLink').value;

        if (!content || !category) return showToast('Vui lòng điền Đầy đủ Danh mục và Nội dung!', 'error');

        // Lấy danh sách Base64 từ mảng quản lý file
        let finalImages = uploadFilesArray.map(file => file.base64);
        
        const textLinks = extractAndConvertLinks(linksInput);
        finalImages = finalImages.concat(textLinks);

        const payload = { author, category, content, images: finalImages };

        showToast('⏳ Đang xử lý tải ảnh và đăng bài...', 'info');

        // Dọn dẹp form
        document.getElementById('category').value = '';
        document.getElementById('content').value = '';
        document.getElementById('imageLink').value = '';
        document.getElementById('imageFile').value = '';
        uploadFilesArray = [];
        renderSelectedFiles();
        switchTab('home');

        fetch(`${BACKEND_API}/api/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(() => {
            showToast('✅ Đăng bài thành công!', 'success');
            loadCategories(); 
            loadPosts(); 
        })
        .catch(err => showToast('❌ Lỗi đăng bài: ' + err.message, 'error'));
    }