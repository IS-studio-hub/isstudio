import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'Assets/elicensing');
const OUT = path.join(SRC, 'marketing');
fs.mkdirSync(OUT, { recursive: true });

function fileUrl(relPath) {
  return `file://${path.join(SRC, relPath)}`;
}

function baseStyles() {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: ${1600}px;
      height: ${1200}px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(ellipse 80% 70% at 50% 40%, #fff6c8 0%, #F7E491 45%, #edd56e 100%);
      font-family: Inter, system-ui, sans-serif;
      overflow: hidden;
    }
    .scene {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 28px 48px rgba(206, 65, 39, 0.18));
    }
    .glow {
      position: absolute;
      width: 70%;
      height: 40%;
      bottom: 8%;
      left: 15%;
      background: rgba(206, 65, 39, 0.12);
      filter: blur(60px);
      border-radius: 50%;
      z-index: 0;
    }

    /* Laptop */
    .laptop {
      position: relative;
      z-index: 1;
      width: ${1100}px;
    }
    .laptop__screen {
      background: #1a1a1a;
      border-radius: 18px 18px 0 0;
      padding: 14px 14px 10px;
      border: 2px solid #2b2b2b;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
    }
    .laptop__camera {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #333;
      margin: 0 auto 10px;
      box-shadow: inset 0 0 0 1px #555;
    }
    .laptop__display {
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
      line-height: 0;
    }
    .laptop__display img {
      width: 100%;
      height: auto;
      display: block;
    }
    .laptop__base {
      height: 18px;
      background: linear-gradient(180deg, #d8d8d8 0%, #b8b8b8 100%);
      border-radius: 0 0 12px 12px;
      margin: 0 48px;
      position: relative;
    }
    .laptop__base::before {
      content: "";
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 6px;
      background: #a8a8a8;
      border-radius: 0 0 8px 8px;
    }
    .laptop__hinge {
      height: 6px;
      background: linear-gradient(90deg, #999, #ccc, #999);
      margin: 0 20px;
      border-radius: 0 0 4px 4px;
    }

    /* Desktop monitor */
    .monitor {
      position: relative;
      z-index: 1;
      width: ${1050}px;
    }
    .monitor__shell {
      background: #222;
      border-radius: 20px;
      padding: 16px;
      border: 3px solid #333;
    }
    .monitor__display {
      border-radius: 10px;
      overflow: hidden;
      background: #fff;
    }
    .monitor__display img {
      width: 100%;
      display: block;
    }
    .monitor__chin {
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .monitor__logo {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #444;
    }
    .monitor__stand {
      width: 180px;
      height: 70px;
      margin: 0 auto;
      background: linear-gradient(180deg, #ccc 0%, #aaa 100%);
      clip-path: polygon(15% 0, 85% 0, 100% 100%, 0 100%);
    }
    .monitor__foot {
      width: 260px;
      height: 12px;
      margin: 0 auto;
      background: #999;
      border-radius: 0 0 8px 8px;
    }

    /* Phone */
    .phone-scene body, body.phone-body {
      width: 900px;
      height: 1100px;
    }
    .phone {
      position: relative;
      z-index: 1;
      width: 340px;
      background: #111;
      border-radius: 44px;
      padding: 14px;
      border: 3px solid #2a2a2a;
      box-shadow:
        inset 0 0 0 2px rgba(255,255,255,0.08),
        0 24px 60px rgba(0,0,0,0.28);
    }
    .phone__island {
      position: absolute;
      top: 22px;
      left: 50%;
      transform: translateX(-50%);
      width: 96px;
      height: 28px;
      background: #000;
      border-radius: 20px;
      z-index: 3;
    }
    .phone__display {
      border-radius: 32px;
      overflow: hidden;
      background: #fff;
    }
    .phone__display img {
      width: 100%;
      display: block;
    }
    .phone__bar {
      height: 28px;
    }

    /* Duo layout */
    body.duo-body {
      width: 1800px;
      height: 1200px;
    }
    .duo {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 48px;
      position: relative;
      z-index: 1;
    }
    .duo .laptop { width: 920px; transform: perspective(1200px) rotateY(-6deg); }
    .duo .phone {
      width: 280px;
      margin-bottom: 40px;
      transform: perspective(1200px) rotateY(8deg) translateY(20px);
    }
    .duo .phone__island { width: 80px; height: 24px; top: 18px; }

    /* Tablet */
    .tablet {
      position: relative;
      z-index: 1;
      width: 720px;
      background: #1c1c1e;
      border-radius: 28px;
      padding: 18px;
      border: 2px solid #333;
    }
    .tablet__display {
      border-radius: 14px;
      overflow: hidden;
      background: #fff;
    }
    .tablet__display img { width: 100%; display: block; }
  `;
}

function laptopHtml(imageFile, bodyClass = '') {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles()}</style></head>
  <body class="${bodyClass}">
    <div class="glow"></div>
    <div class="scene">
      <div class="laptop">
        <div class="laptop__screen">
          <div class="laptop__camera"></div>
          <div class="laptop__display"><img src="${fileUrl(imageFile)}" alt="" /></div>
        </div>
        <div class="laptop__hinge"></div>
        <div class="laptop__base"></div>
      </div>
    </div>
  </body></html>`;
}

function monitorHtml(imageFile) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles()}</style></head>
  <body>
    <div class="glow"></div>
    <div class="scene">
      <div class="monitor">
        <div class="monitor__shell">
          <div class="monitor__display"><img src="${fileUrl(imageFile)}" alt="" /></div>
          <div class="monitor__chin"><div class="monitor__logo"></div></div>
        </div>
        <div class="monitor__stand"></div>
        <div class="monitor__foot"></div>
      </div>
    </div>
  </body></html>`;
}

function phoneHtml(imageFile) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles()}
    body { width: 900px; height: 1100px; }
  </style></head>
  <body>
    <div class="glow"></div>
    <div class="scene">
      <div class="phone">
        <div class="phone__island"></div>
        <div class="phone__bar"></div>
        <div class="phone__display"><img src="${fileUrl(imageFile)}" alt="" /></div>
        <div class="phone__bar"></div>
      </div>
    </div>
  </body></html>`;
}

function duoHtml(desktopFile, mobileFile) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles()}
    body.duo-body { width: 1800px; height: 1200px; }
  </style></head>
  <body class="duo-body">
    <div class="glow"></div>
    <div class="scene">
      <div class="duo">
        <div class="laptop">
          <div class="laptop__screen">
            <div class="laptop__camera"></div>
            <div class="laptop__display"><img src="${fileUrl(desktopFile)}" alt="" /></div>
          </div>
          <div class="laptop__hinge"></div>
          <div class="laptop__base"></div>
        </div>
        <div class="phone">
          <div class="phone__island"></div>
          <div class="phone__bar"></div>
          <div class="phone__display"><img src="${fileUrl(mobileFile)}" alt="" /></div>
          <div class="phone__bar"></div>
        </div>
      </div>
    </div>
  </body></html>`;
}

function tabletHtml(imageFile) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles()}
    body { width: 1200px; height: 1000px; }
  </style></head>
  <body>
    <div class="glow"></div>
    <div class="scene">
      <div class="tablet">
        <div class="tablet__display"><img src="${fileUrl(imageFile)}" alt="" /></div>
      </div>
    </div>
  </body></html>`;
}

const jobs = [
  { name: '01-home-hero-laptop', html: () => laptopHtml('01-home-hero.png'), width: 1600, height: 1200 },
  { name: '02-home-licence-cards-laptop', html: () => laptopHtml('02-home-licence-cards.png'), width: 1600, height: 1200 },
  { name: '03-home-draws-forestry-monitor', html: () => monitorHtml('03-home-draws-forestry.png'), width: 1600, height: 1200 },
  { name: '04-home-issuers-faq-laptop', html: () => laptopHtml('04-home-issuers-faq.png'), width: 1600, height: 1200 },
  { name: '05-home-park-permit-laptop', html: () => laptopHtml('05-home-park-permit.png'), width: 1600, height: 1200 },
  { name: '06-home-multilevel-draws-monitor', html: () => monitorHtml('06-home-multilevel-draws.png'), width: 1600, height: 1200 },
  { name: '07-home-mobile-phone', html: () => phoneHtml('07-home-mobile-hero.png'), width: 900, height: 1100 },
  { name: '08-responsive-duo', html: () => duoHtml('01-home-hero.png', '07-home-mobile-hero.png'), width: 1800, height: 1200 },
  { name: '09-licence-cards-duo', html: () => duoHtml('02-home-licence-cards.png', '07-home-mobile-hero.png'), width: 1800, height: 1200 },
  { name: '10-park-permit-tablet', html: () => tabletHtml('05-home-park-permit.png'), width: 1200, height: 1000 },
];

const TMP = path.join(__dirname, '.mockup-tmp');
fs.mkdirSync(TMP, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: 2 });

for (const job of jobs) {
  const htmlPath = path.join(TMP, `${job.name}.html`);
  fs.writeFileSync(htmlPath, job.html());
  const page = await context.newPage();
  await page.setViewportSize({ width: job.width, height: job.height });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const outFile = path.join(OUT, `${job.name}.png`);
  await page.screenshot({ path: outFile, type: 'png' });
  await page.close();
  console.log('OK', job.name);
}

await browser.close();

// Optimize output size
for (const f of fs.readdirSync(OUT)) {
  if (!f.endsWith('.png')) continue;
  const p = path.join(OUT, f);
  // keep quality, cap max dimension via sips if available
  try {
    const { execSync } = await import('child_process');
    execSync(`sips -Z 2000 "${p}" --out "${p}"`, { stdio: 'ignore' });
  } catch {
    /* optional */
  }
}

console.log('Done:', OUT);
