// ==================== 
// 水印功能模块
// ====================

document.addEventListener('DOMContentLoaded', function() {
    initWatermark();
    initRemoveWatermark();
});

// ==================== 
// 添加水印功能
// ====================

let watermarkImage = null;
let watermarkLogoImage = null;

function initWatermark() {
    const uploadArea = document.getElementById('watermarkUpload');
    const fileInput = document.getElementById('watermarkInput');
    const options = document.getElementById('watermarkOptions');
    
    // 点击上传
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            loadWatermarkImage(file);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            loadWatermarkImage(e.target.files[0]);
        }
    });
    
    // 水印类型切换
    document.querySelectorAll('input[name="watermarkType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const textOptions = document.getElementById('textWatermarkOptions');
            const imageOptions = document.getElementById('imageWatermarkOptions');
            
            if (e.target.value === 'text') {
                textOptions.style.display = 'block';
                imageOptions.style.display = 'none';
            } else {
                textOptions.style.display = 'none';
                imageOptions.style.display = 'block';
            }
        });
    });
    
    // 滑块数值显示
    document.getElementById('watermarkFont').addEventListener('input', (e) => {
        document.getElementById('fontSizeValue').textContent = e.target.value;
    });
    
    document.getElementById('watermarkOpacity').addEventListener('input', (e) => {
        document.getElementById('opacityValue').textContent = e.target.value;
    });
    
    document.getElementById('watermarkScale').addEventListener('input', (e) => {
        document.getElementById('scaleValue').textContent = e.target.value;
    });
    
    // 水印图片上传
    const watermarkImageUpload = document.getElementById('watermarkImageUpload');
    const watermarkImageInput = document.getElementById('watermarkImageInput');
    
    watermarkImageUpload.addEventListener('click', () => watermarkImageInput.click());
    
    watermarkImageInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    watermarkLogoImage = img;
                    document.getElementById('watermarkImagePreview').innerHTML = 
                        `<img src="${event.target.result}" style="max-width:100px;max-height:100px;margin-top:10px;border-radius:4px;">`;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // 预览按钮
    document.getElementById('previewWatermarkBtn').addEventListener('click', previewWatermark);
    
    // 下载按钮
    document.getElementById('downloadWatermarkBtn').addEventListener('click', downloadWatermark);
}

function loadWatermarkImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            watermarkImage = img;
            document.getElementById('watermarkOptions').style.display = 'block';
            previewWatermark();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function previewWatermark() {
    if (!watermarkImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = watermarkImage.width;
    canvas.height = watermarkImage.height;
    
    // 绘制原图
    ctx.drawImage(watermarkImage, 0, 0);
    
    // 获取设置
    const watermarkType = document.querySelector('input[name="watermarkType"]:checked').value;
    const opacity = document.getElementById('watermarkOpacity').value / 100;
    const position = document.getElementById('watermarkPosition').value;
    
    ctx.globalAlpha = opacity;
    
    if (watermarkType === 'text') {
        drawTextWatermark(ctx, canvas, position);
    } else {
        drawImageWatermark(ctx, canvas, position);
    }
    
    // 显示预览
    const previewDiv = document.getElementById('watermarkPreview');
    previewDiv.innerHTML = '';
    
    const previewImg = document.createElement('img');
    previewImg.src = canvas.toDataURL('image/png');
    previewDiv.appendChild(previewImg);
}

function drawTextWatermark(ctx, canvas, position) {
    const text = document.getElementById('watermarkText').value || 'Image Tools';
    const fontSize = document.getElementById('watermarkFont').value;
    const color = document.getElementById('watermarkColor').value;
    
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    
    // 添加阴影效果
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    const textWidth = ctx.measureText(text).width;
    const padding = 20;
    
    if (position === 'tile') {
        // 平铺水印
        ctx.shadowBlur = 2;
        const gap = Math.max(textWidth + 50, 150);
        for (let y = 50; y < canvas.height; y += gap) {
            for (let x = 50; x < canvas.width; x += gap) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(-Math.PI / 6);
                ctx.fillText(text, 0, 0);
                ctx.restore();
            }
        }
    } else {
        const coords = getPosition(position, canvas, textWidth, fontSize, padding);
        ctx.fillText(text, coords.x, coords.y);
    }
}

function drawImageWatermark(ctx, canvas, position) {
    if (!watermarkLogoImage) {
        alert('请先选择水印图片！');
        return;
    }
    
    const scale = document.getElementById('watermarkScale').value / 100;
    const logoWidth = canvas.width * scale;
    const logoHeight = (watermarkLogoImage.height / watermarkLogoImage.width) * logoWidth;
    const padding = 20;
    
    if (position === 'tile') {
        const gap = Math.max(logoWidth + 30, 100);
        for (let y = 30; y < canvas.height; y += gap + logoHeight) {
            for (let x = 30; x < canvas.width; x += gap) {
                ctx.drawImage(watermarkLogoImage, x, y, logoWidth, logoHeight);
            }
        }
    } else {
        const coords = getPosition(position, canvas, logoWidth, logoHeight, padding);
        ctx.drawImage(watermarkLogoImage, coords.x, coords.y, logoWidth, logoHeight);
    }
}

function getPosition(position, canvas, width, height, padding) {
    const positions = {
        'top-left': { x: padding, y: padding + height/2 },
        'top-right': { x: canvas.width - width - padding, y: padding + height/2 },
        'bottom-left': { x: padding, y: canvas.height - padding - height/2 },
        'bottom-right': { x: canvas.width - width - padding, y: canvas.height - padding - height/2 },
        'center': { x: (canvas.width - width) / 2, y: canvas.height / 2 }
    };
    return positions[position] || positions['bottom-right'];
}

function downloadWatermark() {
    const previewImg = document.querySelector('#watermarkPreview img');
    if (!previewImg) {
        alert('请先预览效果！');
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'watermarked-image.png';
    link.href = previewImg.src;
    link.click();
}

// ==================== 
// 去水印功能
// ====================

let removeWatermarkImage = null;
let removeCanvas = null;
let removeCtx = null;
let isDrawing = false;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;
let maskCanvas = null;
let maskCtx = null;
let history = [];
let originalImageData = null;

function initRemoveWatermark() {
    const uploadArea = document.getElementById('removeWatermarkUpload');
    const fileInput = document.getElementById('removeWatermarkInput');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            loadRemoveWatermarkImage(file);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            loadRemoveWatermarkImage(e.target.files[0]);
        }
    });
    
    // 画笔大小
    document.getElementById('brushSize').addEventListener('input', (e) => {
        document.getElementById('brushSizeValue').textContent = e.target.value;
    });
    
    // 工具切换
    document.querySelectorAll('input[name="removeTool"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (removeCanvas) {
                if (e.target.value === 'brush') {
                    removeCanvas.style.cursor = 'crosshair';
                } else {
                    removeCanvas.style.cursor = 'crosshair';
                }
            }
        });
    });
    
    // 按钮事件
    document.getElementById('undoRemoveBtn').addEventListener('click', undoRemove);
    document.getElementById('resetRemoveBtn').addEventListener('click', resetRemove);
    document.getElementById('applyRemoveBtn').addEventListener('click', applyRemove);
    document.getElementById('downloadRemoveBtn').addEventListener('click', downloadRemove);
}

function loadRemoveWatermarkImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            removeWatermarkImage = img;
            document.getElementById('removeWatermarkOptions').style.display = 'block';
            initRemoveCanvas();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function initRemoveCanvas() {
    removeCanvas = document.getElementById('removeWatermarkCanvas');
    removeCtx = removeCanvas.getContext('2d');
    
    // 设置画布大小
    const maxWidth = Math.min(removeWatermarkImage.width, 800);
    const scale = maxWidth / removeWatermarkImage.width;
    
    removeCanvas.width = removeWatermarkImage.width * scale;
    removeCanvas.height = removeWatermarkImage.height * scale;
    
    // 绘制图片
    removeCtx.drawImage(removeWatermarkImage, 0, 0, removeCanvas.width, removeCanvas.height);
    
    // 保存原始图像数据
    originalImageData = removeCtx.getImageData(0, 0, removeCanvas.width, removeCanvas.height);
    
    // 初始化遮罩画布
    maskCanvas = document.createElement('canvas');
    maskCanvas.width = removeCanvas.width;
    maskCanvas.height = removeCanvas.height;
    maskCtx = maskCanvas.getContext('2d');
    
    // 保存初始状态
    history = [];
    saveHistory();
    
    // 设置光标
    removeCanvas.style.cursor = 'crosshair';
    
    // 移除之前的事件监听器
    removeCanvas.replaceWith(removeCanvas.cloneNode(true));
    removeCanvas = document.getElementById('removeWatermarkCanvas');
    removeCtx = removeCanvas.getContext('2d');
    removeCtx.drawImage(removeWatermarkImage, 0, 0, removeCanvas.width, removeCanvas.height);
    
    // 绑定事件监听器
    removeCanvas.addEventListener('mousedown', startDrawingOrRect);
    removeCanvas.addEventListener('mousemove', drawOrRectPreview);
    removeCanvas.addEventListener('mouseup', stopDrawingOrRect);
    removeCanvas.addEventListener('mouseleave', stopDrawingOrRect);
    
    // 触摸事件
    removeCanvas.addEventListener('touchstart', handleTouchStart);
    removeCanvas.addEventListener('touchmove', handleTouchMove);
    removeCanvas.addEventListener('touchend', stopDrawingOrRect);
}

function startDrawingOrRect(e) {
    if (!removeCanvas) return;
    
    const rect = removeCanvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    lastX = startX;
    lastY = startY;
    isDrawing = true;
}

function drawOrRectPreview(e) {
    if (!isDrawing) return;
    if (!removeCanvas) return;
    
    const rect = removeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const tool = document.querySelector('input[name="removeTool"]:checked').value;
    const brushSize = document.getElementById('brushSize').value;
    
    if (tool === 'brush') {
        // 画笔模式
        drawBrush(x, y, brushSize);
    } else {
        // 框选模式 - 实时预览框选区域
        drawRectPreview(startX, startY, x, y, brushSize);
    }
    
    lastX = x;
    lastY = y;
}

function drawBrush(x, y, brushSize) {
    // 在遮罩上绘制
    maskCtx.beginPath();
    maskCtx.strokeStyle = 'rgba(255, 0, 0, 1)';
    maskCtx.lineWidth = brushSize;
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';
    maskCtx.moveTo(lastX, lastY);
    maskCtx.lineTo(x, y);
    maskCtx.stroke();
    
    // 在原画布上显示标记
    removeCtx.beginPath();
    removeCtx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
    removeCtx.lineWidth = brushSize;
    removeCtx.lineCap = 'round';
    removeCtx.lineJoin = 'round';
    removeCtx.moveTo(lastX, lastY);
    removeCtx.lineTo(x, y);
    removeCtx.stroke();
}

function drawRectPreview(x1, y1, x2, y2, brushSize) {
    // 重新绘制原图，清除之前的框选预览
    removeCtx.putImageData(originalImageData, 0, 0);
    
    // 绘制新的框选预览
    const rectX = Math.min(x1, x2);
    const rectY = Math.min(y1, y2);
    const rectWidth = Math.abs(x2 - x1);
    const rectHeight = Math.abs(y2 - y1);
    
    removeCtx.strokeStyle = 'rgba(255, 100, 100, 0.7)';
    removeCtx.lineWidth = 2;
    removeCtx.strokeRect(rectX, rectY, rectWidth, rectHeight);
    
    removeCtx.fillStyle = 'rgba(255, 100, 100, 0.1)';
    removeCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
}

function stopDrawingOrRect() {
    if (!isDrawing) return;
    
    isDrawing = false;
    
    const tool = document.querySelector('input[name="removeTool"]:checked').value;
    
    if (tool === 'rect') {
        // 框选模式下，将框选区域标记到遮罩
        const rectX = Math.min(startX, lastX);
        const rectY = Math.min(startY, lastY);
        const rectWidth = Math.abs(lastX - startX);
        const rectHeight = Math.abs(lastY - startY);
        
        if (rectWidth > 5 && rectHeight > 5) {
            // 在遮罩上标记框选区域
            maskCtx.fillStyle = 'rgba(255, 0, 0, 1)';
            maskCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
            
            // 在原画布上显示标记
            removeCtx.strokeStyle = 'rgba(255, 100, 100, 0.7)';
            removeCtx.lineWidth = 2;
            removeCtx.strokeRect(rectX, rectY, rectWidth, rectHeight);
            removeCtx.fillStyle = 'rgba(255, 100, 100, 0.2)';
            removeCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
        }
    }
    
    saveHistory();
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = removeCanvas.getBoundingClientRect();
    startX = touch.clientX - rect.left;
    startY = touch.clientY - rect.top;
    lastX = startX;
    lastY = startY;
    isDrawing = true;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const rect = removeCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const tool = document.querySelector('input[name="removeTool"]:checked').value;
    const brushSize = document.getElementById('brushSize').value;
    
    if (tool === 'brush') {
        drawBrush(x, y, brushSize);
    } else {
        drawRectPreview(startX, startY, x, y, brushSize);
    }
    
    lastX = x;
    lastY = y;
}

function saveHistory() {
    history.push(removeCtx.getImageData(0, 0, removeCanvas.width, removeCanvas.height));
    if (history.length > 20) history.shift();
}

function undoRemove() {
    if (history.length > 1) {
        history.pop();
        removeCtx.putImageData(history[history.length - 1], 0, 0);
        // 重新初始化原始数据
        originalImageData = removeCtx.getImageData(0, 0, removeCanvas.width, removeCanvas.height);
    }
}

function resetRemove() {
    if (removeWatermarkImage) {
        removeCtx.drawImage(removeWatermarkImage, 0, 0, removeCanvas.width, removeCanvas.height);
        originalImageData = removeCtx.getImageData(0, 0, removeCanvas.width, removeCanvas.height);
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        history = [];
        saveHistory();
    }
}

function applyRemove() {
    const method = document.getElementById('removeMethod').value;
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    
    // 获取当前画布数据
    const imageData = removeCtx.getImageData(0, 0, removeCanvas.width, removeCanvas.height);
    
    switch(method) {
        case 'blur':
            applyBlur(imageData, maskData);
            break;
        case 'mosaic':
            applyMosaic(imageData, maskData);
            break;
        case 'inpaint':
            applyInpaint(imageData, maskData);
            break;
    }
    
    removeCtx.putImageData(imageData, 0, 0);
    originalImageData = removeCtx.getImageData(0, 0, removeCanvas.width, removeCanvas.height);
    document.getElementById('downloadRemoveBtn').style.display = 'inline-block';
    
    // 清除遮罩
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    saveHistory();
}

function applyBlur(imageData, maskData) {
    const data = imageData.data;
    const mask = maskData.data;
    const width = imageData.width;
    const height = imageData.height;
    const radius = 15;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            
            if (mask[i] > 128 || mask[i + 1] > 128) {
                let r = 0, g = 0, b = 0, count = 0;
                
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const ni = (ny * width + nx) * 4;
                            r += data[ni];
                            g += data[ni + 1];
                            b += data[ni + 2];
                            count++;
                        }
                    }
                }
                
                data[i] = Math.round(r / count);
                data[i + 1] = Math.round(g / count);
                data[i + 2] = Math.round(b / count);
            }
        }
    }
}

function applyMosaic(imageData, maskData) {
    const data = imageData.data;
    const mask = maskData.data;
    const width = imageData.width;
    const height = imageData.height;
    const blockSize = 8;
    
    for (let y = 0; y < height; y += blockSize) {
        for (let x = 0; x < width; x += blockSize) {
            let hasMask = false;
            let sumR = 0, sumG = 0, sumB = 0, count = 0;
            
            for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
                for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
                    const i = ((y + dy) * width + (x + dx)) * 4;
                    
                    if (mask[i] > 128 || mask[i + 1] > 128) {
                        hasMask = true;
                    }
                    
                    sumR += data[i];
                    sumG += data[i + 1];
                    sumB += data[i + 2];
                    count++;
                }
            }
            
            if (hasMask && count > 0) {
                const avgR = Math.round(sumR / count);
                const avgG = Math.round(sumG / count);
                const avgB = Math.round(sumB / count);
                
                for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
                    for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
                        const i = ((y + dy) * width + (x + dx)) * 4;
                        data[i] = avgR;
                        data[i + 1] = avgG;
                        data[i + 2] = avgB;
                    }
                }
            }
        }
    }
}

function applyInpaint(imageData, maskData) {
    const data = imageData.data;
    const mask = maskData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            
            if (mask[i] > 128 || mask[i + 1] > 128) {
                let r = 0, g = 0, b = 0, count = 0;
                const radius = 20;
                
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const ni = (ny * width + nx) * 4;
                            if (mask[ni] < 128 && mask[ni + 1] < 128) {
                                r += data[ni];
                                g += data[ni + 1];
                                b += data[ni + 2];
                                count++;
                            }
                        }
                    }
                }
                
                if (count > 0) {
                    data[i] = Math.round(r / count);
                    data[i + 1] = Math.round(g / count);
                    data[i + 2] = Math.round(b / count);
                }
            }
        }
    }
}

function downloadRemove() {
    const link = document.createElement('a');
    link.download = 'removed-watermark.png';
    link.href = removeCanvas.toDataURL('image/png');
    link.click();
}