/**
 * 网络状态监控模块
 * 用于监控网络状态变化并显示提示
 */

// 初始化网络状态监控
function initNetworkStatusMonitor() {
  // 监听网络状态变化
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // 页面加载时检查
  if (!navigator.onLine) {
    updateOnlineStatus();
  }
  
  // 监听来自Service Worker的消息
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'NETWORK_STATUS') {
        // 根据Service Worker发送的网络状态更新UI
        updateOnlineStatus(event.data.isOnline);
      }
    });
  }
}

// 更新网络状态UI
function updateOnlineStatus(isOnlineParam) {
  // 使用参数或当前网络状态
  const isOnline = isOnlineParam !== undefined ? isOnlineParam : navigator.onLine;
  
  const statusIndicator = document.createElement('div');
  statusIndicator.id = 'network-status';
  statusIndicator.style.position = 'fixed';
  statusIndicator.style.bottom = '20px';
  statusIndicator.style.right = '20px';
  statusIndicator.style.padding = '8px 16px';
  statusIndicator.style.borderRadius = '4px';
  statusIndicator.style.fontSize = '14px';
  statusIndicator.style.fontWeight = 'bold';
  statusIndicator.style.zIndex = '9999';
  statusIndicator.style.transition = 'opacity 0.5s';
  
  if (isOnline) {
    statusIndicator.textContent = '已恢复在线状态';
    statusIndicator.style.backgroundColor = '#4CAF50';
    statusIndicator.style.color = 'white';
    
    // 三秒后自动隐藏
    setTimeout(() => {
      statusIndicator.style.opacity = '0';
      setTimeout(() => {
        if (statusIndicator.parentNode) {
          statusIndicator.parentNode.removeChild(statusIndicator);
        }
      }, 500);
    }, 3000);
  } else {
    statusIndicator.textContent = '离线模式 - 部分功能受限';
    statusIndicator.style.backgroundColor = '#FF9800';
    statusIndicator.style.color = 'white';
  }
  
  // 移除旧的状态指示器
  const oldIndicator = document.getElementById('network-status');
  if (oldIndicator) {
    oldIndicator.parentNode.removeChild(oldIndicator);
  }
  
  document.body.appendChild(statusIndicator);
}

// 页面加载完成后初始化
window.addEventListener('load', initNetworkStatusMonitor);