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
    if (req.url().endsWith('/game.js') && req.url().includes('flappy')) {
      const res = await fetch(req.url());
      let body = await res.text();
      body = body.replace('type: Phaser.AUTO', 'type: Phaser.CANVAS');
      await req.respond({ status: 200, contentType: 'application/javascript', body });
    } else await req.continue();
  });
  await page.goto('http://127.0.0.1:8765/minis/flappy-bird/index.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('#game-container canvas', { timeout: 20000 });
  await sleep(800);
  const box = await page.$eval('#game-container canvas', (c) => {
    const r = c.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  const flap = () => page.mouse.click(box.x, box.y);
  const state = () => page.evaluate(() => {
    const g = Phaser.GAMES && Phaser.GAMES[0];
    const s = g && g.scene.getScenes(true)[0];
    if (!s) return null;
    const pipes = (s.pipes || []).map((p) => ({ x: p.gfx.x, topH: p.topH, gap: p.gap }));
    return { over: !!s.isGameOver, started: !!s.hasStarted, score: s.score|0, birdY: s.birdY, H: s.scale.height, pipes };
  });

  await flap(); // start
  await sleep(100);

  const outs = [];
  const t0 = Date.now();
  while (outs.length < 3 && Date.now() - t0 < 20000) {
    let st = await state();
    if (!st) { await sleep(40); continue; }
    if (st.over) { await flap(); await sleep(250); await flap(); continue; }
    if (!st.started) { await flap(); await sleep(80); continue; }

    // keep bird near mid / gap center
    const next = st.pipes.filter((p) => p.x > 80).sort((a,b)=>a.x-b.x)[0];
    const target = next ? (next.topH + next.gap / 2) : st.H * 0.45;
    if (st.birdY > target + 12) await flap();

    const visiblePipe = st.pipes.some((p) => p.x > 100 && p.x < 420);
    const thresholds = [0, 900, 2200];
    if (visiblePipe && !st.over && (Date.now() - t0) > thresholds[outs.length]) {
      // ensure enough spacing between captures
      if (outs.length === 0 || Date.now() - outs[outs.length - 1].t > 700) {
        const url = await page.evaluate(() => document.querySelector('#game-container canvas').toDataURL('image/png'));
        const n = outs.length + 1;
        const out = path.join(ROOT, `assets/gallery/flappy/play-0${n}.png`);
        save(url, out);
        outs.push({ t: Date.now(), pipeX: next && next.x, score: st.score });
      }
    }
    await sleep(35);
  }
  console.log(JSON.stringify(outs));
  await browser.close();
  if (outs.length < 3) process.exit(2);
})().catch((e) => { console.error(e); process.exit(1); });
