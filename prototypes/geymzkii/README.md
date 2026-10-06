# GEYMZKII — integrated console v2

The MZ website game uses JC’s supplied purple console artwork, original route graphic and pin, directional triangles, and existing running sprite. The source remains independently previewable and is published into the website with `python3 scripts/sync-console.py`. No build framework or remote service is required.

## Play and build

From the repository root, run `python3 -m http.server 8080`, then open `http://localhost:8080/prototypes/geymzkii/`. The modular draft reuses the existing files in `dist/assets/`.

For a portable, offline HTML file:

```sh
python3 prototypes/geymzkii/build.py
node prototypes/geymzkii/check-engine.cjs
```

Open the generated `GEYMZKII-Console-Draft.html` in a modern browser. No installation, account, or network connection is needed to play. Email submission needs a configured email app.

## Controls and flow

Choose runner → instructions → countdown → run → results. START pauses/resumes, SELECT opens help, M opens the route map. Keyboard: arrows move/jump/duck, Space also jumps, Z boosts, M maps, H opens help, Enter pauses while the game canvas is focused. Escape pauses or closes help/map. Touch controls support holding and simultaneous movement/jump. Restart/exit asks before discarding the current run. Leaving the tab pauses gameplay.

The current runner is available; the second selection is a disabled Coming Soon placeholder. Decorative motion respects reduced-motion preferences; necessary gameplay movement remains.

## Current balance

| Rule | Draft value |
| --- | --- |
| Course | 8 arcade km; clean baseline approximately 7 minutes |
| Juice | 10 bars; each hazard costs 1, with 1.25 seconds of damage immunity |
| Water | +1 bar, first drop after 17 seconds, then every 18–23 seconds |
| Boost | Costs 3 bars; requires at least 4; lasts 30 seconds |
| Low Juice | At 5 or fewer, pace eases down progressively |
| Jump | Tap for short jump; hold for higher jump; tap twice for double jump |
| Duck | Hold down; visual and collision height shrink to about two-thirds |
| Scoring | Gold bolts plus finish time; separate local bests |

The clock measures active gameplay only. Slower runs can exceed eight minutes: this is a target duration, not a forced timeout. Arcade kilometres and speeds are game values, not real fitness measurements. Successful runs end at 8 km; zero Juice ends the attempt. Boosting is a resource tradeoff, not mandatory.

Hazards progress from bananas/cones to ice/construction barriers, then potholes and a stylized flying bird. The bird can be ducked. Bolts appear in ground and jump trails. Backgrounds and checkpoint spacing are provisional. Route: RGC → River Valley → Victoria Park → Emily Murphy → University of Alberta → High Level Bridge View → Walterdale → RGC.

## Top-five leaderboard and submissions

`results.csv` is the source of the public leaderboard. The current real row is LUTZKII’s v2 result. `scripts/sync-console.py` emits a safe data snapshot for the site. The browser also tries the public GitHub CSV on each visit; private/offline repositories fall back to the published snapshot. Future private-repo edits require syncing/publishing.

Ranking: completed v2 8,000 m runs, gold bolts descending, finish time ascending as the tie-breaker. Duplicate run IDs and malformed rows are ignored. The top five are runs, so a player can occupy more than one slot. Empty slots say “This could be you.” Existing display names are preserved, with stat-based aura titles alongside them. Selecting a name opens stats in the same dialog. The first rank has a gold trophy. The dialog appears once when the console comes into view, and can be reopened using Top 5. Reduced-motion preferences disable its pop animations.

PNG, CSV and copy exports work. The mail composer and visible recipient address were removed. **Direct email is prepared but inactive:** no email credentials or server endpoint are connected. See `server/README.md`. Send score stays disabled until `submission.endpoint` in `world-config.js` points at the deployed handler. On a positive server acknowledgement the results panel clears; failures keep it intact. Provider acceptance does not prove inbox delivery.

Maintain the CSV by appending actual exported results, deduplicating run IDs and committing. Scores are casual, editable and unverified. Publish only display names and run stats, not personal email addresses. Device-local personal bests stay separate from this shared CSV. Do not compare different course versions.

## Custom scenery and finish flag

See `assets/world/README.md` for the exact filenames, dimensions and supported formats. Missing artwork retains the original scenery/flag. Run `scripts/sync-console.py` after adding artwork and republish. The flag travels at the road’s speed and freezes when the course finishes; animated GIFs flutter in place without moving the camera.

## Architecture and roadmap

- `engine.js`: testable simulation and CSV serialization, independent of DOM/storage.
- `console.js`: state transitions, inputs, Canvas renderer, local records and exports.
- `console.css` / `index.html`: responsive console UI; mobile rearranges the shell and controls.
- `assets/`: movable controls and shell extracted from the supplied SVG; original art preserved separately.
- `build.py`: packages code, shared sprites, font and console SVGs into one offline file.

Delivered: console shell, compact three-column controls, 30-second orange boost, double jump, original route map with moving pin, ground-anchored jump shadow, deeper road, taller responsive camera, resources, hazards, results and exports. Next: hands-on desktop/mobile playtesting and balance tuning, then custom route landmarks/backgrounds. Integrated into the website’s Play section. Sound/haptics, additional playable characters, authoritative score verification and automated submissions are later options.

Validation: JavaScript syntax checks and deterministic engine tests cover boosting, speed, pause, movement limits, variable jump, duck collision, water, damage immunity, course completion and CSV escaping. Actual device/browser playtesting remains a review step; this is not a production QA sign-off.

## v2 integration notes

- `dist/console-embed.js` coordinates responsive frame height, gameplay state (disabling page snap while running), offscreen pause and scrolling to results. Messages are validated against the embedded window and same origin.
- Mobile uses a narrower logical camera with adjusted world movement; it does not stretch the sprites.
- During a jump, sprite frame 6 is cropped above its separate embedded shadow; a thin ground ellipse is drawn independently. The supplied duck sprite can replace the current scaled pose later.
- Boost tint is composited inside the current sprite; speed lines follow its vertical position. Reduced motion removes the decorative trail and freezes the colour transition.
- Course version and local PR storage moved to v2 because the boost duration and jumping rules affect scores. Keep older CSV rows and compare matching course versions only.
