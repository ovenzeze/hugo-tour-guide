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

// 源SVG图标
const svgPath = path.join(__dirname, '..', 'public', 'hugo-icon.svg');

// 需要生成的图标尺寸
const icons = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'maskable-icon.png', size: 512 }
];

// 读取SVG文件
const svgBuffer = fs.readFileSync(svgPath);

// 生成各种尺寸的图标
async function generateIcons() {
    console.log('开始生成图标...');

    for (const icon of icons) {
        await sharp(svgBuffer)
            .resize(icon.size, icon.size)
            .png()
            .toFile(path.join(publicDir, icon.name));

        console.log(`已生成 ${icon.name} (${icon.size}x${icon.size}px)`);
    }

    // 为Safari生成特殊的固定tab图标
    await sharp(svgBuffer)
        .resize(512, 512)
        .png()
        .toFile(path.join(publicDir, 'safari-pinned-tab.svg'));

    console.log('已生成 safari-pinned-tab.svg');
    console.log('所有图标生成完成！');
}

generateIcons().catch(err => {
    console.error('生成图标时出错：', err);
    process.exit(1);
});