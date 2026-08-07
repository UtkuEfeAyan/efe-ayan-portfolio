import { access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import process from "node:process";

const required = [
  "index.html",
  "css/styles.css",
  "js/main.js",
  "js/particles.js",
  "js/language-gen.js",
  "js/projects.js",
  "js/narrative.js",
  "projects/index.html",
  "lab/index.html",
  "narrative/index.html",
  "series/index.html",
  "about/index.html",
  ".nojekyll",
];

const root = process.cwd();
let ok = true;

for (const rel of required) {
  const full = path.join(root, rel);
  try {
    await access(full, constants.F_OK);
    console.log(`ok  ${rel}`);
  } catch {
    ok = false;
    console.error(`missing  ${rel}`);
  }
}

console.log(`\nNode ${process.version}`);
if (!ok) {
  process.exitCode = 1;
  console.error("Site check failed.");
} else {
  console.log("Site check passed.");
}
