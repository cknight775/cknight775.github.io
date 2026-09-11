import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const run = promisify(execFile);

const HOST = '127.0.0.1';
const PORT = 4173;
const BASE = `http://${HOST}:${PORT}`;
const REPORT_DIR = 'qa-reports';

// Approved thresholds (Consejo, PR #14).
const THRESHOLDS = {
  performance: 90,
  accessibility: 95,
  'best-practices': 95,
  seo: 95,
};

async function discoverPaths() {
  const xml = await readFile('dist/sitemap-index.xml', 'utf8').catch(
    () => null,
  );
  const sitemapFiles = xml
    ? [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    : ['dist/sitemap-0.xml'];

  const paths = new Set();
  for (const entry of sitemapFiles) {
    const localPath = entry.startsWith('http') ? 'dist/sitemap-0.xml' : entry;
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

async function waitForServer(url, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Timed out waiting for ${url}`);
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
      if (!exists) broken.push(`${url} -> ${href} (element not found)`);
      continue;
    }
    const target = new URL(href, url);
    const res = await fetch(target).catch((e) => ({
      ok: false,
      status: `ERROR: ${e.message}`,
    }));
    if (!res.ok) broken.push(`${url} -> ${href} (HTTP ${res.status})`);
  }
  await context.close();
  return broken;
}

async function main() {
  await mkdir(REPORT_DIR, { recursive: true });
  const paths = await discoverPaths();
  console.log(`Discovered public paths from sitemap: ${paths.join(', ')}`);

  await run('npx', [
    '--no-install',
    'astro',
    'preview',
    '--host',
    HOST,
    '--port',
    String(PORT),
  ]);
  await waitForServer(BASE + '/');

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
    await run('npx', ['--no-install', 'astro', 'preview', 'stop']).catch(
      () => {},
    );
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
