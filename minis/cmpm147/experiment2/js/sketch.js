// sketch.js - purpose and description here
// Author: Utku Efe Ayan
// Date:

// let seed = 239;

// const grassColor = "#74740d";
// const skyColor = "#69ade4";
// const stoneColor = "#858290";
// const treeColor = "#33330b";

function setup() {
  createCanvas(400, 200);
  createButton("reimagine").mousePressed(() => seed++);
}


const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isNight = true;

const snowflakes = [];
const birds = [];
const trees = [];
const clouds = [];
const dolphins = [];

function initScene() {
  createTrees(30);
  createBirds(5);
  createSnow(150);
  createClouds(3);
  createDolphins(2);
  canvas.addEventListener('click', () => isNight = !isNight);
  animate();
}

function createSnow(count) {
  for (let i = 0; i < count; i++) {
    snowflakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      speed: Math.random() * 1 + 0.5,
    });
  }
}

function drawSnow() {
  ctx.fillStyle = "white";
  snowflakes.forEach(flake => {
    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fill();
    flake.y += flake.speed;
    if (flake.y > canvas.height) {
      flake.y = 0;
      flake.x = Math.random() * canvas.width;
    }
  });
}

function createTrees(count) {
  for (let i = 0; i < count; i++) {
    trees.push({
      x: Math.random() * canvas.width,
      height: Math.random() * 40 + 80,
      snow: Math.random() > 0.5
    });
  }
}

function drawTrees() {
  trees.forEach(tree => {
    let x = tree.x;
    let y = canvas.height - 300 - tree.height;
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(x, y + tree.height, 10, 30);

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x - 25 + 5 * i, y + tree.height - 10 * i);
      ctx.lineTo(x + 35 - 5 * i, y + tree.height - 10 * i);
      ctx.lineTo(x + 5, y + tree.height - 40 - 10 * i);
      ctx.fillStyle = "#1e5626";
      ctx.fill();

      if (tree.snow) {
        ctx.beginPath();
        ctx.arc(x + 5, y + tree.height - 40 - 10 * i, 15, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
      }
    }
  });
}

function createBirds(count) {
  for (let i = 0; i < count; i++) {
    birds.push({
      x: Math.random() * canvas.width,
      y: Math.random() * 200 + 30,
      speed: Math.random() * 1 + 1.5,
    });
  }
}

function drawBirds() {
  birds.forEach(bird => {
    const wingSpan = 20;
    const bodyLength = 16;
    const bodyHeight = 8;

    // Body
    ctx.beginPath();
    ctx.ellipse(bird.x, bird.y, bodyLength, bodyHeight, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#444";
    ctx.fill();

    // Wings (top and bottom arc)
    ctx.beginPath();
    ctx.moveTo(bird.x - 10, bird.y);
    ctx.quadraticCurveTo(bird.x, bird.y - 15, bird.x + 10, bird.y);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bird.x - 10, bird.y);
    ctx.quadraticCurveTo(bird.x, bird.y + 15, bird.x + 10, bird.y);
    ctx.stroke();

    // Beak
    ctx.beginPath();
    ctx.moveTo(bird.x + bodyLength, bird.y);
    ctx.lineTo(bird.x + bodyLength + 5, bird.y - 2);
    ctx.lineTo(bird.x + bodyLength + 5, bird.y + 2);
    ctx.closePath();
    ctx.fillStyle = "orange";
    ctx.fill();

    bird.x += bird.speed;
    if (bird.x > canvas.width + 40) bird.x = -40;


    bird.x += bird.speed;
    if (bird.x > canvas.width) bird.x = -30;
  });
}

function createClouds(count) {
  for (let i = 0; i < count; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: Math.random() * 100 + 20,
      speed: 0.2 + Math.random() * 0.3
    });
  }
}

function drawClouds() {
  clouds.forEach(cloud => {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, 30, 0, Math.PI * 2);
    ctx.arc(cloud.x + 40, cloud.y + 10, 25, 0, Math.PI * 2);
    ctx.arc(cloud.x + 80, cloud.y, 30, 0, Math.PI * 2);
    ctx.fill();

    cloud.x += cloud.speed;
    if (cloud.x > canvas.width + 100) cloud.x = -100;
  });
}

function drawFrozenLake() {
  ctx.fillStyle = "#99ccff";
  ctx.fillRect(0, canvas.height - 200, canvas.width, 200);
  ctx.strokeStyle = "white";
  ctx.strokeRect(0, canvas.height - 200, canvas.width, 200);
}

function drawLand() {
  ctx.fillStyle = "#b58b57";
  ctx.fillRect(0, canvas.height - 500, canvas.width, 300);

}

function drawSun() {
  if (!isNight) {
    ctx.beginPath();
    ctx.arc(100, 100, 50, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD700";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawMoon() {
  if (isNight) {
    ctx.beginPath();
    ctx.arc(canvas.width - 120, 100, 40, 0, Math.PI * 2);
    ctx.fillStyle = "#aaa";
    ctx.shadowColor = "#fdfd96";
    ctx.shadowBlur = 25;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawSky() {
  ctx.fillStyle = isNight ? "#001d3d" : "#dbe9f4";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawHouseAndPath() {
    const baseY = canvas.height - 500;
    ctx.fillStyle = "#8b0000";
    ctx.fillRect(100, baseY - 60, 80, 60);
    ctx.fillStyle = "#654321";
    ctx.beginPath();
    ctx.moveTo(90, baseY - 60);
    ctx.lineTo(140, baseY - 100);
    ctx.lineTo(190, baseY - 60);
    ctx.fill();
  
    // Draw door on house
    ctx.fillStyle = "#3b2f2f";
    ctx.fillRect(135, baseY - 15, 10, 15);
  
    // Snake-like path from door to lake
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(140, baseY);
    ctx.bezierCurveTo(160, baseY + 100, 100, baseY + 200, 140, canvas.height - 200);
    ctx.stroke();

  
    // Draw boat directly on lake in front of path
    ctx.fillStyle = "#3e3e3e";
    ctx.beginPath();
    const boatX = 140;
    const boatY = canvas.height - 200 + 20; // 20px above lake bottom
    ctx.moveTo(boatX - 20, boatY);
    ctx.lineTo(boatX + 20, boatY);
    ctx.lineTo(boatX + 10, boatY - 15);
    ctx.lineTo(boatX - 10, boatY - 15);
    ctx.closePath();
    ctx.fill();

    drawClassicSailboat(boatX, boatY);
    
  }

  function createDolphins(count) {
    for (let i = 0; i < count; i++) {
      dolphins.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 120,
        speed: 1 + Math.random(),
        direction: Math.random() > 0.5 ? -1 : 1,
        jumpHeight: 0,
        jumpingUp: true
      });
    }
  }
  
  
  function drawDolphins() {
    ctx.fillStyle = "#4682B4";
    dolphins.forEach(d => {
      // Jump logic
      if (d.jumpingUp) {
        d.jumpHeight += 0.5;
        if (d.jumpHeight >= 15) d.jumpingUp = false;
      } else {
        d.jumpHeight -= 0.5;
        if (d.jumpHeight <= 0) d.jumpingUp = true;
      }
      const jumpY = d.y - d.jumpHeight;
  
      // Body
      ctx.beginPath();
      ctx.ellipse(d.x, jumpY, 30, 15, 0, 0, Math.PI * 2);
      ctx.fill();
  
      // Fin
      ctx.beginPath();
      ctx.moveTo(d.x + d.direction * 30, jumpY);
      ctx.lineTo(d.x + d.direction * 40, jumpY - 10);
      ctx.lineTo(d.x + d.direction * 40, jumpY + 10);
      ctx.closePath();
      ctx.fill();
  
      // Eye
      ctx.beginPath();
      ctx.arc(d.x + 10 * d.direction, jumpY - 5, 2, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();
  
      // Splash when turning
      if (d.x > canvas.width + 40 || d.x < -40) {
        ctx.fillStyle = "#add8e6";
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(d.x, canvas.height - 180 - i * 5, 2 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
  
      d.x += d.speed * d.direction;
      if (d.x > canvas.width + 40 || d.x < -40) {
        d.direction *= -1;
      }
    });
  }

  function drawClassicSailboat(x, y) {
    // Hull
    ctx.fillStyle = "#3e3e3e";
    ctx.beginPath();
    ctx.moveTo(x - 30, y);
    ctx.lineTo(x + 30, y);
    ctx.lineTo(x + 20, y - 15);
    ctx.lineTo(x - 20, y - 15);
    ctx.closePath();
    ctx.fill();
  
    // Mast
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(x - 2, y - 50, 4, 35);
  
    // Sail
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(x, y - 50);
    ctx.lineTo(x + 25, y - 20);
    ctx.lineTo(x, y - 20);
    ctx.closePath();
    ctx.fill();
  }

  function drawHills() {
    const hillCount = 5;
    const hillColors = ["#91c483", "#6aa84f", "#4a7c27"];
    for (let i = 0; i < hillCount; i++) {
      const hillX = i * (canvas.width / hillCount);
      const hillWidth = canvas.width / hillCount + 100;
      const hillHeight = 100 + Math.random() * 100;
      const hillY = canvas.height - 500;
  
      ctx.beginPath();
      ctx.moveTo(hillX, hillY);
      ctx.quadraticCurveTo(
        hillX + hillWidth / 2,
        hillY - hillHeight,
        hillX + hillWidth,
        hillY
      );
      ctx.lineTo(hillX + hillWidth, canvas.height);
      ctx.lineTo(hillX, canvas.height);
      ctx.closePath();
      ctx.fillStyle = hillColors[i % hillColors.length];
      ctx.fill();
    }
  }
  
  drawHills();
function animate() {
  drawSky();
  drawSun();
  drawMoon();
  drawClouds();
  drawLand();

  drawFrozenLake();
  drawHouseAndPath();
  drawTrees();
  drawBirds();
  drawSnow();
  drawDolphins();
  requestAnimationFrame(animate);
}

initScene();

