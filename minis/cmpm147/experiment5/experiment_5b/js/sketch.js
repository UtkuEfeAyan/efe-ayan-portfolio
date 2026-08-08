/* exported preload, setup, draw */
/* global memory, dropper, restart, rate, slider, activeScore, bestScore, fpsCounter */
/* global getInspirations, initDesign, renderDesign, mutateDesign */

let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentCanvas;
let currentInspirationPixels;
let circleCounter;

let mutationThreshold = 100;
let newCirclesPerMutation = 500;
let minCircleSize = 3;
let maxCircleSize = 5;
let maxTotalCircles = 10000;
let minAlphaTransparency = 60;
let maxAlphaTransparency = 180;

function preload() {

  let allInspirations = getInspirations();

  for (let i = 0; i < allInspirations.length; i++) {
    let insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl);
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = insp.name;
    dropper.appendChild(option);
  }
  dropper.onchange = e => inspirationChanged(allInspirations[e.target.value]);
  currentInspiration = allInspirations[0];

  restart.onclick = () =>
    inspirationChanged(allInspirations[dropper.value]);
}

function inspirationChanged(nextInspiration) {
  currentInspiration = nextInspiration;
  currentDesign = undefined;
  memory.innerHTML = "";
  setup();
}



function setup() {
  currentCanvas = createCanvas(width, height);
  currentCanvas.parent(document.getElementById("active"));
  currentScore = Number.NEGATIVE_INFINITY;
  currentDesign = initDesign(currentInspiration);
  bestDesign = currentDesign;
  image(currentInspiration.image, 0,0, width, height);
  loadPixels();
  currentInspirationPixels = pixels;
}

function evaluate() {
  loadPixels();

  let error = 0;
  let n = pixels.length;
  
  for (let i = 0; i < n; i++) {
    error += sq(pixels[i] - currentInspirationPixels[i]);
  }
  return 1/(1+error/n);
}



function memorialize() {
  let url = currentCanvas.canvas.toDataURL();

  let img = document.createElement("img");
  img.classList.add("memory");
  img.src = url;
  img.width = width;
  img.heigh = height;
  img.title = currentScore;

  document.getElementById("best").innerHTML = "";
  document.getElementById("best").appendChild(img.cloneNode());

  img.width = width / 2;
  img.height = height / 2;

  memory.insertBefore(img, memory.firstChild);

  if (memory.childNodes.length > memory.dataset.maxItems) {
    memory.removeChild(memory.lastChild);
  }
}

let mutationCount = 0;

function draw() {
  if (!currentDesign) return;

  randomSeed(mutationCount++);
  let mutatedDesign = JSON.parse(JSON.stringify(bestDesign));
  mutateDesign(mutatedDesign, currentInspiration, slider.value / 100.0);

  renderDesign(mutatedDesign, currentInspiration);
  let nextScore = evaluate();

  if (nextScore > currentScore) {
    currentScore = nextScore;
    bestDesign = mutatedDesign;
    memorialize();
    bestScore.innerHTML = currentScore;
  }

  currentDesign = mutatedDesign;

  // Update display stats
  fpsCounter.innerHTML = Math.round(frameRate());
  circleCounter.textContent = currentDesign.length;
}
  
window.addEventListener('DOMContentLoaded', () => {
  const minAlphaInput = document.getElementById("minAlphaInput");
  const maxAlphaInput = document.getElementById("maxAlphaInput");
  const thresholdInput = document.getElementById("thresholdInput");
  const  newCirclesInput = document.getElementById("newCirclesInput");
  const minRadiusInput = document.getElementById("minRadiusInput");
  const maxRadiusInput = document.getElementById("maxRadiusInput");
  const maxCirclesInput = document.getElementById("maxCirclesInput");
  circleCounter = document.getElementById("circleCounter");
  
  thresholdInput.oninput = () => {
    mutationThreshold = parseInt(thresholdInput.value);
  };
  newCirclesInput.oninput = () => {
    newCirclesPerMutation = parseInt(newCirclesInput.value);
  };
  minRadiusInput.oninput = () => {
    minCircleSize = parseFloat(minRadiusInput.value);
  };
  maxRadiusInput.oninput = () => {
    maxCircleSize = parseFloat(maxRadiusInput.value);
  };
  maxCirclesInput.oninput = () => {
    maxTotalCircles = parseInt(maxCirclesInput.value);
  };
  minAlphaInput.oninput = () => {
    minAlphaTransparency = parseInt(minAlphaInput.value);
  };

  maxAlphaInput.oninput = () => {
    maxAlphaTransparency = parseInt(maxAlphaInput.value);
  };
  window.circleCounter = circleCounter;
  
});


