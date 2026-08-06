# Efe Ayan Portfolio

Personal portfolio for **Efe Ayan** — Game Designer, Creative Coder, and AI Researcher (UC Santa Cruz).

## Pages

| Path | Description |
|------|-------------|
| `/` | Immersive hero with generative particle canvas |
| `/projects/` | Filterable project grid with media + demo slots |
| `/lab/` | Live **Procedural Language Generator** + adventure teaser |
| `/narrative/` | Interactive fiction accordion with choice previews |
| `/series/` | Ongoing series / research threads |
| `/about/` | Bio, skill HUD, social links, contact form |

## Run locally

No build step required. From this folder:

```bash
# Python
python -m http.server 5173

# or Node (if installed)
npx serve .
```

Then open `http://localhost:5173`.

## Customize

1. Replace placeholder media in project cards (`assets/` — add `videos/`, images).
2. Update GitHub / itch / LinkedIn / Scholar URLs in `about/index.html`.
3. Set your real email in `js/main.js` (mailto target).
4. Drop your PDF at `assets/Efe-Ayan-CV.pdf`.
5. Wire Play / Demo / Video buttons on each project card.

## Design

Dark cyberpunk × academic theme: charcoal `#0b0d10`, cyan `#00f2fe`, purple `#7f00ff`, pink `#ff007f`. Typography: JetBrains Mono + Space Grotesk.

## License

© Efe Ayan. All rights reserved unless otherwise noted.
