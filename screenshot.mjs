import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

mkdirSync('/tmp/screenshots', { recursive: true });

const BASE = 'http://localhost:8081';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

async function shot(url, path, scrollY = 0, delay = 1500) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle2', timeout: 20000 });
  await new Promise(r => setTimeout(r, delay));
  if (scrollY) { await page.evaluate(y => window.scrollTo(0, y), scrollY); await new Promise(r => setTimeout(r, 500)); }
  await page.screenshot({ path: `/tmp/screenshots/${path}.png` });
  await page.close();
  console.log(`  ✓ ${path}`);
}

await shot('/', 'landing-hero');
await shot('/', 'landing-features', 900);
await shot('/', 'landing-pricing', 1700);
await shot('/login', 'login');
await shot('/signup', 'signup');

await browser.close();
console.log('Done → /tmp/screenshots/');
