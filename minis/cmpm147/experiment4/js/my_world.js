"use strict";

let player = {
  i: 10,
  j: 10,
  score: 0,
};
let captureLocations = {};
let animalImages = {};
let playerImage;
let treeImages = {};
let activeAnimals = {}; // animalID -> {i, j, level}
let [tw, th] = [p3_tileWidth(), p3_tileHeight()];
let worldSeed;
let gameWon = false;
let scoreSubmitted = false;

let scoreGoal = 10000; // Adjustable win-condition score, see p3_setScoreGoal
const MAX_ACTIVE_ANIMALS = 400; //  others will not move
const LOCAL_SCATTER = 20; // Radius used for respawn scatter around the player
const SPAWN_RADIUS = 18; // Keep topping up animals within this many tiles of the player
const CULL_RADIUS = 40; // Animals farther than this from the player are forgotten
const WORLD_HALF = 1000000; // Effectively unbounded, the world keeps revealing forever
const SAFE_RADIUS = 7; // 5-tile radius nothing around Player
const animals = [
  "chicken",
  "dove",
  "dragon",
  "duck",
  "flamingo",
  "horse",
  "sheep",
  "wasp",
];
const trees = ["tree-1", "tree-2", "tree-3", "tree-4", "grass"];

// Only ~20% of play tiles will have animals
function hasAnimal(i, j) {
  if (Math.abs(i) <= SAFE_RADIUS && Math.abs(j) <= SAFE_RADIUS) return false;
  return (
    isInPlay(i, j) && XXH.h32("hasAnimal:" + i + "," + j, worldSeed) % 10 < 3
  );
}

function getAnimal(i, j) {
  const hash = XXH.h32("animal:" + i + "," + j, worldSeed);
  return animals[hash % animals.length];
}

function getAnimalLevel(i, j) {
  return (XXH.h32("level:" + i + "," + j, worldSeed) % 100) + 1;
}

function isTree(i, j) {
  if (Math.abs(i) <= SAFE_RADIUS / 2 && Math.abs(j) <= SAFE_RADIUS / 2)
    return false;
  return isInPlay(i, j) && XXH.h32("tree:" + i + "," + j, worldSeed) % 3 === 0;
}

function p3_preload() {
  for (let name of animals) {
    animalImages[name] = loadImage(
      "./img/" + name + ".png",
      () => console.log(name + " is loaded"),
      () => console.warn("Missing image for:", name)
    );
  }

  // Load tree images
  for (let tree of trees) {
    treeImages[tree] = loadImage(
      "./img/" + tree + ".png",
      () => console.log(tree + " is loaded"),
      () => console.warn("Missing tree image:", tree)
    );
  }

  // Load hunter image
  playerImage = loadImage(
    "./img/human-red.png",
    () => console.log("Player image loaded"),
    () => console.warn("Missing player image")
  );
}

function p3_setup() {}

function p3_tileWidth() {
  return 32;
}

function p3_tileHeight() {
  return 16;
}

function isOnBoard(i, j) {
  // World expands from center in square rings (Chebyshev distance), forever.
  if (i < -WORLD_HALF || i > WORLD_HALF || j < -WORLD_HALF || j > WORLD_HALF) return false;
  const ring = Math.max(Math.abs(i), Math.abs(j));
  const revealed = Math.floor(millis() / 180);
  return ring <= revealed;
}

function chebyshevDistance(ai, aj, bi, bj) {
  return Math.max(Math.abs(ai - bi), Math.abs(aj - bj));
}

function isInPlay(i, j) {
  return (i + j) % 2 == 0; //  only played on half the board
}

function isOccupiedByOpponent(i, j) {
  if (isInPlay(i, j) && XXH.h32("opponent at " + [i, j], worldSeed) % 3 == 0) {
    if (!captureLocations[[i, j]]) {
      return true;
    }
  } else {
    return false;
  }
}

function p3_tileClicked(i, j) {
  if (isLegalMove(i, j)) {
    let scale = 0.06 * (player.i - i);
    camera_velocity.x = tw * scale;
    camera_velocity.y = th * scale;
    applyMove(i, j);
  }
}

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  randomSeed(worldSeed);
  captureLocations = {};
  player = { i: 0, j: 0, score: 0 };
  camera_offset.x = -width / 2 + 4 * tw;
  camera_offset.y = height / 2 - 2 * th;

  activeAnimals = {}; // reset animals at start!
  gameWon = false;
  scoreSubmitted = false;

  // Animals are topped up continuously around the player (see topUpAnimalsNearPlayer),
  // so the world never runs out no matter how far you wander.
  topUpAnimalsNearPlayer();
}

function p3_setScoreGoal(value) {
  scoreGoal = Math.max(100, Math.floor(value));
}

function p3_getScoreGoal() {
  return scoreGoal;
}

// Keeps a steady population of animals within SPAWN_RADIUS of the player,
// and forgets ones that have drifted far behind so memory/CPU stay bounded
// even during a very long, effectively infinite session.
function topUpAnimalsNearPlayer() {
  for (let i = player.i - SPAWN_RADIUS; i <= player.i + SPAWN_RADIUS; i++) {
    for (let j = player.j - SPAWN_RADIUS; j <= player.j + SPAWN_RADIUS; j++) {
      if (Math.abs(i) <= SAFE_RADIUS && Math.abs(j) <= SAFE_RADIUS) continue;
      if (!isOnBoard(i, j) || !hasAnimal(i, j) || isTree(i, j)) continue;
      const id = i + "," + j;
      if (activeAnimals[id] || captureLocations[id]) continue;
      activeAnimals[id] = {
        i: i,
        j: j,
        type: getAnimal(i, j),
        level: getAnimalLevel(i, j),
      };
    }
  }

  for (let id in activeAnimals) {
    const animal = activeAnimals[id];
    if (chebyshevDistance(animal.i, animal.j, player.i, player.j) > CULL_RADIUS) {
      delete activeAnimals[id];
    }
  }
}

const LEADERBOARD_KEY = "animalWorldLeaderboard";

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLeaderboard(list) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
  } catch (e) {
    // localStorage unavailable, ignore
  }
}

function submitScore(score) {
  if (!score) return;
  const list = loadLeaderboard();
  list.push({ score: score, date: new Date().toISOString() });
  list.sort((a, b) => b.score - a.score);
  saveLeaderboard(list.slice(0, 10));
  renderLeaderboard();
}

function renderLeaderboard() {
  const listEl = document.getElementById("leaderboard-list");
  if (!listEl) return;
  const list = loadLeaderboard();
  listEl.innerHTML = "";
  if (list.length === 0) {
    const li = document.createElement("li");
    li.className = "lb-empty";
    li.textContent = "No scores yet, go hunt something.";
    listEl.appendChild(li);
    return;
  }
  list.forEach((entry, index) => {
    const li = document.createElement("li");
    const date = new Date(entry.date);
    const dateStr = Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
    const rank = document.createElement("span");
    rank.textContent = "#" + (index + 1);
    const scoreSpan = document.createElement("span");
    scoreSpan.textContent = entry.score;
    const dateSpan = document.createElement("span");
    dateSpan.textContent = dateStr;
    li.appendChild(rank);
    li.appendChild(scoreSpan);
    li.appendChild(dateSpan);
    listEl.appendChild(li);
  });
}

function maybeSubmitScore() {
  if ((player.dead || gameWon) && !scoreSubmitted) {
    scoreSubmitted = true;
    submitScore(player.score);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderLeaderboard();
  const clearBtn = document.getElementById("leaderboard-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      saveLeaderboard([]);
      renderLeaderboard();
    });
  }
});

function p3_drawBefore() {
  background(240);
  push();
  translate(-camera_offset.x - tw, camera_offset.y + th * 1.5);
  textSize(18);
  noStroke();
  fill(0);
  applyMatrix(1, th / tw, 0, 1, 0, 0);
  text("Score: " + player.score, 0, 0);
  pop();
}

function moveAnimalsTowardPlayer() {
  if (player.dead) return;

  let count = 0;
  
  for (let id in activeAnimals) {
    if ( count > MAX_ACTIVE_ANIMALS)
      continue;
    let animal = activeAnimals[id];
    if (animal.blowingUp || animal.blowingUpBlue) continue;

    let di = Math.sign(player.i - animal.i);
    let dj = Math.sign(player.j - animal.j);

    let newI = animal.i + di;
    let newJ = animal.j + dj;
    const newId = newI + "," + newJ;

    if (!isTree(newI, newJ) && !activeAnimals[newId]) {
      if (newI === player.i && newJ === player.j) {
        player.dead = true;
      }
      delete activeAnimals[id];
      activeAnimals[newId] = animal;
      animal.i = newI;
      animal.j = newJ;
    }
    count++;
  }
}

function p3_clickKillAnimal(i, j) {
  const id = i + "," + j;
  if (activeAnimals[id]) {
    activeAnimals[id].blowingUpBlue = 20;
    player.score += activeAnimals[id].level;

    // Schedule new animal spawn after 2 seconds, scattered near the player
    // so it always lands somewhere reachable, however far you've wandered.
    setTimeout(() => {
      let newI, newJ, newId;
      let attempts = 0;

      do {
        newI = player.i + Math.floor(random(-LOCAL_SCATTER, LOCAL_SCATTER));
        newJ = player.j + Math.floor(random(-LOCAL_SCATTER, LOCAL_SCATTER));
        newId = newI + "," + newJ;
        attempts++;
      } while (
        (Math.abs(newI) <= SAFE_RADIUS && Math.abs(newJ) <= SAFE_RADIUS) || // too close to player
        activeAnimals[newId] || // already occupied
        isTree(newI, newJ) || // tree present
        (!isInPlay(newI, newJ) && // valid play tile
          attempts < 100)
      );

      if (
        attempts < 100 
      ) {
        activeAnimals[newId] = {
          i: newI,
          j: newJ,
          type: animals[Math.floor(Math.random() * animals.length)],
          level: Math.floor(Math.random() * 100) + 1,
        };
      }
    }, 2000);
  }
}

// Add this at the top with other global variables
let frameCount = 0;
let lastSpawnCheckTime = 0;

function p3_drawTile(i, j) {
  if (!isOnBoard(i, j)) return;

  const id = i + "," + j;

  if (XXH.h32("tile:" + [i, j], worldSeed) % 6 == 0) {
    fill(240, 230, 140); // Darker brown (Chocolate)
  } else {
    fill(255, 250, 205); // Lighter brown (Sandy Brown)
  }

  stroke(200); // light gray-white grid lines
  strokeWeight(1);
  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);

  // --- Draw Tree if any
  if (isTree(i, j)) {
    const treeIndex =
      XXH.h32("treeType:" + i + "," + j, worldSeed) % trees.length;
    const treeName = trees[treeIndex];

    if (treeImages[treeName]) {
      imageMode(CENTER);
      image(treeImages[treeName], 0, 0, tw, th * 1.5);
    } else {
      fill(34, 100, 34);
      ellipse(0, 0, tw * 0.8, th * 0.8);
    }
    return; // No animal or player can appear on tree
  }

  if (activeAnimals[id] && !player.dead) {
    // We draw animals if player is alive
    const animal = activeAnimals[id];

    if (animal.blowingUp) {
      fill(255, 0, 0, 200); // RED explosion
      ellipse(
        0,
        0,
        tw * (2 - animal.blowingUp / 20),
        th * (2 - animal.blowingUp / 20)
      );
      animal.blowingUp--;
      if (animal.blowingUp <= 0) {
        delete activeAnimals[id];
      }
      return;
    }

    if (animal.blowingUpBlue) {
      fill(0, 0, 255, 200); // BLUE explosion
      ellipse(
        0,
        0,
        tw * (2 - animal.blowingUpBlue / 20),
        th * (2 - animal.blowingUpBlue / 20)
      );
      animal.blowingUpBlue--;
      if (animal.blowingUpBlue <= 0) {
        delete activeAnimals[id];
      }
      return;
    }

    if (animalImages && animalImages[animal.type]) {
      imageMode(CENTER);
      image(animalImages[animal.type], 0, 0, tw * 1.2, th * 1.2);
    }

    fill(0);
    textSize(10);
    textAlign(CENTER, CENTER);
    text(animal.level, 0, th * 0.6);
  }

  // --- Draw Player if standing on this tile
  if (player.i === i && player.j === j) {
    if (player.dead) {
      fill(255, 0, 0);
      ellipse(0, 0, tw, th);
    } else if (playerImage) {
      imageMode(CENTER);
      image(playerImage, 0, 0, tw * 1.2, th * 1.2);
    } else {
      fill("#ff3333");
      ellipse(0, 0, 12, 12);
    }

    // --- Score or WIN ---
    noStroke();
    textAlign(CENTER, BOTTOM);

    if (player.score > scoreGoal) {
      if (!gameWon) {
        gameWon = true;
        activeAnimals = {};
        captureLocations = {};
        treeImages = {};
      }

      fill(255, 215, 0);
      textSize(18);
      text("WIN! SCORE: " + player.score, 10, -th * 2.5);
    } else {
      fill(0);
      textSize(12);
      text(player.score, 0, -th * 1.2);
    }
  }
}

function p3_attemptMove(i, j) {
  if (isLegalMove(i, j)) {
    applyMove(i, j);
    moveAnimalsTowardPlayer();
  }
}

function drawMan(sideFill, topFill, altitude) {
  let r = 0.8;
  let manW = tw * r;
  let manH = th * r;
  let offset = 6;

  // draw shadow on the ground
  fill(0, 0, 0, 64);
  ellipse(0, 0, manW, manH);

  // draw man shifted up by altitude
  fill(sideFill);
  rect(-manW / 2, -offset - altitude, manW, offset);
  ellipse(0, -altitude, manW, manH);
  fill(topFill);
  ellipse(0, -offset - altitude, manW, manH);
}

function isLegalMove(i, j) {
  if (!isOnBoard(i, j) || isTree(i, j)) return false;
  if (activeAnimals[i + "," + j]) return false; // can't walk into live animal
  return Math.abs(i - player.i) <= 1 && Math.abs(j - player.j) <= 1;
}

function applyMove(i, j) {
  const id = i + "," + j;

  // Prevent walking onto a tree
  if (isTree(i, j)) {
    return;
  }

  // Check if it's an animal tile
  if (hasAnimal(i, j) && !captureLocations[id]) {
    const animalLevel = getAnimalLevel(i, j);

    if (player.score > scoreGoal + 10) {
      // Too strong, blocked!
      return;
    } else {
      // Defeat and gain score
      player.score += Math.floor(animalLevel / 5); // or another formula
      captureLocations[id] = true;
    }
  }

  // Safe to move
  player.i = i;
  player.j = j;
}

function p3_drawSelectedTile(i, j) {
  if (isLegalMove(i, j)) {
    player.altitude = 10;
  } else {
    player.altitude = 0;
  }
}

function p3_drawAfter() {
  frameCount++;

  if (millis() - lastSpawnCheckTime > 1200) {
    topUpAnimalsNearPlayer();
    lastSpawnCheckTime = millis();
  }

  maybeSubmitScore();
}
