# October 5, 2026 — Motion and gallery release

Completed: promoted the approved HTML motion study into the maintainable site source; loader, heading entrances/exits, cloud footer, back-to-top control, five real club photos with portrait/landscape framing, automatic infinite gallery, chevrons, paper background and hero mascot inset. Meetup details remain consolidated in the run guide. The game and three-scene mascot choreography are preserved.

Gallery content is editable through the `mz-run-photos` JSON block. Whole-site content JSON, GSAP/Lenis and Lottie controls remain in the parking lot. No new animation dependency was added.

Release checks cover syntax, local assets, gallery wrap/ratio/autoplay lifecycle, game and mascot logic. Real-browser composition and device-performance review remain outstanding; this static project has no compatible supervised browser preview.

---

# Metro Zoomin’ — release notes & roadmap

**Current milestone:** Revision 4 — directional mascot exits, motion-on default and orange game frame.
**Site:** https://metro-zoomin-zoom-run.jc-lutao.chatgpt.site
**Audience:** Private preview; ready for JC’s review and playtesting.

## This revision

- Both mascots slide right out of section 2 without shrinking.
- On upward scrolling from the footer, both slide left while holding their current size. Downward entry retains the grow-in.
- Site motion defaults to on; explicit saved off preferences and system reduced motion remain respected.
- The game frame uses `border: 11px solid #d94426`.
- GitHub-ready source package and upload instructions included.

## Previous revision

- Hero: “RUN THE CITY. OWN THE PACE”, Royal Glenora meetup coordinates, “GET OUT.” and “A few KMs”. Removed the extra pace/location line, duplicate Play link and arrow under “The City Is Our Track”.
- Crew: a solid orange circle replaces the outlined orbital badge and its label/arrow.
- Interlude: both lane borders are 23px. Their oversized strokes extend beyond the clipped scene at all viewport sizes. Route copy is “RGC → RIVER VALLEY → NEW FRIENDS”.
- Meetup: **Royal Glenora Parking Lot — 18:00 on Wednesdays.** Seasonal note: **“Start times may shift with the seasons.”** The first-run guide and introduction now match the announced schedule.
- Brand line: **“Good miles. Better vibes.”** Footer credit: **“GRXPHJC BY DESIGN”**, including mobile.

## Mascot behavior

The girl and boy use separate SVG layers, with individual easing and a small stagger along a shared route. Mouse movement adds subtle depth on desktop; touch uses scrolling only.

| Scene | Behavior with Site Motion On |
| --- | --- |
| Opening | Both mascots form the hero composition and begin the shared journey. |
| Crew, the second page section | They settle beside the orange circle, then slide right with a slight stagger as the section leaves. |
| Middle scenes | The traveling pair is hidden. The runner inside the optional game remains independent. |
| Footer | The pair grows into view on downward entry; upward departure slides left at the current size. |

Motion is **on on first visit**. The footer toggle remembers an explicit on/off choice. Reduced-motion settings show static pairs in the three designated scenes. The animation loop stops when settled, and hidden tabs stop updates.

## Where we are

| Phase | Status | Result |
| --- | --- | --- |
| Art direction and one-page structure | Complete | Bold editorial scenes built around MZ artwork. |
| Playable Zoom Run | Complete | Eight-frame runner, 10 health bars, water, five hazards and keyboard/touch controls. |
| Copy, meetup and mascot refinement | Complete in this revision | Real schedule, revised graphics and paired scene motion. |
| Visual/device release checks | Still to do | Check real desktop/mobile composition, touch play, motion timing and performance. Automated logic checks do not replace these. |
| Content editing through JSON | Parking lot — suggested next phase | One editable content file for headings, paragraphs, meetup details, coordinates, links and artwork references. Validate the data and keep accessible fallback content. |
| GSAP / Lenis | Parking lot | Evaluate coordinated section transitions and scroll effects after the content structure is stable. Preserve native navigation, motion controls and reduced-motion behavior. |
| Lottie / SVG animation controls | Parking lot | Add supplied animations with play/pause, speed, loop and trigger controls; pause offscreen and retain static fallbacks. |

The parking-lot ideas are documented only. Whole-site JSON content loading, GSAP, Lenis and a Lottie player have **not** been added to this release.

## Meetup pin used

The coordinates currently identify the **east gravel parking lot beside the Royal Glenora stairs**: **53.532371, −113.511875**, displayed as **53.5324°N / 113.5119°W**. This interprets the meetup location as the public stair-side lot rather than the members’ lot west of the clubhouse. If the club uses a different point within Royal Glenora, that exact pin is the one content detail to replace.

References: [community-shared map pin](https://maps.app.goo.gl/Um1ubaV2fnD9GzaY8), [Edmonton Outdoor Club’s east-lot directions](https://www.edmontonoutdoorclub.com/events/details.asp?eventid=6239).

## Checks and technical handoff

Passed: JavaScript syntax; internal links/assets; exact copy/removal audit; three-scene routing; paired poses; directional exits and footer entry scale; reverse scrolling; mouse offset; reduced-motion fallback; idle-loop shutdown; and lane coverage calculations at 320, 390, 768 and 1440px widths. Game logic regression checks also pass.

Browser visual QA remains unavailable in this environment; DOM geometry tests are simulated. The live preview is the next place to review the exact composition and feel.

Source remains static HTML/CSS/JavaScript. `dist/scene-motion.js` holds the choreography; `dist/app.js` renders and coordinates the two actors. `window.metroCharacter.configure()` can receive separate `boy` and `girl` media configurations for future animation assets. No new animation dependency was introduced.


## GEYMZKII website integration — 2026-10-06

Shipped the console in the Play section: concise UI, original SVG route/pin and directional icons, 2 px rounded UI strokes, 30-second orange boost with airborne trails, double jump, ground-fixed jump shadow, deeper pavement, taller mobile camera and responsive embedded results. Email, PNG and CSV exports remain. Scores use `rgc-arcade-v2`.

Next: hands-on mobile/desktop balance review; supplied duck pose; richer route-specific scenery. The shared CSV is still maintained manually.
