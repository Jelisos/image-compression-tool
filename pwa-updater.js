/**
 * PWA 更新检测和通知
 * 用于检测应用是否有更新并提示用户刷新
 */

// 当前版本号（每次更新时手动修改）
const APP_VERSION = '1.0.0';

let newWorker;
let refreshing = false;

// 检测服务工作线程更新
function checkForUpdates() {
  // 监听控制状态变化，避免刷新循环
  navigator.serviceWorker.addEventListener('controllerchange', function() {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  // 如果服务工作线程已注册，检查更新
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('message', function(event) {
      if (event.data.type === 'UPDATE_AVAILABLE') {
        showUpdateToast();
      }
    });

    // 检查服务工作线程中是否有更新
    navigator.serviceWorker.ready.then(registration => {
      registration.addEventListener('updatefound', function() {
        newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', function() {
          // 当服务工作线程安装完成并等待激活
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateToast();
          }
        });
      });
      
      // 尝试更新服务工作线程
      registration.update();
    });
  }
}

// 显示更新提示
function showUpdateToast() {
  // 如果已经显示了提示，则不再显示
  if (document.getElementById('update-toast')) return;
  
  const toast = document.createElement('div');
  toast.id = 'update-toast';
  toast.className = 'update-toast';
  toast.innerHTML = `
    <span>发现新版本！</span>
    <button id="update-button">立即更新</button>
  `;
  
  document.body.appendChild(toast);
  
  // 添加更新按钮事件
  document.getElementById('update-button').addEventListener('click', function() {
    if (newWorker) {
      // 向服务工作线程发送消息，激活新版本
      newWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
    
    // 移除提示
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  });
  
  // 5秒后自动隐藏提示
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }, 5000);
}

// 初始化
if ('serviceWorker' in navigator) {
  window.addEventListener('load', checkForUpdates);
} 