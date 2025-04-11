/**
 * 推送通知处理模块
 * 处理通知权限请求、订阅和管理
 */

// 确保Web Push支持
let isSubscribed = false;
let swRegistration = null;

// VAPID公钥 - 在生产环境中应由服务器提供
// 这是一个示例公钥，您需要生成自己的密钥对
const applicationServerPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

/**
 * 初始化推送通知功能
 */
function initializeNotifications() {
  // 检查Service Worker和Push通知支持
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker和Push通知支持');
    
    navigator.serviceWorker.register('./service-worker.js')
      .then(function(swReg) {
        console.log('Service Worker已注册', swReg);
        swRegistration = swReg;
        
        // 检查用户是否已经订阅
        initializeUI();
      })
      .catch(function(error) {
        console.error('Service Worker注册失败:', error);
      });
  } else {
    console.warn('Push通知不受支持');
    updateNotificationButton('不支持推送通知');
  }
}

/**
 * 初始化通知用户界面
 */
function initializeUI() {
  // 添加通知订阅/取消订阅按钮事件
  const notifyButton = document.getElementById('notify-button');
  
  notifyButton.addEventListener('click', function() {
    if (isSubscribed) {
      unsubscribeFromPushNotifications();
    } else {
      subscribeForPushNotifications();
    }
  });
  
  // 检查当前订阅状态以更新UI
  swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
      isSubscribed = !(subscription === null);
      
      if (isSubscribed) {
        console.log('用户已订阅');
      } else {
        console.log('用户未订阅');
      }
      
      updateNotificationButton();
    });
}

/**
 * 更新通知按钮状态
 */
function updateNotificationButton(message = null) {
  const notifyButton = document.getElementById('notify-button');
  
  if (Notification.permission === 'denied') {
    notifyButton.textContent = '通知已被阻止';
    notifyButton.disabled = true;
    return;
  }
  
  if (message) {
    notifyButton.textContent = message;
    return;
  }
  
  if (isSubscribed) {
    notifyButton.textContent = '取消通知提醒';
  } else {
    notifyButton.textContent = '开启通知提醒';
  }
  
  notifyButton.disabled = false;
}

/**
 * 订阅Push通知
 */
function subscribeForPushNotifications() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('用户已订阅:', subscription);
    isSubscribed = true;
    updateNotificationButton();
    
    // 这里您可以将订阅对象发送到您的服务器
    // sendSubscriptionToBackend(subscription);
  })
  .catch(function(error) {
    console.error('订阅失败:', error);
    updateNotificationButton();
  });
}

/**
 * 取消Push通知订阅
 */
function unsubscribeFromPushNotifications() {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('取消订阅出错:', error);
  })
  .then(function() {
    // 这里您可以通知您的服务器用户已取消订阅
    // removeSubscriptionFromBackend();
    
    console.log('用户已取消订阅');
    isSubscribed = false;
    updateNotificationButton();
  });
}

/**
 * 转换Base64编码的公钥为Uint8Array
 */
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * 模拟发送测试通知
 */
function sendTestNotification() {
  if (swRegistration) {
    const options = {
      body: '这是一条测试通知',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore', 
          title: '了解更多',
          icon: '/icons/checkmark.png'
        },
        {
          action: 'close', 
          title: '关闭',
          icon: '/icons/close.png'
        }
      ]
    };
    
    swRegistration.showNotification('Jelisos 图片压缩工具', options);
  }
}

// 初始化推送通知
window.addEventListener('load', initializeNotifications); 