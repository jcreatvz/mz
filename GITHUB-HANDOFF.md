# Metro Zoomin’ — GitHub handoff

Revision 4, October 2, 2026.

## Upload the source

1. Unzip `Metro-Zoomin-GitHub-Source.zip`.
2. Create an empty repository in your GitHub account.
3. Choose **Add file → Upload files** and upload the extracted contents, preserving folders. Alternatively, use GitHub Desktop to publish the extracted folder.
4. Commit the files. Your editable website is in `dist/`; the README, roadmap and scripts sit alongside it.

The archive excludes Git history, credentials and Sites-specific hosting configuration. The existing Sites deployment remains independent. Uploading this source does not automatically link GitHub to Sites.

## Run locally

From the project folder:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. There is no npm dependency or build step.

## Optional GitHub Pages hosting

For simple branch-based Pages hosting, create a separate `gh-pages` branch and upload the **contents of `dist/`** at that branch’s root (so `index.html` is at the root). In repository **Settings → Pages**, choose **Deploy from a branch**, then `gh-pages` and `/ (root)`. Preserve the editable source on `main`. Copy updated `dist/` contents to `gh-pages` when publishing changes.

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

The supplied font license is included. Keep asset filenames and letter case unchanged. No API keys, backend or sign-up service are required. JSON content editing, GSAP/Lenis and Lottie remain future work; see ROADMAP.md.

Automated motion and game checks pass. Real-browser visual review and mobile touch/performance checks remain outstanding.
