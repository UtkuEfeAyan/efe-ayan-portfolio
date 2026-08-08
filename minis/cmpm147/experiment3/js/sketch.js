/// sketch.js - purpose and description here
// Author: Utku Efe Ayan
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

let items = 0;
let tilesetImage;
let currentGrid = [];
let numRows, numCols;

// Setup for all general parameters
function setup() {
  numCols = select("#canvasContainer").attribute("rows") | 40;
  numRows = select("#canvasContainer").attribute("cols") | 40;

  document
    .getElementById("fullscreen-button")
    .addEventListener("click", toggleFullscreen);

  createCanvas(16 * numCols, 16 * numRows).parent("canvasContainer");
  select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

  select("#refresh-button").mousePressed(refresh);
  select("#string-container").input(reparseGrid);

  refresh();
}

function gridToString(grid) {
  let rows = [];
  for (let i = 0; i < grid.length; i++) {
    rows.push(grid[i].join(""));
  }
  return rows.join("\n");
}

function stringToGrid(str) {
  let grid = [];
  let lines = str.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let trimmed = lines[i].trim();
    if (trimmed === "" || trimmed.startsWith("---")) continue;
    grid.push(trimmed.split(""));
  }
  return grid;
}

function preload() {
  tilesetImage = loadImage("./img/tilesetP8.png");
}

function refresh() {
  items = (items | 0) + 1109;
  randomSeed(items);
  noiseSeed(items);
  regenerateGrid();
}

function regenerateGrid() {
  select("#canvasContainer").value(
    gridToString(generateGrid(numCols, numRows))
  );
  reparseGrid();
}

function reparseGrid() {
  currentGrid = stringToGrid(select("#canvasContainer").value());
}

function draw() {
  randomSeed(items);
  drawGrid(currentGrid);
}

function placeTile(i, j, ti, tj) {
  image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
}

function generateGrid(numCols, numRows) {
  let grid = [];
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      row.push("~");
    }
    grid.push(row);
  }

  const numIslands = floor(random((numRows + numCols) / 10)) + 1;
  select("#num_of_islands").html("Number of islands: " + numIslands);

  for (let n = 0; n < numIslands; n++) {
    const height = floor(random(43 - numIslands)) + 3;
    const width = floor(random(43 - numIslands)) + 3;
    const hStart = floor(random(numRows - height));
    const wStart = floor(random(numCols - width));

    const tileKeys = floor(random(6));
    console.log(tileKeys);

    // Background is water.
    for (let i = hStart; i < hStart + height; i++) {
      for (let j = wStart; j < wStart + width; j++) {
        switch (tileKeys) {
          case 0:
            grid[i][j] = "~"; // Grass
            break;
          case 1:
            grid[i][j] = "."; // Brown Sand
            break;
          case 2:
            grid[i][j] = "#"; // Dark Green
            break;
          case 3:
            grid[i][j] = "o"; // Black Rock
            break;
          case 4:
            grid[i][j] = "*"; // Snow
            break;
          case 5:
            grid[i][j] = "?"; // Red Rock
        }
      }
    }
  }
  displayTileMapInTextArea(grid);
  return grid;
}

function drawGrid(grid) {
  background(128);

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const char = grid[i][j];
      const code = gridCode(grid, i, j, char);

      const tileMap = {
        "~": [0, 0],
        ".": [0, 3],
        "#": [0, 6],
        o: [0, 9],
        "*": [0, 12],
        "?": [0, 15],
      };

      const contextMap = {
        "~": [9, 0],
        ".": [9, 3],
        "#": [9, 6],
        o: [9, 9],
        "*": [9, 12],
        "?": [9, 15],
      };

      if (tileMap[char]) {
        if (code < 15) {
          drawContext(
            grid,
            i,
            j,
            char,
            contextMap[char][0],
            contextMap[char][1]
          );
        } else {
          placeTile(i, j, floor(random(4)), tileMap[char][1]);
        }
      }
    }
  }

  const floorTiles = ["~", ".", "#", "o", "*", "?"];
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (floorTiles.includes(grid[i][j])) {
        if (gridCode(grid, i, j, grid[i][j]) >= 15) {
          if (random(10) > 9) {
            placeTile(i, j, floor(random(2)) + 26, floor(random(4)));
          }
        }
      }
    }
  }
}

function gridCheck(grid, i, j, target) {
  return grid[i][j] == target;
}

function gridCode(grid, i, j, target) {
  let val = 0;
  if ((j - 1 > 0 && grid[i][j - 1] == target) || j - 1 <= 0) {
    val += 1;
  }
  if (
    (i + 1 < grid.length && grid[i + 1][j] == target) ||
    i + 1 >= grid.length
  ) {
    val += 8;
  }
  if (
    (j + 1 < grid[0].length && grid[i][j + 1] == target) ||
    j + 1 >= grid[0].length
  ) {
    val += 4;
  }
  if ((i - 1 > 0 && grid[i - 1][j] == target) || i - 1 <= 0) {
    val += 2;
  }
  return val;
}

function drawContext(grid, i, j, target, dti, dtj) {
  const offset = lookup[gridCode(grid, i, j, target)];
  placeTile(i, j, dti + offset[0], dtj + offset[1]);
}

const lookup = [
  [0, 0], // 0
  [0, 0], // 1
  [0, 0], // 2
  [4, 1], // 3 [bot right corner]
  [0, 0], // 4
  [0, 0], // 5
  [3, 1], // 6
  [1, 0], // 7 [bot empty]
  [2, 0], // 8 [bot left corner]
  [4, 0], // 9 [top right corner]
  [0, 0], // 10
  [0, 1], // 11 [right empty]
  [3, 0], // 12 [top left corner]
  [1, 2], // 13 [top empty]
  [2, 1], // 14 [left empty]
  [0, 0], // 15
];

// Helper function to draw tile on legend
function placeTileLegend(y, x, ti, tj) {
  image(tilesetImage, x, y, 16, 16, 8 * ti, 8 * tj, 8, 8);
}

function displayTileMapInTextArea(grid) {
  let output = "";
  console.log("grid length:" + grid.length);
  for (let row of grid) {
    for (let cell of row) {
      output += cell;
    }
    output += "\n";
  }
  let textarea = select("#string-container");
  if (textarea) {
    textarea.value(output);
  }
}

// Fullscreen button based on different explorer
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    // Enter fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      /* Safari */
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      /* IE11 */
      document.documentElement.msRequestFullscreen();
    }
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE11 */
      document.msExitFullscreen();
    }
  }
}
