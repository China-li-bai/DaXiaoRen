# Meta 标签优化说明

## ✅ 已完成的优化

### 1. 基础 Meta 标签 ✅
```html
<title>打小人 - 在线打小人游戏 | 释放压力，驱除小人</title>
<meta name="description" content="在线打小人游戏，释放压力，驱除小人！输入你想打的人，AI 生成专属口诀，多人协作一起打，实时排行榜看谁打得多。免费在线游戏，无需下载。" />
<meta name="keywords" content="打小人,在线游戏,释放压力,多人游戏,排行榜,AI生成" />
<meta name="author" content="DaXiaoRen" />
<meta name="theme-color" content="#0f172a" />
```

### 2. Open Graph 标签（Facebook、LinkedIn 等）✅
```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://dadaxiaoren.com/" />
<meta property="og:title" content="打小人 - 在线打小人游戏 | 释放压力，驱除小人" />
<meta property="og:description" content="在线打小人游戏，释放压力，驱除小人！输入你想打的人，AI 生成专属口诀，多人协作一起打，实时排行榜看谁打得多。" />
<meta property="og:image" content="https://dadaxiaoren.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="打小人" />
```

### 3. Twitter Card 标签 ✅
```html
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="https://dadaxiaoren.com/" />
<meta property="twitter:title" content="打小人 - 在线打小人游戏 | 释放压力，驱除小人" />
<meta property="twitter:description" content="在线打小人游戏，释放压力，驱除小人！输入你想打的人，AI 生成专属口诀，多人协作一起打。" />
<meta property="twitter:image" content="https://dadaxiaoren.com/og-image.png" />
```

### 4. 其他优化 ✅
```html
<!-- Canonical URL -->
<link rel="canonical" href="https://dadaxiaoren.com/" />

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

## 📸 分享图片

### 已创建的文件

#### 1. Open Graph 图片（SVG 格式）
**文件**：`public/og-image.svg`
- 尺寸：1200 x 630（推荐尺寸）
- 格式：SVG
- 内容：
  - 渐变背景（深蓝色）
  - 拖鞋图标（带发光效果）
  - 标题："打小人"
  - 副标题："在线打小人游戏"
  - 功能特点：AI 生成口诀、多人协作、实时排行榜
  - CTA："释放压力 · 驱除小人"
  - URL：dadaxiaoren.com

#### 2. Favicon（SVG 格式）
**文件**：`public/favicon.svg`
- 尺寸：32 x 32
- 格式：SVG
- 内容：拖鞋图标

### 需要生成的 PNG 图片

某些平台（如 Facebook、LinkedIn）对 SVG 支持不好，需要 PNG 格式的图片。

#### 方法 1：使用在线工具（推荐）
1. 访问 [CloudConvert](https://cloudconvert.com/svg-to-png)
2. 上传 `public/og-image.svg`
3. 设置输出尺寸：1200 x 630
4. 转换为 PNG
5. 下载并保存为 `public/og-image.png`

#### 方法 2：使用命令行工具
如果你安装了 ImageMagick：

```bash
# 安装 ImageMagick
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick
# Windows: 下载安装包 https://imagemagick.org/script/download.php

# 转换 SVG 为 PNG
convert public/og-image.svg -resize 1200x630 public/og-image.png

# 生成 Apple Touch Icon
convert public/favicon.svg -resize 180x180 public/apple-touch-icon.png
```

#### 方法 3：使用 Node.js 脚本
创建 `scripts/generate-images.js`：

```javascript
const sharp = require('sharp');
const fs = require('fs');

// 读取 SVG
const svgBuffer = fs.readFileSync('public/og-image.svg');

// 转换为 PNG
sharp(svgBuffer)
  .resize(1200, 630)
  .png()
  .toFile('public/og-image.png')
  .then(() => console.log('✅ og-image.png generated'))
  .catch(err => console.error('❌ Error:', err));

// 生成 Favicon PNG
const faviconBuffer = fs.readFileSync('public/favicon.svg');

sharp(faviconBuffer)
  .resize(180, 180)
  .png()
  .toFile('public/apple-touch-icon.png')
  .then(() => console.log('✅ apple-touch-icon.png generated'))
  .catch(err => console.error('❌ Error:', err));
```

安装依赖并运行：

```bash
npm install sharp
node scripts/generate-images.js
```

## 📊 Meta 标签说明

### 基础 Meta 标签
| 标签 | 说明 | 示例 |
|------|------|------|
| `title` | 网页标题 | "打小人 - 在线打小人游戏" |
| `description` | 网页描述 | "在线打小人游戏，释放压力..." |
| `keywords` | 关键词 | "打小人,在线游戏,释放压力" |
| `author` | 作者 | "DaXiaoRen" |
| `theme-color` | 主题颜色 | "#0f172a" |

### Open Graph 标签
| 标签 | 说明 | 示例 |
|------|------|------|
| `og:type` | 内容类型 | "website" |
| `og:url` | 网页 URL | "https://dadaxiaoren.com/" |
| `og:title` | 分享标题 | "打小人 - 在线打小人游戏" |
| `og:description` | 分享描述 | "在线打小人游戏，释放压力..." |
| `og:image` | 分享图片 | "https://dadaxiaoren.com/og-image.png" |
| `og:image:width` | 图片宽度 | "1200" |
| `og:image:height` | 图片高度 | "630" |
| `og:site_name` | 网站名称 | "打小人" |

### Twitter Card 标签
| 标签 | 说明 | 示例 |
|------|------|------|
| `twitter:card` | 卡片类型 | "summary_large_image" |
| `twitter:url` | 网页 URL | "https://dadaxiaoren.com/" |
| `twitter:title` | 分享标题 | "打小人 - 在线打小人游戏" |
| `twitter:description` | 分享描述 | "在线打小人游戏，释放压力..." |
| `twitter:image` | 分享图片 | "https://dadaxiaoren.com/og-image.png" |

## 🧪 测试分享效果

### 1. Facebook 分享调试工具
访问：https://developers.facebook.com/tools/debug/
输入你的网站 URL，查看预览效果。

### 2. Twitter Card 验证工具
访问：https://cards-dev.twitter.com/validator
输入你的网站 URL，查看预览效果。

### 3. LinkedIn Post Inspector
访问：https://www.linkedin.com/post-inspector/
输入你的网站 URL，查看预览效果。

## 📝 注意事项

### 图片要求
- **尺寸**：1200 x 630（推荐）
- **格式**：PNG 或 JPG（推荐 PNG）
- **大小**：小于 8MB
- **内容**：清晰、有吸引力、包含品牌元素

### 文字要求
- **标题**：60-90 个字符
- **描述**：150-200 个字符
- **关键词**：相关、准确、不堆砌

### URL 要求
- **Canonical URL**：指向首选 URL
- **HTTPS**：使用 HTTPS 协议
- **无参数**：避免不必要的查询参数

## ✅ 完成检查清单

- [x] 更新基础 Meta 标签
- [x] 添加 Open Graph 标签
- [x] 添加 Twitter Card 标签
- [x] 添加 Canonical URL
- [x] 添加 Favicon
- [x] 创建 Open Graph 图片（SVG）
- [x] 创建 Favicon（SVG）
- [ ] 生成 PNG 格式的 Open Graph 图片
- [ ] 生成 Apple Touch Icon
- [ ] 测试分享效果（Facebook、Twitter、LinkedIn）

## 🎉 总结

本次优化完成了以下内容：
1. ✅ 完整的 Meta 标签配置
2. ✅ Open Graph 标签（Facebook、LinkedIn）
3. ✅ Twitter Card 标签
4. ✅ SEO 优化（关键词、描述）
5. ✅ 创建了 SVG 格式的分享图片
6. ✅ 创建了 Favicon

**下一步**：生成 PNG 格式的分享图片，然后测试分享效果。
