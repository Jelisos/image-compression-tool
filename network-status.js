/**
 * 网络状态监控模块
 * 用于监控网络状态变化并显示提示
 * 支持离线模式，在底部版权信息上方显示当前网络状态
 */

// 初始化网络状态监控
function initNetworkStatusMonitor() {
  // 监听网络状态变化
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // 页面加载时检查
  if (!navigator.onLine) {
    updateOnlineStatus();
  } else {
    // 确保在线状态也显示
    updateOnlineStatus(true);
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
    statusIndicator.style.marginBottom = '20px';
    
    // 找到footer元素，将状态指示器插入到footer的第一个子元素之前
    const footer = document.querySelector('.footer');
    if (footer) {
      footer.insertBefore(statusIndicator, footer.firstChild);
    } else {
      // 如果找不到footer，则添加到body末尾
      document.body.appendChild(statusIndicator);
    }
  }
  
  // 移除所有可能存在的网络状态弹窗
  const toasts = document.querySelectorAll('.network-toast, .toast-container');
  toasts.forEach(toast => toast.remove());
  
  // 创建状态图标
  const createStatusIcon = () => {
    const icon = document.createElement('span');
    icon.innerHTML = '✅';
    icon.style.marginRight = '5px';
    return icon;
  };
  
  // 清空当前内容
  statusIndicator.innerHTML = '';
  
  // 根据网络状态更新内容和样式
  if (isOnline) {
    const icon = createStatusIcon();
    statusIndicator.appendChild(icon);
    
    const text = document.createTextNode('已恢复在线状态');
    statusIndicator.appendChild(text);
    
    statusIndicator.style.backgroundColor = 'transparent';
    statusIndicator.style.color = '#4CAF50'; // 舒适的绿色
  } else {
    const icon = createStatusIcon();
    statusIndicator.appendChild(icon);
    
    const text = document.createTextNode('离线模式已启用，可以无网络使用所有功能');
    statusIndicator.appendChild(text);
    
    statusIndicator.style.backgroundColor = 'transparent';
    statusIndicator.style.color = '#4CAF50'; // 舒适的绿色
  }
}

// 页面加载完成后初始化
window.addEventListener('load', initNetworkStatusMonitor);