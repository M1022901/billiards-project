# Billiards Project Notes

## Follow-up polish backlog

1. Hall of Fame data consistency
   - Define exactly what `Elite` means when ranking or title data is incomplete.
   - Decide whether `Career prize money` should be shown only when a reliable source exists.
   - Fill consistent source-backed fields for top titles, peak ranking, weeks at peak, best world finish, total titles, career prize money and 147 / equivalent scoring marks.

2. Rules 101 images
   - Replace remaining generic or imperfect images with sport-specific visuals.
   - Prefer images that clearly match the step being taught: rack setup, legal contact, foul, scoring, safety and table layout.
   - Consider local cached assets for key teaching images so the page is not dependent on hotlinked images.

3. Major events by discipline
   - Snooker: explain the Triple Crown and why World Championship / UK Championship / Masters carry special status.
   - American 9-ball: introduce WPA World 9-Ball, U.S. Open 9-Ball, World Pool Championship, Mosconi Cup and World Nineball Tour.
   - Chinese 8-ball / Heyball: introduce JOY events, World Heyball Masters, WPA Heyball events and major Chinese commercial tournaments.

## Three.js teaching roadmap

### Phase 1: Learn to Play

No real collision simulation. The goal is to answer: what are the balls, what are the rules, and what should I try to do on this shot?

| Case | Title | Learning goal | Three.js treatment | Priority |
| --- | --- | --- | --- | --- |
| 01 | Table & Ball Tour | Learn table areas, pockets, cue ball, red ball and colour values | 3D table with clickable balls and regions | High |
| 02 | Basic Rule Flow | Understand red-colour alternation and final colour order | Click balls, update legal target and score state | High |
| 03 | Ghost Ball Aiming | Aim through ghost ball center instead of ball edge | Toggle real view and assisted aim lines | Highest |
| 04 | Thick vs Thin Contact | Understand how contact fullness changes object-ball direction | Drag aim direction and show overlap ratio | Highest |
| 05 | Cue Tip Position | Learn high, center, low, left and right tip positions | Enlarged cue ball face with clickable tip point | Highest |
| 06 | Power Control | Understand soft / medium / hard distance effects | Power slider with travel distance preview | High |
| 07 | Stop / Follow / Draw | See cue-ball behavior after contact | Three slow-motion lanes side by side | Highest |
| 08 | Spin Basics | Separate vertical spin from side spin | Cue-ball spin axis and rail-rebound arrows | Highest |

Optional Phase 1 extensions:

| Case | Title | Reason |
| --- | --- | --- |
| 09 | Bridge and Cue Angle | Useful for real technique, less central to Three.js physics |
| 10 | Stroke Alignment | Helps show cue, cue ball and target line in one vertical plane |

### Phase 2: Learn to Control

Add collision, route prediction and cue-ball control. The goal is to answer: after the shot, where will both balls go?

| Case | Title | Learning goal | Priority |
| --- | --- | --- | --- |
| 11 | Post-contact Ball Directions | Predict cue-ball and object-ball directions | Highest |
| 12 | Tangent Line / 90 Degree Rule | Learn stun-shot cue-ball direction | Highest |
| 13 | Follow / Draw Amount | Control how far the cue ball continues or returns | Highest |
| 14 | Cushion Rebound | Predict natural rail rebound | Highest |
| 15 | Side Spin on Cushions | See how left / right spin changes rebound | Highest |
| 16 | Bank Shot Geometry | Use mirror geometry for one-cushion shots | Medium |
| 17 | Escaping a Snooker | Compare direct, one-cushion and two-cushion routes | High |
| 18 | Position Planning | Pot the current ball and leave position for the next | Highest |

## Implementation notes

- Case 01 is intentionally descriptive, not physics-based.
- Phase 1 should feel like an interactive handbook.
- Phase 2 should become the physics and route-prediction layer.
