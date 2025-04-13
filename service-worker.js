// 缓存名称和版本号（更新版本号可以强制更新缓存）
const CACHE_NAME = 'jelisos-image-compressor-v4';

// 定义Service Worker版本，用于调试和版本控制
const SW_VERSION = '1.2.0';

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
  const isHuawei = /HuaweiBrowser/.test(navigator.userAgent);
  const isMiui = /MiuiBrowser/.test(navigator.userAgent);
  const isOppo = /HeyTapBrowser/.test(navigator.userAgent);
  const isVivo = /VivoBrowser/.test(navigator.userAgent);
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
  const isWechat = /MicroMessenger/.test(navigator.userAgent);
  const isQQBrowser = /QQBrowser/.test(navigator.userAgent);
  
  // 检测Android版本
  const androidVersion = (function() {
    const match = navigator.userAgent.match(/Android\s([0-9\.]+)/);
    return match ? parseFloat(match[1]) : 0;
  })();
  
  // 检测iOS版本
  const iOSVersion = (function() {
    const match = navigator.userAgent.match(/OS\s([0-9_]+)\slike\sMac\sOS\sX/);
    return match ? parseFloat(match[1].replace('_', '.')) : 0;
  })();
  
  console.log(`[Service Worker] 浏览器检测: ${JSON.stringify({
    Chrome: isChrome,
    Firefox: isFirefox,
    Safari: isSafari,
    Edge: isEdge,
    Quark: isQuark,
    UC: isUC,
    Huawei: isHuawei,
    MIUI: isMiui,
    OPPO: isOppo,
    Vivo: isVivo,
    Wechat: isWechat,
    QQBrowser: isQQBrowser,
    Mobile: isMobile,
    AndroidVersion: androidVersion,
    iOSVersion: iOSVersion
  })}`);
  
  return { 
    isChrome, isFirefox, isSafari, isEdge, isQuark, isUC, isHuawei, 
    isMiui, isOppo, isVivo, isMobile, isWechat, isQQBrowser,
    androidVersion, iOSVersion 
  };
};

// 在初始化时检测浏览器
const browserInfo = checkBrowserCompatibility();

// 安装事件：预缓存所有静态资源
self.addEventListener('install', event => {
  console.log(`[Service Worker ${SW_VERSION}] 安装中...`);
  
  // 针对不同浏览器的安装策略
  if (browserInfo.isQuark || browserInfo.isUC) {
    console.log('[Service Worker] 检测到夸克/UC浏览器，使用兼容模式安装');
  } else if (browserInfo.isHuawei) {
    console.log('[Service Worker] 检测到华为浏览器，使用优化模式安装');
  } else if (browserInfo.isMiui || browserInfo.isOppo || browserInfo.isVivo) {
    console.log('[Service Worker] 检测到国产手机浏览器，使用兼容模式安装');
  } else if (browserInfo.isWechat || browserInfo.isQQBrowser) {
    console.log('[Service Worker] 检测到微信/QQ浏览器，这些浏览器对PWA支持有限');
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
  } else if (event.data && event.data.type === 'CLEAR_CACHE') {
    // 清除缓存
    console.log('[Service Worker] 收到清除缓存请求');
    caches.delete(CACHE_NAME).then(success => {
      console.log(`[Service Worker] 缓存清除${success ? '成功' : '失败'}`);
      if (event.source && event.source.postMessage) {
        event.source.postMessage({
          type: 'CACHE_CLEARED',
          success: success
        });
      }
    });
  } else if (event.data && event.data.type === 'CHECK_COMPATIBILITY') {
    // 检查兼容性
    if (event.source && event.source.postMessage) {
      event.source.postMessage({
        type: 'COMPATIBILITY_INFO',
        browser: browserInfo,
        isCompatible: browserInfo.isChrome || browserInfo.isHuawei,
        recommendedBrowser: browserInfo.isMobile ? '华为浏览器' : 'Chrome浏览器'
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
  let fetchStrategy;
  
  // 华为浏览器使用特定的缓存策略
  if (browserInfo.isHuawei) {
    // 华为浏览器在移动端表现良好，使用优化的缓存策略
    fetchStrategy = huaweiBrowserStrategy(event);
  } else if (browserInfo.isQuark || browserInfo.isUC || browserInfo.isMiui || browserInfo.isOppo || browserInfo.isVivo) {
    // 国产浏览器使用网络优先策略
    fetchStrategy = networkFirst(event);
  } else if (browserInfo.isWechat || browserInfo.isQQBrowser) {
    // 微信和QQ浏览器使用网络优先策略，但有特殊处理
    fetchStrategy = networkFirstWithFallback(event);
  } else {
    // 其他浏览器（如Chrome、Firefox、Safari、Edge）使用缓存优先策略
    fetchStrategy = cacheFirst(event);
  }
  
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

// 华为浏览器专用策略 - 针对华为浏览器优化
function huaweiBrowserStrategy(event) {
  // 对于核心资源，优先使用缓存
  const isCoreAsset = CACHE_ASSETS.some(asset => 
    event.request.url.endsWith(asset.replace('./', '/')));
  
  if (isCoreAsset) {
    return caches.match(event.request)
      .then(cacheResponse => {
        if (cacheResponse) {
          // 同时在后台更新缓存
          fetch(event.request)
            .then(response => {
              if (response && response.status === 200 && response.type === 'basic') {
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, response.clone()))
                  .catch(error => console.error('[Service Worker] 更新缓存失败:', error));
              }
            })
            .catch(() => console.log('[Service Worker] 后台更新资源失败，继续使用缓存版本'));
          
          return cacheResponse;
        }
        
        // 如果缓存中没有，则从网络获取
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 缓存响应副本
            let responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache))
              .catch(error => console.error('[Service Worker] 缓存响应失败:', error));
            
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] 网络请求失败:', error);
            return handleOfflineResponse(event.request);
          });
      });
  } else {
    // 对于非核心资源，使用网络优先策略
    return networkFirst(event);
  }
}

// 网络优先策略（带特殊回退处理）- 针对微信和QQ浏览器
function networkFirstWithFallback(event) {
  // 添加额外的错误处理和重试逻辑
  return fetch(event.request)
    .then(response => {
      if (response && response.status === 200) {
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
    .catch(error => {
      console.log('[Service Worker] 首次网络请求失败，尝试重试:', error);
      
      // 首次失败后重试一次
      return fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            return response;
          }
          throw new Error('重试请求失败');
        })
        .catch(() => {
          // 重试也失败，尝试从缓存获取
          return caches.match(event.request)
            .then(cacheResponse => {
              if (cacheResponse) {
                return cacheResponse;
              }
              
              // 如果缓存中也没有，返回离线响应
              return handleOfflineResponse(event.request);
            });
        });
    });
}

// 处理离线响应
function handleOfflineResponse(request) {
  // 如果是导航请求，返回离线页面
  if (request.mode === 'navigate') {
    return caches.match('./offline.html')
      .catch(() => {
        // 如果离线页面不在缓存中，返回基本的离线响应
        return new Response(
          '<html><body><h1>您当前处于离线状态</h1><p>请检查网络连接后重试。</p></body></html>', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/html; charset=utf-8'
          })
        });
      });
  }
  
  // 如果是图片请求，返回默认图片
  if (request.destination === 'image') {
    return caches.match('./icons/offline-image.png')
      .catch(() => {
        // 如果默认图片不在缓存中，返回空响应
        return new Response('', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
  }
  
  // 如果是样式表请求，返回基本样式
  if (request.destination === 'style') {
    return new Response('body { font-family: sans-serif; }', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/css'
      })
    });
  }
  
  // 如果是脚本请求，返回空脚本
  if (request.destination === 'script') {
    return new Response('// 离线模式，脚本不可用', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'application/javascript'
      })
    });
  }
  
  // 对于其他资源，返回简单的离线响应
  return new Response('您处于离线状态，无法加载此资源。', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/plain; charset=utf-8'
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
    
    // 如果缓存异常，尝试重新创建
    if (!hasCache) {
      console.log('[Service Worker] 尝试重新创建缓存...');
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('[Service Worker] 缓存已重新创建');
          // 预缓存核心资源
          return Promise.allSettled([
            './index.html',
            './offline.html',
            './styles.css',
            './script.js',
            './icons/offline-image.png'
          ].map(url => {
            return cache.add(url).catch(error => {
              console.error(`[Service Worker] 缓存资源失败: ${url}`, error);
              return Promise.resolve();
            });
          }));
        })
        .then(() => console.log('[Service Worker] 核心资源已重新缓存'));
    }
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
          timestamp: new Date().toISOString(),
          browser: browserInfo
        });
      });
    }
  });
  
  // 检测网络状态变化
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      console.log(`[Service Worker] 网络状态: ${connection.type || '未知'}, 在线: ${navigator.onLine}`);
      
      // 通知客户端网络状态
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'NETWORK_STATUS',
            isOnline: navigator.onLine,
            connectionType: connection.type || '未知'
          });
        });
      });
    }
  }
}, 60000); // 每分钟自检一次