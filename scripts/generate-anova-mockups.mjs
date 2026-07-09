import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'Assets/anova/screens');
const OUT = path.join(ROOT, 'Assets/anova/lifestyle');
const TMP = path.join(__dirname, '.mockup-tmp-anova');

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

function src(file) {
  return `file://${path.join(SRC, file)}`;
}

const STUDIO_BG = `
  background:
    radial-gradient(ellipse 90% 70% at 50% 20%, #ffffff 0%, transparent 55%),
    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(206, 65, 39, 0.04) 0%, transparent 70%),
    linear-gradient(165deg, #f7f3ee 0%, #ece7e0 48%, #e3ddd4 100%);
`;

const TEXTURE_BG = `
  background:
    linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"),
    linear-gradient(180deg, #ebe4d9 0%, #ddd4c8 100%);
`;

const BASE_DEVICES = `
  .phone {
    position: absolute;
    background: linear-gradient(145deg, #2a2a2c 0%, #0f0f10 100%);
    border-radius: 46px;
    padding: 11px;
    border: 1.5px solid #3a3a3c;
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.08),
      0 2px 0 rgba(255,255,255,0.06) inset,
      0 30px 60px rgba(0,0,0,0.22),
      0 12px 24px rgba(0,0,0,0.12);
    transform-style: preserve-3d;
  }
  .phone__island {
    position: absolute;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    width: 84px;
    height: 24px;
    background: #000;
    border-radius: 16px;
    z-index: 3;
  }
  .phone__display {
    border-radius: 34px;
    overflow: hidden;
    background: #fff;
  }
  .phone__display img {
    width: 100%;
    display: block;
  }
  .phone__display--crop {
    height: var(--crop-h);
  }
  .phone__display--crop img {
    height: 100%;
    object-fit: cover;
    object-position: top;
  }
  .tablet {
    position: absolute;
    background: linear-gradient(145deg, #2c2c2e 0%, #141416 100%);
    border-radius: 30px;
    padding: 14px;
    border: 1.5px solid #444;
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.06),
      0 35px 70px rgba(0,0,0,0.2),
      0 15px 30px rgba(0,0,0,0.1);
    transform-style: preserve-3d;
  }
  .tablet__display {
    border-radius: 16px;
    overflow: hidden;
    background: #fff;
  }
  .tablet__display img { width: 100%; display: block; }
  .laptop {
    position: absolute;
    transform-style: preserve-3d;
  }
  .laptop__screen {
    background: linear-gradient(180deg, #3a3a3c 0%, #1c1c1e 100%);
    border-radius: 18px 18px 0 0;
    padding: 14px 14px 8px;
    border: 1.5px solid #4a4a4c;
    box-shadow: 0 25px 50px rgba(0,0,0,0.18);
  }
  .laptop__camera {
    width: 7px; height: 7px; border-radius: 50%;
    background: #222; margin: 0 auto 8px;
    box-shadow: inset 0 0 0 1px #555;
  }
  .laptop__display {
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
  }
  .laptop__display img { width: 100%; display: block; }
  .laptop__base {
    height: 16px;
    margin: 0 36px;
    background: linear-gradient(180deg, #c8c8ca 0%, #a8a8aa 100%);
    border-radius: 0 0 10px 10px;
  }
  .laptop__hinge {
    height: 5px;
    margin: 0 14px;
    background: linear-gradient(90deg, #888, #bbb, #888);
    border-radius: 0 0 3px 3px;
  }
  .shadow-oval {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(0,0,0,0.18) 0%, transparent 70%);
    filter: blur(8px);
    pointer-events: none;
  }
  .float-card {
    position: absolute;
    background: #fff;
    border-radius: 18px;
    padding: 14px;
    box-shadow:
      0 24px 48px rgba(0,0,0,0.12),
      0 8px 16px rgba(0,0,0,0.06),
      inset 0 1px 0 rgba(255,255,255,0.9);
    transform-style: preserve-3d;
  }
  .float-card__label {
    position: absolute;
    top: 18px;
    right: 22px;
    font: 700 72px/1 'Inter', system-ui, sans-serif;
    color: rgba(0,0,0,0.04);
    pointer-events: none;
  }
  .float-card img {
    width: 100%;
    display: block;
    border-radius: 10px;
  }
  .stripe-light {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      100deg,
      transparent 0,
      transparent 52px,
      rgba(0,0,0,0.035) 52px,
      rgba(0,0,0,0.035) 88px
    );
    mix-blend-mode: multiply;
  }
`;

function phoneEl({ src: file, w, style, cropH }) {
  const cropClass = cropH ? ' phone__display--crop' : '';
  const cropStyle = cropH ? ` style="--crop-h:${cropH}px"` : '';
  return `
    <div class="phone" style="width:${w}px;${style}">
      <div class="phone__island"></div>
      <div style="height:22px"></div>
      <div class="phone__display${cropClass}"${cropStyle}>
        <img src="${src(file)}" alt="" />
      </div>
      <div style="height:18px"></div>
    </div>`;
}

function tabletEl({ src: file, w, style }) {
  return `
    <div class="tablet" style="width:${w}px;${style}">
      <div class="tablet__display">
        <img src="${src(file)}" alt="" />
      </div>
    </div>`;
}

function laptopEl({ src: file, w, style }) {
  return `
    <div class="laptop" style="width:${w}px;${style}">
      <div class="laptop__screen">
        <div class="laptop__camera"></div>
        <div class="laptop__display"><img src="${src(file)}" alt="" /></div>
      </div>
      <div class="laptop__hinge"></div>
      <div class="laptop__base"></div>
    </div>`;
}

function floatCard({ src: file, w, label, style }) {
  return `
    <div class="float-card" style="width:${w}px;${style}">
      <span class="float-card__label">${label}</span>
      <img src="${src(file)}" alt="" />
    </div>`;
}

const scenes = {
  multiDeviceStudio: () => `<!DOCTYPE html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet"><style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { width:2000px; height:1300px; overflow:hidden; position:relative; ${STUDIO_BG} }
    .stage { position:absolute; inset:0; perspective:2400px; }
    ${BASE_DEVICES}
    .s1 { left:50%; top:52%; transform:translate(-50%,-50%); width:900px; z-index:1; }
    .s2 { left:18%; top:48%; transform:translate(-50%,-50%) rotateY(14deg) rotateX(2deg); z-index:2; }
    .s3 { left:78%; top:56%; transform:translate(-50%,-50%) rotateY(-18deg) rotateX(4deg); z-index:4; }
    .sh1 { left:50%; top:78%; width:720px; height:90px; transform:translateX(-50%); }
    .sh2 { left:18%; top:72%; width:340px; height:60px; transform:translateX(-50%); }
    .sh3 { left:78%; top:76%; width:220px; height:50px; transform:translateX(-50%); }
  </style></head><body>
    <div class="stage">
      <div class="shadow-oval sh1"></div>
      <div class="shadow-oval sh2"></div>
      <div class="shadow-oval sh3"></div>
      ${laptopEl({ src: '01-user-flow.png', w: 900, style: 'left:50%;top:42%;transform:translate(-50%,-50%) rotateX(8deg);z-index:1;' })}
      ${tabletEl({ src: '07-guide-handoff-01.png', w: 520, style: 'left:20%;top:50%;transform:translate(-50%,-50%) rotateY(16deg) rotateX(6deg);z-index:2;' })}
      ${phoneEl({ src: '02-wireframe-01.png', w: 260, style: 'left:80%;top:54%;transform:translate(-50%,-50%) rotateY(-14deg) rotateX(8deg);z-index:4;', cropH: 520 })}
    </div>
  </body></html>`,

  isometricCluster: () => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { width:2000px; height:1300px; overflow:hidden; position:relative; ${STUDIO_BG} }
    .stage { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; perspective:1800px; }
    .cluster {
      position: relative;
      width: 1400px;
      height: 900px;
      transform: rotateX(52deg) rotateZ(-38deg) scale(0.92);
      transform-style: preserve-3d;
    }
    ${BASE_DEVICES}
    .pl { left:420px; top:80px; transform:translateZ(40px); z-index:1; }
    .pt { left:80px; top:220px; transform:translateZ(80px); z-index:3; }
    .pp { left:620px; top:340px; transform:translateZ(120px); z-index:5; }
    .ps { left:340px; top:480px; transform:translateZ(60px); z-index:4; }
    .ground {
      position:absolute; left:50%; top:72%; width:1100px; height:420px;
      transform:translate(-50%,-50%) rotateX(78deg);
      background: radial-gradient(ellipse, rgba(0,0,0,0.14) 0%, transparent 68%);
      filter: blur(12px);
    }
  </style></head><body>
    <div class="stage">
      <div class="cluster">
        <div class="ground"></div>
        ${laptopEl({ src: '03-wireframe-02.png', w: 640, style: 'left:420px;top:80px;z-index:1;' })}
        ${tabletEl({ src: '04-wireframe-03.png', w: 380, style: 'left:80px;top:220px;z-index:3;' })}
        ${phoneEl({ src: '13-guide-handoff-07.png', w: 210, style: 'left:620px;top:340px;z-index:5;' })}
        ${phoneEl({ src: '05-wireframe-04.png', w: 195, style: 'left:340px;top:480px;z-index:4;' })}
      </div>
    </div>
  </body></html>`,

  topdownDesk: () => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { width:2000px; height:1300px; overflow:hidden; position:relative; ${TEXTURE_BG} }
    .stripe-light { opacity: 0.85; }
    ${BASE_DEVICES}
    .lp { left:54%; top:38%; transform:translate(-50%,-50%) rotate(-8deg); z-index:2; }
    .tp { left:22%; top:52%; transform:translate(-50%,-50%) rotate(12deg); z-index:3; }
    .pp { left:68%; top:68%; transform:translate(-50%,-50%) rotate(-4deg); z-index:4; }
    .sh { left:50%; top:62%; width:800px; height:100px; transform:translateX(-50%); opacity:0.7; }
  </style></head><body>
    <div class="stripe-light"></div>
    <div class="shadow-oval sh"></div>
    ${laptopEl({ src: '08-guide-handoff-02.png', w: 780, style: 'left:54%;top:38%;transform:translate(-50%,-50%) rotate(-8deg);z-index:2;' })}
    ${tabletEl({ src: '11-guide-handoff-05.png', w: 480, style: 'left:22%;top:52%;transform:translate(-50%,-50%) rotate(12deg);z-index:3;' })}
    ${phoneEl({ src: '02-wireframe-01.png', w: 240, style: 'left:68%;top:68%;transform:translate(-50%,-50%) rotate(-4deg);z-index:4;' })}
  </body></html>`,

  floatingCards: () => `<!DOCTYPE html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet"><style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { width:2000px; height:1300px; overflow:hidden; position:relative; ${STUDIO_BG} }
    ${BASE_DEVICES}
    .center-laptop { left:50%; top:54%; transform:translate(-50%,-50%); z-index:3; }
    .c1 { left:14%; top:28%; transform:translate(-50%,-50%) rotate(-6deg); z-index:4; }
    .c2 { left:86%; top:32%; transform:translate(-50%,-50%) rotate(8deg); z-index:4; }
    .c3 { left:16%; top:76%; transform:translate(-50%,-50%) rotate(5deg); z-index:2; }
    .c4 { left:84%; top:74%; transform:translate(-50%,-50%) rotate(-7deg); z-index:2; }
    .sh { left:50%; top:78%; width:680px; height:80px; transform:translateX(-50%); }
  </style></head><body>
    <div class="shadow-oval sh"></div>
    ${laptopEl({ src: '07-guide-handoff-01.png', w: 820, style: 'left:50%;top:54%;transform:translate(-50%,-50%);z-index:3;' })}
    ${floatCard({ src: '02-wireframe-01.png', w: 280, label: '01', style: 'left:14%;top:28%;transform:translate(-50%,-50%) rotate(-6deg);z-index:4;' })}
    ${floatCard({ src: '03-wireframe-02.png', w: 280, label: '02', style: 'left:86%;top:32%;transform:translate(-50%,-50%) rotate(8deg);z-index:4;' })}
    ${floatCard({ src: '12-guide-handoff-06.png', w: 260, label: '03', style: 'left:16%;top:76%;transform:translate(-50%,-50%) rotate(5deg);z-index:2;' })}
    ${floatCard({ src: '13-guide-handoff-07.png', w: 260, label: '04', style: 'left:84%;top:74%;transform:translate(-50%,-50%) rotate(-7deg);z-index:2;' })}
  </body></html>`,

  isometricPanels: () => `<!DOCTYPE html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet"><style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { width:2000px; height:1300px; overflow:hidden; position:relative;
      background: linear-gradient(135deg, #d8dee8 0%, #c5ccd6 100%); }
    .stage { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; perspective:1600px; }
    .wrap { position:relative; width:1200px; height:900px; transform:rotateX(48deg) rotateZ(-42deg) scale(0.88); transform-style:preserve-3d; }
    ${BASE_DEVICES}
    .hero { left:120px; top:40px; transform:translateZ(100px); z-index:5; }
    .panel1 { left:560px; top:120px; width:340px; padding:12px; background:#fff; border-radius:16px;
      box-shadow:0 30px 60px rgba(0,0,0,0.15); transform:translateZ(60px); z-index:3; }
    .panel2 { left:560px; top:420px; width:340px; padding:12px; background:#fff; border-radius:16px;
      box-shadow:0 30px 60px rgba(0,0,0,0.15); transform:translateZ(40px); z-index:2; }
    .panel1 img, .panel2 img { width:100%; border-radius:10px; display:block; }
    .num { position:absolute; right:20px; top:12px; font:700 80px/1 Inter,system-ui; color:rgba(0,0,0,0.05); }
    .ground { position:absolute; left:50%; top:70%; width:900px; height:300px; transform:translate(-50%,-50%) rotateX(80deg);
      background:radial-gradient(ellipse,rgba(0,0,0,0.12),transparent 70%); filter:blur(10px); }
  </style></head><body>
    <div class="stage"><div class="wrap">
      <div class="ground"></div>
      ${phoneEl({ src: '07-guide-handoff-01.png', w: 320, style: 'left:120px;top:40px;z-index:5;', cropH: 620 })}
      <div class="panel1" style="left:560px;top:120px;position:absolute;">
        <span class="num">01</span>
        <img src="${src('03-wireframe-02.png')}" alt="" />
      </div>
      <div class="panel2" style="left:560px;top:420px;position:absolute;">
        <span class="num">02</span>
        <img src="${src('13-guide-handoff-07.png')}" alt="" />
      </div>
    </div></div>
  </body></html>`,

  heroPhone: () => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { width:900px; height:1120px; overflow:hidden; position:relative; ${STUDIO_BG} }
    ${BASE_DEVICES}
    .sh { left:50%; top:78%; width:340px; height:60px; transform:translateX(-50%); }
  </style></head><body>
    <div class="shadow-oval sh"></div>
    ${phoneEl({ src: '07-guide-handoff-01.png', w: 310, style: 'left:50%;top:48%;transform:translate(-50%,-50%) rotateY(-8deg) rotateX(4deg);', cropH: 580 })}
  </body></html>`,

  duoPhonesStudio: () => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { width:2000px; height:1300px; overflow:hidden; position:relative; ${STUDIO_BG} }
    ${BASE_DEVICES}
    .sh { left:50%; top:76%; width:560px; height:80px; transform:translateX(-50%); }
  </style></head><body>
    <div class="shadow-oval sh"></div>
    ${phoneEl({ src: '04-wireframe-03.png', w: 270, style: 'left:38%;top:52%;transform:translate(-50%,-50%) rotateY(12deg) rotateX(5deg);z-index:2;' })}
    ${phoneEl({ src: '13-guide-handoff-07.png', w: 270, style: 'left:62%;top:50%;transform:translate(-50%,-50%) rotateY(-10deg) rotateX(5deg);z-index:3;' })}
  </body></html>`,

  tabletFlow: () => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { width:900px; height:1120px; overflow:hidden; position:relative; ${STUDIO_BG} }
    ${BASE_DEVICES}
    .sh { left:50%; top:80%; width:420px; height:70px; transform:translateX(-50%); }
  </style></head><body>
    <div class="shadow-oval sh"></div>
    ${tabletEl({ src: '01-user-flow.png', w: 620, style: 'left:50%;top:48%;transform:translate(-50%,-50%) rotateY(-6deg) rotateX(8deg);' })}
  </body></html>`,

  responsiveTrio: () => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { width:2000px; height:1300px; overflow:hidden; position:relative;
      background: linear-gradient(180deg, #faf8f5 0%, #f0ebe4 100%); }
    ${BASE_DEVICES}
    .monitor { position:absolute; left:50%; top:38%; transform:translate(-50%,-50%); width:980px; z-index:1; }
    .monitor__shell { background:#1a1a1c; border-radius:22px; padding:18px; border:2px solid #333; box-shadow:0 40px 80px rgba(0,0,0,0.15); }
    .monitor__display { border-radius:12px; overflow:hidden; background:#fff; }
    .monitor__display img { width:100%; display:block; }
    .monitor__stand { width:160px; height:60px; margin:0 auto; background:linear-gradient(180deg,#bbb,#999); clip-path:polygon(20% 0,80% 0,100% 100%,0 100%); }
    .monitor__foot { width:240px; height:10px; margin:0 auto; background:#888; border-radius:0 0 6px 6px; }
    .tab { left:14%; top:58%; transform:translate(-50%,-50%) rotateY(10deg); z-index:3; }
    .ph { left:82%; top:62%; transform:translate(-50%,-50%) rotateY(-8deg); z-index:4; }
  </style></head><body>
    <div class="monitor" style="left:50%;top:38%;transform:translate(-50%,-50%);">
      <div class="monitor__shell"><div class="monitor__display"><img src="${src('01-user-flow.png')}" alt="" /></div></div>
      <div class="monitor__stand"></div><div class="monitor__foot"></div>
    </div>
    ${tabletEl({ src: '09-guide-handoff-03.png', w: 440, style: 'left:14%;top:58%;transform:translate(-50%,-50%) rotateY(10deg);z-index:3;' })}
    ${phoneEl({ src: '02-wireframe-01.png', w: 250, style: 'left:82%;top:62%;transform:translate(-50%,-50%) rotateY(-8deg);z-index:4;' })}
  </body></html>`,

  kitchenAccent: () => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { width:900px; height:1120px; overflow:hidden; position:relative; }
    .bg { position:absolute; inset:0; background:url('https://images.unsplash.com/photo-1556909172-54557c668992?auto=format&fit=crop&w=1800&q=85') center/cover; }
    .bg::after { content:""; position:absolute; inset:0; background:linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.25)); }
    ${BASE_DEVICES}
    .sh { left:50%; top:82%; width:280px; height:50px; transform:translateX(-50%); opacity:0.5; }
  </style></head><body>
    <div class="bg"></div>
    <div class="shadow-oval sh"></div>
    ${phoneEl({ src: '07-guide-handoff-01.png', w: 280, style: 'left:50%;top:55%;transform:translate(-50%,-50%);', cropH: 540 })}
  </body></html>`,
};

const jobs = [
  { name: 'wide/01-multi-device-studio', html: scenes.multiDeviceStudio, width: 2000, height: 1300 },
  { name: 'wide/02-isometric-cluster', html: scenes.isometricCluster, width: 2000, height: 1300 },
  { name: 'wide/03-topdown-desk', html: scenes.topdownDesk, width: 2000, height: 1300 },
  { name: 'wide/04-floating-cards', html: scenes.floatingCards, width: 2000, height: 1300 },
  { name: 'wide/05-isometric-panels', html: scenes.isometricPanels, width: 2000, height: 1300 },
  { name: 'wide/06-responsive-trio', html: scenes.responsiveTrio, width: 2000, height: 1300 },
  { name: 'wide/07-duo-phones-studio', html: scenes.duoPhonesStudio, width: 2000, height: 1300 },
  { name: 'portrait/01-hero-phone', html: scenes.heroPhone, width: 900, height: 1120 },
  { name: 'portrait/02-tablet-flow', html: scenes.tabletFlow, width: 900, height: 1120 },
  { name: 'portrait/03-kitchen-accent', html: scenes.kitchenAccent, width: 900, height: 1120 },
];

const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: 2 });

for (const job of jobs) {
  const outDir = path.join(OUT, path.dirname(job.name));
  fs.mkdirSync(outDir, { recursive: true });
  const htmlPath = path.join(TMP, `${job.name.replace(/\//g, '-')}.html`);
  fs.writeFileSync(htmlPath, job.html());
  const page = await context.newPage();
  await page.setViewportSize({ width: job.width, height: job.height });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, `${job.name}.png`), type: 'png' });
  await page.close();
  console.log('OK', job.name);
}

await browser.close();

for (const dir of ['wide', 'portrait', 'tall']) {
  const folder = path.join(OUT, dir);
  if (!fs.existsSync(folder)) continue;
  for (const f of fs.readdirSync(folder)) {
    if (!f.endsWith('.png')) continue;
    try {
      execSync(`sips -Z 2400 "${path.join(folder, f)}" --out "${path.join(folder, f)}"`, { stdio: 'ignore' });
    } catch { /* optional */ }
  }
}

console.log('Done:', OUT);
