const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = 'C:\\Users\\utkue\\efe-ayan-portfolio';
const BASE = 'http://127.0.0.1:8765';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const results = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function saveDataUrl(dataUrl, outPath) {
  ensureDir(outPath);
  const b64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(outPath, buf);
  results.push({ path: outPath, bytes: buf.length, ok: true });
  console.log(`OK ${outPath} (${buf.length} bytes)`);
}

async function screenshotEl(page, selector, outPath) {
  ensureDir(outPath);
  const el = await page.$(selector);
  if (!el) throw new Error(`Missing ${selector}`);
  await el.screenshot({ path: outPath, type: 'png' });
  const st = fs.statSync(outPath);
  results.push({ path: outPath, bytes: st.size, ok: true });
  console.log(`OK ${outPath} (${st.size} bytes)`);
}

async function captureFlappy(browser) {
  console.log('\n=== FLAPPY FIX ===');
  const page = await browser.newPage();
  await page.setViewport({ width: 900, height: 900 });

  // Force Phaser Canvas renderer so pixels are readable via screenshot
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(window, '__FORCE_PHASER_CANVAS__', { value: true });
  });

  await page.goto(`${BASE}/minis/flappy-bird/index.html`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });

  // Patch config if game already constructed with AUTO — reload with override
  await page.evaluate(() => {
    // If Phaser available, monkey-patch Game to force CANVAS
  });

  // Intercept by rewriting config: inject script before game.js finishes if needed
  // Prefer: stop and re-init with CANVAS
  const hasCanvas = await page.waitForSelector('#game-container canvas', { timeout: 30000 });
  if (!hasCanvas) throw new Error('no flappy canvas');

  // Force recreate with CANVAS if black WebGL
  await page.evaluate(async () => {
    if (typeof Phaser === 'undefined') return;
    // Destroy existing games
    if (Phaser.GAMES && Phaser.GAMES.length) {
      Phaser.GAMES.slice().forEach((g) => {
        try { g.destroy(true); } catch (e) {}
      });
    }
    const container = document.getElementById('game-container');
    if (container) container.innerHTML = '';
  });

  // Re-run game.js boot by reloading with injected patch
  await page.setContent('<html></html>');
  await page.goto(`${BASE}/minis/flappy-bird/index.html`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });

  await page.waitForFunction(() => typeof Phaser !== 'undefined', { timeout: 30000 });

  // Destroy and recreate with CANVAS type
  await page.evaluate(() => {
    if (Phaser.GAMES && Phaser.GAMES.length) {
      Phaser.GAMES.slice().forEach((g) => {
        try { g.destroy(true); } catch (e) {}
      });
    }
    const container = document.getElementById('game-container');
    if (container) container.innerHTML = '';

    // Find scene class from previous config is hard; instead reload game.js after patching Phaser.AUTO
    const origAuto = Phaser.AUTO;
    Phaser.AUTO = Phaser.CANVAS;
    // Re-execute game bootstrap by fetching and eval game.js again would duplicate scenes.
    // Better approach: create a minimal redirect — just set AUTO = CANVAS then location.reload once.
    window.__phaserForced = true;
    Phaser.AUTO = Phaser.CANVAS;
  });

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.evaluateOnNewDocument(() => {}); // noop placeholder

  await page.waitForSelector('#game-container canvas', { timeout: 30000 });
  await sleep(1500);

  // Ensure renderer is canvas by checking
  const info = await page.evaluate(() => {
    const g = Phaser.GAMES && Phaser.GAMES[0];
    return {
      games: Phaser.GAMES ? Phaser.GAMES.length : 0,
      type: g ? g.config.renderType : null,
      w: g ? g.config.width : null,
      h: g ? g.config.height : null,
    };
  });
  console.log('flappy game info', info);

  const box = await page.$eval('#game-container canvas', (c) => {
    const r = c.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  async function flap() {
    await page.mouse.click(box.x, box.y);
  }

  await flap();
  await sleep(300);
  for (let i = 0; i < 4; i++) {
    await flap();
    await sleep(220);
  }
  await screenshotEl(page, '#game-container', path.join(ROOT, 'assets/gallery/flappy/play-01.png'));

  for (let i = 0; i < 8; i++) {
    await flap();
    await sleep(200);
  }
  await screenshotEl(page, '#game-container', path.join(ROOT, 'assets/gallery/flappy/play-02.png'));

  for (let i = 0; i < 10; i++) {
    await flap();
    await sleep(180);
  }
  await screenshotEl(page, '#game-container', path.join(ROOT, 'assets/gallery/flappy/play-03.png'));
  await page.close();
}

async function captureCircles(browser) {
  console.log('\n=== CIRCLES FIX ===');
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });
  page.on('console', (msg) => console.log('PAGE:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('PAGEERR:', err.message));

  const resp = await page.goto(`${BASE}/minis/cmpm147/experiment5/experiment_5b/index.html`, {
    waitUntil: 'load',
    timeout: 120000,
  });
  console.log('circles status', resp && resp.status());

  await page.waitForSelector('#dropper', { timeout: 30000 });
  // Wait for p5 + canvas
  await page.waitForFunction(() => !!document.querySelector('#active canvas'), { timeout: 90000 });
  await page.waitForFunction(() => {
    const fps = document.getElementById('fpsCounter');
    const circ = document.getElementById('circleCounter');
    const ref = document.querySelector('#reference img, #reference canvas');
    const fpsTxt = fps && fps.textContent;
    const fpsOk = fpsTxt && fpsTxt !== '—' && !Number.isNaN(Number(fpsTxt));
    const circOk = circ && Number(circ.textContent) > 20;
    return !!(ref && (fpsOk || circOk));
  }, { timeout: 90000 });

  await sleep(3000);
  const dataUrl = await page.evaluate(() => {
    const c = document.querySelector('#active canvas');
    return c ? c.toDataURL('image/png') : null;
  });
  if (!dataUrl) throw new Error('no generated canvas');
  saveDataUrl(dataUrl, path.join(ROOT, 'assets/gallery/circles/generated-01.png'));

  const options = await page.$$eval('#dropper option', (opts) => opts.map((o) => o.value));
  for (let i = 1; i < Math.min(options.length, 3); i++) {
    await page.select('#dropper', options[i]);
    await sleep(800);
    await page.waitForFunction(() => {
      const circ = document.getElementById('circleCounter');
      return circ && Number(circ.textContent) > 20;
    }, { timeout: 60000 });
    await sleep(3500);
    const url = await page.evaluate(() => document.querySelector('#active canvas').toDataURL('image/png'));
    saveDataUrl(url, path.join(ROOT, `assets/gallery/circles/generated-0${i + 1}.png`));
  }
  await page.close();
}

(async () => {
  // Fresh page for flappy with AUTO->CANVAS patch before scripts
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    defaultViewport: { width: 1280, height: 900 },
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ],
  });

  // Better flappy approach: intercept game.js and force type CANVAS
  {
    console.log('\n=== FLAPPY (canvas force) ===');
    const page = await browser.newPage();
    await page.setViewport({ width: 700, height: 900 });
    await page.setRequestInterception(true);
    page.on('request', async (req) => {
      if (req.url().includes('/minis/flappy-bird/game.js')) {
        try {
          const res = await fetch(req.url());
          let body = await res.text();
          body = body.replace('type: Phaser.AUTO', 'type: Phaser.CANVAS');
          await req.respond({
            status: 200,
            contentType: 'application/javascript',
            body,
          });
        } catch (e) {
          await req.continue();
        }
      } else {
        await req.continue();
      }
    });

    await page.goto(`${BASE}/minis/flappy-bird/index.html`, {
      waitUntil: 'load',
      timeout: 90000,
    });
    await page.waitForSelector('#game-container canvas', { timeout: 30000 });
    await sleep(1200);

    const box = await page.$eval('#game-container canvas', (c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 };
    });
    const flap = async () => page.mouse.click(box.x, box.y);

    await flap();
    await sleep(250);
    for (let i = 0; i < 5; i++) {
      await flap();
      await sleep(200);
    }
    // Prefer element screenshot; also try toDataURL for canvas2d
    let used = false;
    try {
      const url = await page.evaluate(() => {
        const c = document.querySelector('#game-container canvas');
        return c ? c.toDataURL('image/png') : null;
      });
      if (url && url.length > 5000) {
        // check not nearly black
        const nonBlack = await page.evaluate(() => {
          const c = document.querySelector('#game-container canvas');
          const ctx = c.getContext('2d');
          if (!ctx) return false;
          const { data } = ctx.getImageData(0, 0, Math.min(c.width, 80), Math.min(c.height, 80));
          let bright = 0;
          for (let i = 0; i < data.length; i += 16) {
            if (data[i] + data[i + 1] + data[i + 2] > 40) bright++;
          }
          return bright > 10;
        });
        console.log('canvas nonBlack sample', nonBlack);
        if (nonBlack) {
          saveDataUrl(url, path.join(ROOT, 'assets/gallery/flappy/play-01.png'));
          used = true;
        }
      }
    } catch (e) {
      console.log('toDataURL failed', e.message);
    }
    if (!used) {
      await screenshotEl(page, '#game-container', path.join(ROOT, 'assets/gallery/flappy/play-01.png'));
    }

    for (let i = 0; i < 10; i++) {
      await flap();
      await sleep(180);
    }
    {
      const url = await page.evaluate(() => document.querySelector('#game-container canvas').toDataURL('image/png'));
      const nonBlack = await page.evaluate(() => {
        const c = document.querySelector('#game-container canvas');
        const ctx = c.getContext('2d');
        if (!ctx) return false;
        const { data } = ctx.getImageData(40, 40, 100, 100);
        let bright = 0;
        for (let i = 0; i < data.length; i += 16) {
          if (data[i] + data[i + 1] + data[i + 2] > 40) bright++;
        }
        return bright > 10;
      });
      if (nonBlack) saveDataUrl(url, path.join(ROOT, 'assets/gallery/flappy/play-02.png'));
      else await screenshotEl(page, '#game-container', path.join(ROOT, 'assets/gallery/flappy/play-02.png'));
    }

    for (let i = 0; i < 12; i++) {
      await flap();
      await sleep(160);
    }
    {
      const url = await page.evaluate(() => document.querySelector('#game-container canvas').toDataURL('image/png'));
      const nonBlack = await page.evaluate(() => {
        const c = document.querySelector('#game-container canvas');
        const ctx = c.getContext('2d');
        if (!ctx) return false;
        const { data } = ctx.getImageData(40, 40, 100, 100);
        let bright = 0;
        for (let i = 0; i < data.length; i += 16) {
          if (data[i] + data[i + 1] + data[i + 2] > 40) bright++;
        }
        return bright > 10;
      });
      if (nonBlack) saveDataUrl(url, path.join(ROOT, 'assets/gallery/flappy/play-03.png'));
      else await screenshotEl(page, '#game-container', path.join(ROOT, 'assets/gallery/flappy/play-03.png'));
    }
    await page.close();
  }

  try {
    await captureCircles(browser);
  } catch (e) {
    console.error('FAIL circles', e.message);
    results.push({ path: 'circles', ok: false, error: e.message });
  }

  await browser.close();
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(ROOT, '.capture-tmp/results-fix.json'), JSON.stringify(results, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
