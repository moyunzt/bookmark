// 监听安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('书签美化器已安装');
});

// 处理跨浏览器兼容性
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser; 