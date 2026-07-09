import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../Assets/elicensing');
fs.mkdirSync(OUT, { recursive: true });

const captures = [
  { name: '05-home-park-permit', scrollY: 480 },
  { name: '06-home-multilevel-draws', scrollY: 1180 },
  { name: '07-home-mobile-hero', width: 390, height: 844, scrollY: 0 },
];

async function dismissModal(page) {
  const close = page.getByRole('button', { name: 'Close' });
  if (await close.count()) {
    try {
      await close.first().click({ timeout: 2000 });
      await page.waitForTimeout(500);
    } catch {
      /* ignore */
    }
  }
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

for (const shot of captures) {
  try {
    if (shot.width) {
      await page.setViewportSize({ width: shot.width, height: shot.height });
    } else {
      await page.setViewportSize({ width: 1440, height: 900 });
    }
    await page.goto('https://www.manitobaelicensing.ca/public/home', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2500);
    await dismissModal(page);
    if (shot.scrollY) {
      await page.evaluate((y) => window.scrollTo(0, y), shot.scrollY);
      await page.waitForTimeout(600);
    }
    const file = path.join(OUT, `${shot.name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log('OK', shot.name);
  } catch (e) {
    console.log('FAIL', shot.name, e.message);
  }
}

await browser.close();
