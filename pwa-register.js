/*
 * studytool 共用 PWA 注册脚本
 * 用法：在每个需要离线使用的 html 页面 </body> 前加一行：
 *   <script src="pwa-register.js"></script>
 *
 * 说明：
 * - Service Worker 只能在 http(s) 下工作（file:// 直接双击打开时自动跳过，不影响其他功能）
 * - 录音/图片等用户数据本来就存在浏览器 IndexedDB 中，离线天然可用；
 *   本脚本负责缓存 html/js 程序本身，断网后仍能打开页面。
 */
(function () {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('sw.js')
      .catch(function () { /* 注册失败静默处理（如 http 非 localhost 环境） */ });
  });
})();
