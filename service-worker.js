// 缓存名称和版本号（更新版本号可以强制更新缓存）
const CACHE_NAME = 'jelisos-image-compressor-v1';

// 需要缓存的资源列表 - 确保路径以 '../' 开头或使用绝对路径
const CACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './share.css',
  './script.js',
  './share.js',
  './notifications.js',
  './pwa-updater.js',
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
  './placeholder-image.svg',
  './loading-image.svg',
  './bgz02.jpg',
  './offline.html'
];

// 修改 fetch 事件处理，在离线时展示离线页面
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
              return caches.match('/offline.html');
            }
            
            // 如果是图片请求，返回默认图片
            if (event.request.destination === 'image') {
              return caches.match('/icons/offline-image.png');
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
            // 如果网络请求失败且是文档类型，返回离线页面
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// 推送通知事件处理
self.addEventListener('push', event => {
  const title = '图片压缩工具';
  const options = {
    body: event.data ? event.data.text() : '有新消息',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 处理通知点击事件
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://jelisos.github.io/image-compression-tool/')
  );
});

// 网络状态监控
function updateOnlineStatus() {
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
  
  if (navigator.onLine) {
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

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// 页面加载时检查
if (!navigator.onLine) {
  updateOnlineStatus();
}

// 处理来自客户端的消息
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});