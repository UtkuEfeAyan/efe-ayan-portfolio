/* exported preload, setup, draw */
/* global memory, dropper, restart, rate, slider, activeScore, bestScore, fpsCounter */
/* global getInspirations, initDesign, renderDesign, mutateDesign, revertMutation */

let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentCanvas;
let currentInspirationPixels;
let circleCounter;

let mutationThreshold = 10;
let newCirclesPerMutation = 1000;
let minCircleSize = 3;
let maxCircleSize = 8;
let maxTotalCircles = 20000;
let minAlphaTransparency = 60;
let maxAlphaTransparency = 180;

let lastMemoMs = 0;
let mutationCount = 0;

function preload() {
  const allInspirations = getInspirations();

  for (let i = 0; i < allInspirations.length; i++) {
    const insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl);
    const option = document.createElement("option");
    option.value = i;
    option.innerHTML = insp.name;
    dropper.appendChild(option);
  }
  dropper.onchange = (e) => inspirationChanged(allInspirations[e.target.value]);
  currentInspiration = allInspirations[0];

  restart.onclick = () => inspirationChanged(allInspirations[dropper.value]);
}

function inspirationChanged(nextInspiration) {
  currentInspiration = nextInspiration;
  currentDesign = undefined;
  memory.innerHTML = "";
  setup();
}

function updateReferencePanel() {
  const host = document.getElementById("reference");
  if (!host || !currentInspiration || !currentInspiration.image) return;
  host.innerHTML = "";
  const img = document.createElement("img");
  img.className = "reference-img";
  img.alt = currentInspiration.name + " — original";
  img.src = currentInspiration.assetUrl;
  host.appendChild(img);
}

function captureInspirationPixels() {
  image(currentInspiration.image, 0, 0, width, height);
  loadPixels();
  currentInspirationPixels = new Uint8ClampedArray(pixels);
}

function setup() {
  const activeEl = document.getElementById("active");
  if (activeEl) activeEl.innerHTML = "";
  pixelDensity(1);
  currentCanvas = createCanvas(320, 240);
  currentCanvas.parent(activeEl);
  currentScore = Number.NEGATIVE_INFINITY;
  currentDesign = initDesign(currentInspiration);
  bestDesign = currentDesign;
  currentCanvas.canvas.style.width = '100%';
  currentCanvas.canvas.style.height = 'auto';
  captureInspirationPixels();
  updateReferencePanel();
  background(32);
  renderDesign(currentDesign);
}

function evaluate() {
  loadPixels();
  let error = 0;
  let count = 0;
  // Subsample (~1/4 of channels) — enough signal, much cheaper at large canvases
  const stride = 16;
  const n = pixels.length;
  for (let i = 0; i < n; i += stride) {
    const d = pixels[i] - currentInspirationPixels[i];
    error += d * d;
    count++;
  }
  return 1 / (1 + error / count);
}

function memorialize() {
  const url = currentCanvas.canvas.toDataURL();
  const img = document.createElement("img");
  img.classList.add("memory");
  img.src = url;
  img.width = Math.min(120, width);
  img.height = Math.round(img.width * (height / width));
  img.title = String(currentScore);

  document.getElementById("best").innerHTML = "";
  document.getElementById("best").appendChild(img.cloneNode());

  memory.insertBefore(img, memory.firstChild);
  if (memory.childNodes.length > memory.dataset.maxItems) {
    memory.removeChild(memory.lastChild);
  }
}

function draw() {
  if (!currentDesign) return;

  randomSeed(mutationCount++);
  const rateValue = (typeof slider !== "undefined" ? slider.value : 100) / 100.0;
  const undoInfo = mutateDesign(bestDesign, currentInspiration, rateValue);

  renderDesign(bestDesign);
  const nextScore = evaluate();

  if (nextScore > currentScore) {
    currentScore = nextScore;
    currentDesign = bestDesign;
    bestScore.innerHTML = currentScore.toPrecision(6);
    if (typeof activeScore !== "undefined" && activeScore) {
      activeScore.innerHTML = currentScore.toPrecision(6);
    }
    const now = millis();
    if (now - lastMemoMs > 450) {
      memorialize();
      lastMemoMs = now;
    }
  } else {
    revertMutation(bestDesign, undoInfo);
  }

  fpsCounter.innerHTML = Math.round(frameRate());
  if (circleCounter) {
    circleCounter.textContent = String(Math.min(bestDesign.length, maxTotalCircles));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const minAlphaInput = document.getElementById("minAlphaInput");
  const maxAlphaInput = document.getElementById("maxAlphaInput");
  const thresholdInput = document.getElementById("thresholdInput");
  const newCirclesInput = document.getElementById("newCirclesInput");
  const minRadiusInput = document.getElementById("minRadiusInput");
  const maxRadiusInput = document.getElementById("maxRadiusInput");
  const maxCirclesInput = document.getElementById("maxCirclesInput");
  circleCounter = document.getElementById("circleCounter");

  const syncRate = () => {
    if (typeof rate !== "undefined" && rate && typeof slider !== "undefined") {
      rate.textContent = slider.value;
    }
  };
  syncRate();
  if (typeof slider !== "undefined" && slider) {
    slider.oninput = syncRate;
  }

  thresholdInput.oninput = () => {
    mutationThreshold = Math.max(1, parseInt(thresholdInput.value, 10) || 1);
  };
  newCirclesInput.oninput = () => {
    newCirclesPerMutation = Math.max(0, parseInt(newCirclesInput.value, 10) || 0);
  };
  minRadiusInput.oninput = () => {
    minCircleSize = Math.max(0.5, parseFloat(minRadiusInput.value) || 1);
  };
  maxRadiusInput.oninput = () => {
    maxCircleSize = Math.max(minCircleSize, parseFloat(maxRadiusInput.value) || minCircleSize);
  };
  maxCirclesInput.oninput = () => {
    maxTotalCircles = Math.min(
      typeof HARD_MAX_CIRCLES !== "undefined" ? HARD_MAX_CIRCLES : 30000,
      Math.max(100, parseInt(maxCirclesInput.value, 10) || 100)
    );
    maxCirclesInput.value = maxTotalCircles;
  };
  minAlphaInput.oninput = () => {
    minAlphaTransparency = Math.max(0, Math.min(255, parseInt(minAlphaInput.value, 10) || 0));
  };
  maxAlphaInput.oninput = () => {
    maxAlphaTransparency = Math.max(0, Math.min(255, parseInt(maxAlphaInput.value, 10) || 255));
  };
});
