/**
 * 华为浏览器PWA支持增强脚本
 * 用于提高PWA在华为浏览器上的安装成功率
 */

// 初始化华为浏览器支持
document.addEventListener('DOMContentLoaded', initHuaweiBrowserSupport);

// 华为浏览器信息
let huaweiBrowserInfo = {
    detected: false,
    version: '',
    androidVersion: '',
    supportsPWA: false
};

// 初始化华为浏览器支持
function initHuaweiBrowserSupport() {
    console.log('检查华为浏览器支持...');
    
    // 检测是否为华为浏览器
    if (detectHuaweiBrowser()) {
        console.log('检测到华为浏览器，应用特定优化...');
        applyHuaweiBrowserOptimizations();
    }
}

// 检测是否为华为浏览器
function detectHuaweiBrowser() {
    const userAgent = navigator.userAgent;
    const isHuawei = /HuaweiBrowser/.test(userAgent);
    
    if (isHuawei) {
        // 提取版本信息
        const versionMatch = userAgent.match(/HuaweiBrowser\/(\d+\.\d+\.\d+\.\d+)/);
        if (versionMatch && versionMatch[1]) {
            huaweiBrowserInfo.version = versionMatch[1];
        }
        
        // 提取Android版本
        const androidMatch = userAgent.match(/Android\s([0-9\.]+)/);
        if (androidMatch && androidMatch[1]) {
            huaweiBrowserInfo.androidVersion = androidMatch[1];
        }
        
        // 检查是否支持PWA
        huaweiBrowserInfo.supportsPWA = true; // 华为浏览器通常支持PWA
        huaweiBrowserInfo.detected = true;
        
        console.log('华为浏览器信息:', huaweiBrowserInfo);
    }
    
    return isHuawei;
}

// 应用华为浏览器特定优化
function applyHuaweiBrowserOptimizations() {
    // 1. 确保manifest.json正确加载
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
        // 确保manifest链接使用绝对路径
        if (!manifestLink.href.startsWith('http')) {
            const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
            manifestLink.href = new URL(manifestLink.getAttribute('href'), baseUrl).href;
            console.log('已更新manifest链接为绝对路径:', manifestLink.href);
        }
    }
    
    // 2. 优化Service Worker注册
    if ('serviceWorker' in navigator) {
        // 使用特定的注册选项
        navigator.serviceWorker.register('./service-worker.js', {
            scope: './',
            updateViaCache: 'none' // 禁用通过缓存更新
        }).then(registration => {
            console.log('华为浏览器: Service Worker注册成功:', registration.scope);
            
            // 通知Service Worker使用华为浏览器优化
            if (registration.active) {
                registration.active.postMessage({
                    type: 'BROWSER_INFO',
                    browser: 'huawei',
                    version: huaweiBrowserInfo.version,
                    androidVersion: huaweiBrowserInfo.androidVersion
                });
            }
        }).catch(error => {
            console.error('华为浏览器: Service Worker注册失败:', error);
        });
    }
    
    // 3. 添加安装按钮事件处理
    const installButton = document.getElementById('pwa-install-button') || 
                          document.getElementById('manual-install-button');
    
    if (installButton) {
        installButton.addEventListener('click', promptInstallForHuawei);
        installButton.style.display = 'block'; // 确保按钮可见
    }
    
    // 4. 添加特定的meta标签
    addHuaweiMetaTags();
}

// 添加华为浏览器特定的meta标签
function addHuaweiMetaTags() {
    // 添加移动端视口设置
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    
    // 添加华为浏览器特定的meta标签
    const metaTags = [
        { name: 'theme-color', content: '#4a90e2' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'mobile-web-app-capable', content: 'yes' }
    ];
    
    metaTags.forEach(meta => {
        if (!document.querySelector(`meta[name="${meta.name}"]`)) {
            const metaTag = document.createElement('meta');
            metaTag.name = meta.name;
            metaTag.content = meta.content;
            document.head.appendChild(metaTag);
            console.log(`已添加meta标签: ${meta.name}`);
        }
    });
}

// 华为浏览器特定的安装提示
function promptInstallForHuawei() {
    // 检查是否已经以应用模式运行
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        alert('应用已经安装并以独立模式运行');
        return;
    }
    
    // 显示华为浏览器特定的安装指南
    const installGuide = document.createElement('div');
    installGuide.style.position = 'fixed';
    installGuide.style.top = '0';
    installGuide.style.left = '0';
    installGuide.style.width = '100%';
    installGuide.style.height = '100%';
    installGuide.style.backgroundColor = 'rgba(0,0,0,0.8)';
    installGuide.style.zIndex = '10000';
    installGuide.style.display = 'flex';
    installGuide.style.flexDirection = 'column';
    installGuide.style.justifyContent = 'center';
    installGuide.style.alignItems = 'center';
    installGuide.style.color = 'white';
    installGuide.style.padding = '20px';
    installGuide.style.boxSizing = 'border-box';
    installGuide.style.textAlign = 'center';
    
    installGuide.innerHTML = `
        <div style="background-color: #4a90e2; padding: 20px; border-radius: 10px; max-width: 90%; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
            <h2 style="margin-top: 0;">安装到主屏幕</h2>
            <p>在华为浏览器中，请按照以下步骤安装此应用：</p>
            <ol style="text-align: left; margin-bottom: 20px;">
                <li>点击浏览器右上角的三点菜单</li>
                <li>选择"添加到主屏幕"选项</li>
                <li>点击"添加"确认安装</li>
            </ol>
            <p>安装后，您可以从主屏幕直接启动应用，享受更好的体验！</p>
            <button id="close-install-guide" style="background-color: white; color: #4a90e2; border: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; margin-top: 10px;">我知道了</button>
        </div>
    `;
    
    document.body.appendChild(installGuide);
    
    // 添加关闭按钮事件
    document.getElementById('close-install-guide').addEventListener('click', function() {
        installGuide.remove();
    });
}

// 导出函数
window.huaweiBrowserSupport = {
    detect: detectHuaweiBrowser,
    getInfo: () => huaweiBrowserInfo,
    promptInstall: promptInstallForHuawei
};