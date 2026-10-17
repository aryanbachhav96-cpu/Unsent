import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const galleryDir = path.join(__dirname, '../public/images/gallery');
const nightImagesDir = path.join(__dirname, '../public/images');
const dayImagesDir = path.join(__dirname, '../public/images/day');

if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}

async function optimize() {
  let sharp = null;
  try {
    const sharpModule = await import('sharp');
    sharp = sharpModule.default || sharpModule;
  } catch (err) {
    console.warn('Sharp not available, copying originals:', err.message);
  }

  // Night images for gallery: img-02, img-03, img-04, img-05, img-06, img-08, img-10, img-11, img-13
  const nightImages = [
    'img-02.jpg', 'img-03.jpg', 'img-04.jpg', 'img-05.jpg',
    'img-06.jpg', 'img-08.jpg', 'img-10.jpg', 'img-11.jpg', 'img-13.jpg'
  ];

  // Day images: day-01.jpg .. day-08.jpg
  const dayImages = [
    'day-01.jpg', 'day-02.jpg', 'day-03.jpg', 'day-04.jpg',
    'day-05.jpg', 'day-06.jpg', 'day-07.jpg', 'day-08.jpg'
  ];

  const tasks = [];

  for (const file of nightImages) {
    const src = path.join(nightImagesDir, file);
    const dest = path.join(galleryDir, file);
    if (fs.existsSync(src)) {
      tasks.push({ src, dest, name: file });
    }
  }

  for (const file of dayImages) {
    const src = path.join(dayImagesDir, file);
    const dest = path.join(galleryDir, file);
    if (fs.existsSync(src)) {
      tasks.push({ src, dest, name: file });
    }
  }

  for (const { src, dest, name } of tasks) {
    if (sharp) {
      try {
        await sharp(src)
          .resize({ width: 900, withoutEnlargement: true })
          .jpeg({ quality: 82 })
          .toFile(dest);
        const stats = fs.statSync(dest);
        console.log(`[Optimized] ${name} -> ${Math.round(stats.size / 1024)} KB`);
      } catch (e) {
        console.warn(`Failed sharp optimization for ${name}, falling back to copy:`, e.message);
        fs.copyFileSync(src, dest);
      }
    } else {
      fs.copyFileSync(src, dest);
      console.log(`[Copied] ${name}`);
    }
  }
  console.log('Gallery image optimization complete.');
}

optimize().catch(console.error);
