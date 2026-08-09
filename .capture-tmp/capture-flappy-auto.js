const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = 'C:\\Users\\utkue\\efe-ayan-portfolio';
const BASE = 'http://127.0.0.1:8765';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function saveDataUrl(dataUrl, outPath) {
  const buf = Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
  console.log(`OK ${outPath} (${buf.length} bytes)`);
  return buf.length;
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
    } else await req.continue();
  });

  await page.goto(`${BASE}/minis/flappy-bird/index.html`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForSelector('#game-container canvas', { timeout: 30000 });
  await sleep(800);

  const box = await page.$eval('#game-container canvas', (c) => {
    const r = c.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  async function getState() {
    return page.evaluate(() => {
      const g = Phaser.GAMES && Phaser.GAMES[0];
      if (!g) return null;
      const scene = g.scene.getScenes(true)[0];
      if (!scene) return null;
      const pipes = (scene.pipes || []).map((p) => ({
        x: p.gfx.x,
        topH: p.topH,
        botY: p.botY,
        gap: p.gap,
      }));
      return {
        playing: !!scene.hasStarted,
        over: !!scene.isGameOver,
        score: scene.score || 0,
        birdY: scene.birdY,
        birdV: scene.birdVelocity,
        H: scene.scale.height,
        pipes,
      };
    });
  }

  async function flap() {
    await page.mouse.click(box.x, box.y);
  }

  // Start
  await flap();
  await sleep(150);

  const captures = [];
  const start = Date.now();
  while (Date.now() - start < 25000 && captures.length < 3) {
    const st = await getState();
    if (!st) {
      await sleep(50);
      continue;
    }
    if (st.over) {
      await flap(); // restart
      await sleep(200);
      await flap();
      continue;
    }
    if (!st.playing) {
      await flap();
      await sleep(100);
      continue;
    }

    // Autopilot: aim for center of nearest upcoming pipe gap
    const upcoming = st.pipes
      .filter((p) => p.x + 30 > 120)
      .sort((a, b) => a.x - b.x)[0];
    let targetY = st.H * 0.45;
    if (upcoming) targetY = upcoming.topH + upcoming.gap * 0.5;

    if (st.birdY > targetY + 18 || st.birdV > 180) {
      await flap();
    }

    // Capture distinct moments: approaching pipe, near gap, after some score/time
    const nearPipe = upcoming && upcoming.x < 280 && upcoming.x > 140;
    const midGap = upcoming && upcoming.x < 160 && upcoming.x > 90;
    const want =
      (captures.length === 0 && nearPipe) ||
      (captures.length === 1 && (midGap || st.score >= 1)) ||
      (captures.length === 2 && (st.score >= 1 || (Date.now() - start > 8000 && nearPipe)));

    if (want && !st.over) {
      // avoid capturing game-over overlay
      const url = await page.evaluate(() =>
        document.querySelector('#game-container canvas').toDataURL('image/png')
      );
      const idx = String(captures.length + 1).padStart(2, '0');
      saveDataUrl(url, path.join(ROOT, `assets/gallery/flappy/play-${idx}.png`));
      captures.push({ score: st.score, birdY: st.birdY, pipeX: upcoming && upcoming.x });
      await sleep(400);
    }

    await sleep(40);
  }

  // Fallback fills if needed (bounded)
  let guard = 0;
  while (captures.length < 3 && guard++ < 80) {
    for (let i = 0; i < 20; i++) {
      const st = await getState();
      if (st && st.over) {
        await flap();
        await sleep(200);
      } else if (st && st.birdY > st.H * 0.5) {
        await flap();
      }
      await sleep(50);
    }
    const st = await getState();
    if (st && !st.over && st.playing) {
      const url = await page.evaluate(() =>
        document.querySelector('#game-container canvas').toDataURL('image/png')
      );
      const idx = String(captures.length + 1).padStart(2, '0');
      saveDataUrl(url, path.join(ROOT, `assets/gallery/flappy/play-${idx}.png`));
      captures.push(st);
    } else {
      await flap();
    }
  }

  console.log('captures', captures);
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
