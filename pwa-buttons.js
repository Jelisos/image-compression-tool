/**
 * PWA按钮功能增强脚本
 * 处理安装为应用和通知提醒按钮的事件绑定
 */

// 确保DOM完全加载后再执行
document.addEventListener('DOMContentLoaded', initPWAButtons);

// 初始化PWA相关按钮
function initPWAButtons() {
    console.log('初始化PWA按钮功能...');
    setupManualInstallButton();
    setupNotifyButton();
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
    
    // 存储安装提示事件
    let deferredPrompt;
    
    // 监听安装提示事件
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('捕获到beforeinstallprompt事件');
        // 阻止Chrome 67及更早版本自动显示安装提示
        e.preventDefault();
        // 保存事件以便稍后触发
        deferredPrompt = e;
        // 确保按钮可见
        manualInstallButton.style.display = 'flex';
    });
    
    // 添加按钮点击事件
    manualInstallButton.addEventListener('click', (e) => {
        console.log('安装为应用按钮被点击');
        // 如果没有安装提示事件，显示详细的提示信息
        if (!deferredPrompt) {
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
                alert('您的浏览器不支持安装此应用，或者安装条件不满足。请尝试使用Chrome、Edge或Safari最新版本。');
                console.log('安装失败原因: beforeinstallprompt事件未触发');
            }
            return;
        }
        
        // 显示安装提示
        deferredPrompt.prompt();
        
        // 等待用户响应
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('用户接受安装');
                // 隐藏按钮
                manualInstallButton.style.display = 'none';
            } else {
                console.log('用户拒绝安装');
            }
            // 清除提示事件
            deferredPrompt = null;
        });
    });
    
    // 监听应用安装事件
    window.addEventListener('appinstalled', () => {
        console.log('应用已安装');
        // 隐藏按钮
        manualInstallButton.style.display = 'none';
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