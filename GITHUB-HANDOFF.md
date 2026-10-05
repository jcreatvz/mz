# Metro Zoomin’ — GitHub handoff

Release: October 5, 2026. Repository: https://github.com/jcreatvz/mz, branch `main`.

## Run locally

```sh
git clone https://github.com/jcreatvz/mz.git
cd mz
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. No npm dependencies or build step.

## Editable files

- `dist/index.html`: scene copy, meetup guide and `mz-run-photos` JSON.
- `dist/assets/mz-*.jpg`: the five supplied gallery photos.
- `dist/run-gallery.js`: infinite wrapping, natural ratios, autoplay and controls.
- `dist/motion.css`, `dist/motion.js`, `dist/scene-prepare.js`: motion-study enhancements.
- `dist/styles.css`, `dist/app.js`, `dist/scene-motion.js`: original design and mascot paths.
- `dist/game*`: the optional runner game.

```sh
node scripts/check-motion.cjs
node scripts/check-game.cjs
node scripts/check-gallery.cjs
python3 scripts/check-release.py
python3 scripts/build-standalone.py metro-zoomin-offline.html
```

The release ZIP includes editable source, assets and documentation. It excludes Git history and private hosting configuration. The separate offline HTML embeds its assets. GitHub is a source mirror; pushing to it does not automatically deploy the Sites publication. For other static hosts, publish the contents of `dist/`. Do not expose project-only files as the site root.

Whole-site content JSON, GSAP/Lenis and Lottie remain future work. Visual browser/device QA remains outstanding.
