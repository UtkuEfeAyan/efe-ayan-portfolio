const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const ROOT = 'C:\\Users\\utkue\\efe-ayan-portfolio';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
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
  await sleep(700);
  const box = await page.$eval('#game-container canvas', (c) => {
    const r = c.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.click(box.x, box.y);
  await sleep(200);
  for (let i = 0; i < 5; i++) {
    await page.mouse.click(box.x, box.y);
    await sleep(210);
  }
  await page.waitForFunction(() => {
    const c = document.querySelector('#game-container canvas');
    const ctx = c.getContext('2d');
    const w = c.width, h = c.height;
    const { data } = ctx.getImageData(Math.floor(w * 0.55), 0, Math.floor(w * 0.4), h);
    let green = 0;
    for (let i = 0; i < data.length; i += 32) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (g > 120 && g > r + 30 && g > b + 30) green++;
    }
    return green > 40;
  }, { timeout: 8000 });
  const url = await page.evaluate(() => document.querySelector('#game-container canvas').toDataURL('image/png'));
  const out = path.join(ROOT, 'assets/gallery/flappy/play-03.png');
  fs.writeFileSync(out, Buffer.from(url.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log('OK', out, fs.statSync(out).size);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
