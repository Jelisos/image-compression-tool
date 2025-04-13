// 缓存名称和版本号（更新版本号可以强制更新缓存）
const CACHE_NAME = 'jelisos-image-compressor-v1';

// 需要缓存的资源列表 - 确保路径以 './' 开头使用相对路径
const CACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './share.css',
  './script.js',
  './share.js',
  './notifications.js',
  './pwa-updater.js',
  './network-status.js',
  './manifest.json',
  './libs/browser-image-compression.min.js',
  './libs/jszip.min.js',
  './libs/FileSaver.min.js',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  './icons/offline-image.png',
  './placeholder-image.svg',
  './loading-image.svg',
  './bgz02.jpg',
  './offline.html'
];

// 注意：Service Worker中的fetch事件处理已移至下方合并

// 安装事件：预缓存所有静态资源
self.addEventListener('install', event => {
  console.log('[Service Worker] 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] 缓存已打开，开始缓存资源');
        return cache.addAll(CACHE_ASSETS).catch(error => {
          console.error('[Service Worker] 缓存资源失败:', error);
          // 即使部分资源缓存失败，也继续安装过程
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('[Service Worker] 安装完成，跳过等待');
        return self.skipWaiting(); // 强制新安装的 Service Worker 立即激活
      })
  );
});

// 添加消息处理功能，处理来自页面的消息
self.addEventListener('message', event => {
  console.log('[Service Worker] 收到消息:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] 跳过等待，立即激活');
    self.skipWaiting();
  }
});

// 激活事件：清理旧缓存
self.addEventListener('activate', event => {
  console.log('[Service Worker] 激活中...');
  
  // 立即接管页面
  event.waitUntil(self.clients.claim());
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: 清理旧缓存 ' + cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // 控制所有打开的标签页
  );
});

// 拦截网络请求：优先使用缓存，无缓存时请求网络
// 注意：这里合并了两个fetch事件处理程序，确保离线功能正常工作
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cacheResponse => {
        // 如果在缓存中找到，返回缓存的响应
        if (cacheResponse) {
          return cacheResponse;
        }
        
        // 否则发起网络请求
        return fetch(event.request)
          .then(response => {
            // 如果响应无效，直接返回
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 为了不阻塞响应，创建一个响应的副本来缓存
            let responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                // 将响应添加到缓存
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // 如果网络请求失败且是导航请求，返回离线页面
            if (event.request.mode === 'navigate') {
              return caches.match('./offline.html');
            }
            
            // 如果是图片请求，返回默认图片
            if (event.request.destination === 'image') {
              return caches.match('./icons/offline-image.png');
            }
            
            // 对于其他资源，返回简单的离线响应
            return new Response('您处于离线状态，无法加载此资源。', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// 推送通知事件处理
self.addEventListener('push', event => {
  const title = '图片压缩工具';
  const options = {
    body: event.data ? event.data.text() : '有新消息',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 处理通知点击事件
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // 尝试查找已打开的窗口
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(clientList => {
      // 检查是否已经有打开的窗口
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // 如果没有打开的窗口，则打开一个新窗口
      // 使用相对路径，而不是硬编码的URL
      return clients.openWindow('./index.html');
    })
  );
});

// 注意：Service Worker 环境中不能使用 window 和 document 对象
// 网络状态变化可以通过 clients API 通知所有受控页面

// 向所有客户端发送网络状态更新的消息
function notifyClientsAboutNetworkStatus(isOnline) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'NETWORK_STATUS',
        isOnline: isOnline
      });
    });
  });
}

// 可以在主页面中监听这些消息并更新 UI
// 这部分代码应该放在主页面的 JavaScript 中，而不是 Service Worker 中

// 注意：上面已经有一个消息处理事件监听器，不需要重复定义