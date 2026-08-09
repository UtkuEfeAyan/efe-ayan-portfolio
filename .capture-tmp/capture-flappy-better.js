const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = 'C:\\Users\\utkue\\efe-ayan-portfolio';
const BASE = 'http://127.0.0.1:8765';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function saveDataUrl(dataUrl, outPath) {
  const b64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  const buf = Buffer.from(b64, 'base64');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
  console.log(`OK ${outPath} (${buf.length} bytes)`);
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
      try {
        const res = await fetch(req.url());
        let body = await res.text();
        body = body.replace('type: Phaser.AUTO', 'type: Phaser.CANVAS');
        await req.respond({ status: 200, contentType: 'application/javascript', body });
      } catch {
        await req.continue();
      }
    } else {
      await req.continue();
    }
  });

  await page.goto(`${BASE}/minis/flappy-bird/index.html`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForSelector('#game-container canvas', { timeout: 30000 });
  await sleep(1000);

  // Click center to start
  const box = await page.$eval('#game-container canvas', (c) => {
    const r = c.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top, left: r.left, w: r.width, h: r.height };
  });
  await page.mouse.click(box.x, box.y);
  await sleep(200);

  const shots = [];
  const endAt = Date.now() + 18000;
  while (Date.now() < endAt && shots.length < 3) {
    // Read bird Y approx by sampling yellow pixels, or just rhythmic flap
    // Rhythmic flap tuned for survival
    await page.mouse.click(box.x, box.y);
    await sleep(280);
    await page.mouse.click(box.x, box.y);
    await sleep(320);

    // Capture periodically after a bit of play
    const elapsed = 18000 - (endAt - Date.now());
    if (
      (shots.length === 0 && elapsed > 1200) ||
      (shots.length === 1 && elapsed > 4500) ||
      (shots.length === 2 && elapsed > 9000)
    ) {
      const url = await page.evaluate(() => document.querySelector('#game-container canvas').toDataURL('image/png'));
      const idx = String(shots.length + 1).padStart(2, '0');
      const out = path.join(ROOT, `assets/gallery/flappy/play-${idx}.png`);
      saveDataUrl(url, out);
      shots.push(out);
    }
  }

  // If game over early, restart and keep going
  while (shots.length < 3) {
    await page.mouse.click(box.x, box.y);
    await sleep(400);
    for (let i = 0; i < 8; i++) {
      await page.mouse.click(box.x, box.y);
      await sleep(260);
    }
    const url = await page.evaluate(() => document.querySelector('#game-container canvas').toDataURL('image/png'));
    const idx = String(shots.length + 1).padStart(2, '0');
    const out = path.join(ROOT, `assets/gallery/flappy/play-${idx}.png`);
    saveDataUrl(url, out);
    shots.push(out);
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
