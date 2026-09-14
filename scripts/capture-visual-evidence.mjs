import { mkdir, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

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
  const projectPaths = [...paths]
    .filter((p) => p.startsWith('/proyectos/'))
    .map((path) => ({
      path,
      slug: path.replace(/^\/proyectos\//, '').replace(/\/$/, ''),
    }));

  // Whether each project's built page has a rendered "Evidencia" gallery
  // block, found by inspecting the static output rather than the browser —
  // consistent with how paths themselves are discovered from the sitemap.
  for (const project of projectPaths) {
    const html = await readFile(
      `${DIST_DIR}${project.path}index.html`,
      'utf8',
    ).catch(() => '');
    project.hasGallery = html.includes('evidence-section');
  }
  return projectPaths;
}

// The full list of files this run must produce, independent of whether the
// capture steps below actually ran — so a step that silently no-ops (a
// selector that stopped matching, a conditional that took the wrong branch)
// is still caught by verifyCaptures() instead of passing quietly.
function buildManifest(projectPaths) {
  const manifest = [
    { path: `${OUT_DIR}/home-desktop-1440x900.png`, ...VIEWPORTS.desktop },
    { path: `${OUT_DIR}/home-tablet-768x1024.png`, ...VIEWPORTS.tablet },
    {
      path: `${OUT_DIR}/home-mobile-390x844-cerrado.png`,
      ...VIEWPORTS.mobile,
    },
    {
      path: `${OUT_DIR}/home-mobile-390x844-abierto.png`,
      ...VIEWPORTS.mobile,
    },
    {
      path: `${OUT_DIR}/gallery-desktop-1440x900.png`,
      ...VIEWPORTS.desktop,
    },
    {
      path: `${OUT_DIR}/gallery-mobile-drawer-390x844.png`,
      ...VIEWPORTS.mobile,
    },
  ];

  if (projectPaths.length > 0) {
    manifest.push({
      path: `${OUT_DIR}/home-proyectos-1440x900.png`,
      ...VIEWPORTS.desktop,
    });
  }
  for (const { slug, hasGallery } of projectPaths) {
    manifest.push(
      {
        path: `${OUT_DIR}/caso-${slug}-desktop-1440x900.png`,
        ...VIEWPORTS.desktop,
      },
      {
        path: `${OUT_DIR}/caso-${slug}-mobile-390x844.png`,
        ...VIEWPORTS.mobile,
      },
      {
        path: `${OUT_DIR}/caso-${slug}-tablet-768x1024.png`,
        ...VIEWPORTS.tablet,
      },
    );
    if (hasGallery) {
      // The final rendered "Evidencia" gallery block itself (as opposed to
      // the gallery-desktop-*/gallery-mobile-drawer-* source captures used to
      // build the WebP assets it displays). It's an element screenshot, so
      // its height is whatever the composed grid needs, not a fixed
      // viewport size — validated as "non-trivial", not an exact match.
      manifest.push(
        {
          path: `${OUT_DIR}/evidencia-${slug}-desktop.png`,
          minWidth: 500,
          minHeight: 100,
        },
        {
          path: `${OUT_DIR}/evidencia-${slug}-mobile.png`,
          minWidth: 300,
          minHeight: 100,
        },
      );
    }
  }
  return manifest;
}

async function verifyCaptures(manifest) {
  const problems = [];
  for (const entry of manifest) {
    const { path: filePath } = entry;
    const fileStat = await stat(filePath).catch(() => null);
    if (!fileStat) {
      problems.push(`${filePath}: missing`);
      continue;
    }
    const metadata = await sharp(filePath).metadata();
    const { width, height } = metadata;
    if (!width || !height) {
      problems.push(`${filePath}: unreadable or zero-size image`);
    } else if ('width' in entry) {
      if (width !== entry.width || height !== entry.height) {
        problems.push(
          `${filePath}: expected ${entry.width}x${entry.height}, got ${width}x${height}`,
        );
      }
    } else if (width < entry.minWidth || height < entry.minHeight) {
      problems.push(
        `${filePath}: expected at least ${entry.minWidth}x${entry.minHeight}, got ${width}x${height}`,
      );
    }
  }
  if (problems.length > 0) {
    throw new Error(
      `Visual evidence verification failed:\n${problems.map((p) => `  - ${p}`).join('\n')}`,
    );
  }
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

// Clicks the real sidebar toggle (never sets [data-open] directly) and waits
// for the drawer's own attribute change, then lets its CSS transition finish.
async function openDrawer(page) {
  await page.locator('.sidebar-toggle').click();
  await page
    .locator('[data-sidebar][data-open]')
    .waitFor({ state: 'attached' });
  await page.waitForTimeout(250);
}

// The gallery images use loading="lazy", so scrolling a locator into view is
// not enough to guarantee they've finished decoding by the time a screenshot
// is taken; wait for every <img> inside it to report .complete.
async function waitForImages(locator) {
  await locator.locator('img').evaluateAll((imgs) =>
    Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            }),
      ),
    ),
  );
}

// A plain `locator.screenshot()` on an element taller than the viewport
// makes Playwright capture "beyond the viewport", which on this page
// mis-renders position: fixed/sticky elements (the skip link, the sidebar)
// at coordinates relative to the *original* scroll position instead of the
// expanded capture area — they bleed into the shot instead of staying put.
// Growing the real viewport to fit the element first avoids that capture
// mode entirely: everything renders through the normal (non-beyond-viewport)
// path, so fixed/sticky elements land where they actually belong.
async function screenshotWholeElement(page, locator, path) {
  // scrollIntoViewIfNeeded() only scrolls until *some* part is visible, which
  // for an element taller than the viewport can leave its top above y=0 (a
  // negative box.y breaks the clip math below) or its bottom cut off.
  // Aligning to the top explicitly guarantees box.y is ~0.
  await locator.evaluate((el) => el.scrollIntoView({ block: 'start' }));
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Element not found for screenshot: ${path}`);

  const viewport = page.viewportSize();
  const neededHeight = Math.ceil(box.y + box.height) + 8;
  if (neededHeight > viewport.height) {
    await page.setViewportSize({ width: viewport.width, height: neededHeight });
  }

  await page.screenshot({
    path,
    clip: {
      x: Math.floor(box.x),
      y: Math.floor(box.y),
      width: Math.ceil(box.width),
      height: Math.ceil(box.height),
    },
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const projectPaths = await discoverProjectPaths();
  if (projectPaths.length === 0) {
    throw new Error(
      'No public project pages discovered from the sitemap. Visual review ' +
        'evidence assumes at least one public case study exists; if that is ' +
        'no longer true, update this script deliberately instead of letting ' +
        'it silently produce a smaller evidence set.',
    );
  }
  console.log(
    `Discovered project pages from sitemap: ${projectPaths
      .map((p) => `${p.path} (slug: ${p.slug}, gallery: ${p.hasGallery})`)
      .join(', ')}`,
  );
  const manifest = buildManifest(projectPaths);

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
        // A real 1440x900 viewport capture (not an element-bounded one, which
        // is only as wide as the centered content column and as tall as the
        // section's own content).
        await proyectos.scrollIntoViewIfNeeded();
        await page.screenshot({
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
      await openDrawer(page);
      await page.screenshot({
        path: `${OUT_DIR}/home-mobile-390x844-abierto.png`,
      });
    });

    // Dedicated captures for the public case-study gallery, kept separate
    // from the QA/design-review shots above so the two can diverge (crop,
    // framing) without one silently changing the other.
    await withPage(browser, VIEWPORTS.desktop, async (page) => {
      await goto(page, '/');
      await page.screenshot({
        path: `${OUT_DIR}/gallery-desktop-1440x900.png`,
      });
    });

    await withPage(browser, VIEWPORTS.mobile, async (page) => {
      await goto(page, '/');
      await openDrawer(page);
      await page.screenshot({
        path: `${OUT_DIR}/gallery-mobile-drawer-390x844.png`,
      });
    });

    for (const { path: projectPath, slug, hasGallery } of projectPaths) {
      await withPage(browser, VIEWPORTS.desktop, async (page) => {
        await goto(page, projectPath);
        await page.screenshot({
          path: `${OUT_DIR}/caso-${slug}-desktop-1440x900.png`,
        });
      });

      await withPage(browser, VIEWPORTS.mobile, async (page) => {
        await goto(page, projectPath);
        await page.screenshot({
          path: `${OUT_DIR}/caso-${slug}-mobile-390x844.png`,
        });
      });

      await withPage(browser, VIEWPORTS.tablet, async (page) => {
        await goto(page, projectPath);
        await page.screenshot({
          path: `${OUT_DIR}/caso-${slug}-tablet-768x1024.png`,
        });
      });

      if (hasGallery) {
        // The final assembled "Evidencia" block as actually rendered, not
        // the gallery-desktop-*/gallery-mobile-drawer-* source captures used
        // to build the images it displays. An element screenshot, so it
        // captures the whole composition regardless of its height.
        await withPage(browser, VIEWPORTS.desktop, async (page) => {
          await goto(page, projectPath);
          const section = page.locator('.evidence-section');
          await section.scrollIntoViewIfNeeded();
          await waitForImages(section);
          await screenshotWholeElement(
            page,
            section,
            `${OUT_DIR}/evidencia-${slug}-desktop.png`,
          );
        });

        await withPage(browser, VIEWPORTS.mobile, async (page) => {
          await goto(page, projectPath);
          const section = page.locator('.evidence-section');
          await section.scrollIntoViewIfNeeded();
          await waitForImages(section);
          await screenshotWholeElement(
            page,
            section,
            `${OUT_DIR}/evidencia-${slug}-mobile.png`,
          );
        });
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  await verifyCaptures(manifest);

  console.log(`\nVisual evidence captured and verified in ${OUT_DIR}/.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
