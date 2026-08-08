/* exported getInspirations, initDesign, renderDesign, mutateDesign */

let generationCounter = 0;


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
      credit: "Four-year-old Zo├½ Roth, 2005"
    },
    {
      name: "My Cat 1",
      assetUrl: "assets/cat-1.jpeg",
      credit: "Taken by me / Mr. G├╢lge"
    },
    {
      name: "My Cat 2",
      assetUrl: "assets/cat-2.jpeg",
      credit: "Taken by me / Mr. G├╢lge"
    },
    {
      name: "AI Landscape Art",
      assetUrl: "assets/ai-landscape.jpeg",
      credit: "AI image via Adobe Stock"
    },
    {
      name: "Game Screenshot: Prey",
      assetUrl: "assets/prey-screenshot.jpeg",
      credit: "Steam (Prey ┬⌐ Arkane Studios)"
    }
  ];
}

function initDesign(inspiration) {
  resizeCanvas(inspiration.image.width / 4, inspiration.image.height / 4);
  inspiration.image.loadPixels();

  let design = [];
  for (let i = 0; i < 1000; i++) {
    design.push(randomCircle(inspiration, minCircleSize, maxCircleSize));
  }
  return design;
}

function randomCircle(inspiration, minR, maxR) {
  let x = random(width);
  let y = random(height);
  let ix = Math.floor(x * 4);
  let iy = Math.floor(y * 4);
  ix = constrain(ix, 0, inspiration.image.width - 1);
  iy = constrain(iy, 0, inspiration.image.height - 1);
  let idx = 4 * (iy * inspiration.image.width + ix);
  let imgPixels = inspiration.image.pixels;
  let colorFromImg = [
    imgPixels[idx],
    imgPixels[idx + 1],
    imgPixels[idx + 2],
    Math.floor(random(minAlphaTransparency, maxAlphaTransparency))
  ];
  return {
    x: x,
    y: y,
    r: random(minR, maxR),
    color: colorFromImg
  };
}

function renderDesign(design) {
  background(225);
  noStroke();
  drawLimit = Math.min(maxTotalCircles, design.length);

  for (let i = 0; i < drawLimit; i++) {
    const circle = design[i];
    fill(circle.color[0], circle.color[1], circle.color[2], circle.color[3]);
    ellipse(circle.x, circle.y, circle.r * 2);
  }
}

function mutateDesign(design, inspiration, rate) {
  function mut(num, min, max, rate) {
    return constrain(randomGaussian(num, (rate * (max - min)) / 20), min, max);
  }

  for (let circle of design) {
    circle.x = mut(circle.x, 0, width, rate);
    circle.y = mut(circle.y, 0, height, rate);
    circle.r = mut(circle.r, minCircleSize, maxCircleSize, rate);

    let ix = Math.floor(circle.x * 4);
    let iy = Math.floor(circle.y * 4);
    ix = constrain(ix, 0, inspiration.image.width - 1);
    iy = constrain(iy, 0, inspiration.image.height - 1);
    let idx = 4 * (iy * inspiration.image.width + ix);
    let imgPixels = inspiration.image.pixels;
    
    if (idx + 2 < inspiration.image.pixels.length) {
      circle.color[0] = mut(inspiration.image.pixels[idx], 0, 255, rate);
      circle.color[1] = mut(inspiration.image.pixels[idx + 1], 0, 255, rate);
      circle.color[2] = mut(inspiration.image.pixels[idx + 2], 0, 255, rate);
    }
   
    circle.color[3] = Math.floor(mut(circle.color[3], minAlphaTransparency, maxAlphaTransparency, rate));
  }

  generationCounter++;
  if (generationCounter % mutationThreshold === 0) {
    for (let i = 0; i < newCirclesPerMutation; i++) {
      design.push(randomCircle(inspiration, minCircleSize, maxCircleSize));
    }
  }
}

