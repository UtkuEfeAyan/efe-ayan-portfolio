const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const ROOT = 'C:\\Users\\utkue\\efe-ayan-portfolio';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function save(url, out) {
  const buf = Buffer.from(url.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync(out, buf);
  console.log('OK', out, buf.length);
}
(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    defaultViewport: { width: 480, height: 800 },
    args: ['--no-sandbox', '--disable-gpu', '--use-angle=swiftshader'],
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', async (req) => {
    if (req.url().includes('/minis/flappy-bird/game.js')) {
      const res = await fetch(req.url());
      let body = await res.text();
      body = body.replace('type: Phaser.AUTO', 'type: Phaser.CANVAS');
      await req.respond({ status: 200, contentType: 'application/javascript', body });
    } else await req.continue();
  });
  await page.goto('http://127.0.0.1:8765/minis/flappy-bird/index.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('#game-container canvas', { timeout: 20000 });
  await sleep(1000);
  const box = await page.$eval('#game-container canvas', (c) => {
    const r = c.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  const flap = () => page.mouse.click(box.x, box.y);
  const grab = async (n) => {
    const url = await page.evaluate(() => document.querySelector('#game-container canvas').toDataURL('image/png'));
    save(url, path.join(ROOT, `assets/gallery/flappy/play-0${n}.png`));
  };

  // Start and keep flapping so first pipe enters view
  await flap();
  await sleep(250);
  for (let i = 0; i < 5; i++) { await flap(); await sleep(220); }
  await grab(1);

  for (let i = 0; i < 6; i++) { await flap(); await sleep(200); }
  await grab(2);

  for (let i = 0; i < 6; i++) { await flap(); await sleep(190); }
  await grab(3);

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
