import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const HOST = '127.0.0.1';
const PORT = 4173;
const BASE = `http://${HOST}:${PORT}`;
const REPORT_DIR = 'qa-reports';
const DIST_DIR = 'dist';

// Approved thresholds (Consejo, PR #14).
const THRESHOLDS = {
  performance: 90,
  accessibility: 95,
  'best-practices': 95,
  seo: 95,
};

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

// A static file server for the already-built `dist/` output, run in this
// same process. Deliberately avoids spawning `astro preview` (or any other
// external server process): a detached child that doesn't fully release
// its inherited stdout/stderr can leave a CI step's log pipe open forever
// even after this script has finished, hanging the job. An in-process
// http.Server has no such risk and is trivial to shut down deterministically.
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

async function discoverPaths() {
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
  if (paths.size === 0) paths.add('/');
  return [...paths];
}

async function runLighthouseFor(url, chromePath, slug) {
  const chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  });
  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: ['json', 'html'],
      onlyCategories: Object.keys(THRESHOLDS),
      logLevel: 'error',
    });
    await writeFile(`${REPORT_DIR}/lighthouse-${slug}.json`, result.report[0]);
    await writeFile(`${REPORT_DIR}/lighthouse-${slug}.html`, result.report[1]);
    const scores = {};
    for (const [key, cat] of Object.entries(result.lhr.categories)) {
      scores[key] = Math.round(cat.score * 100);
    }
    return scores;
  } finally {
    await chrome.kill();
  }
}

async function runAxeFor(browser, url, slug) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  await writeFile(
    `${REPORT_DIR}/axe-${slug}.json`,
    JSON.stringify(results, null, 2),
  );
  await context.close();
  return results.violations;
}

async function checkInternalLinks(browser, url) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  const hrefs = await page
    .locator('a[href]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('href')));

  const broken = [];
  for (const href of hrefs) {
    if (!href || href.startsWith('http') || href.startsWith('mailto:')) {
      continue; // external links stay a manual check (see docs/qa/release-readiness.md)
    }
    if (href.startsWith('#')) {
      const exists = await page.evaluate(
        (id) => document.getElementById(id) !== null,
        href.slice(1),
      );
      if (!exists) broken.push(`${href} (element not found)`);
      continue;
    }
    const target = new URL(href, url);
    const res = await fetch(target).catch((e) => ({
      ok: false,
      status: `ERROR: ${e.message}`,
    }));
    if (!res.ok) broken.push(`${href} (HTTP ${res.status})`);
  }
  await context.close();
  return broken;
}

async function main() {
  await mkdir(REPORT_DIR, { recursive: true });
  const paths = await discoverPaths();
  console.log(`Discovered public paths from sitemap: ${paths.join(', ')}`);

  const server = await startStaticServer();
  console.log(`Serving ${DIST_DIR}/ at ${BASE}`);

  const failures = [];
  const chromePath = chromium.executablePath();
  const browser = await chromium.launch({ headless: true });

  try {
    for (const path of paths) {
      const url = `${BASE}${path}`;
      const slug =
        path === '/' ? 'home' : path.replace(/\//g, '-').replace(/^-|-$/g, '');

      const scores = await runLighthouseFor(url, chromePath, slug);
      console.log(`\nLighthouse ${path}:`, scores);
      for (const [category, min] of Object.entries(THRESHOLDS)) {
        if (scores[category] < min) {
          failures.push(
            `${path}: Lighthouse ${category}=${scores[category]} < required ${min}`,
          );
        }
      }

      const violations = await runAxeFor(browser, url, slug);
      console.log(`axe-core ${path}: ${violations.length} violations`);
      for (const v of violations) {
        failures.push(
          `${path}: axe violation [${v.impact}] ${v.id} (${v.nodes.length} nodes)`,
        );
      }

      const broken = await checkInternalLinks(browser, url);
      if (broken.length > 0) {
        console.log(`Broken internal links on ${path}:`, broken);
        failures.push(
          ...broken.map((b) => `${path}: broken internal link ${b}`),
        );
      } else {
        console.log(`Internal links on ${path}: all OK`);
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  await writeFile(
    `${REPORT_DIR}/summary.json`,
    JSON.stringify({ paths, thresholds: THRESHOLDS, failures }, null, 2),
  );

  if (failures.length > 0) {
    console.error('\nQuality gates failed:');
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }

  console.log(
    '\nAll quality gates passed (Lighthouse thresholds, axe-core, internal links).',
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
