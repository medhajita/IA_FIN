// Export LandingPage2 (/dossier) as a PDF using Puppeteer.
// Usage:
//   1. Start dev server in another terminal: npm run dev
//   2. Run this script:                       node scripts/export-dossier-pdf.mjs

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT = path.resolve(__dirname, '..', 'FinCoach-Dossier.pdf');
const URL = process.env.URL || 'http://localhost:5173/dossier';

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

(async () => {
  console.log(`Checking dev server at ${URL}...`);
  const ok = await waitForServer(URL);
  if (!ok) {
    console.error('Dev server not reachable. Start it with: npm run dev');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Loading page...');
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });

  // Switch to print-friendly mode (disable scroll-snap, force page breaks)
  await page.evaluate(() => {
    const root = document.querySelector('.doc-page');
    if (root) root.classList.add('doc-print-mode');
  });

  // Give CSS a moment to settle + ensure all images are loaded
  await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(imgs.map(img => img.complete ? null : new Promise(r => { img.onload = r; img.onerror = r; })));
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('Generating PDF...');
  await page.pdf({
    path: OUT,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    preferCSSPageSize: false,
  });

  await browser.close();
  console.log(`PDF saved: ${OUT}`);
  if (existsSync(OUT)) {
    const { size } = await import('node:fs').then(m => m.promises.stat(OUT));
    console.log(`Size: ${(size / 1024).toFixed(1)} KB`);
  }
})().catch(err => {
  console.error(err);
  process.exit(1);
});
