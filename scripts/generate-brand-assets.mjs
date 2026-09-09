import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const favicon = readFileSync(`${root}/public/favicon.svg`);
const ogImage = readFileSync(`${root}/scripts/assets/og-image.svg`);

await sharp(favicon, { density: 384 })
  .resize(32, 32)
  .png()
  .toFile(`${root}/public/favicon.png`);

await sharp(favicon, { density: 384 })
  .resize(180, 180)
  .flatten({ background: '#0d1929' })
  .png()
  .toFile(`${root}/public/apple-touch-icon.png`);

await sharp(ogImage)
  .resize(1200, 630)
  .png()
  .toFile(`${root}/public/og-image.png`);

console.log('Generated favicon.png, apple-touch-icon.png and og-image.png');
