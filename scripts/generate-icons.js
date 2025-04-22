import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保输出目录存在
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// 源JPG图标路径 - 替换为用户提供的实际路径
const jpgPath = '/Users/clayzhang/Downloads/IMG_5571.JPG';

// 需要生成的图标尺寸
const icons = [
    { name: 'favicon.ico', sizes: [16, 32] },
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'maskable-icon.png', size: 512 },
    // PWA推荐尺寸
    { name: 'pwa-48x48.png', size: 48 },
    { name: 'pwa-72x72.png', size: 72 },
    { name: 'pwa-96x96.png', size: 96 },
    { name: 'pwa-144x144.png', size: 144 },
    { name: 'pwa-168x168.png', size: 168 },
    { name: 'pwa-192x192.png', size: 192 },
    // iOS推荐尺寸
    { name: 'apple-touch-icon-60x60.png', size: 60 },
    { name: 'apple-touch-icon-76x76.png', size: 76 },
    { name: 'apple-touch-icon-120x120.png', size: 120 },
    { name: 'apple-touch-icon-152x152.png', size: 152 }
];

// 生成各种尺寸的图标
async function generateIcons() {
    console.log('开始生成图标...');

    // 读取JPG文件并转换为透明背景PNG
    const image = sharp(jpgPath)
        .flatten({ background: { r: 0, g: 0, b: 0, alpha: 0 } }) // 透明背景
        .toFormat('png');

    for (const icon of icons) {
        if (icon.sizes) {
            // 处理ICO文件(多尺寸)
            await sharp(await image.toBuffer())
                .resize(icon.sizes[0], icon.sizes[0])
                .toFile(path.join(publicDir, icon.name));
        } else {
            // 处理PNG文件
            await sharp(await image.toBuffer())
                .resize(icon.size, icon.size)
                .toFile(path.join(publicDir, icon.name));
        }

        console.log(`已生成 ${icon.name} (${icon.size || icon.sizes.join('x')}px)`);
    }

    // 为Safari生成特殊的固定tab图标
    await sharp(await image.toBuffer())
        .resize(512, 512)
        .toFile(path.join(publicDir, 'safari-pinned-tab.svg'));

    console.log('已生成 safari-pinned-tab.svg');
    console.log('所有图标生成完成！');
}

generateIcons().catch(err => {
    console.error('生成图标时出错：', err);
    process.exit(1);
});