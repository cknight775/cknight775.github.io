import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cknight775.github.io',
  output: 'static',
  integrations: [sitemap()],
});

