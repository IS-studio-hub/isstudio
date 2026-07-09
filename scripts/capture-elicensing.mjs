import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../Assets/elicensing');
fs.mkdirSync(OUT, { recursive: true });

const captures = [
  { name: '01-home-hero', url: 'https://www.manitobaelicensing.ca/public/home', scrollY: 0 },
  { name: '02-home-licence-cards', url: 'https://www.manitobaelicensing.ca/public/home', scrollY: 720 },
  { name: '03-home-draws-forestry', url: 'https://www.manitobaelicensing.ca/public/home', scrollY: 1450 },
  { name: '04-home-issuers-faq', url: 'https://www.manitobaelicensing.ca/public/home', scrollY: 2600 },
  { name: '05-angling-listing', url: 'https://www.manitobaelicensing.ca/public/product-listings?p=angling-licences', scrollY: 0 },
  { name: '06-hunting-listing', url: 'https://www.manitobaelicensing.ca/public/product-listings?p=hunting-licences', scrollY: 0 },
  { name: '07-multilevel-draws', url: 'https://www.manitobaelicensing.ca/public/product-listings?p=multilevel-draws', scrollY: 0 },
  { name: '08-park-vehicle-permit', url: 'https://www.manitobaelicensing.ca/public/product-listings?p=park-vehicle-permits', scrollY: 0 },
  { name: '09-forestry-permit', url: 'https://www.manitobaelicensing.ca/public/product-listings?p=forestry-permits', scrollY: 0 },
  { name: '10-faq', url: 'https://www.manitobaelicensing.ca/public/faq', scrollY: 0 },
  { name: '11-issuers', url: 'https://www.manitobaelicensing.ca/public/issuers', scrollY: 0 },
  { name: '12-sign-in', url: 'https://www.manitobaelicensing.ca/public/sign-in', scrollY: 0 },
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
    await page.goto(shot.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2500);
    await dismissModal(page);
    if (shot.scrollY) {
      await page.evaluate((y) => window.scrollTo(0, y), shot.scrollY);
      await page.waitForTimeout(600);
    }
    const file = path.join(OUT, `${shot.name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log('OK', shot.name, shot.url);
  } catch (e) {
    console.log('FAIL', shot.name, e.message);
  }
}

await browser.close();

// Remove duplicate full-page files from earlier run
['01-home.png', '02-angling.png', '03-hunting.png', '04-multilevel-draws.png', '05-faq.png', '06-issuers.png', '07-home-hero.png', '08-home-licences.png'].forEach((f) => {
  const p = path.join(OUT, f);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log('removed old', f);
  }
});
