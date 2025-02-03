// 在文件开头添加全局变量来存储当前路径
let currentPath = [];

// 在文件开头添加主题相关变量
let currentTheme = 'light';

document.addEventListener('DOMContentLoaded', async () => {
  const folderTree = document.getElementById('folder-tree');
  const container = document.getElementById('bookmarks-container');
  
  // 获取书签
  const bookmarks = await getBookmarks();
  
  // 渲染文件夹树
  renderFolderTree(bookmarks, folderTree);
  
  // 默认显示第一个文件夹的内容
  if (bookmarks[0] && bookmarks[0].children) {
    showFolderContent(bookmarks[0], container);
  }
  
  // 初始化主题
  initTheme();
  
  // 添加主题切换事件监听
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
});

function detectBrowser() {
  if (typeof chrome !== "undefined") {
    if (navigator.userAgent.indexOf("Edge") > -1) return "edge";
    if (navigator.userAgent.indexOf("Chrome") > -1) return "chrome";
  }
  if (typeof browser !== "undefined") return "firefox";
  if (navigator.userAgent.indexOf("Safari") > -1) return "safari";
  return "unknown";
}

async function getBookmarks() {
  if (typeof chrome !== "undefined" && chrome.bookmarks) {
    return new Promise((resolve) => {
      chrome.bookmarks.getTree(resolve);
    });
  } else if (typeof browser !== "undefined" && browser.bookmarks) {
    return await browser.bookmarks.getTree();
  }
  return [];
}

function renderFolderTree(bookmarkNodes, container, level = 0) {
  for (const node of bookmarkNodes) {
    if (!node.url) { // 只显示文件夹
      const folderContainer = document.createElement('div');
      folderContainer.className = 'folder-container';
      
      const folderHeader = document.createElement('div');
      folderHeader.className = 'folder-header';
      
      const toggleIcon = document.createElement('span');
      toggleIcon.className = 'toggle-icon collapsed';  // 默认使用折叠图标
      
      const folderIcon = document.createElement('span');
      folderIcon.className = 'folder-icon';
      
      const folderTitle = document.createElement('span');
      folderTitle.className = 'bookmark-folder';
      folderTitle.textContent = node.title;
      
      folderHeader.appendChild(toggleIcon);
      folderHeader.appendChild(folderIcon);
      folderHeader.appendChild(folderTitle);
      
      // 添加文件夹ID
      folderHeader.setAttribute('data-folder-id', node.id);
      
      folderContainer.appendChild(folderHeader);
      
      if (node.children) {
        const folderContent = document.createElement('div');
        folderContent.className = 'folder-content collapsed';  // 默认添加折叠类
        renderFolderTree(node.children, folderContent, level + 1);
        folderContainer.appendChild(folderContent);
        
        // 点击事件处理
        folderHeader.addEventListener('click', (e) => {
          // 切换折叠状态
          folderContent.classList.toggle('collapsed');
          toggleIcon.classList.toggle('collapsed');
          toggleIcon.classList.toggle('expanded');
          
          // 显示内容到右侧
          showFolderContent(node, document.getElementById('bookmarks-container'));
          
          // 高亮当前文件夹
          document.querySelectorAll('.folder-header.selected').forEach(el => {
            if (el !== folderHeader) el.classList.remove('selected');
          });
          folderHeader.classList.add('selected');
          
          e.stopPropagation();
        });
      }
      
      container.appendChild(folderContainer);
    }
  }
}

async function showFolderContent(folder, container, updatePath = true) {
  container.innerHTML = '';
  
  // 更新路径
  if (updatePath) {
    await updatePathBar(folder);
  }
  
  // 添加标题
  const header = document.createElement('div');
  header.className = 'content-header';
  header.textContent = folder.title;
  container.appendChild(header);
  
  // 显示书签列表
  const bookmarksList = document.createElement('div');
  bookmarksList.className = 'bookmarks-list';
  
  if (folder.children) {
    folder.children.forEach(node => {
      const item = document.createElement('div');
      item.className = 'bookmark-item';
      
      if (node.url) {
        const link = document.createElement('a');
        link.href = node.url;
        link.className = 'bookmark-title';
        link.textContent = node.title;
        link.target = '_blank';
        
        const favicon = document.createElement('img');
        favicon.className = 'bookmark-favicon';
        // 使用多个备选方案获取图标
        try {
          const url = new URL(node.url);
          // 首选 DuckDuckGo 的图标服务
          favicon.src = `https://icons.duckduckgo.com/ip3/${url.hostname}.ico`;
          favicon.onerror = () => {
            // 如果失败，尝试 Google 的服务
            favicon.src = `https://www.google.com/s2/favicons?domain=${url.hostname}`;
            favicon.onerror = () => {
              // 如果还是失败，使用网站自己的 favicon
              favicon.src = `${url.origin}/favicon.ico`;
              favicon.onerror = () => {
                // 最后使用默认图标
                favicon.src = 'images/icon.png';
              };
            };
          };
        } catch (e) {
          favicon.src = 'images/icon.png';
        }
        
        item.appendChild(favicon);
        item.appendChild(link);
      } else {
        const folderIcon = document.createElement('span');
        folderIcon.className = 'folder-icon';
        
        const folderTitle = document.createElement('span');
        folderTitle.className = 'bookmark-folder';
        folderTitle.textContent = node.title;
        
        item.appendChild(folderIcon);
        item.appendChild(folderTitle);
        
        // 双击进入文件夹
        item.addEventListener('dblclick', () => {
          showFolderContent(node, container);
        });
      }
      
      bookmarksList.appendChild(item);
    });
  }
  
  container.appendChild(bookmarksList);
}

// 修改为异步函数
async function updatePathBar(currentFolder) {
  const pathBar = document.getElementById('path-bar');
  pathBar.innerHTML = '';
  
  // 查找当前文件夹的完整路径
  let newPath = [];
  const rootNode = (await getBookmarks())[0];
  findFolderPath(currentFolder.id, rootNode, newPath);
  currentPath = newPath.reverse();
  
  // 渲染路径
  currentPath.forEach((folder, index) => {
    const pathItem = document.createElement('span');
    pathItem.className = 'path-item';
    pathItem.textContent = folder.title;
    pathItem.addEventListener('click', () => {
      // 点击路径项时导航到对应文件夹
      showFolderContent(folder, document.getElementById('bookmarks-container'));
      // 高亮左侧对应的文件夹
      highlightFolder(folder.id);
    });
    
    pathBar.appendChild(pathItem);
    
    // 添加分隔符
    if (index < currentPath.length - 1) {
      const separator = document.createElement('span');
      separator.className = 'path-separator';
      separator.textContent = ' > ';
      pathBar.appendChild(separator);
    }
  });
}

// 添加查找文件夹路径的函数
function findFolderPath(folderId, node, path) {
  if (node.id === folderId) {
    path.push(node);
    return true;
  }
  
  if (node.children) {
    for (const child of node.children) {
      if (findFolderPath(folderId, child, path)) {
        path.push(node);
        return true;
      }
    }
  }
  
  return false;
}

// 添加高亮左侧文件夹的函数
function highlightFolder(folderId) {
  // 移除所有选中状态
  document.querySelectorAll('.folder-header.selected').forEach(el => {
    el.classList.remove('selected');
  });
  // 查找并高亮目标文件夹
  const folderHeader = document.querySelector(`[data-folder-id="${folderId}"]`);
  if (folderHeader) {
    folderHeader.classList.add('selected');
  }
}

// 添加主题相关函数
function initTheme() {
  // 从存储中获取主题设置
  chrome.storage.local.get(['theme'], (result) => {
    if (result.theme) {
      currentTheme = result.theme;
      applyTheme(currentTheme);
    } else {
      // 如果没有存储的主题，则使用系统主题
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        currentTheme = 'dark';
        applyTheme('dark');
      }
    }
  });
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!chrome.storage.local.get(['theme'])) {
      // 只有在用户没有手动设置主题时才跟随系统
      currentTheme = e.matches ? 'dark' : 'light';
      applyTheme(currentTheme);
    }
  });
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(currentTheme);
  // 保存主题设置
  chrome.storage.local.set({ theme: currentTheme });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeIcon = document.querySelector('.theme-icon');
  themeIcon.textContent = theme === 'light' ? '🌓' : '🌗';
}