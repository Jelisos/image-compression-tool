# Jelisos 图片压缩工具 PWA 部署指南

本文档提供了将 Jelisos 图片压缩工具作为 PWA 应用部署的详细步骤。

## 部署前准备

1. **准备图标文件**
   
   确保 `icons` 目录中包含以下尺寸的应用图标：
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png

   您可以使用在线工具如 [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) 生成这些图标。

2. **检查文件路径**
   
   确保所有资源的路径在部署环境中是正确的。所有路径都应该相对于应用程序的根目录。

## 部署步骤

### GitHub Pages 部署

1. 确保您的 GitHub 仓库中包含所有必要文件
2. 在仓库设置中启用 GitHub Pages
3. 选择部署分支和目录（通常是 main 分支和根目录）
4. 保存设置，等待 GitHub 完成部署
5. 访问生成的 GitHub Pages URL 测试您的 PWA

### 自定义服务器部署

1. 将所有文件上传到您的 Web 服务器
2. 确保服务器配置为提供 `application/manifest+json` MIME 类型
3. 配置 HTTPS（PWA 要求使用安全连接）
4. 设置适当的缓存控制头
5. 访问您的网站 URL 测试 PWA

## 更新流程

当您需要更新 PWA 时，请遵循以下步骤：

1. **更新缓存版本**
   
   在 `service-worker.js` 文件中，更新 `CACHE_NAME` 常量：
   ```js
   const CACHE_NAME = 'jelisos-image-compressor-v2'; // 增加版本号
   ```

2. **更新文件**
   
   修改和更新必要的文件。

3. **部署更新**
   
   将更新后的文件部署到您的服务器或 GitHub Pages。

4. **验证更新**
   
   - 打开应用并确认新的服务工作线程已安装
   - 测试新功能或修复的问题
   - 确认离线功能仍然正常工作

## 性能监控

定期使用以下工具监控您的 PWA 性能：

1. **Lighthouse**
   - 在 Chrome 开发者工具中运行 Lighthouse 审计
   - 重点关注 PWA、性能和可访问性得分

2. **Chrome DevTools**
   - 使用 Application 标签页检查 Service Worker 状态
   - 检查 Manifest 是否正确加载
   - 测试离线功能

## 问题排查

如果您在部署或更新过程中遇到问题，请检查：

1. **控制台错误**
   - 查看浏览器控制台中的任何错误消息

2. **Service Worker 注册**
   - 确保 Service Worker 注册成功
   - 检查 Service Worker 范围是否正确

3. **缓存问题**
   - 尝试清除浏览器缓存
   - 检查 Service Worker 缓存策略

4. **HTTPS 问题**
   - 确保所有资源通过 HTTPS 加载
   - 检查 SSL 证书是否有效

如需进一步帮助，请参考 [PWA 文档](https://web.dev/progressive-web-apps/) 或联系技术支持。 