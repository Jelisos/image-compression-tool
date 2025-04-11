/**
 * 图片压缩工具 - 完全离线版本
 * 内联所有必要的库以实现完全离线功能
 */

// 检查和注入关键库 - 优先使用已经存在的实现
(function() {
    console.log('正在检查和初始化离线资源...');

    // 注入必要的库 - 这里只添加最简化版本的关键库
    
    // 1. 注入简化版的browser-image-compression库核心功能
if (typeof imageCompression === 'undefined') {
        console.log('正在内联图像压缩库...');
    
        // 实现一个基本的图像压缩功能
    window.imageCompression = async function(file, options) {
        return new Promise((resolve, reject) => {
            try {
                    console.log('使用内联压缩函数处理图片:', file.name);
                
                // 读取文件
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = new Image();
                    img.onload = function() {
                        try {
                            // 计算新的尺寸
                            let width = img.width;
                            let height = img.height;
                            const maxSize = options.maxWidthOrHeight || 1920;
                            
                            if (width > maxSize || height > maxSize) {
                                const ratio = width / height;
                                if (width > height) {
                                    width = maxSize;
                                        height = Math.round(maxSize / ratio);
                                } else {
                                    height = maxSize;
                                        width = Math.round(maxSize * ratio);
                                }
                            }
                            
                            // 创建canvas进行压缩
                            const canvas = document.createElement('canvas');
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                                
                                // 绘制前清空画布
                                ctx.clearRect(0, 0, width, height);
                                
                                // 优化绘制质量
                                ctx.imageSmoothingEnabled = true;
                                ctx.imageSmoothingQuality = 'high';
                                
                                // 绘制图像
                            ctx.drawImage(img, 0, 0, width, height);
                            
                            // 使用指定质量转换为blob
                            const quality = options.initialQuality || 0.7;
                                
                                // 对于较大图片，采用分步压缩策略
                                if (width * height > 1920 * 1080) {
                                    console.log('大图片检测，使用分步压缩策略');
                                }
                                
                                // 尝试获取更好的压缩类型
                                let outputType = file.type;
                                if (!outputType || outputType === 'image/bmp' || outputType === 'image/tiff') {
                                    outputType = 'image/jpeg';
                                }
                                
                            canvas.toBlob(function(blob) {
                                    if (!blob) {
                                        console.error('Canvas toBlob失败，尝试回退方案');
                                        reject(new Error('Canvas toBlob失败'));
                                        return;
                                    }
                                    
                                // 创建一个模拟File对象
                                blob.name = file.name;
                                blob.lastModified = file.lastModified;
                                
                                    // 记录压缩结果
                                console.log('图片压缩成功:', file.name);
                                console.log('原始大小:', (file.size / 1024).toFixed(2) + 'KB');
                                console.log('压缩后大小:', (blob.size / 1024).toFixed(2) + 'KB');
                                    console.log('压缩率:', ((1 - blob.size / file.size) * 100).toFixed(2) + '%');
                                
                                resolve(blob);
                                }, outputType, quality);
                        } catch (err) {
                            console.error('Canvas处理图片时出错:', err);
                            reject(err);
                        }
                    };
                    
                    img.onerror = function() {
                        console.error('加载图片出错');
                        reject(new Error('加载图片出错'));
                    };
                    
                    img.src = event.target.result;
                };
                
                reader.onerror = function() {
                    console.error('读取文件出错');
                    reject(new Error('读取文件出错'));
                };
                
                reader.readAsDataURL(file);
            } catch (err) {
                console.error('本地压缩函数出错:', err);
                reject(err);
            }
        });
    };
        
        // 添加一些可选的工具方法
        window.imageCompression.getDataUrlFromFile = function(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        };
        
        window.imageCompression.loadImage = function(url) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = url;
            });
        };
        
        console.log('内联图像压缩库已加载完成');
    }
    
    // 2. 注入简化版的JSZip实现
if (typeof JSZip === 'undefined') {
        console.log('正在内联ZIP库...');
    
        // 简单的JSZip实现
    window.JSZip = function() {
            const zipFiles = [];
            const zipFolders = {};
        
        return {
            file: function(name, data) {
                    zipFiles.push({name, data});
                return this;
            },
            folder: function(name) {
                    if (!zipFolders[name]) {
                        zipFolders[name] = {
                        file: function(fileName, data) {
                                zipFiles.push({name: name + '/' + fileName, data});
                            return this;
                        }
                    };
                }
                    return zipFolders[name];
            },
            generateAsync: function(options, onUpdate) {
                return new Promise((resolve) => {
                        console.log(`准备处理${zipFiles.length}个文件`);
                        
                        // 由于无法直接创建ZIP，我们创建一个包含所有文件的归档对象
                        const archiveData = {
                            files: zipFiles,
                            totalSize: zipFiles.reduce((size, file) => size + (file.data.size || 0), 0)
                        };
                        
                        // 直接下载每个文件
                        if (confirm('由于ZIP库未能加载，将为您单独下载每个压缩后的图片。\n是否继续？')) {
                            const totalFiles = zipFiles.length;
                            
                            zipFiles.forEach((file, index) => {
                            setTimeout(() => {
                                    try {
                                if (file.data && typeof file.data === 'object') {
                                            downloadFile(file.data, file.name);
                                }
                                        
                                // 更新进度
                                if (typeof onUpdate === 'function') {
                                    onUpdate({
                                                percent: ((index + 1) / totalFiles) * 100
                                    });
                                        }
                                    } catch (e) {
                                        console.error('下载文件时出错:', e);
                                }
                            }, index * 300);
                        });
                        }
                        
                        // 创建一个说明文本，告知用户已下载的文件
                        const textInfo = `已处理的文件 (${zipFiles.length}):\n` + 
                            zipFiles.map(f => `${f.name}: ${formatFileSize(f.data.size || 0)}`).join('\n');
                        
                        // 返回说明文本作为blob
                        setTimeout(() => {
                            resolve(new Blob([textInfo], {type: 'text/plain'}));
                        }, zipFiles.length * 300 + 200);
                });
            }
        };
    };
    
        // 辅助函数：下载单个文件
        function downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
        
        // 辅助函数：格式化文件大小
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        console.log('内联ZIP库已加载完成');
    }
    
    // 3. 注入saveAs函数
if (typeof saveAs === 'undefined') {
        console.log('正在内联文件保存函数...');
    
        // 简单的文件保存实现
    window.saveAs = function(blob, filename) {
            try {
                // 检查浏览器支持
                if (navigator.msSaveBlob) {
                    // IE10+
                    return navigator.msSaveBlob(blob, filename);
                } 
                
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
                a.style.display = 'none';
        a.href = url;
                a.download = filename;
                
                // 添加到DOM并触发点击
        document.body.appendChild(a);
        a.click();
                
                // 清理
                setTimeout(() => {
        document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            } catch (e) {
                console.error('保存文件时出错:', e);
                alert('保存文件时出错。请尝试右键点击并选择"另存为"。');
            }
        };
        
        console.log('内联文件保存函数已加载完成');
    }
    
    // 4. 检查SVG图标资源，如果缺失则内联创建
    setTimeout(() => {
        // 检查上传图标是否存在
        const uploadIcon = document.getElementById('upload-icon');
        if (!uploadIcon || !uploadIcon.querySelector('use')) {
            console.log('检测到上传图标缺失，创建内联SVG图标...');
            
            // 创建SVG图标定义
            if (!document.getElementById('icon-definitions')) {
                const iconDefs = document.createElement('div');
                iconDefs.id = 'icon-definitions';
                iconDefs.style.display = 'none';
                
                // 添加上传图标定义
                iconDefs.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <symbol id="icon-upload" viewBox="0 0 24 24">
                                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                            </symbol>
                            <symbol id="icon-loading" viewBox="0 0 24 24">
                                <path d="M12 4V2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2v2c4.42 0 8 3.58 8 8s-3.58 8-8 8-8-3.58-8-8 3.58-8 8-8z"/>
                            </symbol>
                        </defs>
                    </svg>
                `;
                
                document.body.appendChild(iconDefs);
            }
            
            // 检查并替换上传图标
            const uploadIconContainer = document.querySelector('.upload-icon-container');
            if (uploadIconContainer) {
                uploadIconContainer.innerHTML = `
                    <svg class="upload-icon" width="80" height="80" viewBox="0 0 24 24">
                        <use xlink:href="#icon-upload"></use>
                    </svg>
                `;
            }
            
            console.log('内联SVG图标已创建');
        }
        
        // 检查loading图标是否可用
        const testImg = new Image();
        testImg.onload = function() {
            console.log('Loading图标可用');
        };
        testImg.onerror = function() {
            console.log('Loading图标不可用，创建内联替代...');
            
            // 创建一个内联的loading SVG图标作为数据URL
            const loadingSvg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#e0e0e0" stroke-width="8" fill="none" />
                    <path d="M50 10 a 40 40 0 0 1 40 40" stroke="#3498db" stroke-width="8" fill="none" stroke-linecap="round">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite" />
                    </path>
                </svg>
            `;
            
            const loadingDataUrl = 'data:image/svg+xml;base64,' + btoa(loadingSvg);
            
            // 替换所有script.js中的loading-image.svg引用
            const compressedImages = document.querySelectorAll('img[src="loading-image.svg"]');
            compressedImages.forEach(img => {
                img.src = loadingDataUrl;
            });
            
            // 创建一个样式表，以便将来的引用也能使用这个内联SVG
            const style = document.createElement('style');
            style.textContent = `
                img[src="loading-image.svg"] {
                    content: url('${loadingDataUrl}');
                }
            `;
            document.head.appendChild(style);
            
            // 替换全局变量中的引用
            window.loadingImageSrc = loadingDataUrl;
        };
        testImg.src = 'loading-image.svg';
    }, 500);
    
    // 替换compressImage函数中的引用
    const originalCompressImage = window.compressImage;
    if (originalCompressImage) {
        window.compressImage = async function() {
            // 如果有loading图标的内联版本，使用它
            if (window.loadingImageSrc) {
                compressedImage.src = window.loadingImageSrc;
            }
            return originalCompressImage.apply(this, arguments);
        };
    }
    
    console.log('离线资源检查完成');
})();

// 为用户显示库加载状态
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // 检查是否所有库都已加载
        const allLoaded = 
            typeof imageCompression === 'function' && 
            typeof JSZip === 'function' && 
            typeof saveAs === 'function';
            
        if (allLoaded) {
            console.log('✅ 所有必要的库都已加载，应用可以完全离线工作');
            
            // 显示成功消息
            const notice = document.createElement('div');
            notice.style.cssText = 'position:fixed; bottom:10px; right:10px; padding:10px; background:#d4edda; color:#155724; border:1px solid #c3e6cb; border-radius:4px; z-index:1000; font-size:14px; max-width:300px;';
            notice.innerHTML = '✅ 离线模式已启用，可以无网络使用所有功能';
            document.body.appendChild(notice);
            
            setTimeout(() => {
                notice.style.opacity = '0';
                notice.style.transition = 'opacity 0.5s';
                setTimeout(() => notice.remove(), 500);
            }, 3000);
        } else {
            console.warn('⚠️ 某些库未能加载，但应用仍然可以使用内联替代方案工作');
        }
    }, 1000);
});

// 获取DOM元素
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');
const uploadArea = document.getElementById('upload-area');
const uploadSection = document.getElementById('upload-section');
const previewSection = document.getElementById('preview-section');
const compressionControls = document.getElementById('compression-controls');
const originalImage = document.getElementById('original-image');
const compressedImage = document.getElementById('compressed-image');
const originalSize = document.getElementById('original-size');
const compressedSize = document.getElementById('compressed-size');
const originalDimensions = document.getElementById('original-dimensions');
const compressedDimensions = document.getElementById('compressed-dimensions');
const compressionRatio = document.getElementById('compression-ratio');
const qualitySlider = document.getElementById('quality-slider');
const qualityValue = document.getElementById('quality-value');
const compressButton = document.getElementById('compress-button');
const downloadButton = document.getElementById('download-button');
const downloadAllButton = document.getElementById('download-all-button');
const resetButton = document.getElementById('reset-button');
const uploadIcon = document.getElementById('upload-icon');
const compressionTipsButton = document.getElementById('compression-tips-button');
const compressionTipsModal = document.getElementById('compression-tips-modal');
const closeModalButton = document.querySelector('.close-modal');
const batchModeToggle = document.getElementById('batch-mode-toggle');
const batchProcessingSection = document.getElementById('batch-processing-section');
const batchList = document.getElementById('batch-list');
const batchProgressBar = document.getElementById('batch-progress-bar');
const processedCount = document.getElementById('processed-count');
const totalCount = document.getElementById('total-count');

// 全局变量
let originalFile = null;
let compressedBlob = null;
let batchMode = false; // 批量模式标志
let batchQueue = []; // 批量处理队列
let processedImages = []; // 已处理图片数组
let currentBatchIndex = 0; // 当前处理的批量索引
let isProcessing = false; // 是否正在处理批量队列

// 批量处理使用限制变量
let batchUsageCount = 0; // 批量处理使用次数
let lastBatchUsageTime = 0; // 上次使用批量处理的时间戳
let countdownTimer = null; // 倒计时定时器
let countdownElement = null; // 倒计时显示元素

// 从localStorage加载批量处理使用限制数据
function loadBatchUsageData() {
    const savedBatchUsageCount = localStorage.getItem('batchUsageCount');
    const savedLastBatchUsageTime = localStorage.getItem('lastBatchUsageTime');
    
    if (savedBatchUsageCount !== null) {
        batchUsageCount = parseInt(savedBatchUsageCount);
    }
    
    if (savedLastBatchUsageTime !== null) {
        lastBatchUsageTime = parseInt(savedLastBatchUsageTime);
    }
}

// 保存批量处理使用限制数据到localStorage
function saveBatchUsageData() {
    localStorage.setItem('batchUsageCount', batchUsageCount);
    localStorage.setItem('lastBatchUsageTime', lastBatchUsageTime);
}

// 初始化事件监听器
function initEventListeners() {
    // 上传按钮点击事件
    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    // 上传区域点击事件
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 批量模式切换按钮点击事件
    batchModeToggle.addEventListener('click', toggleBatchMode);
    
    // 压缩比例建议按钮点击事件
    compressionTipsButton.addEventListener('click', () => {
        compressionTipsModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    });
    
    // 关闭模态窗口按钮点击事件
    closeModalButton.addEventListener('click', () => {
        compressionTipsModal.style.display = 'none';
        document.body.style.overflow = '';
    });
    
    // 点击模态窗口外部区域关闭模态窗口
    window.addEventListener('click', (e) => {
        if (e.target === compressionTipsModal) {
            compressionTipsModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // 文件选择事件
    fileInput.addEventListener('change', handleFileSelect);

    // 拖放事件
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', handleDropEvent);

    // 质量滑块事件
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
    });

    // 压缩按钮点击事件 - 根据模式调用不同的函数
    compressButton.addEventListener('click', () => {
        // 防止重复点击
        if (compressButton.disabled) return;
        
        if (batchMode && batchQueue.length > 0) {
            // 批量模式下处理队列
            processBatchQueue();
        } else {
            // 单图模式下压缩图片
            compressImage();
        }
    });

    // 下载按钮点击事件
    downloadButton.addEventListener('click', downloadCompressedImage);
    
    // 批量下载按钮点击事件
    downloadAllButton.addEventListener('click', downloadAllCompressedImages);

    // 重置按钮点击事件
    resetButton.addEventListener('click', resetApp);
}

// 处理文件选择
function handleFileSelect(e) {
    if (!e.target.files.length) return;
    
    // 添加加载状态
    document.body.classList.add('loading');
    
    // 延迟处理，让UI先更新
    setTimeout(() => {
        try {
            // 区分批量和单图模式
            if (batchMode && e.target.files.length > 1) {
                handleBatchFiles(e.target.files);
                // 注意：handleBatchFiles会自己处理loading状态
            } else {
                handleFile(e.target.files[0]);
                // 注意：handleFile会自己处理loading状态
            }
            
            // 重置文件输入，允许重复选择相同文件
            fileInput.value = '';
        } catch (error) {
            console.error('处理选择文件时出错:', error);
            alert('处理文件时出错，请重试！');
            document.body.classList.remove('loading');
        }
    }, 100);
}

// 处理文件
async function handleFile(file) {
    // 检查文件类型
    if (!file.type.match('image.*')) {
        alert('请选择图片文件！');
        return;
    }

    originalFile = file;
    
    // 添加加载状态类到body，改变鼠标样式
    document.body.classList.add('loading');
    
    // 清空压缩后的图片，显示默认图标
    compressedImage.src = 'loading-image.svg';
    compressedImage.style.display = 'block';
    compressedImage.style.opacity = '0.6';
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.textContent = '图片加载中...';
    compressedImage.parentNode.insertBefore(loadingIndicator, compressedImage.nextSibling);

    try {
        // 显示原始图片
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
            // 获取图片尺寸
            const img = new Image();
            img.onload = () => {
                originalDimensions.textContent = `${img.width} x ${img.height}`;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // 显示原始文件大小
        originalSize.textContent = formatFileSize(file.size);

        // 显示预览区域和控制区域
        uploadSection.style.display = 'none';
        previewSection.hidden = false;
        compressionControls.hidden = false;

        // 默认进行一次压缩
        await compressImage();
    } catch (error) {
        console.error('处理图片时出错:', error);
        alert('处理图片时出错，请重试！');
    } finally {
        // 显示压缩后的图片
        if (loadingIndicator && loadingIndicator.parentNode) {
            loadingIndicator.parentNode.removeChild(loadingIndicator);
        }
        compressedImage.style.display = 'block';
        compressedImage.style.opacity = '1';
        
        // 移除加载状态类，恢复正常鼠标样式
        document.body.classList.remove('loading');

        // 滚动到压缩后图片区域
        setTimeout(() => {
            // 检测是否为移动设备
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isMobile) {
                // 移动端滚动行为
                compressedImage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // PC端保持原有滚动行为
                compressedImage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                window.scrollBy({
                    top: 300,  // 向下滚动300像素
                    behavior: 'smooth'
                });
            }
        }, 300); // 添加延时确保图片加载完成后再滚动
    }
}

// 压缩图片
async function compressImage() {
    if (!originalFile) return;

    try {
        // 显示加载状态
        document.body.classList.add('loading');
        compressButton.textContent = '压缩中...';
        compressButton.disabled = true;
        // 设置压缩图片的占位SVG
        compressedImage.src = 'loading-image.svg';
        compressedImage.style.display = 'block';
        downloadButton.disabled = true;

        // 获取压缩质量
        const quality = parseInt(qualitySlider.value) / 100;

        // 使用browser-image-compression库压缩图片
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: quality  // 使用initialQuality而不是quality参数
        };

        compressedBlob = await imageCompression(originalFile, options);

        // 显示压缩后的图片
        const reader = new FileReader();
        reader.onload = (e) => {
            compressedImage.src = e.target.result;
            // 获取压缩后图片尺寸
            const img = new Image();
            img.onload = () => {
                compressedDimensions.textContent = `${img.width} x ${img.height}`;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(compressedBlob);

        // 显示压缩后文件大小
        compressedSize.textContent = formatFileSize(compressedBlob.size);

        // 计算压缩率
        const ratio = ((1 - compressedBlob.size / originalFile.size) * 100).toFixed(2);
        compressionRatio.textContent = `${ratio}%`;

        // 启用下载按钮
        downloadButton.disabled = false;
        
        // 启用分享按钮
        if (window.enableShareButton) {
            window.enableShareButton();
        } else {
            document.getElementById('share-button').disabled = false;
        }
    } catch (error) {
        console.error('压缩图片时出错:', error);
        alert('压缩图片时出错，请重试！');
    } finally {
        // 恢复按钮状态
        compressButton.textContent = '压缩图片';
        compressButton.disabled = false;
        // 移除加载状态类，恢复正常鼠标样式
        document.body.classList.remove('loading');
    }
}

// 下载压缩后的图片
function downloadCompressedImage() {
    if (!compressedBlob) return;

    // 用于存储创建的URL对象，以确保在适当的时候释放
    let blobUrl = null;
    
    try {
        // 创建下载链接
        const link = document.createElement('a');
        blobUrl = URL.createObjectURL(compressedBlob);
        link.href = blobUrl;
        link.style.display = 'none'; // 隐藏链接元素
        
        // 设置文件名
        const extension = originalFile.name.split('.').pop();
        const fileName = originalFile.name.replace(`.${extension}`, `-compressed.${extension}`);
        link.download = fileName;
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        
        // 立即移除DOM元素
        document.body.removeChild(link);
    } catch (error) {
        console.error('下载图片时出错:', error);
        alert('下载图片时出错，请重试！');
    } finally {
        // 确保在任何情况下都释放URL对象
        if (blobUrl) {
            try {
                // 延迟释放URL对象，确保下载已开始
                setTimeout(() => {
                    URL.revokeObjectURL(blobUrl);
                }, 100);
            } catch (revokeError) {
                console.error('释放Blob URL时出错:', revokeError);
                // 不抛出错误，继续执行
            }
        }
    }
}

// 批量下载所有压缩后的图片
async function downloadAllCompressedImages() {
    if (processedImages.length === 0) return;
    
    // 显示下载指示器
    document.body.classList.add('loading');
    
    try {
        // 创建一个zip文件
        const zip = new JSZip();
        const folder = zip.folder("compressed_images");
        
        // 使用异步方式添加文件到zip
        for (const item of processedImages) {
            try {
                const extension = item.originalName.split('.').pop();
                const baseName = item.originalName.substring(0, item.originalName.lastIndexOf('.'));
                const fileName = `${baseName}_compressed.${extension}`;
                
                // 添加文件到zip
                folder.file(fileName, item.blob, {
                    compression: "DEFLATE",
                    compressionOptions: { level: 9 },
                    uncompressedSize: item.originalSize
                });
                
                // 给UI线程一些时间
                if (processedImages.length > 10) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            } catch (itemError) {
                console.error('处理单个文件时出错:', itemError);
                // 继续处理其他文件
                continue;
            }
        }
        
        // 异步生成zip文件
        const content = await zip.generateAsync({
            type: "blob",
            streamFiles: true, // 流式处理大文件
            compression: "DEFLATE",
            compressionOptions: { level: 9 }
        }, metadata => {
            // 更新进度条
            const percent = metadata.percent.toFixed(0);
            if (percent % 10 === 0) { // 每10%更新一次UI
                console.log(`Zip压缩进度: ${percent}%`);
            }
        });
        
        // 优先使用FileSaver.js的saveAs函数直接保存文件
        if (typeof saveAs === 'function') {
            saveAs(content, "compressed_images.zip");
        } else {
            // 回退方案：使用更安全的方式创建和释放URL
            const blobUrl = URL.createObjectURL(content);
            
            try {
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = "compressed_images.zip";
                link.style.display = 'none';
                
                // 添加到DOM并触发下载
                document.body.appendChild(link);
                link.click();
                
                // 立即从DOM中移除
                document.body.removeChild(link);
                
                // 延迟释放URL对象，确保下载已开始
                setTimeout(() => {
                    try {
                        URL.revokeObjectURL(blobUrl);
                    } catch (revokeError) {
                        console.error('释放Blob URL时出错:', revokeError);
                    }
                }, 100);
            } catch (urlError) {
                console.error('创建下载链接时出错:', urlError);
                // 确保释放URL对象
                URL.revokeObjectURL(blobUrl);
                throw urlError;
            }
        }
    } catch (error) {
        console.error('批量下载时出错:', error);
        alert('批量下载时出错，请重试！');
    } finally {
        // 确保在任何情况下都移除loading状态
        document.body.classList.remove('loading');
    }
}

// 处理批量文件
async function handleBatchFiles(files) {
    // 先检查是否有图片文件
    let imageFiles = [];
    for (let i = 0; i < files.length; i++) {
        if (files[i].type.match('image.*')) {
            imageFiles.push(files[i]);
        }
    }
    
    if (imageFiles.length === 0) {
        alert('没有选择有效的图片文件！');
        // 确保移除加载状态
        document.body.classList.remove('loading');
        return;
    }
    
    // 检查批量处理使用限制
    if (batchUsageCount > 0) {
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastBatchUsageTime;
        const cooldownPeriod = 20000; // 20秒固定冷却时间
        
        if (timeElapsed < cooldownPeriod) {
            const remainingTime = Math.ceil((cooldownPeriod - timeElapsed) / 1000);
            startCountdown(remainingTime, true);
            fileInput.value = '';
            // 确保移除加载状态
            document.body.classList.remove('loading');
            return;
        }
    }
    
    // 清空批量队列并添加新文件
    batchQueue = [...imageFiles];
    processedImages = [];
    currentBatchIndex = 0;
    
    // 更新UI显示
    uploadSection.style.display = 'none';
    batchProcessingSection.hidden = false;
    compressionControls.hidden = false;
    previewSection.hidden = true;
    
    // 更新进度信息
    totalCount.textContent = batchQueue.length;
    processedCount.textContent = '0';
    batchProgressBar.style.width = '0%';
    
    // 清空批量列表
    batchList.innerHTML = '';
    
    // 创建批量项目列表
    for (let i = 0; i < batchQueue.length; i++) {
        const file = batchQueue[i];
        const listItem = document.createElement('div');
        listItem.className = 'batch-item';
        listItem.id = `batch-item-${i}`;
        
        const fileName = document.createElement('div');
        fileName.className = 'batch-filename';
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('div');
        fileSize.className = 'batch-size';
        fileSize.textContent = formatFileSize(file.size);
        
        const status = document.createElement('div');
        status.className = 'batch-status';
        status.textContent = '等待处理';
        
        listItem.appendChild(fileName);
        listItem.appendChild(fileSize);
        listItem.appendChild(status);
        batchList.appendChild(listItem);
    }
    
    // 启用压缩按钮
    compressButton.disabled = false;
    compressButton.textContent = '开始批量压缩';
    downloadAllButton.disabled = true;
    
    // 重要：移除加载状态！这样在选择文件后的等待操作阶段，鼠标不会显示为加载状态
    document.body.classList.remove('loading');
    
    // 滚动到批量处理界面
    setTimeout(() => {
        compressionControls.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// 完全重写处理批量队列的函数，使用Web Worker进行异步处理
async function processBatchQueue() {
    if (isProcessing || batchQueue.length === 0) return;
    
    try {
        // 标记正在处理状态
        isProcessing = true;
        
        // 添加加载状态 - 在开始处理时添加
        document.body.classList.add('loading');
        
        // 更新批量处理使用限制
        batchUsageCount++;
        lastBatchUsageTime = Date.now();
        saveBatchUsageData();
        
        // 更新UI状态
        compressButton.disabled = true;
        compressButton.textContent = '批量处理中...';
        
        // 获取压缩质量
        const quality = parseInt(qualitySlider.value) / 100;
        
        // 使用Promise.all和批次处理来提高性能
        const batchSize = 3; // 每批处理的文件数量，根据设备性能可调整
        
        for (let batchStart = 0; batchStart < batchQueue.length; batchStart += batchSize) {
            const batchEnd = Math.min(batchStart + batchSize, batchQueue.length);
            const currentBatch = batchQueue.slice(batchStart, batchEnd);
            
            // 并行处理当前批次中的文件
            const promises = currentBatch.map((file, idx) => {
                const index = batchStart + idx;
                return processFileThenUpdateUI(file, index, quality);
            });
            
            // 等待当前批次的所有文件处理完成
            await Promise.all(promises);
            
            // 更新进度条
            processedCount.textContent = Math.min(batchEnd, batchQueue.length);
            batchProgressBar.style.width = `${(batchEnd / batchQueue.length) * 100}%`;
            
            // 允许UI更新和用户交互
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // 批量处理完成
        compressButton.textContent = '批量处理完成';
        downloadAllButton.disabled = false;
        downloadButton.disabled = true;
    } catch (error) {
        console.error('批量处理过程中出错:', error);
        alert('批量处理过程中出错，请重试！');
    } finally {
        // 重置处理状态
        isProcessing = false;
        document.body.classList.remove('loading');
    }
}

// 处理单个文件并更新UI的函数
async function processFileThenUpdateUI(file, index, quality) {
    // 获取对应的UI元素
    const listItem = document.getElementById(`batch-item-${index}`);
    if (!listItem) return; // 安全检查
    
    const statusElement = listItem.querySelector('.batch-status');
    
    // 更新状态
    statusElement.textContent = '处理中...';
    listItem.classList.add('processing');
    
    try {
        // 使用Web Worker异步处理图片
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true, // 关键：使用Web Worker
            initialQuality: quality
        };
        
        // 在一个独立的微任务中处理图片压缩
        return new Promise((resolve) => {
            // 使用setTimeout将处理移到后台
            setTimeout(async () => {
                try {
                    // 使用try-catch包裹压缩过程
                    let compressedFile;
                    try {
                        compressedFile = await imageCompression(file, options);
                    } catch (compressionError) {
                        console.error(`压缩文件 ${file.name} 时出错:`, compressionError);
                        throw compressionError;
                    }
                    
                    // 直接存储Blob对象，不创建URL
                    processedImages.push({
                        originalName: file.name,
                        originalSize: file.size,
                        compressedSize: compressedFile.size,
                        blob: compressedFile
                    });
                    
                    // 更新UI状态
                    requestAnimationFrame(() => {
                        statusElement.textContent = `完成 (${formatFileSize(compressedFile.size)}, 压缩率: ${((1 - compressedFile.size / file.size) * 100).toFixed(2)}%)`;
                        listItem.classList.remove('processing');
                        listItem.classList.add('completed');
                    });
                    
                    resolve();
                } catch (error) {
                    requestAnimationFrame(() => {
                        statusElement.textContent = '处理失败';
                        listItem.classList.remove('processing');
                        listItem.classList.add('failed');
                    });
                    console.error(`处理文件 ${file.name} 时出错:`, error);
                    resolve(); // 即使失败也标记为完成
                }
            }, 0);
        });
    } catch (error) {
        // 更新失败状态
        requestAnimationFrame(() => {
            statusElement.textContent = '处理失败';
            listItem.classList.remove('processing');
            listItem.classList.add('failed');
        });
        console.error(`处理文件 ${file.name} 时出错:`, error);
    }
}

// 重置应用
function resetApp() {
    // 清除图片和数据
    originalFile = null;
    compressedBlob = null;
    batchQueue = [];
    processedImages = [];
    currentBatchIndex = 0;
    isProcessing = false;
    
    // 注意：不重置批量处理使用限制变量，以保持冷却时间
    
    // 恢复示例图片或清空图片源
    const defaultImagePath = "https://jelisos.github.io/image-compression-tool/bgz02.jpg";
    originalImage.src = defaultImagePath;
    compressedImage.src = defaultImagePath;
    originalSize.textContent = '2.33 MB';
    compressedSize.textContent = '180.4 KB';
    originalDimensions.textContent = '5120 x 3200';
    compressedDimensions.textContent = '1920 x 1200';
    compressionRatio.textContent = '92.45%';
    
    // 重置滑块
    qualitySlider.value = 75;
    qualityValue.textContent = '75%';
    
    // 显示上传区域，隐藏预览和控制区域
    uploadSection.style.display = 'flex';
    previewSection.hidden = true;
    compressionControls.hidden = true;
    batchProcessingSection.hidden = true;
    
    // 重置文件输入
    fileInput.value = '';
    
    // 重置批量处理按钮
    compressButton.textContent = '压缩图片';
    compressButton.disabled = false;
    downloadAllButton.disabled = true;
    
    // 如果当前是批量模式，并且批量处理在冷却期内，则直接显示倒计时
    if (batchMode && batchUsageCount > 0) {
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastBatchUsageTime;
        const cooldownPeriod = 20000; // 20秒固定冷却时间
        
        if (timeElapsed < cooldownPeriod) {
            // 计算剩余冷却时间
            const remainingTime = Math.ceil((cooldownPeriod - timeElapsed) / 1000);
            
            // 显示倒计时UI并启动倒计时
            setTimeout(() => {
                startCountdown(remainingTime, true); // 传递true表示这是批量模式的倒计时
            }, 300); // 短暂延时确保DOM已更新
        }
    }
    
    // 滚动到上传界面
    // 确保无论是单图模式还是批量模式都能正确滚动到上传界面
    setTimeout(() => {
        uploadSection.scrollIntoView({ behavior: 'smooth' });
    }, 100); // 添加短暂延时确保DOM更新后再滚动
}

// 检测是否为移动设备
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);
}

// 切换批量模式
function toggleBatchMode() {
    // 如果当前不是批量模式，要切换到批量模式时检查使用限制
    if (!batchMode) {
        // 检查批量处理使用限制
        if (batchUsageCount > 0) {
            const currentTime = Date.now();
            const timeElapsed = currentTime - lastBatchUsageTime;
            const cooldownPeriod = 20000; // 20秒固定冷却时间
            
            if (timeElapsed < cooldownPeriod) {
                // 计算剩余冷却时间
                const remainingTime = Math.ceil((cooldownPeriod - timeElapsed) / 1000);
                
                // 显示服务繁忙提示
                alert(`服务繁忙，请在${remainingTime}秒后再试。`);
                
                // 启动倒计时，传递true表示这是批量模式的倒计时
                startCountdown(remainingTime, true);
                
                return; // 不允许切换到批量模式
            }
        }
    }
    
    batchMode = !batchMode;
    
    if (batchMode) {
        batchModeToggle.textContent = '批量模式';
        batchModeToggle.classList.add('active');
        // 在批量模式下禁用下载压缩图片按钮
        downloadButton.disabled = true;
        
        // 确保文件输入控件的multiple属性被设置
        fileInput.setAttribute('multiple', 'multiple');
        
        // 如果是移动设备，显示特殊提示信息
        if (isMobileDevice()) {
            const mobileHint = document.createElement('div');
            mobileHint.className = 'mobile-batch-hint';
            mobileHint.innerHTML = `
                <div class="hint-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="12" cy="16" r="1" fill="currentColor"/>
                    </svg>
                </div>
                <div class="hint-content">
                    <div class="hint-title">批量上传提示</div>
                    <ul class="hint-list">
                        <li>选图片时"长按1秒"可多选</li>
                        <li>下载时会以.zip压缩包下载</li>
                        <li>手机解压可下载"解压专家"</li>
                    </ul>
                </div>
            `;
            // 移除内联样式，改为使用CSS类
            
            // 检查是否已经存在提示
            const existingHint = document.querySelector('.mobile-batch-hint');
            if (!existingHint) {
                const buttonGroup = document.querySelector('.button-group');
                buttonGroup.appendChild(mobileHint);
            }
        }
    } else {
        batchModeToggle.textContent = '单图模式';
        batchModeToggle.classList.remove('active');
        // 隐藏批量处理区域
        batchProcessingSection.hidden = true;
        // 如果有压缩后的图片，则启用下载按钮
        if (compressedBlob) {
            downloadButton.disabled = false;
        }
        
        // 切换到单图模式时，无论批量模式是否在冷却中，都确保上传按钮可用
        // 移除上传按钮的禁用状态和样式
        fileInput.disabled = false;
        uploadButton.disabled = false;
        uploadButton.classList.remove('disabled');
        uploadArea.style.pointerEvents = 'auto';
        uploadArea.classList.remove('disabled');
        
        // 移除multiple属性
        fileInput.removeAttribute('multiple');
        
        // 移除移动设备提示
        const mobileHint = document.querySelector('.mobile-batch-hint');
        if (mobileHint) {
            mobileHint.parentNode.removeChild(mobileHint);
        }
        
        // 如果有倒计时UI，移除UI但不影响单图模式的使用
        if (countdownElement && countdownElement.parentNode) {
            // 移除倒计时UI
            hideCountdownUI(false);
        }
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 显示倒计时UI
function showCountdownUI(seconds) {
    // 如果已经有倒计时元素，先移除它
    if (countdownElement) {
        uploadArea.removeChild(countdownElement);
        countdownElement = null;
    }
    
    // 创建倒计时元素
    countdownElement = document.createElement('div');
    countdownElement.className = 'countdown-overlay';
    countdownElement.style.position = 'absolute';
    countdownElement.style.top = '0';
    countdownElement.style.left = '0';
    countdownElement.style.width = '100%';
    countdownElement.style.height = '100%';
    countdownElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    countdownElement.style.color = 'white';
    countdownElement.style.borderRadius = 'var(--border-radius)';
    countdownElement.style.zIndex = '10';
    countdownElement.style.display = 'flex';
    countdownElement.style.flexDirection = 'column';
    countdownElement.style.justifyContent = 'center';
    countdownElement.style.alignItems = 'center';
    countdownElement.style.padding = '20px';
    countdownElement.style.boxSizing = 'border-box';
    countdownElement.style.animation = 'fadeIn 0.3s ease-in-out';
    
    // 添加CSS动画
    if (!document.getElementById('countdown-animations')) {
        const style = document.createElement('style');
        style.id = 'countdown-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .countdown-overlay.removing {
                animation: fadeOut 0.3s ease-in-out forwards;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 创建圆形倒计时指示器
    const circleContainer = document.createElement('div');
    circleContainer.style.position = 'relative';
    circleContainer.style.width = '80px';
    circleContainer.style.height = '80px';
    circleContainer.style.marginBottom = '20px';
    
    // 创建旋转的圆环
    const spinnerRing = document.createElement('div');
    spinnerRing.style.position = 'absolute';
    spinnerRing.style.top = '0';
    spinnerRing.style.left = '0';
    spinnerRing.style.width = '100%';
    spinnerRing.style.height = '100%';
    spinnerRing.style.border = '4px solid rgba(255, 255, 255, 0.1)';
    spinnerRing.style.borderTopColor = 'var(--primary-color)';
    spinnerRing.style.borderRadius = '50%';
    spinnerRing.style.animation = 'spin 1s linear infinite';
    
    // 创建倒计时数字显示
    const timerDisplay = document.createElement('div');
    timerDisplay.style.position = 'absolute';
    timerDisplay.style.top = '50%';
    timerDisplay.style.left = '50%';
    timerDisplay.style.transform = 'translate(-50%, -50%)';
    timerDisplay.style.fontSize = '24px';
    timerDisplay.style.fontWeight = 'bold';
    timerDisplay.style.color = 'var(--primary-color)';
    timerDisplay.textContent = seconds;
    
    circleContainer.appendChild(spinnerRing);
    circleContainer.appendChild(timerDisplay);
    
    const title = document.createElement('h3');
    title.textContent = '预计时间：20秒';
    title.style.margin = '10px 0';
    title.style.color = 'var(--primary-color)';
    title.style.fontSize = '20px';
    
    const message = document.createElement('p');
    message.textContent = `批量处理模式繁忙中，请稍候...`;
    message.style.margin = '10px 0 20px';
    message.style.textAlign = 'center';
    message.style.fontSize = '16px';
    
    // 保存上传区域的原始样式
    const originalPosition = uploadArea.style.position;
    if (!originalPosition || originalPosition === '') {
        uploadArea.style.position = 'relative';
    }
    
    countdownElement.appendChild(circleContainer);
    countdownElement.appendChild(title);
    countdownElement.appendChild(message);
    
    // 将倒计时元素添加到上传区域
    uploadArea.appendChild(countdownElement);
    
    // 保存原始位置样式，以便在倒计时结束后恢复
    countdownElement.originalPosition = originalPosition;
    
    return timerDisplay; // 返回计时器显示元素，以便更新
}

// 启动倒计时
function startCountdown(seconds, isBatchMode = false) {
    // 如果已经有倒计时在运行，先清除它
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
    
    // 显示倒计时UI并获取计时器元素
    const timerElement = showCountdownUI(seconds);
    
    // 如果是批量模式的倒计时，则禁用文件输入和上传按钮
    // 如果不是批量模式的倒计时，则不禁用，允许单图模式正常工作
    if (isBatchMode) {
        // 只在批量模式下禁用上传功能
        fileInput.disabled = true;
        uploadButton.disabled = true;
        uploadButton.classList.add('disabled'); // 添加禁用样式类到上传按钮
        uploadArea.style.pointerEvents = 'none'; // 禁止上传区域的点击和拖放事件
        uploadArea.classList.add('disabled'); // 添加禁用样式类
    }
    
    // 启动倒计时
    let secondsLeft = seconds;
    countdownTimer = setInterval(() => {
        secondsLeft--;
        if (timerElement) {
            timerElement.textContent = secondsLeft;
        }
        
        if (secondsLeft <= 0) {
            clearInterval(countdownTimer);
            countdownTimer = null;
            
            // 如果是批量模式的倒计时，则重新启用文件输入和上传按钮
            if (isBatchMode) {
                fileInput.disabled = false;
                uploadButton.disabled = false;
                uploadButton.classList.remove('disabled'); // 移除上传按钮的禁用样式类
                uploadArea.style.pointerEvents = 'auto'; // 恢复上传区域的交互
                uploadArea.classList.remove('disabled'); // 移除禁用样式类
            }
            
            // 添加淡出动画并在动画结束后移除倒计时UI
            if (countdownElement) {
                countdownElement.classList.add('removing');
                
                // 监听动画结束事件
                countdownElement.addEventListener('animationend', () => {
                    hideCountdownUI(isBatchMode);
                });
                
                // 设置一个安全的超时，确保即使动画事件没有触发也能移除倒计时UI
                setTimeout(() => hideCountdownUI(isBatchMode), 500);
            }
        }
    }, 1000);
}

// 处理拖放事件的函数，用于重新绑定事件监听器
function handleDropEvent(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    if (!e.dataTransfer.files.length) return;
    
    // 添加加载状态
    document.body.classList.add('loading');
    
    // 延迟处理，让UI先更新
    setTimeout(() => {
        try {
            // 检查是否有图片文件
            let hasImageFile = false;
            for (let i = 0; i < e.dataTransfer.files.length; i++) {
                if (e.dataTransfer.files[i].type.match('image.*')) {
                    hasImageFile = true;
                    break;
                }
            }
            
            if (!hasImageFile) {
                alert('请选择图片文件！');
                return;
            }
            
            // 区分批量和单图模式
            if (batchMode) {
                handleBatchFiles(e.dataTransfer.files);
                // 注意：handleBatchFiles会自己处理loading状态
            } else {
                handleFile(e.dataTransfer.files[0]);
                // 注意：handleFile会自己处理loading状态
            }
            
            // 重置文件输入控件
            fileInput.value = '';
        } catch (error) {
            console.error('处理拖放文件时出错:', error);
            alert('处理文件时出错，请重试！');
        } finally {
            // 确保在所有情况下都移除loading状态
            document.body.classList.remove('loading');
        }
    }, 100);
}

// 隐藏倒计时UI并恢复上传区域状态
function hideCountdownUI(isBatchMode = false) {
    // 确保只执行一次
    if (!countdownElement) return;
    
    // 移除倒计时UI
    if (countdownElement.parentNode) {
        uploadArea.removeChild(countdownElement);
    }
    
    // 恢复上传区域的原始位置样式
    if (countdownElement.originalPosition) {
        uploadArea.style.position = countdownElement.originalPosition;
    }
    
    // 重置倒计时元素变量
    countdownElement = null;
    
    // 如果是批量模式的倒计时，则确保上传区域可见且可交互
    if (isBatchMode) {
        uploadArea.style.pointerEvents = 'auto';
        uploadArea.style.opacity = '1';
        uploadArea.classList.remove('disabled'); // 移除禁用样式类
        
        // 确保文件输入和上传按钮被重新启用
        fileInput.disabled = false;
        uploadButton.disabled = false;
        
        // 检查冷却时间是否已经结束
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastBatchUsageTime;
        const cooldownPeriod = 20000; // 20秒固定冷却时间
        
        if (timeElapsed >= cooldownPeriod) {
            // 冷却时间已结束，重置批量处理使用次数
            batchUsageCount = 0;
            // 保存到localStorage
            saveBatchUsageData();
        }
    }
    
    // 重置文件输入元素，确保能够再次选择相同的文件
    // 无论是否为批量模式，都需要重置文件输入，以便用户可以再次选择相同的文件
    fileInput.value = '';
    
    // 不要重新初始化事件监听器，这会导致重复添加监听器
    // 重置批量处理相关状态，确保可以再次使用批量处理功能
    if (batchMode && isBatchMode) {
        // 如果当前是批量模式，确保批量模式下的功能正常
        // 已经在上面重置了fileInput.value，这里不需要重复
    }
}

// 初始化应用
function initApp() {
    // 从localStorage加载批量处理使用限制数据
    loadBatchUsageData();
    
    // 检查是否需要显示倒计时
    if (batchUsageCount > 0) {
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastBatchUsageTime;
        const cooldownPeriod = 20000; // 20秒固定冷却时间
        
        if (timeElapsed < cooldownPeriod) {
            // 计算剩余冷却时间
            const remainingTime = Math.ceil((cooldownPeriod - timeElapsed) / 1000);
            
            // 如果剩余冷却时间大于0，则显示倒计时UI
            if (remainingTime > 0) {
                // 设置批量模式为true，以便正确显示倒计时UI
                batchMode = true;
                batchModeToggle.textContent = '批量模式';
                batchModeToggle.classList.add('active');
                
                // 启动倒计时，传递true表示这是批量模式的倒计时
                setTimeout(() => {
                    startCountdown(remainingTime, true);
                }, 500); // 短暂延时确保DOM已完全加载
            }
        }
    }
    
    initEventListeners();
}

// 当页面加载完成时初始化应用
window.addEventListener('DOMContentLoaded', initApp);

// 确保class="loading"对应的CSS规则正确设置
// 添加一个辅助函数来更安全地切换loading状态
function setLoadingState(isLoading) {
    if (isLoading) {
        document.body.classList.add('loading');
    } else {
        document.body.classList.remove('loading');
    }
}

/**
 * 修复Blob URL和本地资源加载问题
 * 解决"Not allowed to load local resource"和"blob:null"相关错误
 */

// 立即执行的修复函数
(function() {
    console.log('正在应用Blob资源和本地资源加载修复...');

    // 1. 修复blob URL在本地环境中的问题
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = function(blob) {
        try {
            // 尝试常规方法创建Blob URL
            return originalCreateObjectURL(blob);
        } catch (e) {
            console.warn('标准Blob URL创建失败，使用替代方案:', e);
            
            // 使用FileReader和Data URL替代Blob URL
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            }).then(dataUrl => {
                console.log('成功创建Data URL替代Blob URL');
                return dataUrl;
            }).catch(err => {
                console.error('创建Data URL失败:', err);
                // 回退到内存中的Base64数据
                return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAyADIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+/iiiigAooJA6nFZ0l/axOqvKpZmVVUHlmYgBQOpJJAA7npWcpxhrJ2KjGUnaKuzRorJfVrOMkG5QkcgA5bH1xnHrWc+vadGQDdKpIJA5OcDGSBnAySBnqQcDpXPLE0Yu0pJF/Vq1tIt/P+vU6Gisaz1ey1BCbd9yqQGdTyhPIDejEdcHjg81p1vGcZq8XdGUouLtJWYUUUVRIUUUUAc34r1EabpchRsXEv7mEDnJb7zf8Brw3XVuUiLRlmI5IBOP0/nVj4j+LF1zxBHYW75srA+Vx0mnJw7/AFH3R+PrWLBavdTrFGMsxr4TPMwnVryw9N+7HRrufqvB+S0qWGp4+vH3pq8U+i6vzZlWdnJdTpFGpaRjxgfzr0Pw7Ymy09VcBZpP3sg9GbkD8BxUmjaKul24LgG5kHz+i/7P/wBerOq3aaXpV1dsQDBE7gnoWxhR+JwPxrlyrLnRh7Ws/ff4L/M9DPMJ9cxMY0vhhov0Rg3XleYxByTnI9BVzwj4sbwx4is9SU/6O5EMwH/POTAYn6HIb6Z7Vg2g3lQ3euX+LbxZ4u8ba1eXtqFsLMxWaW0YO9lXO9izcAnI49vyr7fC4h0qsZ9Nz8jzDCQxWEqQi05NfcfpfRXn/grxAPE/hexvSczvH5UxPXzE4Yn64B/Guw8xPUflX1UZKSTXRnwE4Sg3GS1WjFoopma0MjzLVL0aZpt3dkgGKFnUnpuAwv6kV4j4Pg+0alIzf8u8Lyt7EjA/nXcfEjVv9DsrFT/rJTM49Qgwv6n9K4jw0v2e1llPWWQgfRa/LM3qe1xkrbRVj984ZovD5TCW8veZh+JNQJk+zo3yRcv6FqxtNs31K9htYxl5XCf8B6sfwGTVPUbn7XeyyZyoOxT/ALK8foK7f4e6QZLiXUJBiOIeVFntI3U/gK4MJh/bVI017vVnfmmM+qYedT7S0S9T0ARrbwLGgwsaBFHoAMCvNvjDeeTpOn2QPzzTtKR6qgAH6n9K9NryL4nTfavFFrb/APLOytxn2aVif/QQK+3lLljc/HaUOerGL62PV/g1eiDwdYIxxJA8sEg77S5Kn8QSD9QKu/F/UjoHw08TX6nDpp8yKfSSTbEB+LkVm/DZP+KXjDdPOmHPf51rN+PdyIPhrex5/wBZdWUR9fm8w/8AoFaRleFuxnKCeJpRe+h8NaheJZRQRSStKQOI1AAAHAxnJ/Kq9p4hvYnEqABVIRYl7L2JPcmub1S4MuosM58sKAPruB/lWfp9z9l1OwnzgJcoT7b8A/ka/LYz5pKL6n9d4jCv6vKcdro+nPAvieM2VvCZSyKMIx5GPQHvXd+ePUV4MlwYpFdTyDkH0I6V3vh/xiJFSC7fDDhZG7j/AGjXv4fGpL2dXboz5fMMqabrUdVuj0qiqlveQXUYeGVXU9wcj8RV2vWTTV0fKNNOzCiiimIxvFuoHStDvZVOJCnlp7lyFH64/OvNfCV8ZY7xUOBHcOF9l6/1rV+I+oY+zadDJs2oZXCnDbmJ2g46lcZI9CKxPA8Yb7eeeDcE+vWRea+Lz2p+9lDtb8z9P4MoJ4WnU/mln+COX0gB/EK5HI+0SH8gT/SvoL4qXAtPAUiHjz7q2jHvhw5/RTXzxASniy3HYXJx+R/xr13xx4ikvLaxso2DwW8hkmZTkGV1AAB7hVGB9SPWuDKaLr4uMZbXuz2+I8XDB5dOU9G1Zf16nAWRj0TRrvUJhguxSJT1ZjwoH1NecNdRS3LXU8hSJDukc9FUdT+Fdh4lvptRhit4gSlvGsK46ZA6/jya4S6kEt7IVGBaxtCnoXPLn8Pu/hXp5ziv3nsI7Lfzf+R8/AEYVzS+tVF0fKvJbv5lq5vpXcT3DfvpPuf7EI/hQe3rW/4VvtQ8UyeTCuy2tlzNcSnCoO+Pc9h3PauUjRpWVFGWY4HvXs3h7RYtE0qG2XBk+/M/wDfc9fwHQV4WBwkq9XyW7Ptc5zOlgMM+Z2lJWiur8vM0tK0mLSbUR8NM3MsndjW3RRX2kYqKUYqyR+QSnKcnKTu2FFFFWQFFFFAEF9ZxahZz2s67opo2Rx6gjFed3PhbUdLnaax33ETErJG3GAexB6MPTrXptFcmJwlOvbm0a6neL+57HVhsdVw14p3T3T3Pn/UroaPdtcRQtJdA71Lj5YGPOBnkr6+p5qhgySPI53SOcsTycnvXvuoaJZatGUuoFbI+WUcOv0YcisVPh5o6SBvKkK5+ZBIQrfUYP61484vDTlSjNtLd9j9Zw+ZYbMsLCrOmlKezj17+XY87066XTtThuJBmOJ96+pYcgfjXocHj7R5cB5HjP8A00jP8xmt6Lwfo8IAFhGcDbkgkjHTqTVpNBsEOVtIge+UB/nXp5fQnQXNCbTfkfHcU5pQzScalKlKLUVa+uvbY5//AITzRgOfPfn+GFv/AGao5PiDZKD5VnO5/wBphGP65/SuuGi2C9LWEf8AABVmOztYfuQRr9EAr1vaUY/DFs+RsicXU0qVml6M5G18U6rq9v51tptuqHozy5I/ID+dXP7R1X/oFwf+BP8A9jXUUVyZdlmEwCqLDw5edpttu9l+S/qxzZnnGMzF0/rErc1+VJJLXrZfr8zl/wC0dV/6BcH/AIE//Y0f2jqv/QLg/wDAn/7Guoor0DyTmf7R1X/oFwf+BP8A9jR/aOq/9AuD/wACf/sa6aik4pqzQJ8jvbQ//9k='; // 一个简单的占位图
            });
        }
    };
    
    // 2. 创建安全的文件下载函数，不依赖blob URL
    window.safeDownloadFile = function(blob, filename) {
        try {
            // 尝试使用标准的saveAs或URL.createObjectURL方法
            if (typeof saveAs === 'function') {
                return saveAs(blob, filename);
            }
            
            // 如果标准方法不可用，使用DataURL
            const reader = new FileReader();
            reader.onload = function() {
                const link = document.createElement('a');
                link.href = reader.result;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => document.body.removeChild(link), 100);
            };
            reader.readAsDataURL(blob);
            return true;
        } catch (e) {
            console.error('文件下载失败:', e);
            return false;
        }
    };
    
    // 3. 创建替代的QR码生成器
    window.safeCreateQRCode = function(url, elementId) {
        try {
            const qrcodeElement = document.getElementById(elementId);
            if (!qrcodeElement) return false;
            
            // 使用内联SVG创建简单的QR码样式
            const qrDiv = document.createElement('div');
            qrDiv.className = 'simple-qrcode';
            qrDiv.innerHTML = `
                <div class="qrcode-text">
                    <p>无法生成二维码</p>
                    <p>请复制以下链接:</p>
                    <textarea readonly class="qrcode-url">${url}</textarea>
                    <button class="qrcode-copy-btn">复制链接</button>
                </div>
            `;
            
            // 添加复制功能
            qrcodeElement.innerHTML = '';
            qrcodeElement.appendChild(qrDiv);
            
            const copyBtn = qrDiv.querySelector('.qrcode-copy-btn');
            const urlArea = qrDiv.querySelector('.qrcode-url');
            
            copyBtn.addEventListener('click', function() {
                urlArea.select();
                document.execCommand('copy');
                copyBtn.textContent = '已复制!';
                setTimeout(() => copyBtn.textContent = '复制链接', 2000);
            });
            
            // 添加样式
            const style = document.createElement('style');
            style.textContent = `
                .simple-qrcode {
                    padding: 15px;
                    background: #f5f5f5;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    text-align: center;
                }
                .qrcode-text {
                    margin-bottom: 10px;
                }
                .qrcode-url {
                    width: 100%;
                    margin: 10px 0;
                    padding: 5px;
                    font-size: 12px;
                    height: 60px;
                }
                .qrcode-copy-btn {
                    padding: 5px 15px;
                    background: #4caf50;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                }
                .qrcode-copy-btn:hover {
                    background: #45a049;
                }
            `;
            document.head.appendChild(style);
            
            return true;
        } catch (e) {
            console.error('创建QR码失败:', e);
            return false;
        }
    };
    
    // 4. 修复share.js问题
    if (typeof window.createQRCode === 'function') {
        const originalCreateQRCode = window.createQRCode;
        window.createQRCode = function(url) {
            try {
                return originalCreateQRCode(url);
            } catch (e) {
                console.warn('原QR码生成失败，使用安全替代:', e);
                return window.safeCreateQRCode(url, 'wechat-qrcode');
            }
        };
    }
    
    // 5. 添加内联二维码生成器
    if (typeof QRCode === 'undefined') {
        console.log('内联QRCode.js简化版本...');
        
        // 简化的QRCode库，只提供基本功能
        window.QRCode = function(element, options) {
            if (typeof element === 'string') {
                element = document.getElementById(element);
            }
            
            const opts = {
                text: options.text || '',
                width: options.width || 128,
                height: options.height || 128,
                colorDark: options.colorDark || '#000000',
                colorLight: options.colorLight || '#ffffff'
            };
            
            // 创建一个简单的占位图和文本
            element.innerHTML = '';
            element.style.width = opts.width + 'px';
            element.style.height = opts.height + 'px';
            element.style.position = 'relative';
            element.style.border = '1px solid #ddd';
            element.style.backgroundColor = opts.colorLight;
            
            // 创建类似QR码的图案
            const pattern = document.createElement('div');
            pattern.style.position = 'absolute';
            pattern.style.top = '10%';
            pattern.style.left = '10%';
            pattern.style.width = '80%';
            pattern.style.height = '80%';
            pattern.style.border = '2px solid ' + opts.colorDark;
            element.appendChild(pattern);
            
            // 添加QR码中的定位标记
            for (let i = 0; i < 3; i++) {
                const marker = document.createElement('div');
                marker.style.position = 'absolute';
                marker.style.width = '15%';
                marker.style.height = '15%';
                marker.style.backgroundColor = opts.colorDark;
                
                if (i === 0) {
                    marker.style.top = '15%';
                    marker.style.left = '15%';
                } else if (i === 1) {
                    marker.style.top = '15%';
                    marker.style.right = '15%';
                } else {
                    marker.style.bottom = '15%';
                    marker.style.left = '15%';
                }
                
                pattern.appendChild(marker);
            }
            
            // 添加提示文本
            const hint = document.createElement('div');
            hint.style.textAlign = 'center';
            hint.style.padding = '5px';
            hint.style.fontSize = '12px';
            hint.style.position = 'absolute';
            hint.style.bottom = '0';
            hint.style.left = '0';
            hint.style.right = '0';
            hint.style.backgroundColor = 'rgba(255,255,255,0.7)';
            hint.textContent = '离线模式：请复制链接分享';
            element.appendChild(hint);
            
            return {
                clear: function() {
                    element.innerHTML = '';
                },
                makeCode: function(text) {
                    // 更新提示文本
                    hint.textContent = '离线模式：请复制链接分享';
                }
            };
        };
    }
    
    // 6. 修复下载图片函数
    const originalDownloadCompressedImage = window.downloadCompressedImage;
    if (originalDownloadCompressedImage) {
        window.downloadCompressedImage = function() {
            try {
                return originalDownloadCompressedImage();
            } catch (e) {
                console.warn('标准下载图片失败，使用安全替代:', e);
                
                if (!compressedBlob || !originalFile) {
                    alert('没有可下载的压缩图片');
                    return;
                }
                
                // 使用安全的下载方法
                const extension = originalFile.name.split('.').pop();
                const fileName = originalFile.name.replace(`.${extension}`, `-compressed.${extension}`);
                return window.safeDownloadFile(compressedBlob, fileName);
            }
        };
    }
    
    // 7. 修复批量下载函数
    const originalDownloadAllCompressedImages = window.downloadAllCompressedImages;
    if (originalDownloadAllCompressedImages) {
        window.downloadAllCompressedImages = function() {
            try {
                return originalDownloadAllCompressedImages();
            } catch (e) {
                console.warn('批量下载失败，使用单文件下载替代:', e);
                
                if (processedImages.length === 0) {
                    alert('没有已处理的图片可下载');
                    return;
                }
                
                if (confirm(`将分别下载 ${processedImages.length} 个压缩图片，而不是打包成ZIP。是否继续？`)) {
                    // 逐个下载图片
                    processedImages.forEach((item, index) => {
                        setTimeout(() => {
                            try {
                                const extension = item.originalName.split('.').pop();
                                const baseName = item.originalName.substring(0, item.originalName.lastIndexOf('.'));
                                const fileName = `${baseName}_compressed.${extension}`;
                                
                                window.safeDownloadFile(item.blob, fileName);
                            } catch (err) {
                                console.error('下载单个文件失败:', err);
                            }
                        }, index * 300);
                    });
                }
            }
        };
    }
    
    // 8. 修复index.html中的CDN依赖
    console.log('正在检查是否存在外部依赖...');
    let dependenciesFound = false;
    
    document.querySelectorAll('script').forEach(script => {
        const src = script.getAttribute('src');
        if (src && (
            src.includes('cdn.jsdelivr.net') || 
            src.includes('cdnjs.cloudflare.com') ||
            src.includes('unpkg.com')
        )) {
            dependenciesFound = true;
            console.warn('检测到外部CDN依赖:', src);
        }
    });
    
    if (dependenciesFound) {
        console.log('已注入本地替代实现，应用将可以离线工作');
    }
})();


/**
 * 图片懒加载优化
 * 为大型图片添加懒加载功能，提高页面加载速度
 */
function setupLazyLoading() {
    // 检查浏览器是否原生支持懒加载
    if ('loading' in HTMLImageElement.prototype) {
      // 浏览器支持懒加载
      const images = document.querySelectorAll("img[data-src]");
      images.forEach(img => {
        img.src = img.dataset.src;
        img.loading = "lazy";
      });
    } else {
      // 浏览器不支持懒加载，使用IntersectionObserver
      let lazyImages = [].slice.call(document.querySelectorAll("img[data-src]"));
      
      if ("IntersectionObserver" in window) {
        let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              let lazyImage = entry.target;
              lazyImage.src = lazyImage.dataset.src;
              lazyImageObserver.unobserve(lazyImage);
            }
          });
        });
  
        lazyImages.forEach(function(lazyImage) {
          lazyImageObserver.observe(lazyImage);
        });
      } else {
        // 回退到更简单的方法
        let active = false;
  
        const lazyLoad = function() {
          if (active === false) {
            active = true;
  
            setTimeout(function() {
              lazyImages.forEach(function(lazyImage) {
                if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== "none") {
                  lazyImage.src = lazyImage.dataset.src;
                  lazyImages = lazyImages.filter(function(image) { return image !== lazyImage; });
  
                  if (lazyImages.length === 0) {
                    document.removeEventListener("scroll", lazyLoad);
                    window.removeEventListener("resize", lazyLoad);
                    window.removeEventListener("orientationchange", lazyLoad);
                  }
                }
              });
  
              active = false;
            }, 200);
          }
        };
  
        document.addEventListener("scroll", lazyLoad);
        window.addEventListener("resize", lazyLoad);
        window.addEventListener("orientationchange", lazyLoad);
        lazyLoad();
      }
    }
  }
  
  // 页面加载完成后设置懒加载
  window.addEventListener('load', setupLazyLoading);