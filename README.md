# Metro Zoomin’ — Zoom Run

An Edmonton run club website with oversized editorial typography, the supplied girl and boy MZ mascots, and an optional endless runner game.

## Preview and source

Serve `dist/` with a static web server or open `dist/index.html` in a modern browser. The portable HTML deliverable embeds every required font, SVG, image, stylesheet and script, so it also works offline.

The page is a private frontend preview. The regular meetup is Wednesdays at 18:00 at Royal Glenora Parking Lot, with seasonal timing changes. The east gravel lot by the stairs is the interpreted map pin. An official registration destination has not been provided. See ROADMAP.md for current release notes and future work.

## Site changes

- Official MZ duo in the hero and finale, with both supplied mascots traveling as independent, coordinated layers only in the hero, crew and footer. They slide right out of the crew and grow into the footer; scrolling up from the footer sends them left at their current size.
- Display headlines retained; small text uses Helvetica Neue, Helvetica, Arial and sans-serif fallbacks. Scene numbers and coordinates remain; decorative menu/pace numbers are removed.
- Site motion is on on first visit. An explicit on/off choice is remembered on this device. System reduced motion overrides the stored preference. The game starts only after Play, independently of decorative site motion.
- Desktop, tablet and mobile CSS adapt the composition, game track, controls and typography. Native page scrolling remains available.

## Zoom Run

Press Play, then Space/up arrow or tap the track/Jump button. Escape/P pauses while game controls have focus. Pause, Resume and Restart buttons are also provided. The game pauses when its track leaves the viewport or the tab is hidden; returning never resumes it automatically.

- Start with 10 lifespan bars. Water restores one bar, capped at 10. At full health, a drop awards 10 bonus points.
- Banana peel, ice, construction barricade, cone and pothole each deduct one bar.
- A brief stumble/slide reaction and 1.15-second recovery window prevent repeated damage from the same impact.
- Zero bars ends the run. Distance and drops are reported with score (whole metres plus full-health pickup bonuses).
- A 60-second milestone celebrates progress while the endless run continues. Speed and spawn intervals ramp gradually; mobile speed is capped.
- The supplied eight running poses are normalized by their face position on equal 640×540 canvases, preserving their source ground line and avoiding equal-width crops through limbs. The original SVG strip is retained.
- Run atlas and hazard media load on Play. Only a small still loads near the scene. The game animation loop stops while paused, offscreen or ended. Canvas resolution is capped at 2× device pixel ratio.
- Reduced-motion mode keeps background type and lane markings still, removes shake/rotation and uses steady damage opacity. The optional game still requires movement to play.

## Architecture

- `dist/index.html`: semantic scenes, accessible controls, ten-bar meter and status announcements.
- `dist/styles.css`: site design system and responsive layouts.
- `dist/scene-motion.js`: pure, three-scene paired mascot choreography.
- `dist/app.js`: easing, media replacement hooks, navigation and club guide.
- `dist/game.css`: responsive game composition.
- `dist/game-engine.js`: pure simulation, collision rules, health, spawning and milestone.
- `dist/game.js`: image loading, canvas renderer, keyboard/touch inputs, lifecycle and HUD.
- `artwork/`: supplied originals, earlier reference and generated road-sprite source.
- `scripts/prepare-artwork.py`: repeatable vector extraction/frame alignment; requires Inkscape and Pillow.
- `scripts/build-standalone.py`: dependency-free Python packager for the single-file draft.
- `scripts/check-game.cjs`: focused Node checks for gameplay rules.

Build portable HTML with `python scripts/build-standalone.py /absolute/output.html`.
Run gameplay checks with `node scripts/check-game.cjs`.

## Future animation

The game uses a frame atlas for precise start, stop, jump and slip states. A future GIF can inform frame timing or be used as an opt-in decorative scene loop. The `window.metroCharacter.configure({boy: {idle: ...}, girl: {idle: ...}})` interface supports an image (`{type:'image',src:'...'}`) or video (`{type:'video',sources:[{src:'...',type:'video/webm'}]}`), with a static poster fallback. Supply a stable transparent canvas; each actor preserves its supplied SVG aspect ratio, inside a shared 290:192 composition. No GIF was supplied for this revision.

## Artwork provenance

Both MZ mascot SVGs are user-supplied. Characters were separated/reframed without redraw. The obstacle/pickup sheet was generated once with the built-in image tool: transparent 3×2 cartoon atlas, thick charcoal outlines, banana peel, ice patch, orange/cream barricade, cone, pothole and blue water droplet, no text or characters. Optimized WebP crops are used in the game. The sheet includes subtle glow beyond some silhouettes; the pothole crop has a small rim truncation. No external stock imagery is used. The display font is Anton; its license is included.

## Verification and limits

Passed: JavaScript syntax, local asset/internal-link validation, duplicate-ID checks, minimum small-text audit, normalized mascot asset inspection, pure engine checks for jumps/all hazards/health/pickups/recovery/game over/pause/milestone/mobile speed. A DOM/canvas-stub harness also checks deferred atlas loading, explicit start, restart, keyboard focus behavior, pause on tab/offscreen changes, reduced-motion configuration and image-error retry.

Visual browser QA and real-device touch/performance checks remain unverified: no compatible local browser was available. The DOM harness cannot verify actual layout, painted pixels, overlap or frame smoothness. Playtest difficulty and scene composition in the private preview before treating this as a public production release.

## GitHub handoff

See `GITHUB-HANDOFF.md` for upload and hosting instructions. No npm install or build step is required.
