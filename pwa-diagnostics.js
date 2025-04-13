/**
 * PWA 安装诊断工具
 * 用于检测PWA安装条件并提供详细诊断信息
 * 增强版：添加浏览器兼容性检测
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
    manifestErrors: [],
    browserInfo: {
        name: '',
        version: '',
        isCompatible: false,
        isMobile: false,
        supportsPWA: false
    }
};

// 检测浏览器类型和兼容性
function detectBrowser() {
    const userAgent = navigator.userAgent;
    let browserName = '';
    let browserVersion = '';
    let isCompatible = false;
    
    // 检测是否为移动设备
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/.test(userAgent);
    
    // 检测iOS设备
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);
    
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
    } else if (/HuaweiBrowser/.test(userAgent)) {
        browserName = '华为浏览器';
        isCompatible = true; // 华为浏览器在移动端支持PWA
    } else if (/Quark/.test(userAgent)) {
        browserName = '夸克浏览器';
        isCompatible = false; // 夸克浏览器PWA支持有限
    } else if (/UCBrowser/.test(userAgent)) {
        browserName = 'UC浏览器';
        isCompatible = false; // UC浏览器PWA支持有限
    } else if (/MicroMessenger/.test(userAgent)) {
        browserName = '微信浏览器';
        isCompatible = false; // 微信内置浏览器不支持PWA
    } else if (/QQBrowser/.test(userAgent)) {
        browserName = 'QQ浏览器';
        isCompatible = false; // QQ浏览器PWA支持有限
    } else if (/Baidu/.test(userAgent)) {
        browserName = '百度浏览器';
        isCompatible = false; // 百度浏览器PWA支持有限
    } else if (/MiuiBrowser/.test(userAgent)) {
        browserName = '小米浏览器';
        isCompatible = false; // 小米浏览器PWA支持有限
    } else if (/HeyTapBrowser/.test(userAgent)) {
        browserName = 'OPPO浏览器';
        isCompatible = false; // OPPO浏览器PWA支持有限
    } else if (/VivoBrowser/.test(userAgent)) {
        browserName = 'vivo浏览器';
        isCompatible = false; // vivo浏览器PWA支持有限
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
    
    // 更新诊断结果
    pwaDiagnostics.browserInfo = {
        name: browserName,
        version: browserVersion,
        isCompatible: isCompatible,
        isMobile: isMobile,
        isIOS: isIOS,
        supportsPWA: isCompatible && 'serviceWorker' in navigator && 'PushManager' in window
    };
    
    console.log('🔍 浏览器检测结果:', pwaDiagnostics.browserInfo);
    
    // 如果浏览器不兼容，更新失败原因
    if (!isCompatible && !pwaDiagnostics.failureReason) {
        pwaDiagnostics.failureReason = `当前浏览器(${browserName})对PWA支持有限`;  
    }
    
    return pwaDiagnostics.browserInfo;
}

// 运行完整的PWA诊断
function runPWADiagnostics() {
    console.log('🔍 运行PWA安装诊断...');
    
    // 检测浏览器兼容性
    detectBrowser();
    
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

// 检查是否需要显示安装提示
function shouldShowInstallPrompt() {
    // 如果已经以应用模式运行，不需要显示
    if (pwaDiagnostics.isStandalone) {
        return false;
    }
    
    // 如果浏览器兼容且没有其他失败原因，不需要显示
    if (pwaDiagnostics.browserInfo.isCompatible && !pwaDiagnostics.failureReason) {
        return false;
    }
    
    // 如果已经捕获到安装提示事件，说明可以正常安装，不需要显示提示
    if (pwaDiagnostics.installPromptCaptured) {
        return false;
    }
    
    // 其他情况需要显示安装提示
    return true;
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
    
    // 添加浏览器信息部分
    const browserInfoSection = document.createElement('div');
    browserInfoSection.style.marginBottom = '15px';
    browserInfoSection.style.padding = '10px';
    browserInfoSection.style.backgroundColor = '#f5f5f5';
    browserInfoSection.style.borderRadius = '5px';
    
    // 浏览器信息标题
    const browserTitle = document.createElement('h4');
    browserTitle.textContent = '浏览器兼容性';
    browserTitle.style.margin = '0 0 10px 0';
    browserInfoSection.appendChild(browserTitle);
    
    // 浏览器信息内容
    const browserInfo = document.createElement('div');
    const { name, version, isCompatible, isMobile, supportsPWA } = pwaDiagnostics.browserInfo;
    
    // 浏览器名称和版本
    const browserNameElem = document.createElement('p');
    browserNameElem.innerHTML = `<strong>浏览器:</strong> ${name} ${version}`;
    browserNameElem.style.margin = '5px 0';
    browserInfo.appendChild(browserNameElem);
    
    // 设备类型
    const deviceTypeElem = document.createElement('p');
    deviceTypeElem.innerHTML = `<strong>设备类型:</strong> ${isMobile ? '移动设备' : '桌面设备'}`;
    deviceTypeElem.style.margin = '5px 0';
    browserInfo.appendChild(deviceTypeElem);
    
    // PWA兼容性状态
    const compatibilityElem = document.createElement('p');
    compatibilityElem.innerHTML = `<strong>PWA兼容性:</strong> ${isCompatible ? '支持' : '不完全支持'}`;
    compatibilityElem.style.color = isCompatible ? 'green' : 'red';
    compatibilityElem.style.margin = '5px 0';
    browserInfo.appendChild(compatibilityElem);
    
    // 添加兼容性提示
    if (!isCompatible) {
        const compatTip = document.createElement('p');
        compatTip.style.color = 'red';
        compatTip.style.margin = '5px 0';
        compatTip.style.fontSize = '0.9em';
        
        if (isMobile) {
            // 移动端设备推荐
            if (pwaDiagnostics.browserInfo.isIOS) {
                compatTip.innerHTML = '<strong>提示:</strong> 在iOS设备上，请使用Safari浏览器并通过"添加到主屏幕"功能安装PWA应用。';
            } else if (name === '微信浏览器') {
                compatTip.innerHTML = '<strong>提示:</strong> 微信内置浏览器不支持PWA安装，请使用<strong>华为浏览器</strong>或系统浏览器访问。';
            } else if (name === '夸克浏览器' || name === 'UC浏览器' || name === 'QQ浏览器' || name === '百度浏览器' ||
                name === '小米浏览器' || name === 'OPPO浏览器' || name === 'vivo浏览器') {
                compatTip.innerHTML = `<strong>提示:</strong> ${name}对PWA支持有限，建议使用<strong>华为浏览器</strong>或Chrome浏览器安装。`;
            } else {
                compatTip.innerHTML = '<strong>提示:</strong> 在Android设备上，推荐使用<strong>华为浏览器</strong>安装PWA应用以获得最佳体验。';
            }
        } else {
            // PC端设备推荐
            if (name === 'Safari' && version && parseFloat(version) < 13) {
                compatTip.innerHTML = '<strong>提示:</strong> 当前Safari版本不完全支持PWA，请更新至Safari 13或更高版本，或使用<strong>Chrome浏览器</strong>。';
            } else {
                compatTip.innerHTML = '<strong>提示:</strong> 在PC端，推荐使用<strong>Chrome浏览器</strong>安装PWA应用以获得最佳体验。';
            }
        }
        
        browserInfo.appendChild(compatTip);
    }
    
    // 添加iOS/macOS PWA支持信息
    const iosSupportInfo = document.createElement('p');
    iosSupportInfo.style.margin = '5px 0';
    iosSupportInfo.style.fontSize = '0.9em';
    iosSupportInfo.style.backgroundColor = '#f0f8ff';
    iosSupportInfo.style.padding = '5px';
    iosSupportInfo.style.borderRadius = '3px';
    iosSupportInfo.innerHTML = '<strong>苹果设备支持:</strong> PWA应用适用于iOS 13+和macOS的Safari浏览器，安装方法是打开Safari，访问网站后点击分享按钮，然后选择"添加到主屏幕"。';
    browserInfo.appendChild(iosSupportInfo);
    
    browserInfoSection.appendChild(browserInfo);
    content.appendChild(browserInfoSection);
    
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
    
    // 添加解决方案部分
    if (!pwaDiagnostics.browserInfo.isCompatible || pwaDiagnostics.failureReason) {
        const solutionSection = document.createElement('div');
        solutionSection.style.marginTop = '15px';
        solutionSection.style.padding = '10px';
        solutionSection.style.backgroundColor = '#e6f7ff';
        solutionSection.style.borderRadius = '5px';
        solutionSection.style.borderLeft = '4px solid #1890ff';
        
        const solutionTitle = document.createElement('h4');
        solutionTitle.textContent = '解决方案';
        solutionTitle.style.margin = '0 0 10px 0';
        solutionSection.appendChild(solutionTitle);
        
        const solutionList = document.createElement('ul');
        solutionList.style.paddingLeft = '20px';
        solutionList.style.margin = '0';
        
        // 根据不同问题提供解决方案
        if (!pwaDiagnostics.browserInfo.isCompatible) {
            const browserSolution = document.createElement('li');
            
            if (pwaDiagnostics.browserInfo.isMobile) {
                if (pwaDiagnostics.browserInfo.isIOS) {
                    browserSolution.innerHTML = '使用 <strong>Safari</strong> 浏览器访问本站，并通过"添加到主屏幕"功能安装PWA应用。';
                } else {
                    browserSolution.innerHTML = '使用 <strong>华为浏览器</strong> 或 <strong>Chrome</strong> 浏览器访问本站以获得最佳PWA体验。';
                }
            } else {
                browserSolution.innerHTML = '使用 <strong>Chrome</strong> 浏览器访问本站以获得最佳PWA体验。';
            }
            solutionList.appendChild(browserSolution);
        
        if (!pwaDiagnostics.isHttps && window.location.hostname !== 'localhost') {
            const httpsSolution = document.createElement('li');
            httpsSolution.innerHTML = '确保通过 <strong>HTTPS</strong> 访问本站。';
            solutionList.appendChild(httpsSolution);
        }
        
        if (!pwaDiagnostics.hasServiceWorker || !pwaDiagnostics.serviceWorkerActive) {
            const swSolution = document.createElement('li');
            swSolution.innerHTML = '刷新页面，重新注册Service Worker。';
            solutionList.appendChild(swSolution);
            
            // 添加刷新按钮
            const reloadButton = document.createElement('button');
            reloadButton.textContent = '刷新页面';
            reloadButton.style.marginTop = '10px';
            reloadButton.style.padding = '5px 10px';
            reloadButton.style.backgroundColor = '#1890ff';
            reloadButton.style.color = 'white';
            reloadButton.style.border = 'none';
            reloadButton.style.borderRadius = '3px';
            reloadButton.style.cursor = 'pointer';
            reloadButton.onclick = () => window.location.reload();
            solutionSection.appendChild(reloadButton);
        }
        
        solutionSection.appendChild(solutionList);
        content.appendChild(solutionSection);
    }
    
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
        // 只有在需要显示安装提示时才显示诊断面板
        if (shouldShowInstallPrompt()) {
            diagnosticsContainer.style.display = 'block';
        } else {
            diagnosticsContainer.style.display = 'none';
            console.log('✅ 当前浏览器可以正常安装PWA，无需显示安装提示');
        }
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
    setTimeout(() => {
        runPWADiagnostics();
        
        // 根据诊断结果决定是否自动显示诊断面板
        const diagnosticsContainer = document.getElementById('pwa-diagnostics-container');
        if (diagnosticsContainer && shouldShowInstallPrompt()) {
            diagnosticsContainer.style.display = 'block';
            console.log('🔔 检测到浏览器无法正常安装PWA，显示安装提示');
        } else if (diagnosticsContainer) {
            diagnosticsContainer.style.display = 'none';
            console.log('✅ 当前浏览器可以正常安装PWA，无需显示安装提示');
        }
    }, 1000);
});