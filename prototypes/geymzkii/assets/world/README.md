# Replaceable route artwork

Place files here, commit them, then run `python3 scripts/sync-console.py` from the repo root and publish. No CSS or game-engine edit is required. Refresh the page after replacing a file.

## Backgrounds

Use **1920 × 640 px (3:1)** WebP, ideally under 250 KB, or self-contained SVG with `viewBox="0 0 1920 640"`. The background covers the scenery area above the road and is center-cropped on narrow screens. Keep important landmarks inside the central 40%; leave the bottom 10% free of essential details. Do not include pavement, the runner, the flag or HUD in these files. Transparency is supported over the route’s sky colour. SVGs should contain paths/shapes only, without scripts, remote images or external fonts.

| Checkpoint | File stem (add `.webp` or `.svg`) |
| --- | --- |
| RGC start | `mz-bg-01-rgc` |
| River Valley | `mz-bg-02-rv` |
| Victoria Park | `mz-bg-03-victoria-park` |
| Emily Murphy | `mz-bg-04-emily-murphy` |
| University of Alberta | `mz-bg-05-university-alberta` |
| High Level Bridge View | `mz-bg-06-high-level-bridge` |
| Walterdale | `mz-bg-07-walterdale` |
| RGC finish | `mz-bg-08-rgc-return` |

Only supply one format for each stem. If both exist, WebP wins. Missing or invalid artwork uses the original generated scenery. Current and next checkpoints load on demand. The return-to-RGC image appears at completion; checkpoint timing remains provisional.

## Finish flag

Use **400 × 640 px (5:8)** with a transparent background, named `mz-finish-flag.webp`, `mz-finish-flag.svg`, or `mz-finish-flag.gif`. Keep the pole’s foot at the bottom centre of the image. The full image scales to 230 game units high without cropping. Prefer WebP/SVG under 150 KB; keep an animated GIF under 500 KB, approximately 12–18 fps. The browser displays a GIF as a real image so its frames animate. The flag’s position freezes with the world at the finish. GIF artwork can keep fluttering in place. Under reduced motion, a GIF falls back to the static checker flag.

Selection priority: WebP → SVG → GIF. Missing artwork uses the original checker flag. Remove unused formats when changing types. The road and collision rules are separate from artwork.
