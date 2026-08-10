/* exported getInspirations, initDesign, renderDesign, mutateDesign */

let generationCounter = 0;

const HARD_MAX_CIRCLES = 30000;
const MUTATE_PER_FRAME = 320;

function getInspirations() {
  return [
    {
      name: "Lunch atop a Skyscraper",
      assetUrl: "assets/lunch-on-a-skyscraper.jpg",
      credit: "Lunch atop a Skyscraper, Charles Clyde Ebbets, 1932"
    },
    {
      name: "Train Wreck",
      assetUrl: "assets/train-wreck.jpg",
      credit: "Train Wreck At Monteparnasse, Levy & fils, 1895"
    },
    {
      name: "Migrant mother",
      assetUrl: "assets/migrant-mother.jpg",
      credit: "Migrant Mother near Nipomo, California, Dorothea Lange, 1936"
    },
    {
      name: "Disaster Girl",
      assetUrl: "assets/girl-with-fire.jpg",
      credit: "Four-year-old Zoë Roth, 2005"
    },
    {
      name: "My Cat 1",
      assetUrl: "assets/cat-1.jpeg",
      credit: "Taken by me / Mr. Gölge"
    },
    {
      name: "My Cat 2",
      assetUrl: "assets/cat-2.jpeg",
      credit: "Taken by me / Mr. Gölge"
    },
    {
      name: "AI Landscape Art",
      assetUrl: "assets/ai-landscape.jpeg",
      credit: "AI image via Adobe Stock"
    },
    {
      name: "Game Screenshot: Prey",
      assetUrl: "assets/prey-screenshot.jpeg",
      credit: "Steam (Prey © Arkane Studios)"
    }
  ];
}

function computeCanvasSize(img) {
  const stage = document.querySelector(".circle-stage");
  const stageW = stage && stage.clientWidth ? stage.clientWidth : 620;
  const availW = Math.max(280, Math.min(620, stageW - 32));
  // Two stacked panels, keep each image large enough to read as a picture
  const availH = Math.max(180, Math.min(340, (window.innerHeight - 200) / 2.15));
  const iw = Math.max(1, img.width || 1);
  const ih = Math.max(1, img.height || 1);
  const scale = Math.min(availW / iw, availH / ih);
  return {
    w: Math.max(160, Math.round(iw * scale)),
    h: Math.max(120, Math.round(ih * scale))
  };
}

function initDesign(inspiration) {
  const { w, h } = computeCanvasSize(inspiration.image);
  resizeCanvas(w, h);
  inspiration.image.loadPixels();
  inspiration.sampleSX = inspiration.image.width / w;
  inspiration.sampleSY = inspiration.image.height / h;

  generationCounter = 0;
  const design = [];
  const seedCount = Math.min(1000, Math.max(100, maxTotalCircles));
  for (let i = 0; i < seedCount; i++) {
    // Start clustered in the middle, then widen a bit as more seeds spawn
    const spread = 0.12 + (i / seedCount) * 0.28;
    design.push(randomCircle(inspiration, minCircleSize, maxCircleSize, spread));
  }
  return design;
}

function sampleInspirationColor(inspiration, x, y, alpha) {
  const ix = constrain(Math.floor(x * inspiration.sampleSX), 0, inspiration.image.width - 1);
  const iy = constrain(Math.floor(y * inspiration.sampleSY), 0, inspiration.image.height - 1);
  const idx = 4 * (iy * inspiration.image.width + ix);
  const px = inspiration.image.pixels;
  return [px[idx], px[idx + 1], px[idx + 2], alpha];
}

function randomCircle(inspiration, minR, maxR, spread = 0.45) {
  const x = constrain(randomGaussian(width / 2, width * spread), 0, width);
  const y = constrain(randomGaussian(height / 2, height * spread), 0, height);
  const alpha = Math.floor(random(minAlphaTransparency, maxAlphaTransparency));
  return {
    x,
    y,
    r: random(minR, maxR),
    color: sampleInspirationColor(inspiration, x, y, alpha)
  };
}

function renderDesign(design) {
  background(32);
  noStroke();
  const ctx = drawingContext;
  const limit = Math.min(maxTotalCircles, design.length);

  for (let i = 0; i < limit; i++) {
    const c = design[i];
    const a = c.color[3] / 255;
    ctx.beginPath();
    ctx.fillStyle = `rgba(${c.color[0]|0},${c.color[1]|0},${c.color[2]|0},${a})`;
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function mutateDesign(design, inspiration, rate) {
  function mut(num, min, max, r) {
    return constrain(randomGaussian(num, (r * (max - min)) / 20), min, max);
  }

  const n = design.length;
  if (n === 0) return { undos: [], added: 0 };

  const batch = Math.min(n, MUTATE_PER_FRAME + Math.floor(n * 0.01));
  const undos = new Array(batch);

  for (let k = 0; k < batch; k++) {
    const idx = Math.floor(random(n));
    const circle = design[idx];
    undos[k] = {
      idx,
      x: circle.x,
      y: circle.y,
      r: circle.r,
      color: [circle.color[0], circle.color[1], circle.color[2], circle.color[3]]
    };

    circle.x = mut(circle.x, 0, width, rate);
    circle.y = mut(circle.y, 0, height, rate);
    circle.r = mut(circle.r, minCircleSize, maxCircleSize, rate);

    const base = sampleInspirationColor(inspiration, circle.x, circle.y, circle.color[3]);
    circle.color[0] = mut(base[0], 0, 255, rate);
    circle.color[1] = mut(base[1], 0, 255, rate);
    circle.color[2] = mut(base[2], 0, 255, rate);
    circle.color[3] = Math.floor(mut(circle.color[3], minAlphaTransparency, maxAlphaTransparency, rate));
  }

  let added = 0;
  generationCounter++;
  if (generationCounter % mutationThreshold === 0) {
    const room = Math.min(HARD_MAX_CIRCLES, maxTotalCircles) - design.length;
    const toAdd = Math.min(newCirclesPerMutation, Math.max(0, room));
    for (let i = 0; i < toAdd; i++) {
      // Wider spread as the painting grows
      design.push(randomCircle(inspiration, minCircleSize, maxCircleSize, 0.42));
    }
    added = toAdd;
  }

  return { undos, added };
}

function revertMutation(design, undoInfo) {
  if (!undoInfo) return;
  if (undoInfo.added > 0) {
    design.length = Math.max(0, design.length - undoInfo.added);
  }
  for (let i = 0; i < undoInfo.undos.length; i++) {
    const u = undoInfo.undos[i];
    if (u.idx >= design.length) continue;
    const circle = design[u.idx];
    circle.x = u.x;
    circle.y = u.y;
    circle.r = u.r;
    circle.color[0] = u.color[0];
    circle.color[1] = u.color[1];
    circle.color[2] = u.color[2];
    circle.color[3] = u.color[3];
  }
}
