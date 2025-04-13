/**
 * PWA浏览器兼容性增强脚本
 * 用于提高PWA在不同浏览器上的安装成功率
 * 特别针对夸克浏览器、UC浏览器和移动设备优化
 */

// 初始化浏览器兼容性检测
document.addEventListener('DOMContentLoaded', initBrowserCompatibility);

// 浏览器兼容性信息
let browserCompatInfo = {
    name: '',
    version: '',
    isCompatible: false,
    isMobile: false,
    isStandalone: false,
    workarounds: []
};

// 初始化浏览器兼容性检测
function initBrowserCompatibility() {
    console.log('初始化PWA浏览器兼容性检测...');
    
    // 检测浏览器类型和版本
    detectBrowser();
    
    // 应用浏览器特定的兼容性修复
    applyBrowserWorkarounds();
    
    // 监听Service Worker消息
    listenForServiceWorkerMessages();
    
    // 检查是否已经以应用模式运行
    checkStandaloneMode();
}

// 检测浏览器类型和版本
function detectBrowser() {
    const userAgent = navigator.userAgent;
    let browserName = '';
    let browserVersion = '';
    let isCompatible = false;
    
    // 检测是否为移动设备
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/.test(userAgent);
    
    // 检测浏览器类型
    if (/Edge|Edg/.test(userAgent)) {
        browserName = 'Edge';
        isCompatible = true; // Edge支持PWA
    } else if (/Firefox/.test(userAgent)) {
        browserName = 'Firefox';
        isCompatible = true; // Firefox支持PWA，但有限制
    } else if (/Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor)) {
        browserName = 'Chrome';
        isCompatible = true; // Chrome完全支持PWA
    } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
        browserName = 'Safari';
        isCompatible = /Version\/1[3-9]/.test(userAgent); // Safari 13+支持PWA
    } else if (/Quark/.test(userAgent)) {
        browserName = '夸克浏览器';
        isCompatible = false; // 夸克浏览器PWA支持有限，需要特殊处理
    } else if (/UCBrowser/.test(userAgent)) {
        browserName = 'UC浏览器';
        isCompatible = false; // UC浏览器PWA支持有限，需要特殊处理
    } else if (/MicroMessenger/.test(userAgent)) {
        browserName = '微信浏览器';
        isCompatible = false; // 微信内置浏览器不支持PWA
    } else if (/QQBrowser/.test(userAgent)) {
        browserName = 'QQ浏览器';
        isCompatible = false; // QQ浏览器PWA支持有限
    } else if (/Baidu/.test(userAgent)) {
        browserName = '百度浏览器';
        isCompatible = false; // 百度浏览器PWA支持有限
    } else {
        browserName = '未知浏览器';
        isCompatible = false;
    }
    
    // 提取版本号
    const versionMatch = userAgent.match(new RegExp(browserName + '\/([0-9\.]+)'))
                      || userAgent.match(/Version\/([0-9\.]+)/)
                      || userAgent.match(/(?:Chrome|Firefox|Safari)\/([0-9\.]+)/);
    
    if (versionMatch && versionMatch[1]) {
        browserVersion = versionMatch[1];
    }
    
    // 更新浏览器兼容性信息
    browserCompatInfo = {
        name: browserName,
        version: browserVersion,
        isCompatible: isCompatible,
        isMobile: isMobile,
        isStandalone: false,
        workarounds: []
    };
    
    console.log('浏览器兼容性检测结果:', browserCompatInfo);
    
    // 显示浏览器兼容性提示
    showBrowserCompatibilityNotice();
    
    return browserCompatInfo;
}

// 应用浏览器特定的兼容性修复
function applyBrowserWorkarounds() {
    const { name, isMobile } = browserCompatInfo;
    
    // 针对夸克浏览器的特殊处理
    if (name === '夸克浏览器') {
        console.log('应用夸克浏览器兼容性修复...');
        
        // 强制重新注册Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration) {
                    registration.unregister().then(() => {
                        console.log('已注销旧的Service Worker，准备重新注册');
                        // 延迟重新注册，避免冲突
                        setTimeout(() => {
                            navigator.serviceWorker.register('./service-worker.js')
                                .then(reg => console.log('夸克浏览器: Service Worker重新注册成功:', reg.scope))
                                .catch(err => console.error('夸克浏览器: Service Worker重新注册失败:', err));
                        }, 1000);
                    });
                } else {
                    // 直接注册
                    navigator.serviceWorker.register('./service-worker.js')
                        .then(reg => console.log('夸克浏览器: Service Worker注册成功:', reg.scope))
                        .catch(err => console.error('夸克浏览器: Service Worker注册失败:', err));
                }
            });
        }
        
        // 记录应用的修复措施
        browserCompatInfo.workarounds.push('重新注册Service Worker');
        browserCompatInfo.workarounds.push('使用网络优先缓存策略');
    }
    
    // 针对UC浏览器的特殊处理
    if (name === 'UC浏览器') {
        console.log('应用UC浏览器兼容性修复...');
        
        // UC浏览器类似夸克浏览器，应用相同的修复
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js', {scope: './'})
                .then(reg => console.log('UC浏览器: Service Worker注册成功:', reg.scope))
                .catch(err => console.error('UC浏览器: Service Worker注册失败:', err));
        }
        
        // 记录应用的修复措施
        browserCompatInfo.workarounds.push('指定Service Worker作用域');
    }
    
    // 针对移动设备的特殊处理
    if (isMobile) {
        console.log('应用移动设备兼容性修复...');
        
        // 确保manifest.json正确加载
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
            // 重新加载manifest以确保正确应用
            const currentHref = manifestLink.href;
            manifestLink.href = '';
            setTimeout(() => {
                manifestLink.href = currentHref;
                console.log('已重新加载manifest.json');
            }, 100);
        }
        
        // 记录应用的修复措施
        browserCompatInfo.workarounds.push('重新加载manifest.json');
    }
}

// 监听Service Worker消息
function listenForServiceWorkerMessages() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', event => {
            console.log('收到Service Worker消息:', event.data);
            
            // 处理Service Worker版本信息
            if (event.data && event.data.type === 'VERSION_INFO') {
                console.log('Service Worker版本:', event.data.version);
                console.log('缓存名称:', event.data.cacheName);
                
                // 如果Service Worker报告了浏览器信息，更新本地信息
                if (event.data.browser) {
                    console.log('Service Worker检测到的浏览器信息:', event.data.browser);
                }
            }
            
            // 处理Service Worker激活消息
            if (event.data && event.data.type === 'SW_ACTIVATED') {
                console.log('Service Worker已激活，版本:', event.data.version);
                
                // 刷新页面以应用新的Service Worker
                if (browserCompatInfo.name === '夸克浏览器' || browserCompatInfo.name === 'UC浏览器') {
                    console.log('检测到特殊浏览器，将在3秒后刷新页面以应用新的Service Worker...');
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                }
            }
        });
    }
}

// 检查是否已经以应用模式运行
function checkStandaloneMode() {
    // 检查是否已经以独立应用模式运行
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.matchMedia('(display-mode: fullscreen)').matches || 
                         window.navigator.standalone === true;
    
    browserCompatInfo.isStandalone = isStandalone;
    
    if (isStandalone) {
        console.log('应用已经以独立模式运行');
        
        // 隐藏安装按钮
        const installButton = document.getElementById('manual-install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
        
        // 隐藏弹窗式安装提示
        const pwaInstallContainer = document.getElementById('pwa-install-container');
        if (pwaInstallContainer) {
            pwaInstallContainer.hidden = true;
        }
    }
    
    // 监听显示模式变化
    window.matchMedia('(display-mode: standalone)').addEventListener('change', event => {
        browserCompatInfo.isStandalone = event.matches;
        console.log('显示模式变化:', event.matches ? '独立模式' : '浏览器模式');
    });
}

// 显示浏览器兼容性提示
function showBrowserCompatibilityNotice() {
    const { name, isCompatible } = browserCompatInfo;
    
    // 如果浏览器不完全兼容，显示提示
    if (!isCompatible) {
        // 创建提示元素
        const notice = document.createElement('div');
        notice.id = 'browser-compatibility-notice';
        notice.style.position = 'fixed';
        notice.style.bottom = '10px';
        notice.style.left = '10px';
        notice.style.right = '10px';
        notice.style.backgroundColor = '#fff8e1';
        notice.style.border = '1px solid #ffd54f';
        notice.style.borderRadius = '4px';
        notice.style.padding = '10px';
        notice.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        notice.style.zIndex = '9999';
        notice.style.fontSize = '14px';
        notice.style.textAlign = 'center';
        
        // 设置提示内容
        let noticeText = '';
        if (name === '夸克浏览器' || name === 'UC浏览器' || name === 'QQ浏览器' || name === '百度浏览器') {
            noticeText = `检测到您正在使用${name}，PWA安装功能可能受限。建议使用Chrome浏览器获得最佳体验。`;
        } else if (name === '微信浏览器') {
            noticeText = '微信内置浏览器不支持PWA安装，请使用系统浏览器访问本站。';
        } else {
            noticeText = '当前浏览器对PWA支持有限，建议使用Chrome、Edge或Firefox获得最佳体验。';
        }
        
        notice.textContent = noticeText;
        
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '5px';
        closeButton.style.right = '5px';
        closeButton.style.border = 'none';
        closeButton.style.background = 'none';
        closeButton.style.fontSize = '16px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '0 5px';
        closeButton.onclick = () => {
            document.body.removeChild(notice);
        };
        
        notice.appendChild(closeButton);
        
        // 添加到页面
        setTimeout(() => {
            document.body.appendChild(notice);
            
            // 5秒后自动隐藏
            setTimeout(() => {
                if (notice.parentNode) {
                    notice.style.opacity = '0';
                    notice.style.transition = 'opacity 0.5s';
                    setTimeout(() => {
                        if (notice.parentNode) {
                            document.body.removeChild(notice);
                        }
                    }, 500);
                }
            }, 5000);
        }, 1000);
    }
}

// 查询Service Worker版本信息
function queryServiceWorkerVersion() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'GET_VERSION'
        });
    }
}

// 导出函数
window.pwaCompat = {
    detectBrowser,
    applyBrowserWorkarounds,
    queryServiceWorkerVersion
};

// 页面加载完成后查询Service Worker版本
window.addEventListener('load', () => {
    // 延迟查询，确保Service Worker已激活
    setTimeout(queryServiceWorkerVersion, 2000);
});