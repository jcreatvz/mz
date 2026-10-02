# Metro Zoomin’ — GitHub handoff

The source is now in [`jcreatvz/mz`](https://github.com/jcreatvz/mz) on `main`.

## Get a local working copy

```sh
git clone https://github.com/jcreatvz/mz.git
cd mz
```

The editable site is in `dist/`; artwork, scripts, README and roadmap are at the repository root. Open the repository in GitHub Desktop if you prefer a visual workflow.

## Run locally

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. There is no npm dependency or build step.

## Optional GitHub Pages hosting

The source remains on `main`. To publish the site through GitHub Pages, add a Pages workflow that uploads `dist/` as the Pages artifact, or publish a copy of the **contents of `dist/`** to a dedicated `gh-pages` branch so `index.html` is at that branch’s root. Then choose **Settings → Pages → Deploy from a branch → `gh-pages` / `(root)`**. GitHub Pages hosting is separate from the existing private Sites preview.

## Edit and check

- Text, meetup information and links: `dist/index.html`.
- Site layout: `dist/styles.css`.
- Mascot routes: `dist/scene-motion.js`; rendering, scroll direction and motion preferences: `dist/app.js`.
- Game frame: `dist/game.css`; simulation: `dist/game-engine.js`; controls/rendering: `dist/game.js`.
- User-supplied original artwork: `artwork/`; optimized site assets: `dist/assets/`.

```sh
node scripts/check-motion.cjs
node scripts/check-game.cjs
python3 scripts/build-standalone.py metro-zoomin-offline.html
```

The supplied font license is included. Keep asset filenames and letter case unchanged. No API keys, backend or sign-up service are required. JSON content editing, GSAP/Lenis and Lottie remain future work; see `ROADMAP.md`.

Automated motion and game checks pass. Real-browser visual review and mobile touch/performance checks remain outstanding.
