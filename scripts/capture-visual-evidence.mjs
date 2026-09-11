import { mkdir, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const HOST = '127.0.0.1';
const PORT = 4174;
const BASE = `http://${HOST}:${PORT}`;
const DIST_DIR = 'dist';
const OUT_DIR = 'visual-evidence';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
};

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};

// Same in-process static server as check-quality-gates.mjs: avoids spawning
// `astro preview` (or any other external server process), which can leave a
// CI step's log pipe open indefinitely even after this script has finished.
async function startStaticServer() {
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, BASE).pathname);
      let filePath = join(DIST_DIR, pathname);
      let fileStat = await stat(filePath).catch(() => null);
      if (fileStat?.isDirectory()) {
        filePath = join(filePath, 'index.html');
        fileStat = await stat(filePath).catch(() => null);
      }
      if (!fileStat) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
        return;
      }
      const data = await readFile(filePath);
      res.writeHead(200, {
        'Content-Type':
          MIME_TYPES[extname(filePath)] ?? 'application/octet-stream',
      });
      res.end(data);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(String(error));
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, HOST, resolve);
  });
  return server;
}

async function discoverProjectPaths() {
  const xml = await readFile(`${DIST_DIR}/sitemap-index.xml`, 'utf8').catch(
    () => null,
  );
  const sitemapFiles = xml
    ? [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    : [`${DIST_DIR}/sitemap-0.xml`];

  const paths = new Set();
  for (const entry of sitemapFiles) {
    const localPath = entry.startsWith('http')
      ? `${DIST_DIR}/sitemap-0.xml`
      : entry;
    const content = await readFile(localPath, 'utf8').catch(() => null);
    if (!content) continue;
    for (const match of content.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const url = new URL(match[1]);
      paths.add(url.pathname);
    }
  }
  return [...paths].filter((p) => p.startsWith('/proyectos/'));
}

// Opens a page, records console/pageerror/failed-response issues, runs
// `run(page, url)`, then closes the context deterministically before
// surfacing any recorded issue as a thrown error.
async function withPage(browser, viewport, run) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const issues = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') issues.push(`console error: ${msg.text()}`);
  });
  page.on('pageerror', (error) => issues.push(`pageerror: ${error}`));
  page.on('requestfailed', (request) => {
    issues.push(
      `requestfailed: ${request.url()} (${request.failure()?.errorText})`,
    );
  });
  page.on('response', (response) => {
    if (response.url().startsWith(BASE) && response.status() >= 400) {
      issues.push(`response ${response.status()}: ${response.url()}`);
    }
  });

  try {
    await run(page);
  } finally {
    await context.close();
  }

  if (issues.length > 0) {
    throw new Error(
      `Page errors detected:\n${issues.map((i) => `  - ${i}`).join('\n')}`,
    );
  }
}

async function goto(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const projectPaths = await discoverProjectPaths();
  console.log(
    `Discovered project pages from sitemap: ${projectPaths.join(', ') || '(none)'}`,
  );

  const server = await startStaticServer();
  console.log(`Serving ${DIST_DIR}/ at ${BASE}`);

  const browser = await chromium.launch({ headless: true });

  try {
    await withPage(browser, VIEWPORTS.desktop, async (page) => {
      await goto(page, '/');
      await page.screenshot({
        path: `${OUT_DIR}/home-desktop-1440x900.png`,
      });
      const proyectos = page.locator('#proyectos');
      if ((await proyectos.count()) > 0) {
        await proyectos.scrollIntoViewIfNeeded();
        await proyectos.screenshot({
          path: `${OUT_DIR}/home-proyectos-1440x900.png`,
        });
      } else {
        console.log('No #proyectos section in this build; skipping capture.');
      }
    });

    await withPage(browser, VIEWPORTS.tablet, async (page) => {
      await goto(page, '/');
      await page.screenshot({
        path: `${OUT_DIR}/home-tablet-768x1024.png`,
      });
    });

    await withPage(browser, VIEWPORTS.mobile, async (page) => {
      await goto(page, '/');
      await page.screenshot({
        path: `${OUT_DIR}/home-mobile-390x844-cerrado.png`,
      });

      const toggle = page.locator('.sidebar-toggle');
      await toggle.click();
      await page.locator('[data-sidebar][data-open]').waitFor({
        state: 'attached',
      });
      // Let the CSS transform transition finish before capturing.
      await page.waitForTimeout(250);
      await page.screenshot({
        path: `${OUT_DIR}/home-mobile-390x844-abierto.png`,
      });
    });

    for (const projectPath of projectPaths) {
      await withPage(browser, VIEWPORTS.desktop, async (page) => {
        await goto(page, projectPath);
        await page.screenshot({
          path: `${OUT_DIR}/caso-portafolio-desktop-1440x900.png`,
        });
      });

      await withPage(browser, VIEWPORTS.mobile, async (page) => {
        await goto(page, projectPath);
        await page.screenshot({
          path: `${OUT_DIR}/caso-portafolio-mobile-390x844.png`,
        });
      });

      await withPage(browser, VIEWPORTS.tablet, async (page) => {
        await goto(page, projectPath);
        await page.screenshot({
          path: `${OUT_DIR}/caso-portafolio-tablet-768x1024.png`,
        });
      });
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  console.log(`\nVisual evidence captured in ${OUT_DIR}/.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
