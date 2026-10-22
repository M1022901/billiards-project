import chalkImage from "../../../assets/equipment/chalk.jpg";
import cueCaseImage from "../../../assets/equipment/cue-case.jpg";
import cueTipImage from "../../../assets/equipment/cue-tip.jpg";
import playingCueImage from "../../../assets/equipment/playing-cue.jpg";
import restBridgeImage from "../../../assets/equipment/rest-bridge.jpg";

// Photos are bundled locally from src/assets/equipment (see scripts/fetch-equipment-images.mjs)
// so the case works offline. Each item keeps the Wikimedia Commons file page plus author and
// licence for attribution.
//
// The viewer always shows the whole photo (object-fit: contain), so there is no per-item crop
// hint any more; pick a source whose subject is centred instead.
export const equipmentItems = [
  {
    id: "cue",
    label: "Playing cue",
    value: "Main tool",
    image: playingCueImage,
    imageSource: {
      label: "Snooker cue and extensions.png",
      url: "https://commons.wikimedia.org/wiki/File:Snooker_cue_and_extensions.png",
      author: "barfisch",
      license: "CC BY-SA 3.0",
    },
    detail: "The cue is the stick used for almost every shot. Beginners should look for straightness, comfortable weight and a clean tip before worrying about expensive materials. The two pieces below the cue are screw-on extensions for extra reach.",
    facts: [
      ["Use", "Strikes the cue ball"],
      ["Choose", "Straight shaft, comfortable grip, stable weight"],
      ["Beginner tip", "A consistent house cue is better than a flashy but warped cue"],
    ],
  },
  {
    id: "rest",
    label: "Rest / bridge",
    value: "Reach support",
    image: restBridgeImage,
    imageSource: {
      label: "Rests for cue sports.png",
      url: "https://commons.wikimedia.org/wiki/File:Rests_for_cue_sports.png",
      author: "barfisch",
      license: "CC BY-SA 3.0",
    },
    detail: "A rest helps when the cue ball is too far away for a normal bridge hand. It is essential on large snooker tables.",
    facts: [
      ["Use", "Supports the cue on long-reach shots"],
      ["Choose", "Stable head, smooth shaft, not too heavy"],
      ["Beginner tip", "Practice bridge shots early; do not treat the rest as emergency-only"],
    ],
  },
  {
    id: "tip",
    label: "Cue tip",
    value: "Contact point",
    image: cueTipImage,
    imageSource: {
      label: "Ferrule for snooker cue.jpg",
      url: "https://commons.wikimedia.org/wiki/File:Ferrule_for_snooker_cue.jpg",
      author: "Lee Vilenski",
      license: "CC BY-SA 4.0",
    },
    detail: "The leather tip transfers force and spin to the cue ball. A shaped, well-maintained tip is more important than many beginners expect.",
    facts: [
      ["Use", "Contacts the cue ball"],
      ["Choose", "Medium hardness is usually a safe first choice"],
      ["Beginner tip", "Keep the tip rounded and avoid a flat, glossy surface"],
    ],
  },
  {
    id: "chalk",
    label: "Chalk",
    value: "Grip on cue ball",
    image: chalkImage,
    imageSource: {
      label: "Billiard Chalk and Cue.jpg",
      url: "https://commons.wikimedia.org/wiki/File:Billiard_Chalk_and_Cue.jpg",
      author: "Fcb981",
      license: "CC BY-SA 3.0",
    },
    detail: "Chalk increases friction between the tip and cue ball, reducing miscues when applying spin or hitting away from center.",
    facts: [
      ["Use", "Adds friction at impact"],
      ["Choose", "Clean, dry chalk that coats evenly"],
      ["Beginner tip", "Chalk lightly and often; grinding chalk onto the tip is unnecessary"],
    ],
  },
  {
    id: "case",
    label: "Cue case",
    value: "Protection",
    image: cueCaseImage,
    imageSource: {
      label: "Snooker cue case (51223529470).jpg",
      url: "https://commons.wikimedia.org/wiki/File:Snooker_cue_case_(51223529470).jpg",
      author: "Snooker Spot",
      license: "CC BY 2.0",
    },
    detail: "A cue case protects the cue from bending, dents and humidity changes during transport.",
    facts: [
      ["Use", "Stores and protects cue equipment"],
      ["Choose", "Hard shell or padded case with enough compartments"],
      ["Beginner tip", "Protection matters more than decoration"],
    ],
  },
];
