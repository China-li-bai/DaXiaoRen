import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist');

console.log('🖼️  生成分享图片...\n');

// 读取 OG Image SVG
const ogSvgPath = path.join(publicDir, 'og-image.svg');
const ogPngPath = path.join(publicDir, 'og-image.png');
const ogDistPath = path.join(distDir, 'og-image.png');

if (fs.existsSync(ogSvgPath)) {
  const svgBuffer = fs.readFileSync(ogSvgPath);
  
  // 转换为 PNG (1200x630)
  sharp(svgBuffer)
    .resize(1200, 630)
    .png({ quality: 90 })
    .toFile(ogPngPath)
    .then(() => {
      console.log('✅ public/og-image.png generated (1200x630)');
      
      // 复制到 dist 目录
      fs.copyFileSync(ogPngPath, ogDistPath);
      console.log('✅ dist/og-image.png copied');
    })
    .catch(err => {
      console.error('❌ Error generating OG image:', err);
    });
} else {
  console.log('⚠️  og-image.svg not found');
}

// 读取 Favicon SVG
const faviconSvgPath = path.join(publicDir, 'favicon.svg');
const appleTouchPath = path.join(publicDir, 'apple-touch-icon.png');
const appleTouchDistPath = path.join(distDir, 'apple-touch-icon.png');

if (fs.existsSync(faviconSvgPath)) {
  const faviconBuffer = fs.readFileSync(faviconSvgPath);
  
  // 转换为 PNG (180x180)
  sharp(faviconBuffer)
    .resize(180, 180)
    .png({ quality: 90 })
    .toFile(appleTouchPath)
    .then(() => {
      console.log('✅ public/apple-touch-icon.png generated (180x180)');
      
      // 复制到 dist 目录
      fs.copyFileSync(appleTouchPath, appleTouchDistPath);
      console.log('✅ dist/apple-touch-icon.png copied');
    })
    .catch(err => {
      console.error('❌ Error generating Apple Touch Icon:', err);
    });
} else {
  console.log('⚠️  favicon.svg not found');
}

console.log('\n🎉 图片生成完成！');
console.log('\n📝 提示：');
console.log('   - public/og-image.png: Open Graph 分享图片 (1200x630)');
console.log('   - public/apple-touch-icon.png: Apple Touch Icon (180x180)');
console.log('   - 这些图片会自动复制到 dist/ 目录');