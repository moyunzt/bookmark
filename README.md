# 书签美化器 (PrismMark)

![效果预览](/images/jianjie.png "PrismMark")

一个美化浏览器书签的扩展程序，提供类似 Windows 资源管理器的界面和体验。

## 功能特点

- 📁 Windows 风格的文件夹树形结构
- 🔍 清晰的书签层级显示
- 📍 面包屑导航路径
- 🎯 双击文件夹快速导航
- 💫 平滑的动画效果
- 📱 响应式布局设计

## 安装方法

### Chrome / Edge

1. 下载并解压此扩展程序
2. 打开浏览器，进入扩展程序页面
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择解压后的文件夹

### Firefox

1. 下载并解压此扩展程序
2. 在 Firefox 地址栏输入 `about:debugging`
3. 点击"此 Firefox"
4. 点击"临时载入附加组件"
5. 选择扩展程序目录中的 `manifest.json` 文件

## 使用说明

- 左侧面板显示书签文件夹树形结构
- 右侧面板显示当前文件夹内容
- 点击文件夹可以展开/折叠
- 双击右侧的文件夹可以进入该文件夹
- 点击顶部导航路径可以快速跳转

## 文件结构 
├── manifest.json // 扩展程序配置文件
├── popup.html // 主界面 HTML
├── popup.js // 主要功能逻辑
├── background.js // 后台脚本
├── styles/
│ └── bookmarks.css // 样式文件
└── images/
└── icon.png // 扩展图标


## 技术栈

- HTML5
- CSS3
- JavaScript

## 浏览器兼容性

- Chrome 88+
- Edge 88+
- Firefox 78+
- Opera 74+

## 许可证

MIT License

## 作者

#moyunzt

## 贡献
moyunzt
