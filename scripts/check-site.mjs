import { access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import process from "node:process";

const required = [
  "index.html",
  "css/styles.css",
  "js/main.js",
  "about/index.html",
  "projects/index.html",
  "minis/index.html",
  "contact/index.html",
  "toys/index.html",
  "toys/voices-of-void/index.html",
  "toys/voices-of-void/style.css",
  "toys/voices-of-void/src/ui.js",
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
