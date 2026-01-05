// 标签页切换
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // 移除所有 active 类
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // 添加 active 类
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// ========== 图片压缩功能 ==========
const compressUpload = document.getElementById('compressUpload');
const compressInput = document.getElementById('compressInput');
const compressPreview = document.getElementById('compressPreview');
const compressBtn = document.getElementById('compressBtn');

let compressFile = null;

// 点击上传区域
compressUpload.addEventListener('click', () => compressInput.click());

// 拖拽上传
compressUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    compressUpload.style.background = '#e8ebff';
});

compressUpload.addEventListener('dragleave', () => {
    compressUpload.style.background = '#f8f9ff';
});

compressUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    compressUpload.style.background = '#f8f9ff';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleCompressFile(files[0]);
    }
});

// 选择文件
compressInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleCompressFile(e.target.files[0]);
    }
});

function handleCompressFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }

    compressFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const originalSize = (file.size / 1024).toFixed(2);
            compressPreview.innerHTML = `
                <img src="${e.target.result}" alt="preview">
                <div class="preview-info">
                    <p><strong>文件名：</strong> ${file.name}</p>
                    <p><strong>尺寸：</strong> ${img.width} × ${img.height} px</p>
                    <p><strong>大小：</strong> ${originalSize} KB</p>
                </div>
            `;
            compressBtn.style.display = 'block';
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

// 压缩按钮
compressBtn.addEventListener('click', async () => {
    compressBtn.disabled = true;
    compressBtn.textContent = '⏳ 压缩中...';

    try {
        const canvas = await compressImage(compressFile, 0.7);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 0.7);
        link.download = `compressed-${Date.now()}.jpg`;
        link.click();

        // 显示压缩后的大小
        const compressedSize = (link.href.length / 1024).toFixed(2);
        compressPreview.innerHTML += `
            <div class="preview-info" style="background: #e8f5e9; margin-top: 20px;">
                <p style="color: #2e7d32;"><strong>✅ 压缩成功！</strong></p>
                <p>压缩后大小：约 ${compressedSize} KB</p>
            </div>
        `;
    } catch (error) {
        alert('压缩失败：' + error.message);
    } finally {
        compressBtn.disabled = false;
        compressBtn.textContent = '🎯 开始压缩';
    }
});

// 压缩图片函数
function compressImage(file, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas);
            };
            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
    });
}

// ========== 格式转换功能 ==========
const convertUpload = document.getElementById('convertUpload');
const convertInput = document.getElementById('convertInput');
const convertPreview = document.getElementById('convertPreview');
const convertBtn = document.getElementById('convertBtn');
const formatSelect = document.getElementById('formatSelect');

let convertFile = null;

// 点击上传区域
convertUpload.addEventListener('click', () => convertInput.click());

// 拖拽上传
convertUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    convertUpload.style.background = '#e8ebff';
});

convertUpload.addEventListener('dragleave', () => {
    convertUpload.style.background = '#f8f9ff';
});

convertUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    convertUpload.style.background = '#f8f9ff';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleConvertFile(files[0]);
    }
});

// 选择文件
convertInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleConvertFile(e.target.files[0]);
    }
});

function handleConvertFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }

    convertFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const originalSize = (file.size / 1024).toFixed(2);
            convertPreview.innerHTML = `
                <img src="${e.target.result}" alt="preview">
                <div class="preview-info">
                    <p><strong>文件名：</strong> ${file.name}</p>
                    <p><strong>尺寸：</strong> ${img.width} × ${img.height} px</p>
                    <p><strong>大小：</strong> ${originalSize} KB</p>
                </div>
            `;
            convertBtn.style.display = 'block';
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

// 转换按钮
convertBtn.addEventListener('click', async () => {
    convertBtn.disabled = true;
    convertBtn.textContent = '⏳ 转换中...';

    try {
        const format = formatSelect.value;
        const canvas = await convertImage(convertFile);
        const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
        
        const link = document.createElement('a');
        link.href = canvas.toDataURL(mimeType);
        link.download = `converted-${Date.now()}.${format}`;
        link.click();

        convertPreview.innerHTML += `
            <div class="preview-info" style="background: #e8f5e9; margin-top: 20px;">
                <p style="color: #2e7d32;"><strong>✅ 转换成功！</strong></p>
                <p>已转换为 ${format.toUpperCase()} 格式</p>
            </div>
        `;
    } catch (error) {
        alert('转换失败：' + error.message);
    } finally {
        convertBtn.disabled = false;
        convertBtn.textContent = '✨ 开始转换';
    }
});

// 转换图片函数
function convertImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas);
            };
            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
    });
}