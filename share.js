/**
 * 图片压缩工具 - 分享功能修复与优化
 * 1. 修复分享平台按钮无反应问题
 * 2. 批量模式下改为分享本站
 * 3. 移动端适配
 */

// 全局变量
let shareImageUrl = ''; // 分享的图片URL
let isBatchMode = false; // 批量模式标志
let hasSingleImage = false; // 是否有单张图片被处理

// 在文档加载完成后初始化分享功能
document.addEventListener('DOMContentLoaded', initShareFeature);

/**
 * 初始化分享功能
 */
function initShareFeature() {
    const shareButton = document.getElementById('share-button');
    const shareModal = document.getElementById('share-modal');
    const closeShareModal = document.querySelector('.close-share-modal');
    const copyLinkButton = document.getElementById('copy-link-button');
    const copyLinkInput = document.getElementById('copy-link-input');
    const copySuccessMessage = document.getElementById('copy-success-message');
    
    // 如果找不到元素，直接返回
    if (!shareButton || !shareModal) return;
    
    // 检测是否为批量模式，并在批量模式下启用分享按钮
    checkBatchModeAndEnableShare();
    
    // 点击分享按钮打开模态窗口
    shareButton.addEventListener('click', () => {
        // 更新批量模式状态和单图状态
        updateShareStatus();
        
        // 网站主页链接
        const siteUrl = 'https://jelisos.github.io/image-compression-tool/';
        
        // 获取分享内容 - 检查是否有单张图片被处理
        const useImageShare = !isBatchMode || (isBatchMode && hasSingleImage);
        
        if (useImageShare) {
            // 单图模式下或批量模式但有单张图片时
            const compressedImage = document.getElementById('compressed-image');
            if (compressedImage && compressedImage.src && 
                !compressedImage.src.includes('jelisos.github.io') && 
                compressedImage.style.display !== 'none') {
                
                // 检查图片链接是否为data:URL
                if (compressedImage.src.startsWith('data:image/')) {
                    console.log('检测到data:URL图片，使用主页链接替代');
                    shareImageUrl = siteUrl; // 使用主页链接替代
                } else {
                    shareImageUrl = compressedImage.src;
                }
                
                // 更新模态窗口标题
                const modalTitle = document.querySelector('.share-modal-header h2');
                if (modalTitle) {
                    modalTitle.textContent = '分享图片压缩工具';
                }
            } else {
                // 如果找不到有效的压缩图片，则分享网站
                shareImageUrl = siteUrl;
                
                // 更新模态窗口标题
                const modalTitle = document.querySelector('.share-modal-header h2');
                if (modalTitle) {
                    modalTitle.textContent = '分享图片压缩工具';
                }
            }
        } else {
            // 批量模式下分享本站
            shareImageUrl = siteUrl;
            
            // 更新模态窗口标题
            const modalTitle = document.querySelector('.share-modal-header h2');
            if (modalTitle) {
                modalTitle.textContent = '分享图片压缩工具';
            }
        }
        
        // 更新预览图片和链接
        const sharePreviewImage = document.getElementById('share-preview-image');
        if (sharePreviewImage) {
            if (useImageShare && shareImageUrl && !shareImageUrl.startsWith('http') && !shareImageUrl.startsWith('data:')) {
                // 单图模式下显示压缩后的图片(非数据URL)
                sharePreviewImage.src = shareImageUrl;
            } else {
                // 显示网站Logo或默认图片
                sharePreviewImage.src = 'https://jelisos.github.io/image-compression-tool/bgz02.jpg';
                // 如果没有Logo，可以创建一个文本预览
                if (sharePreviewImage.naturalWidth === 0) {
                    sharePreviewImage.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#f5f5f5"/><text x="50%" y="50%" font-family="Arial" font-size="16" text-anchor="middle" fill="#333">图片压缩工具</text></svg>');
                }
            }
        }
        
        // 更新复制链接输入框
        if (copyLinkInput) {
            if (useImageShare && shareImageUrl && !shareImageUrl.startsWith('http') && !shareImageUrl.startsWith('data:')) {
                copyLinkInput.value = shareImageUrl;
                
                // 更新复制链接区域标题
                const copyLinkTitle = document.querySelector('.copy-link-section h3');
                if (copyLinkTitle) {
                    copyLinkTitle.textContent = '复制图片链接';
                }
            } else {
                copyLinkInput.value = siteUrl; // 使用主页链接
                
                // 更新复制链接区域标题
                const copyLinkTitle = document.querySelector('.copy-link-section h3');
                if (copyLinkTitle) {
                    copyLinkTitle.textContent = '复制本站链接';
                }
            }
        }
        
        // 确保分享平台按钮存在
        createSharePlatformsIfNeeded(useImageShare);
        
        // 显示模态窗口
        shareModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    });
    
    // 关闭模态窗口
    if (closeShareModal) {
        closeShareModal.addEventListener('click', () => {
            shareModal.style.display = 'none';
            document.body.style.overflow = '';
            // 隐藏微信二维码区域
            const qrcodeContainer = document.getElementById('wechat-qrcode-container');
            if (qrcodeContainer) {
                qrcodeContainer.style.display = 'none';
            }
        });
    }
    
    // 点击模态窗口外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.style.display = 'none';
                document.body.style.overflow = '';
            // 隐藏微信二维码区域
            const qrcodeContainer = document.getElementById('wechat-qrcode-container');
            if (qrcodeContainer) {
                qrcodeContainer.style.display = 'none';
            }
        }
    });
    
    // 复制链接
    if (copyLinkButton && copyLinkInput) {
        copyLinkButton.addEventListener('click', () => {
            copyLinkInput.select();
            document.execCommand('copy');
            
            // 显示复制成功消息
            if (copySuccessMessage) {
                copySuccessMessage.style.display = 'block';
                setTimeout(() => {
                    copySuccessMessage.style.display = 'none';
                }, 2000);
            }
        });
    }
    
    // 监听图片处理完成事件，更新单图状态
    monitorImageProcessing();
}

/**
 * 监听图片处理状态，检测单图在批量模式下的情况
 */
function monitorImageProcessing() {
    // 通过MutationObserver监视DOM变化
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' || mutation.type === 'childList') {
                const compressedImage = document.getElementById('compressed-image');
                const previewSection = document.getElementById('preview-section');
                
                // 检查是否有处理后的单张图片
                if (compressedImage && 
                    compressedImage.src && 
                    !compressedImage.src.includes('jelisos.github.io') && 
                    previewSection && 
                    !previewSection.hidden) {
                    hasSingleImage = true;
                }
                
                // 检查预览区域是否隐藏，如果隐藏则重置单图状态
                if (previewSection && previewSection.hidden) {
                    hasSingleImage = false;
                }
            }
        });
    });
    
    // 观察预览区域和压缩图片的变化
    const previewSection = document.getElementById('preview-section');
    const compressedImage = document.getElementById('compressed-image');
    
    if (previewSection) {
        observer.observe(previewSection, { 
            attributes: true, 
            attributeFilter: ['hidden'] 
        });
    }
    
    if (compressedImage) {
        observer.observe(compressedImage, { 
            attributes: true, 
            attributeFilter: ['src', 'style'] 
        });
    }
    
    // 监听reset按钮点击，重置单图状态
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            hasSingleImage = false;
        });
    }
}

/**
 * 更新分享状态
 */
function updateShareStatus() {
    // 更新批量模式状态
    updateBatchModeStatus();
    
    // 检查是否有单张图片
    const compressedImage = document.getElementById('compressed-image');
    const previewSection = document.getElementById('preview-section');
    
    // 如果有处理后的单张图片，并且预览区域可见，则标记有单图
    if (compressedImage && 
        compressedImage.src && 
        !compressedImage.src.includes('jelisos.github.io') && 
        previewSection && 
        !previewSection.hidden) {
        hasSingleImage = true;
    }
}

/**
 * 检查批量模式状态并启用分享按钮
 */
function checkBatchModeAndEnableShare() {
    // 获取批量模式状态
    updateBatchModeStatus();
    
    // 在批量模式下立即启用分享按钮
    if (isBatchMode) {
        const shareButton = document.getElementById('share-button');
        if (shareButton && shareButton.disabled) {
            shareButton.disabled = false;
        }
    }
    
    // 检查是否有单张图片
    updateShareStatus();
    
    // 监听批量模式切换按钮的状态变化
    const batchModeToggle = document.getElementById('batch-mode-toggle');
    if (batchModeToggle) {
        batchModeToggle.addEventListener('click', () => {
            // 延迟执行，确保批量模式变量已更新
            setTimeout(() => {
                updateShareStatus();
                
                // 在批量模式下启用分享按钮
                const shareButton = document.getElementById('share-button');
                if (shareButton && isBatchMode) {
                    shareButton.disabled = false;
                }
            }, 100);
        });
    }
}

/**
 * 更新批量模式状态
 */
function updateBatchModeStatus() {
    // 检查全局变量
    if (typeof window.batchMode !== 'undefined') {
        isBatchMode = window.batchMode;
    } else {
        // 检查批量模式按钮状态
        const batchModeToggle = document.getElementById('batch-mode-toggle');
        isBatchMode = batchModeToggle && (
            batchModeToggle.classList.contains('active') || 
            batchModeToggle.textContent.includes('批量模式')
        );
    }
    
    // 检查批量处理区域的可见性
    const batchSection = document.getElementById('batch-processing-section');
    if (batchSection && !batchSection.hidden) {
        isBatchMode = true;
    }
}

/**
 * 创建分享平台按钮（如果需要）
 */
function createSharePlatformsIfNeeded(useImageShare) {
    // 查找分享平台容器
    let platformsContainer = document.querySelector('.share-platforms');
    
    // 如果容器不存在，创建一个
    if (!platformsContainer) {
        const modalBody = document.querySelector('.share-modal-body');
        if (!modalBody) return;
        
        const platformsSection = document.createElement('div');
        platformsSection.innerHTML = `
            <h3>选择分享平台</h3>
            <div class="share-platforms"></div>
        `;
        
        // 将分享平台区域插入到预览图之后
        const previewSection = modalBody.querySelector('.share-image-preview');
        if (previewSection) {
            previewSection.after(platformsSection);
        } else {
            modalBody.prepend(platformsSection);
        }
        
        platformsContainer = platformsSection.querySelector('.share-platforms');
    }
    
    // 如果容器存在但是为空，或者需要刷新按钮，创建分享平台按钮
    if (platformsContainer && (platformsContainer.children.length === 0 || true)) {
        // 清空容器
        platformsContainer.innerHTML = '';
        
        // 创建分享平台按钮
        const platforms = [
            { id: 'wechat-share', name: '微信', icon: 'icons/wechat.svg', class: 'wechat' },
            { id: 'weibo-share', name: '微博', icon: 'icons/weibo.svg', class: 'weibo' },
            { id: 'qq-share', name: 'QQ', icon: 'icons/qq.svg', class: 'qq' },
            { id: 'facebook-share', name: 'Facebook', icon: 'icons/facebook.svg', class: 'facebook' },
            { id: 'twitter-share', name: 'Twitter', icon: 'icons/twitter.svg', class: 'twitter' },
            { id: 'instagram-share', name: 'Instagram', icon: 'icons/instagram.svg', class: 'instagram' }
        ];
        
        // 添加平台按钮
        platforms.forEach(platform => {
            const platformElement = document.createElement('div');
            platformElement.id = platform.id;
            platformElement.className = `share-platform ${platform.class}`;
            platformElement.innerHTML = `
                <div class="platform-icon ${platform.class}">
                    <img src="${platform.icon}" alt="${platform.name}" width="24" height="24">
                </div>
                <div class="platform-name">${platform.name}</div>
            `;
            platformsContainer.appendChild(platformElement);
        });
        
        // 添加微信二维码区域（如果不存在）
        let qrcodeContainer = document.getElementById('wechat-qrcode-container');
        if (!qrcodeContainer) {
            qrcodeContainer = document.createElement('div');
            qrcodeContainer.id = 'wechat-qrcode-container';
            qrcodeContainer.className = 'wechat-qrcode-container';
            qrcodeContainer.innerHTML = `
                <div class="wechat-qrcode-title">微信扫码分享</div>
                <div id="wechat-qrcode"></div>
                <p class="qrcode-hint">打开微信扫一扫，将${useImageShare ? '图片' : '网站'}分享给好友</p>
            `;
            platformsContainer.after(qrcodeContainer);
        } else {
            // 更新提示文本
            const hint = qrcodeContainer.querySelector('.qrcode-hint');
            if (hint) {
                hint.textContent = `打开微信扫一扫，将${useImageShare ? '图片' : '网站'}分享给好友`;
            }
        }
        
        // 立即绑定事件监听器
        bindSharePlatformEvents(useImageShare);
    }
}

/**
 * 创建二维码
 */
function createQRCode(url) {
    const qrcodeContainer = document.getElementById('wechat-qrcode');
    if (!qrcodeContainer) return;
    
    // 网站主页链接
    const siteUrl = 'https://jelisos.github.io/image-compression-tool/';
    
    // 确保URL是有效的
    if (url.startsWith('data:')) {
        console.log('检测到二维码使用data:URL，替换为网站URL');
        url = siteUrl;
    }
    
    // 清空现有内容
    qrcodeContainer.innerHTML = '';
    
    // 创建一个简单的预览元素
    const previewDiv = document.createElement('div');
    previewDiv.className = 'qrcode-preview';
    previewDiv.style.cssText = 'background:#fff; padding:10px; border:1px solid #ddd; border-radius:4px; text-align:center;';
    
    // 显示加载中提示
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'qrcode-loading';
    loadingDiv.textContent = '二维码加载中...';
    loadingDiv.style.cssText = 'margin-bottom:10px; color:#666;';
    qrcodeContainer.appendChild(loadingDiv);
    
    // 检查URL是否有效
    if (!url.startsWith('http')) {
        console.warn('无效URL:', url);
        url = siteUrl;
    }
    
    // 使用在线二维码生成服务
    const qrcodeImg = document.createElement('img');
    qrcodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
    qrcodeImg.alt = '微信扫码分享';
    qrcodeImg.style.cssText = 'max-width:150px; max-height:150px;';
    
    // 添加加载指示
    qrcodeImg.onload = function() {
        const loadingElement = qrcodeContainer.querySelector('.qrcode-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    };
    
    // 添加到容器
    previewDiv.appendChild(qrcodeImg);
    qrcodeContainer.appendChild(previewDiv);
    
    // 备选方案：如果在线生成服务失败
    qrcodeImg.onerror = function() {
        qrcodeContainer.innerHTML = '<div style="padding:15px; background:#f8f8f8; border:1px solid #ddd; border-radius:4px;">请复制链接后在微信中分享</div>';
    };
}

/**
 * 绑定分享平台点击事件
 */
function bindSharePlatformEvents(useImageShare) {
    // 网站主页链接
    const siteUrl = 'https://jelisos.github.io/image-compression-tool/';
    
    // 获取当前要分享的URL和标题
    // 检查是否为data:URL，如果是则替换为网站URL
    let url = useImageShare && shareImageUrl && !shareImageUrl.startsWith('http') && !shareImageUrl.startsWith('data:') ? 
        shareImageUrl : siteUrl;
    
    // 确保URL是有效的web URL
    if (url.startsWith('data:')) {
        console.log('检测到data:URL，替换为网站URL');
        url = siteUrl;
    }
        
    const title = useImageShare ? 
        '我用图片压缩工具压缩了一张图片' : 
        '推荐一个超好用的图片压缩工具！';
    
    console.log('分享URL:', url);
    console.log('分享标题:', title);
    
    // 微信分享
    const wechatShare = document.getElementById('wechat-share');
    if (wechatShare) {
        // 移除旧事件监听器
        const newWechatShare = wechatShare.cloneNode(true);
        wechatShare.parentNode.replaceChild(newWechatShare, wechatShare);
        
        // 添加新事件监听器
        newWechatShare.addEventListener('click', function(e) {
            if (e) e.preventDefault(); // 防止冒泡
            
            // 显示微信二维码区域
            const qrcodeContainer = document.getElementById('wechat-qrcode-container');
            if (qrcodeContainer) {
                qrcodeContainer.style.display = 'block';
                
                // 确保使用网站URL生成二维码
                const qrUrl = url.startsWith('data:') ? siteUrl : url;
                createQRCode(qrUrl);
            }
        });
    }
    
    // 微博分享
    const weiboShare = document.getElementById('weibo-share');
    if (weiboShare) {
        // 移除旧事件监听器
        const newWeiboShare = weiboShare.cloneNode(true);
        weiboShare.parentNode.replaceChild(newWeiboShare, weiboShare);
        
        // 添加新事件监听器
        newWeiboShare.addEventListener('click', function(e) {
            if (e) e.preventDefault(); // 防止冒泡
            
            // 确保分享URL是有效的Web URL
            const shareUrl = url.startsWith('data:') || !url.startsWith('http') ? 
                siteUrl : url;
                
            const shareLink = `http://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
            window.open(shareLink, '_blank');
        });
    }
    
    // QQ分享
    const qqShare = document.getElementById('qq-share');
    if (qqShare) {
        // 移除旧事件监听器
        const newQQShare = qqShare.cloneNode(true);
        qqShare.parentNode.replaceChild(newQQShare, qqShare);
        
        // 添加新事件监听器
        newQQShare.addEventListener('click', function(e) {
            if (e) e.preventDefault(); // 防止冒泡
            
            // 确保分享URL是有效的Web URL
            const shareUrl = url.startsWith('data:') || !url.startsWith('http') ? 
                siteUrl : url;
                
            const shareLink = `http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
        window.open(shareLink, '_blank');
        });
    }
    
    // Facebook分享
    const facebookShare = document.getElementById('facebook-share');
    if (facebookShare) {
        // 移除旧事件监听器
        const newFacebookShare = facebookShare.cloneNode(true);
        facebookShare.parentNode.replaceChild(newFacebookShare, facebookShare);
        
        // 添加新事件监听器
        newFacebookShare.addEventListener('click', function(e) {
            if (e) e.preventDefault(); // 防止冒泡
            
            // 确保分享URL是有效的Web URL
            const shareUrl = url.startsWith('data:') || !url.startsWith('http') ? 
                siteUrl : url;
                
            const shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
            window.open(shareLink, '_blank');
        });
    }
    
    // Twitter分享
    const twitterShare = document.getElementById('twitter-share');
    if (twitterShare) {
        // 移除旧事件监听器
        const newTwitterShare = twitterShare.cloneNode(true);
        twitterShare.parentNode.replaceChild(newTwitterShare, twitterShare);
        
        // 添加新事件监听器
        newTwitterShare.addEventListener('click', function(e) {
            if (e) e.preventDefault(); // 防止冒泡
            
            // 确保分享URL是有效的Web URL
            const shareUrl = url.startsWith('data:') || !url.startsWith('http') ? 
                siteUrl : url;
                
            const text = useImageShare ? 
                '我压缩了一张图片，效果很好!' : 
                '推荐一个超好用的图片压缩工具！';
                
            const shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
            window.open(shareLink, '_blank');
        });
    }
    
    // Instagram分享提示
    const instagramShare = document.getElementById('instagram-share');
    if (instagramShare) {
        // 移除旧事件监听器
        const newInstagramShare = instagramShare.cloneNode(true);
        instagramShare.parentNode.replaceChild(newInstagramShare, instagramShare);
        
        // 添加新事件监听器
        newInstagramShare.addEventListener('click', function(e) {
            if (e) e.preventDefault(); // 防止冒泡
            
            // 始终指向网站
            alert('Instagram不支持直接分享链接，请复制本站链接后在Instagram中分享');
        });
    }
}

// 在图片处理完成后启用分享按钮
function enableShareButton() {
    const shareButton = document.getElementById('share-button');
    if (shareButton) {
        shareButton.disabled = false;
    }
    
    // 检查是否有单张图片被处理
    setTimeout(() => {
        const compressedImage = document.getElementById('compressed-image');
        const previewSection = document.getElementById('preview-section');
        
        if (compressedImage && 
            compressedImage.src && 
            !compressedImage.src.includes('jelisos.github.io') && 
            previewSection && 
            !previewSection.hidden) {
            hasSingleImage = true;
        }
    }, 500);
}

// 在页面加载完成后，初始化批量模式状态检查并启用分享按钮
document.addEventListener('DOMContentLoaded', () => {
    // 立即检查批量模式状态并启用分享按钮
    setTimeout(checkBatchModeAndEnableShare, 500);
    
    // 再次检查以确保状态正确（处理页面完全加载后的状态）
    setTimeout(checkBatchModeAndEnableShare, 1500);
});

// 导出函数供主脚本使用
window.enableShareButton = enableShareButton;

