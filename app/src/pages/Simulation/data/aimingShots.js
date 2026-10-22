import { snookerHalfWidth, snookerHalfLength, snookerPinkX } from "../lib/tableGeometry.js";

export const ghostAimingShots = [
  {
    id: "middle-pocket-angle",
    label: "Middle pocket angle",
    value: "Cut to middle",
    detail: "Use broadcast view to line up the cue-ball shadow with the ghost ball, then switch to player view and strike.",
    ballLabel: "Blue",
    ballColor: "#2563eb",
    pathColor: "#38bdf8",
    object: [0.24, -0.58],
    pocket: [0, -snookerHalfWidth],
    cue: [0.62, 0.82],
    challengeOffset: -7.5,
    facts: [
      ["Object path", "Blue to middle pocket"],
      ["Practice", "Medium cut into the side pocket"],
      ["Player task", "Remember the ghost-ball target, then aim from cue-ball view"],
    ],
  },
  {
    id: "corner-pocket-angle",
    label: "Corner pocket angle",
    value: "Cut to corner",
    detail: "This corner-pot angle is thinner, so the player view has less visual margin after the planning lines disappear.",
    ballLabel: "Pink",
    ballColor: "#f472b6",
    pathColor: "#f59e0b",
    object: [snookerPinkX - 0.12, 0.2],
    pocket: [snookerHalfLength, -snookerHalfWidth],
    cue: [0.18, 1.1],
    challengeOffset: 6,
    facts: [
      ["Object path", "Pink to corner pocket"],
      ["Practice", "Thinner cut into the corner"],
      ["Player task", "Aim without the planning overlay before striking"],
    ],
  },
];
