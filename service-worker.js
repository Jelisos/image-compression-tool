// 缓存名称和版本号（更新版本号可以强制更新缓存）
const CACHE_NAME = 'jelisos-image-compressor-v3';

// 定义Service Worker版本，用于调试和版本控制
const SW_VERSION = '1.1.0';

// 记录Service Worker版本信息，便于调试
console.log(`[Service Worker ${SW_VERSION}] 初始化中...`);

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
  './pwa-buttons.js',
  './pwa-diagnostics.js',
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

// 检测浏览器兼容性
const checkBrowserCompatibility = () => {
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isEdge = /Edg/.test(navigator.userAgent);
  const isQuark = /Quark/.test(navigator.userAgent);
  const isUC = /UCBrowser/.test(navigator.userAgent);
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
  
  console.log(`[Service Worker] 浏览器检测: ${JSON.stringify({
    Chrome: isChrome,
    Firefox: isFirefox,
    Safari: isSafari,
    Edge: isEdge,
    Quark: isQuark,
    UC: isUC,
    Mobile: isMobile
  })}`);
  
  return { isChrome, isFirefox, isSafari, isEdge, isQuark, isUC, isMobile };
};

// 在初始化时检测浏览器
const browserInfo = checkBrowserCompatibility();

// 安装事件：预缓存所有静态资源
self.addEventListener('install', event => {
  console.log(`[Service Worker ${SW_VERSION}] 安装中...`);
  
  // 针对不同浏览器的安装策略
  if (browserInfo.isQuark || browserInfo.isUC) {
    console.log('[Service Worker] 检测到夸克/UC浏览器，使用兼容模式安装');
  }
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] 缓存已打开，开始缓存资源');
        
        // 使用Promise.allSettled代替Promise.all，确保即使部分资源缓存失败，也不会影响整体安装
        return Promise.allSettled(CACHE_ASSETS.map(url => {
          return cache.add(url).catch(error => {
            console.error(`[Service Worker] 缓存资源失败: ${url}`, error);
            return Promise.resolve(); // 继续处理其他资源
          });
        }));
      })
      .then(results => {
        // 统计成功和失败的资源数量
        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        console.log(`[Service Worker] 缓存完成: 成功 ${succeeded}, 失败 ${failed}`);
        
        // 即使部分资源缓存失败，也继续安装过程
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] 安装过程中发生错误:', error);
        // 即使发生错误，也尝试继续安装过程
        return self.skipWaiting();
      })
  );
});

// 添加消息处理功能，处理来自页面的消息
self.addEventListener('message', event => {
  console.log('[Service Worker] 收到消息:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] 跳过等待，立即激活');
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_VERSION') {
    // 响应版本查询
    if (event.source && event.source.postMessage) {
      event.source.postMessage({
        type: 'VERSION_INFO',
        version: SW_VERSION,
        cacheName: CACHE_NAME,
        browser: browserInfo
      });
    }
  }
});

// 激活事件：清理旧缓存
self.addEventListener('activate', event => {
  console.log('[Service Worker] 激活中...');
  
  // 立即接管页面
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== CACHE_NAME) {
              console.log('[Service Worker] 清理旧缓存 ' + cache);
              return caches.delete(cache);
            }
          })
        );
      }),
      // 控制所有打开的标签页
      self.clients.claim().then(() => {
        console.log('[Service Worker] 已接管所有客户端');
        
        // 通知所有客户端Service Worker已激活
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_ACTIVATED',
              version: SW_VERSION
            });
          });
        });
      })
    ])
  );
});

// 拦截网络请求：优先使用缓存，无缓存时请求网络
self.addEventListener('fetch', event => {
  // 忽略非GET请求
  if (event.request.method !== 'GET') {
    return;
  }
  
  // 忽略浏览器扩展请求和非http(s)请求
  const url = new URL(event.request.url);
  if (!/^https?:/.test(event.request.url) || 
      url.origin !== location.origin && url.hostname.indexOf('cdn') === -1) {
    return;
  }
  
  // 针对不同浏览器的fetch策略
  const fetchStrategy = browserInfo.isQuark || browserInfo.isUC ? 
    networkFirst(event) : cacheFirst(event);
  
  event.respondWith(fetchStrategy);
});

// 缓存优先策略
function cacheFirst(event) {
  return caches.match(event.request)
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
            })
            .catch(error => {
              console.error('[Service Worker] 缓存响应失败:', error);
            });
          
          return response;
        })
        .catch(error => {
          console.error('[Service Worker] 网络请求失败:', error);
          return handleOfflineResponse(event.request);
        });
    });
}

// 网络优先策略 - 针对夸克等浏览器
function networkFirst(event) {
  return fetch(event.request)
    .then(response => {
      // 如果响应有效，尝试缓存并返回
      if (response && response.status === 200 && response.type === 'basic') {
        // 为了不阻塞响应，创建一个响应的副本来缓存
        let responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            // 将响应添加到缓存
            cache.put(event.request, responseToCache);
          })
          .catch(error => {
            console.error('[Service Worker] 缓存响应失败:', error);
          });
      }
      
      return response;
    })
    .catch(() => {
      // 网络请求失败时，尝试从缓存获取
      return caches.match(event.request)
        .then(cacheResponse => {
          if (cacheResponse) {
            return cacheResponse;
          }
          
          // 如果缓存中也没有，返回离线响应
          return handleOfflineResponse(event.request);
        });
    });
}

// 处理离线响应
function handleOfflineResponse(request) {
  // 如果是导航请求，返回离线页面
  if (request.mode === 'navigate') {
    return caches.match('./offline.html');
  }
  
  // 如果是图片请求，返回默认图片
  if (request.destination === 'image') {
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
}

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

// 监听同步事件 - 用于后台同步
self.addEventListener('sync', event => {
  console.log('[Service Worker] 收到同步事件:', event.tag);
  
  if (event.tag === 'sync-data') {
    // 这里可以实现后台同步逻辑
    console.log('[Service Worker] 执行后台同步操作');
  }
});

// 定期自检，确保Service Worker正常运行
setInterval(() => {
  console.log(`[Service Worker ${SW_VERSION}] 自检中...`);
  
  // 检查缓存状态
  caches.has(CACHE_NAME).then(hasCache => {
    console.log(`[Service Worker] 缓存状态: ${hasCache ? '正常' : '异常'}`);
  });
  
  // 通知客户端Service Worker状态
  self.clients.matchAll().then(clients => {
    if (clients.length > 0) {
      console.log(`[Service Worker] 当前连接的客户端数: ${clients.length}`);
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_STATUS',
          status: 'active',
          version: SW_VERSION,
          timestamp: new Date().toISOString()
        });
      });
    }
  });
}, 60000); // 每分钟自检一次