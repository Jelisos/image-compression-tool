/**
 * PWA 安装诊断工具
 * 用于检测PWA安装条件并提供详细诊断信息
 */

// 初始化诊断结果对象
let pwaDiagnostics = {
    isHttps: false,
    hasManifest: false,
    manifestValid: false,
    hasServiceWorker: false,
    serviceWorkerActive: false,
    canInstall: false,
    installPromptCaptured: false,
    isStandalone: false,
    failureReason: '',
    iconsMissing: [],
    manifestErrors: []
};

// 运行完整的PWA诊断
function runPWADiagnostics() {
    console.log('🔍 运行PWA安装诊断...');
    
    // 检查是否为HTTPS
    pwaDiagnostics.isHttps = window.location.protocol === 'https:' || 
                             window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1';
    
    // 检查是否已经以独立应用模式运行
    pwaDiagnostics.isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                                 window.matchMedia('(display-mode: fullscreen)').matches || 
                                 window.navigator.standalone === true;
    
    // 检查manifest.json
    checkManifest();
    
    // 检查Service Worker
    checkServiceWorker();
    
    // 记录诊断结果
    console.log('📊 PWA诊断结果:', pwaDiagnostics);
    
    // 更新UI显示诊断结果
    updateDiagnosticsUI();
    
    return pwaDiagnostics;
}

// 检查manifest.json
function checkManifest() {
    fetch('./manifest.json')
        .then(response => {
            pwaDiagnostics.hasManifest = response.ok;
            if (!response.ok) {
                pwaDiagnostics.failureReason = 'manifest.json加载失败';
                pwaDiagnostics.manifestErrors.push('无法加载manifest.json文件');
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (!data) return;
            
            // 验证manifest必要字段
            pwaDiagnostics.manifestValid = true;
            
            // 检查必要字段
            const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
            for (const field of requiredFields) {
                if (!data[field]) {
                    pwaDiagnostics.manifestValid = false;
                    pwaDiagnostics.manifestErrors.push(`manifest缺少必要字段: ${field}`);
                }
            }
            
            // 检查图标
            if (data.icons && Array.isArray(data.icons)) {
                // 检查是否有192x192和512x512的图标
                const has192 = data.icons.some(icon => icon.sizes === '192x192');
                const has512 = data.icons.some(icon => icon.sizes === '512x512');
                
                if (!has192) {
                    pwaDiagnostics.iconsMissing.push('192x192');
                    pwaDiagnostics.manifestErrors.push('缺少192x192图标');
                }
                
                if (!has512) {
                    pwaDiagnostics.iconsMissing.push('512x512');
                    pwaDiagnostics.manifestErrors.push('缺少512x512图标');
                }
                
                if (!has192 || !has512) {
                    pwaDiagnostics.manifestValid = false;
                }
            } else {
                pwaDiagnostics.manifestValid = false;
                pwaDiagnostics.manifestErrors.push('manifest缺少icons字段或格式不正确');
            }
            
            // 检查display模式
            if (data.display && !['standalone', 'fullscreen', 'minimal-ui'].includes(data.display)) {
                pwaDiagnostics.manifestValid = false;
                pwaDiagnostics.manifestErrors.push(`不支持的display模式: ${data.display}`);
            }
        })
        .catch(error => {
            pwaDiagnostics.manifestValid = false;
            pwaDiagnostics.manifestErrors.push(`解析manifest.json出错: ${error.message}`);
            console.error('manifest.json解析错误:', error);
        });
}

// 检查Service Worker
function checkServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        pwaDiagnostics.failureReason = '浏览器不支持Service Worker';
        return;
    }
    
    pwaDiagnostics.hasServiceWorker = true;
    
    navigator.serviceWorker.getRegistration()
        .then(registration => {
            if (!registration) {
                pwaDiagnostics.failureReason = 'Service Worker未注册';
                return;
            }
            
            pwaDiagnostics.serviceWorkerActive = !!registration.active;
            
            // 检查Service Worker的作用域
            const swScope = new URL(registration.scope).pathname;
            const pagePathname = window.location.pathname;
            
            if (!pagePathname.startsWith(swScope)) {
                pwaDiagnostics.failureReason = `Service Worker作用域(${swScope})不包含当前页面(${pagePathname})`;
            }
        })
        .catch(error => {
            pwaDiagnostics.failureReason = `检查Service Worker失败: ${error.message}`;
            console.error('检查Service Worker状态失败:', error);
        });
}

// 更新UI显示诊断结果
function updateDiagnosticsUI() {
    // 创建或获取诊断信息容器
    let diagnosticsContainer = document.getElementById('pwa-diagnostics-container');
    
    if (!diagnosticsContainer) {
        diagnosticsContainer = document.createElement('div');
        diagnosticsContainer.id = 'pwa-diagnostics-container';
        diagnosticsContainer.style.display = 'none';
        diagnosticsContainer.style.position = 'fixed';
        diagnosticsContainer.style.bottom = '10px';
        diagnosticsContainer.style.right = '10px';
        diagnosticsContainer.style.backgroundColor = '#fff';
        diagnosticsContainer.style.border = '1px solid #ddd';
        diagnosticsContainer.style.borderRadius = '5px';
        diagnosticsContainer.style.padding = '15px';
        diagnosticsContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        diagnosticsContainer.style.zIndex = '9999';
        diagnosticsContainer.style.maxWidth = '400px';
        diagnosticsContainer.style.maxHeight = '80vh';
        diagnosticsContainer.style.overflow = 'auto';
        document.body.appendChild(diagnosticsContainer);
        
        // 添加标题
        const title = document.createElement('h3');
        title.textContent = 'PWA安装诊断';
        title.style.margin = '0 0 10px 0';
        title.style.borderBottom = '1px solid #eee';
        title.style.paddingBottom = '5px';
        diagnosticsContainer.appendChild(title);
        
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.border = 'none';
        closeButton.style.background = 'none';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '16px';
        closeButton.onclick = () => {
            diagnosticsContainer.style.display = 'none';
        };
        diagnosticsContainer.appendChild(closeButton);
        
        // 添加内容容器
        const content = document.createElement('div');
        content.id = 'pwa-diagnostics-content';
        diagnosticsContainer.appendChild(content);
    }
    
    // 获取内容容器
    const content = document.getElementById('pwa-diagnostics-content');
    content.innerHTML = '';
    
    // 创建诊断结果列表
    const list = document.createElement('ul');
    list.style.paddingLeft = '20px';
    list.style.margin = '0';
    
    // 添加诊断项
    addDiagnosticItem(list, 'HTTPS连接', pwaDiagnostics.isHttps);
    addDiagnosticItem(list, 'Manifest文件', pwaDiagnostics.hasManifest);
    addDiagnosticItem(list, 'Manifest有效', pwaDiagnostics.manifestValid);
    addDiagnosticItem(list, 'Service Worker支持', pwaDiagnostics.hasServiceWorker);
    addDiagnosticItem(list, 'Service Worker激活', pwaDiagnostics.serviceWorkerActive);
    addDiagnosticItem(list, '已捕获安装提示', pwaDiagnostics.installPromptCaptured);
    addDiagnosticItem(list, '已以应用模式运行', pwaDiagnostics.isStandalone);
    
    // 添加失败原因
    if (pwaDiagnostics.failureReason) {
        const failureItem = document.createElement('li');
        failureItem.style.color = 'red';
        failureItem.style.marginTop = '10px';
        failureItem.textContent = `失败原因: ${pwaDiagnostics.failureReason}`;
        list.appendChild(failureItem);
    }
    
    // 添加manifest错误
    if (pwaDiagnostics.manifestErrors.length > 0) {
        const manifestErrorsTitle = document.createElement('li');
        manifestErrorsTitle.style.marginTop = '10px';
        manifestErrorsTitle.textContent = 'Manifest错误:';
        list.appendChild(manifestErrorsTitle);
        
        const manifestErrorsList = document.createElement('ul');
        pwaDiagnostics.manifestErrors.forEach(error => {
            const errorItem = document.createElement('li');
            errorItem.style.color = 'red';
            errorItem.textContent = error;
            manifestErrorsList.appendChild(errorItem);
        });
        list.appendChild(manifestErrorsList);
    }
    
    content.appendChild(list);
    
    // 添加刷新按钮
    const refreshButton = document.createElement('button');
    refreshButton.textContent = '刷新诊断';
    refreshButton.style.marginTop = '15px';
    refreshButton.style.padding = '5px 10px';
    refreshButton.style.backgroundColor = '#4a90e2';
    refreshButton.style.color = 'white';
    refreshButton.style.border = 'none';
    refreshButton.style.borderRadius = '3px';
    refreshButton.style.cursor = 'pointer';
    refreshButton.onclick = runPWADiagnostics;
    content.appendChild(refreshButton);
}

// 添加诊断项
function addDiagnosticItem(list, label, isSuccess) {
    const item = document.createElement('li');
    item.style.marginBottom = '5px';
    const icon = isSuccess ? '✅' : '❌';
    item.textContent = `${icon} ${label}: ${isSuccess ? '通过' : '未通过'}`;
    item.style.color = isSuccess ? 'green' : 'red';
    list.appendChild(item);
}

// 显示诊断面板
function showPWADiagnostics() {
    runPWADiagnostics();
    const diagnosticsContainer = document.getElementById('pwa-diagnostics-container');
    if (diagnosticsContainer) {
        diagnosticsContainer.style.display = 'block';
    }
}

// 监听beforeinstallprompt事件
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('✅ 捕获到beforeinstallprompt事件');
    pwaDiagnostics.installPromptCaptured = true;
    pwaDiagnostics.canInstall = true;
    
    // 保存事件以便稍后触发
    window.deferredPrompt = e;
});

// 监听appinstalled事件
window.addEventListener('appinstalled', () => {
    console.log('✅ 应用已成功安装');
    pwaDiagnostics.isStandalone = true;
});

// 导出函数
window.showPWADiagnostics = showPWADiagnostics;
window.runPWADiagnostics = runPWADiagnostics;

// 页面加载完成后自动运行诊断
window.addEventListener('load', () => {
    // 延迟运行诊断，确保其他脚本已加载
    setTimeout(runPWADiagnostics, 1000);
});