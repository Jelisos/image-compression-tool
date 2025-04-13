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
  
  // 创建或获取网络状态指示器
  let statusIndicator = document.getElementById('network-status');
  
  if (!statusIndicator) {
    statusIndicator = document.createElement('div');
    statusIndicator.id = 'network-status';
    
    // 固定样式 - 放置在底部版权信息上方
    statusIndicator.style.width = '100%';
    statusIndicator.style.textAlign = 'center';
    statusIndicator.style.padding = '8px 0';
    statusIndicator.style.fontSize = '14px';
    statusIndicator.style.fontWeight = 'bold';
    statusIndicator.style.zIndex = '9998';
    
    // 找到footer元素，将状态指示器插入到footer之前
    const footer = document.querySelector('.footer');
    if (footer) {
      footer.parentNode.insertBefore(statusIndicator, footer);
    } else {
      // 如果找不到footer，则添加到body末尾
      document.body.appendChild(statusIndicator);
    }
  }
  
  // 根据网络状态更新内容和样式
  if (isOnline) {
    statusIndicator.textContent = '已恢复在线状态';
    statusIndicator.style.backgroundColor = '#4CAF50';
    statusIndicator.style.color = 'white';
  } else {
    statusIndicator.textContent = '离线模式 - 部分功能受限';
    statusIndicator.style.backgroundColor = '#FF9800';
    statusIndicator.style.color = 'white';
  }
}

// 页面加载完成后初始化
window.addEventListener('load', initNetworkStatusMonitor);