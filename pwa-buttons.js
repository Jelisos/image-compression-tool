/**
 * PWA按钮功能增强脚本
 * 处理安装为应用和通知提醒按钮的事件绑定
 */

// 确保DOM完全加载后再执行
document.addEventListener('DOMContentLoaded', initPWAButtons);

// 初始化PWA相关按钮
function initPWAButtons() {
    console.log('初始化PWA按钮功能...');
    // 全局变量，用于存储安装提示事件
    window.deferredPrompt = null;
    // 检查PWA安装条件
    checkPWAInstallConditions();
    setupManualInstallButton();
    setupPopupInstallPrompt();
    setupNotifyButton();
}

// 检查PWA安装条件
function checkPWAInstallConditions() {
    console.log('检查PWA安装条件...');
    
    // 检查Service Worker支持
    if (!('serviceWorker' in navigator)) {
        console.error('浏览器不支持Service Worker');
        return false;
    }
    
    // 检查HTTPS或localhost
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.error('PWA安装需要HTTPS连接');
        return false;
    }
    
    // 检查manifest.json
    fetch('./manifest.json')
        .then(response => {
            if (!response.ok) {
                console.error('manifest.json加载失败');
                return false;
            }
            console.log('manifest.json加载成功');
            return true;
        })
        .catch(error => {
            console.error('manifest.json加载错误:', error);
            return false;
        });
    
    // 检查Service Worker注册
    navigator.serviceWorker.getRegistration()
        .then(registration => {
            if (!registration) {
                console.error('Service Worker未注册');
                // 尝试注册Service Worker
                registerServiceWorker();
                return false;
            }
            console.log('Service Worker已注册，scope是:', registration.scope);
            return true;
        })
        .catch(error => {
            console.error('检查Service Worker注册状态失败:', error);
            return false;
        });
    
    return true;
}

// 注册Service Worker
function registerServiceWorker() {
    navigator.serviceWorker.register('./service-worker.js', {scope: './'})
        .then(registration => {
            console.log('Service Worker注册成功，scope是:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker注册失败:', error);
            // 尝试使用不同的scope
            navigator.serviceWorker.register('./service-worker.js')
                .then(reg => console.log('Service Worker使用默认scope注册成功:', reg.scope))
                .catch(err => console.error('Service Worker注册仍然失败:', err));
        });
}

// 设置手动安装按钮
function setupManualInstallButton() {
    const manualInstallButton = document.getElementById('manual-install-button');
    if (!manualInstallButton) {
        console.error('未找到安装为应用按钮');
        return;
    }

    console.log('找到安装为应用按钮，设置事件监听器...');
    
    // 确保按钮可见
    manualInstallButton.style.display = 'flex';
    
    // 添加诊断按钮
    const diagButton = document.createElement('button');
    diagButton.id = 'pwa-diag-button';
    diagButton.textContent = 'PWA诊断';
    diagButton.className = 'secondary-button';
    diagButton.style.marginLeft = '10px';
    diagButton.style.display = 'none'; // 默认隐藏，只在安装失败时显示
    diagButton.addEventListener('click', () => {
        if (typeof window.showPWADiagnostics === 'function') {
            window.showPWADiagnostics();
        } else {
            alert('PWA诊断工具未加载，请刷新页面后重试');
        }
    });
    manualInstallButton.parentNode.appendChild(diagButton);
    
    // 监听安装提示事件 - 使用全局变量存储事件
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('捕获到beforeinstallprompt事件');
        // 阻止Chrome 67及更早版本自动显示安装提示
        e.preventDefault();
        // 保存事件以便稍后触发（全局变量）
        window.deferredPrompt = e;
        // 确保按钮可见
        manualInstallButton.style.display = 'flex';
        // 隐藏诊断按钮，因为安装条件已满足
        if (diagButton) diagButton.style.display = 'none';
        
        // 显示弹窗式安装提示
        const pwaInstallContainer = document.getElementById('pwa-install-container');
        if (pwaInstallContainer) {
            pwaInstallContainer.hidden = false;
        }
    });
    
    // 添加按钮点击事件
    manualInstallButton.addEventListener('click', (e) => {
        console.log('安装为应用按钮被点击');
        // 如果没有安装提示事件，显示详细的提示信息
        if (!window.deferredPrompt) {
            // 检查是否已安装
            if (window.matchMedia('(display-mode: standalone)').matches || 
                window.matchMedia('(display-mode: fullscreen)').matches || 
                window.navigator.standalone === true) {
                alert('此应用已经安装在您的设备上。');
            } else if (!('serviceWorker' in navigator)) {
                alert('您的浏览器不支持Service Worker，无法安装此应用。');
            } else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                alert('PWA安装需要HTTPS连接，请使用HTTPS访问本站。');
            } else {
                // 检查Service Worker注册状态
                navigator.serviceWorker.getRegistration('./service-worker.js')
                    .then(registration => {
                        if (!registration) {
                            alert('Service Worker未正确注册，请刷新页面后重试。');
                            console.error('安装失败原因: Service Worker未注册');
                        } else {
                            alert('您的浏览器不支持安装此应用，或者安装条件不满足。请点击"PWA诊断"按钮查看详细信息。');
                            console.log('安装失败原因: beforeinstallprompt事件未触发，但Service Worker已注册');
                            // 显示诊断按钮
                            const diagButton = document.getElementById('pwa-diag-button');
                            if (diagButton) diagButton.style.display = 'inline-block';
                            // 尝试重新注册Service Worker
                            navigator.serviceWorker.register('./service-worker.js', {scope: './'})
                                .then(reg => console.log('Service Worker重新注册成功:', reg.scope))
                                .catch(err => console.error('Service Worker重新注册失败:', err));
                        }
                    })
                    .catch(error => {
                        console.error('检查Service Worker注册状态失败:', error);
                        alert('检查PWA安装条件时出错，请刷新页面后重试。');
                    });
            }
            return;
        }
        
        // 显示安装提示
        window.deferredPrompt.prompt();
        
        // 等待用户响应
        window.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('用户接受安装');
                // 隐藏按钮
                manualInstallButton.style.display = 'none';
                // 隐藏弹窗式安装提示
                const pwaInstallContainer = document.getElementById('pwa-install-container');
                if (pwaInstallContainer) {
                    pwaInstallContainer.hidden = true;
                }
            } else {
                console.log('用户拒绝安装');
            }
            // 清除提示事件
            window.deferredPrompt = null;
        });
    });
    
    // 监听应用安装事件
    window.addEventListener('appinstalled', () => {
        console.log('应用已安装');
        // 隐藏按钮
        manualInstallButton.style.display = 'none';
        // 隐藏弹窗式安装提示
        const pwaInstallContainer = document.getElementById('pwa-install-container');
        if (pwaInstallContainer) {
            pwaInstallContainer.hidden = true;
        }
    });
}

// 设置弹窗式安装提示
function setupPopupInstallPrompt() {
    const pwaInstallContainer = document.getElementById('pwa-install-container');
    const pwaInstallButton = document.getElementById('pwa-install-button');
    
    if (!pwaInstallContainer || !pwaInstallButton) {
        console.log('未找到弹窗式安装提示元素');
        return;
    }
    
    console.log('找到弹窗式安装提示，设置事件监听器...');
    
    // 添加安装按钮点击事件
    pwaInstallButton.addEventListener('click', () => {
        console.log('弹窗安装按钮被点击');
        // 隐藏安装提示
        pwaInstallContainer.hidden = true;
        
        // 如果没有安装提示事件，显示提示信息
        if (!window.deferredPrompt) {
            console.error('安装提示事件不存在');
            return;
        }
        
        // 显示安装提示
        window.deferredPrompt.prompt();
        
        // 等待用户响应
        window.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('用户接受安装');
                // 隐藏手动安装按钮
                const manualInstallButton = document.getElementById('manual-install-button');
                if (manualInstallButton) {
                    manualInstallButton.style.display = 'none';
                }
            } else {
                console.log('用户拒绝安装');
            }
            // 清除提示事件
            window.deferredPrompt = null;
        });
    });
}

// 设置通知提醒按钮
function setupNotifyButton() {
    const notifyButton = document.getElementById('notify-button');
    if (!notifyButton) {
        console.error('未找到通知提醒按钮');
        return;
    }

    console.log('找到通知提醒按钮，设置事件监听器...');
    
    // 检查通知API是否可用
    if (!('Notification' in window)) {
        console.log('此浏览器不支持通知API');
        notifyButton.textContent = '不支持通知';
        notifyButton.disabled = true;
        return;
    }
    
    // 根据当前通知权限更新按钮状态
    updateNotifyButtonState();
    
    // 添加按钮点击事件
    notifyButton.addEventListener('click', () => {
        console.log('通知提醒按钮被点击');
        
        // 如果已经有权限，显示测试通知
        if (Notification.permission === 'granted') {
            showTestNotification();
            return;
        }
        
        // 请求通知权限
        Notification.requestPermission().then(permission => {
            console.log('通知权限:', permission);
            // 更新按钮状态
            updateNotifyButtonState();
            
            // 如果授予权限，显示测试通知
            if (permission === 'granted') {
                showTestNotification();
            }
        }).catch(error => {
            console.error('请求通知权限出错:', error);
            alert('请求通知权限时出错，请稍后再试。');
        });
    });
}

// 更新通知按钮状态
function updateNotifyButtonState() {
    const notifyButton = document.getElementById('notify-button');
    if (!notifyButton) return;
    
    switch (Notification.permission) {
        case 'granted':
            notifyButton.textContent = '发送测试通知';
            notifyButton.disabled = false;
            break;
        case 'denied':
            notifyButton.textContent = '通知已被阻止';
            notifyButton.disabled = true;
            break;
        default: // 'default' 状态，用户尚未做出选择
            notifyButton.textContent = '开启通知提醒';
            notifyButton.disabled = false;
    }
}

// 显示测试通知
function showTestNotification() {
    const notification = new Notification('Jelisos 图片压缩工具', {
        body: '通知功能已成功开启！',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-72x72.png',
        vibrate: [100, 50, 100]
    });
    
    notification.onclick = () => {
        console.log('通知被点击');
        window.focus();
        notification.close();
    };
}