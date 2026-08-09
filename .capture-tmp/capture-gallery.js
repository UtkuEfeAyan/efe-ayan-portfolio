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
  return buf.length;
}

async function saveCanvas(page, selector, outPath) {
  const dataUrl = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    if (el.tagName === 'CANVAS') return el.toDataURL('image/png');
    const c = el.querySelector('canvas');
    return c ? c.toDataURL('image/png') : null;
  }, selector);
  if (!dataUrl) throw new Error(`No canvas for ${selector}`);
  return saveDataUrl(dataUrl, outPath);
}

async function waitCanvas(page, selector, timeout = 20000) {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const c = el.tagName === 'CANVAS' ? el : el.querySelector('canvas');
      return !!(c && c.width > 0 && c.height > 0);
    },
    { timeout },
    selector
  );
}

async function screenshotPage(page, outPath) {
  ensureDir(outPath);
  await page.screenshot({ path: outPath, type: 'png', fullPage: false });
  const st = fs.statSync(outPath);
  results.push({ path: outPath, bytes: st.size, ok: true });
  console.log(`OK ${outPath} (${st.size} bytes)`);
}

async function captureFlappy(page) {
  console.log('\n=== FLAPPY ===');
  await page.goto(`${BASE}/minis/flappy-bird/index.html`, { waitUntil: 'networkidle2', timeout: 60000 });
  await waitCanvas(page, 'canvas');
  await sleep(800);

  // Click to start + flap periodically
  const box = await page.$eval('canvas', (c) => {
    const r = c.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  });

  async function flap() {
    await page.mouse.click(box.x, box.y);
  }

  await flap(); // start
  await sleep(400);
  await flap();
  await sleep(500);
  await flap();
  await sleep(350);
  await saveCanvas(page, 'canvas', path.join(ROOT, 'assets/gallery/flappy/play-01.png'));

  // Keep flapping for more moments
  for (let i = 0; i < 6; i++) {
    await flap();
    await sleep(280);
  }
  await saveCanvas(page, 'canvas', path.join(ROOT, 'assets/gallery/flappy/play-02.png'));

  for (let i = 0; i < 8; i++) {
    await flap();
    await sleep(250);
  }
  await saveCanvas(page, 'canvas', path.join(ROOT, 'assets/gallery/flappy/play-03.png'));
}

async function captureAnimal(page) {
  console.log('\n=== ANIMAL WORLD ===');
  await page.goto(`${BASE}/minis/cmpm147/experiment4/index.html`, { waitUntil: 'networkidle2', timeout: 60000 });
  await waitCanvas(page, '#container canvas, canvas');
  await sleep(2500);
  await saveCanvas(page, '#container canvas, canvas', path.join(ROOT, 'assets/gallery/animal-world/play-01.png'));
  await sleep(2500);
  await saveCanvas(page, '#container canvas, canvas', path.join(ROOT, 'assets/gallery/animal-world/play-02.png'));
  await sleep(3000);
  await saveCanvas(page, '#container canvas, canvas', path.join(ROOT, 'assets/gallery/animal-world/play-03.png'));
}

async function captureTileset(page) {
  console.log('\n=== TILESET ===');
  await page.goto(`${BASE}/minis/cmpm147/experiment3/index.html`, { waitUntil: 'networkidle2', timeout: 60000 });
  await waitCanvas(page, '#canvasContainer canvas, canvas');
  await sleep(1500);
  await saveCanvas(page, '#canvasContainer canvas, canvas', path.join(ROOT, 'assets/gallery/tileset/map-02.png'));
  const refresh = await page.$('#refresh-button');
  if (refresh) {
    await refresh.click();
    await sleep(1800);
  } else {
    await page.evaluate(() => {
      const b = document.getElementById('refresh-button');
      if (b) b.click();
    });
    await sleep(1800);
  }
  await saveCanvas(page, '#canvasContainer canvas, canvas', path.join(ROOT, 'assets/gallery/tileset/map-03.png'));
}

async function captureVoices(page) {
  console.log('\n=== VOICES ===');
  await page.goto(`${BASE}/toys/voices-of-void/index.html`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('#app', { timeout: 20000 });
  await sleep(800);
  await page.setViewport({ width: 1400, height: 900 });
  await screenshotPage(page, path.join(ROOT, 'assets/gallery/voices/ui-01.png'));

  // Pick first preset button if present, then generate
  await page.waitForSelector('#preset-buttons button, #send-to-generator', { timeout: 10000 });
  const presetButtons = await page.$$('#preset-buttons button');
  if (presetButtons.length > 0) {
    await presetButtons[0].click();
    await sleep(300);
  }
  await page.click('#send-to-generator');
  await sleep(800);
  // Focus right panel content
  await page.evaluate(() => {
    const el = document.querySelector('.right-panel') || document.querySelector('#app');
    if (el) el.scrollIntoView({ block: 'start' });
  });
  await screenshotPage(page, path.join(ROOT, 'assets/gallery/voices/lang-01.png'));

  // Different preset
  if (presetButtons.length > 1) {
    await presetButtons[1].click();
  } else if (presetButtons.length > 0) {
    await presetButtons[0].click();
  }
  await sleep(300);
  await page.click('#send-to-generator');
  await sleep(500);
  const reroll = await page.$('#reroll-sentences');
  if (reroll) await reroll.click();
  await sleep(600);
  await screenshotPage(page, path.join(ROOT, 'assets/gallery/voices/lang-02.png'));
}

async function captureCircles(page) {
  console.log('\n=== CIRCLES ===');
  await page.goto(`${BASE}/minis/cmpm147/experiment5/experiment_5b/index.html`, {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });
  await page.waitForSelector('#active canvas', { timeout: 30000 });
  await page.waitForSelector('#reference img, #reference canvas', { timeout: 30000 });
  // Wait until FPS updates and some circles exist
  await page.waitForFunction(
    () => {
      const fps = document.getElementById('fpsCounter');
      const circ = document.getElementById('circleCounter');
      const fpsOk = fps && fps.textContent && fps.textContent !== '—' && Number(fps.textContent) > 0;
      const circOk = circ && Number(circ.textContent) > 50;
      return fpsOk && circOk;
    },
    { timeout: 60000 }
  );
  await sleep(2000);
  await saveCanvas(page, '#active canvas', path.join(ROOT, 'assets/gallery/circles/generated-01.png'));

  // Try other inspirations
  const options = await page.$$eval('#dropper option', (opts) => opts.map((o) => o.value));
  for (let i = 1; i < Math.min(options.length, 3); i++) {
    await page.select('#dropper', options[i]);
    await sleep(500);
    await page.waitForFunction(
      () => {
        const circ = document.getElementById('circleCounter');
        return circ && Number(circ.textContent) > 30;
      },
      { timeout: 45000 }
    );
    await sleep(2500);
    const name = `generated-0${i + 1}.png`;
    await saveCanvas(page, '#active canvas', path.join(ROOT, 'assets/gallery/circles', name));
  }
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-gpu', '--allow-insecure-localhost'],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);

  const jobs = [
    ['flappy', captureFlappy],
    ['animal', captureAnimal],
    ['tileset', captureTileset],
    ['voices', captureVoices],
    ['circles', captureCircles],
  ];

  for (const [name, fn] of jobs) {
    try {
      await fn(page);
    } catch (err) {
      console.error(`FAIL ${name}:`, err.message);
      results.push({ path: name, ok: false, error: err.message });
    }
  }

  await browser.close();
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(ROOT, '.capture-tmp/results.json'), JSON.stringify(results, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
