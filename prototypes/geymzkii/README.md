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

## Casual CSV leaderboard

`results.csv` intentionally contains only the header until real runs arrive. At the results screen, the player can save a branded PNG, download a one-row CSV, copy stats, and open a prefilled email addressed to `jcreatvz@gmail.com`. **The player reviews and sends the email.** PNG attachment is manual. Email is offered only for completed runs; partial runs can still be saved locally.

To record a submission:

1. Copy its CSV data row into `results.csv` below the header, or use a spreadsheet to import the downloaded CSV.
2. Deduplicate by `run_id`; keep only completed 8,000 m runs for rankings.
3. Commit the updated CSV. Publish only the chosen display name and game stats, not email addresses.

Fastest finish: sort `time_seconds` ascending, then `gold_bolts` descending. Bolt champion: sort `gold_bolts` descending, then `time_seconds` ascending. Compare only matching `course_version` values (`rgc-arcade-v2` initially). This draft does not display a shared leaderboard yet; the repo CSV is the record. Device-local personal bests are stored separately in localStorage.

CSV fields record a client-generated ID and timestamp, display name, course version, completion status, distance, time, bolts, average/peak arcade speed, Juice, boost count and hazard count. `submitted_at_utc` is the captured end-of-run timestamp, not proof an email was sent. Spreadsheet-formula prefixes and quotes are escaped on export. Scores are unverified, editable and intended for fun. The browser never writes to GitHub or contains repository credentials.

## Architecture and roadmap

- `engine.js`: testable simulation and CSV serialization, independent of DOM/storage.
- `console.js`: state transitions, inputs, Canvas renderer, local records and exports.
- `console.css` / `index.html`: responsive console UI; mobile rearranges the shell and controls.
- `assets/`: movable controls and shell extracted from the supplied SVG; original art preserved separately.
- `build.py`: packages code, shared sprites, font and console SVGs into one offline file.

Delivered: console shell, compact three-column controls, 30-second orange boost, double jump, original route map with moving pin, ground-anchored jump shadow, deeper road, taller responsive camera, resources, hazards, results and exports. Next: hands-on desktop/mobile playtesting and balance tuning, then exact route landmarks/backgrounds and optional shared CSV leaderboard view. Integrated into the website’s Play section. Sound/haptics, additional playable characters, authoritative score verification and automated submissions are later options.

Validation: JavaScript syntax checks and deterministic engine tests cover boosting, speed, pause, movement limits, variable jump, duck collision, water, damage immunity, course completion and CSV escaping. Actual device/browser playtesting remains a review step; this is not a production QA sign-off.

## v2 integration notes

- `dist/console-embed.js` coordinates responsive frame height, gameplay state (disabling page snap while running), offscreen pause and scrolling to results. Messages are validated against the embedded window and same origin.
- Mobile uses a narrower logical camera with adjusted world movement; it does not stretch the sprites.
- During a jump, sprite frame 6 is cropped above its separate embedded shadow; a thin ground ellipse is drawn independently. The supplied duck sprite can replace the current scaled pose later.
- Boost tint is composited inside the current sprite; speed lines follow its vertical position. Reduced motion removes the decorative trail and freezes the colour transition.
- Course version and local PR storage moved to v2 because the boost duration and jumping rules affect scores. Keep older CSV rows and compare matching course versions only.
