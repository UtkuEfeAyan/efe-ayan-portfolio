# CMPM 147 — Local assets guide

Glitch CDN is dead. Everything now loads from folders inside this repo.

## Status by experiment

| Experiment | Needs images from you? | Notes |
|---|---|---|
| 1 | No | Starter template (rotating p5 square) — optional to keep |
| 2 | No | Canvas scene (snow/trees/birds) — self-contained |
| 3 | No | Uses `experiment3/img/tilesetP8.png` (restored) |
| 4 | Optional upgrades | Placeholder sprites in `experiment4/img/` — replace anytime |
| 5a / 5b | Optional upgrades | 8 inspiration images already wired locally |

## Experiment 5 — circle / dots image recreations

These 8 files are already present and wired:

1. `assets/lunch-on-a-skyscraper.jpg` (full quality)
2. `assets/train-wreck.jpg` (currently a **thumbnail** — replace with full photo if you have it)
3. `assets/migrant-mother.jpg` (currently a **thumbnail** — replace with full photo if you have it)
4. `assets/girl-with-fire.jpg` (currently a **thumbnail** — replace with full photo if you have it)
5. `assets/cat-1.jpeg` (your photo)
6. `assets/cat-2.jpeg` (your photo)
7. `assets/ai-landscape.jpeg` (your image)
8. `assets/prey-screenshot.jpeg` (your image)

**Recommended replacements from you: 3 images** (full-res train-wreck, migrant-mother, girl-with-fire). Keep the same filenames.

You can also drop extra inspiration images into `assets/` and add entries in `js/my_design.js` → `getInspirations()`.

## Experiment 4 — world sprites (optional)

Placeholder PNGs exist so the game runs. Replace these 14 files in `experiment4/img/` with your originals when you find them:

- Animals (8): `chicken.png` `dove.png` `dragon.png` `duck.png` `flamingo.png` `horse.png` `sheep.png` `wasp.png`
- Environment (5): `tree-1.png` `tree-2.png` `tree-3.png` `tree-4.png` `grass.png`
- Player (1): `human-red.png`

## Homepage portrait

Currently uses `img/cute-grey-kitten.jpg`. Replace with your preferred portrait as `img/portrait.jpg` and update `index.html` if you want.
