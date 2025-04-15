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
        console.log('收到Service Worker网络状态消息:', event.data.isOnline);
        // 在移动设备上，收到Service Worker消息后进行额外验证
        if (/Mobile|Android|iPhone|iPad|iPod/.test(navigator.userAgent)) {
          // 不立即接受Service Worker的状态，而是触发一次网络检测
          performNetworkCheck();
        } else {
          // 非移动设备直接使用Service Worker提供的状态
          updateOnlineStatus(event.data.isOnline);
        }
      }
    });
    
    // 向Service Worker请求当前网络状态
    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'GET_NETWORK_STATUS'
      });
      console.log('已向Service Worker请求网络状态');
    } catch (e) {
      console.error('向Service Worker请求网络状态失败:', e);
    }
  }
  
  // 页面加载完成后立即进行一次网络状态检测
  window.addEventListener('load', function() {
    console.log('页面加载完成，进行网络状态检测');
    performNetworkCheck();
  });
  
  // 定期检查网络状态（特别针对移动设备）
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
  
  // 移动设备立即进行一次网络状态检测
  if (isMobile) {
    console.log('移动设备检测：立即进行网络状态验证');
    // 立即执行一次网络检测
    performNetworkCheck();
    
    // 然后设置定期检查
    setInterval(performNetworkCheck, 30000); // 30秒检查一次
  }
}

// 执行网络检测
function performNetworkCheck() {
  // 使用fetch进行网络连接测试，添加时间戳防止缓存
  const testUrl = './manifest.json?_=' + new Date().getTime();
  fetch(testUrl, { 
    method: 'HEAD',
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    mode: 'no-cors' // 添加no-cors模式增强兼容性
  })
  .then(() => {
    // 如果fetch成功，确认在线状态
    console.log('网络测试成功：确认在线状态');
    if (!navigator.onLine) {
      console.log('网络检测：实际在线但navigator.onLine报告离线，更正状态');
      updateOnlineStatus(true);
    }
  })
  .catch((error) => {
    // 如果fetch失败，确认离线状态
    console.log('网络测试失败：', error);
    if (navigator.onLine) {
      console.log('网络检测：实际离线但navigator.onLine报告在线，更正状态');
      updateOnlineStatus(false);
    }
  });
}

// 更新网络状态UI
function updateOnlineStatus(isOnlineParam) {
  // 使用参数或当前网络状态，增强移动端检测准确性
  let isOnline = isOnlineParam !== undefined ? isOnlineParam : navigator.onLine;
  
  // 增强型网络状态检测，特别针对移动设备
  if (isOnlineParam === undefined) {
    // 只有当没有明确传入状态参数时才进行额外检测
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('移动设备网络检测开始，当前navigator.onLine状态:', isOnline);
      // 移动设备上进行额外的网络状态验证
      try {
        // 使用fetch进行网络连接测试，添加时间戳防止缓存
        const testUrl = './manifest.json?_=' + new Date().getTime();
        fetch(testUrl, { 
          method: 'HEAD',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
          mode: 'no-cors' // 添加no-cors模式增强兼容性
        })
        .then(() => {
          // 如果fetch成功，确认在线状态
          console.log('移动设备网络测试成功：确认在线状态');
          if (!isOnline) {
            console.log('移动设备网络检测：实际在线但navigator.onLine报告离线，更正状态');
            // 使用setTimeout避免可能的递归调用问题
            setTimeout(() => updateOnlineStatus(true), 0);
            return; // 提前返回，避免继续执行
          }
        })
        .catch((error) => {
          // 如果fetch失败，确认离线状态
          console.log('移动设备网络测试失败：', error);
          if (isOnline) {
            console.log('移动设备网络检测：实际离线但navigator.onLine报告在线，更正状态');
            // 使用setTimeout避免可能的递归调用问题
            setTimeout(() => updateOnlineStatus(false), 0);
            return; // 提前返回，避免继续执行
          }
        });
      } catch (e) {
        console.error('网络状态检测出错:', e);
      }
    }
  } else {
    console.log('使用传入的网络状态参数:', isOnline);
  }
  
  // 创建或获取网络状态指示器
  let statusIndicator = document.getElementById('network-status');
  
  if (!statusIndicator) {
    statusIndicator = document.createElement('div');
    statusIndicator.id = 'network-status';
    
    // 固定样式 - 放置在底部版权信息上方
    statusIndicator.style.width = '100%';
    statusIndicator.style.textAlign = 'center';
    statusIndicator.style.padding = '6px 0';
    statusIndicator.style.fontSize = '12px';
    statusIndicator.style.fontWeight = 'bold';
    statusIndicator.style.zIndex = '9998';
    statusIndicator.style.marginBottom = '0px';
    statusIndicator.style.position = 'static'; // 确保不是固定定位
    
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
  const toasts = document.querySelectorAll('.network-toast, .toast-container, .network-status-toast');
  toasts.forEach(toast => toast.remove());
  
  // 清空当前内容
  statusIndicator.innerHTML = '';
  
  // 根据网络状态更新内容和样式
  if (isOnline) {
    // 在线状态使用绿色对勾图标
    const icon = document.createElement('span');
    icon.innerHTML = '✅';
    icon.style.marginRight = '5px';
    statusIndicator.appendChild(icon);
    
    const text = document.createTextNode('在线模式，网络连接正常');
    statusIndicator.appendChild(text);
    
    statusIndicator.style.backgroundColor = 'transparent';
    statusIndicator.style.color = '#4CAF50'; // 舒适的绿色
  } else {
    // 离线状态使用信息图标
    const icon = document.createElement('span');
    icon.innerHTML = 'ℹ️';
    icon.style.marginRight = '5px';
    statusIndicator.appendChild(icon);
    
    const text = document.createTextNode('离线模式已启用，可以无网络使用所有功能');
    statusIndicator.appendChild(text);
    
    statusIndicator.style.backgroundColor = 'transparent';
    statusIndicator.style.color = '#2196F3'; // 蓝色，表示信息
  }
  
  // 不创建右下角弹窗
}

// 页面加载完成后初始化
window.addEventListener('load', initNetworkStatusMonitor);