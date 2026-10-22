import nineBallDiamondLayout from "../../../assets/rules/nine-ball-diamond-layout.svg";
import nineBallStrategyShot from "../../../assets/rules/nine-ball-strategy-shot.svg";
import nineBallFoulShot from "../../../assets/rules/nine-ball-foul-shot.svg";
import nineBallRaceScorecard from "../../../assets/rules/nine-ball-race-scorecard.svg";
import eightBallGoal from "../../../assets/rules/eight-ball-goal.svg";
import eightBallSetup from "../../../assets/rules/eight-ball-setup.svg";
import eightBallTurn from "../../../assets/rules/eight-ball-turn.svg";
import eightBallStrategy from "../../../assets/rules/eight-ball-strategy.svg";
import eightBallFoul from "../../../assets/rules/eight-ball-foul.svg";
import eightBallScorecard from "../../../assets/rules/eight-ball-scorecard.svg";
import snookerGoal from "../../../assets/rules/snooker-goal.svg";
import snookerSetup from "../../../assets/rules/snooker-setup.svg";
import snookerTurn from "../../../assets/rules/snooker-turn.svg";
import snookerStrategy from "../../../assets/rules/snooker-strategy.svg";
import snookerFoul from "../../../assets/rules/snooker-foul.svg";
import snookerScorecard from "../../../assets/rules/snooker-scorecard.svg";

export const ruleGames = [
  {
    id: "snooker",
    country: "United Kingdom",
    name: "Snooker",
    shortName: "Snooker",
    started: "1875",
    ballCount: "21 object balls + cue ball",
    accent: "#0f766e",
    originLink: "A British rule system built around scoring, safety and break-building.",
    heroImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Snooker_Table_Start_Positions.jpg?width=1600",
    imageCredit: "Snooker teaching diagrams created for this guide; overview start-position image from Wikimedia Commons.",
    beginnerSummary:
      "Snooker is a points game: alternate reds and colours, build a break, and use safety when the scoring chance is too risky.",
    steps: [
      {
        title: "Goal",
        image: snookerGoal,
        imageFit: "contain",
        visualIcon: "+",
        visualLabel: "Most points",
        body: "Score more points than your opponent by potting reds and colours in the correct sequence, then clearing the colours in order.",
        bullets: ["A frame is won by total points, not by one final ball alone.", "Safety play can be as important as potting."],
      },
      {
        title: "Initial setup",
        image: snookerSetup,
        imageFit: "contain",
        visualIcon: "15",
        visualLabel: "Reds + colours",
        body: "The table starts with 15 reds in a triangle and six colours on their spots: yellow, green, brown, blue, pink and black.",
        bullets: ["The cue ball starts in the D for the opening shot.", "Reds are worth 1 point; colours range from 2 to 7."],
      },
      {
        title: "Your turn",
        image: snookerTurn,
        imageFit: "contain",
        visualIcon: "R/C",
        visualLabel: "Red then colour",
        body: "When reds remain, the normal rhythm is red, colour, red, colour. Potted colours return to their spots until the final clearance.",
        bullets: ["After all reds are gone, pot the colours in order: yellow, green, brown, blue, pink, black.", "If you miss without fouling, your opponent plays next."],
      },
      {
        title: "What you can do",
        image: snookerStrategy,
        imageFit: "contain",
        visualIcon: "↘",
        visualLabel: "Break + safety",
        body: "Good snooker combines scoring and control: choose the colour that gives both points and position for the next red.",
        bullets: ["Build breaks with red-colour patterns.", "Play safeties to hide the cue ball from the next target.", "Use cushions to escape when snookered."],
      },
      {
        title: "What you cannot do",
        image: snookerFoul,
        imageFit: "contain",
        visualIcon: "!",
        visualLabel: "Wrong ball",
        body: "Fouls usually come from hitting the wrong ball first, scratching, touching a ball, or failing to escape a snooker legally.",
        bullets: ["Do not hit a colour first when a red is on.", "Do not hit the wrong colour during the final clearance.", "Do not jump over balls.", "Do not touch balls with hand, cue or clothing."],
      },
      {
        title: "Scoring",
        image: snookerScorecard,
        imageFit: "contain",
        visualIcon: "147",
        visualLabel: "Point values",
        body: "Red = 1, yellow = 2, green = 3, brown = 4, blue = 5, pink = 6, black = 7. Fouls award points to the opponent, usually at least 4.",
        bullets: ["A high break comes from repeatedly pairing reds with high-value colours.", "The frame ends when no points remain or a player concedes."],
      },
    ],
  },
  {
    id: "nine-ball",
    country: "United States",
    name: "American 9-Ball",
    shortName: "9-Ball",
    started: "1920s-1930s",
    ballCount: "9 object balls + cue ball",
    accent: "#2563eb",
    originLink: "Rotation pool shaped by American tournament culture.",
    heroImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Nine-ball_rack.jpg?width=1200",
    imageCredit: "9-ball teaching diagrams created for this guide; rack photo from Wikimedia Commons on the overview card.",
    beginnerSummary:
      "The easiest way to understand 9-ball: always hit the lowest-numbered ball first, but any legal shot that pockets the 9 wins the rack.",
    steps: [
      {
        title: "Goal",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Nine-ball_rack.jpg?width=1200",
        visualIcon: "9",
        visualLabel: "Win ball",
        body: "Win the rack by legally pocketing the 9-ball. The 9 can be made at the end of a run-out or earlier through a legal combination.",
        bullets: ["You do not need to pocket balls in numerical order.", "You do need to contact the lowest-numbered ball first on every shot."],
      },
      {
        title: "Initial setup",
        image: nineBallDiamondLayout,
        imageFit: "contain",
        visualIcon: "◆",
        visualLabel: "Diamond rack",
        body: "Nine object balls are racked in a diamond. The 1-ball is at the apex, the 9-ball sits in the center, and the remaining balls are placed randomly.",
        bullets: ["The cue ball starts behind the head string for the break.", "A legal break must contact the 1-ball first."],
      },
      {
        title: "Your turn",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/9f/EVD-billar-102.jpg",
        visualIcon: "1",
        visualLabel: "Lowest first",
        body: "Read the lowest-numbered ball, choose attack or safety, then play a shot where the cue ball contacts that ball first.",
        bullets: ["If you legally pocket a ball, you keep shooting.", "If you miss without fouling, your opponent shoots from where the cue ball stops.", "After a foul, your opponent gets ball in hand anywhere on the table."],
      },
      {
        title: "What you can do",
        image: nineBallStrategyShot,
        imageFit: "contain",
        visualIcon: "↗",
        visualLabel: "Combo routes",
        body: "9-ball rewards creative routes because the target contact and the pocketed ball can be different.",
        bullets: ["Play combinations through the lowest ball.", "Play banks, kicks and safeties.", "Use a legal lowest-ball contact to pocket the 9 early."],
      },
      {
        title: "What you cannot do",
        image: nineBallFoulShot,
        imageFit: "contain",
        visualIcon: "!",
        visualLabel: "Foul risk",
        body: "Most beginner fouls come from hitting the wrong first ball or failing to send any ball to a rail after contact.",
        bullets: ["Do not contact a higher-numbered ball first.", "Do not scratch the cue ball.", "Do not leave the table without a pocketed ball or rail contact after the hit.", "Three consecutive fouls usually lose the rack."],
      },
      {
        title: "Scoring",
        image: nineBallRaceScorecard,
        imageFit: "contain",
        visualIcon: "1",
        visualLabel: "Rack count",
        body: "9-ball is normally scored by racks, not by points. Each legally won rack counts as one game in a race format.",
        bullets: ["The value of the balls does not matter.", "The 9-ball is the rack-winning ball."],
      },
    ],
  },
  {
    id: "chinese-eight-ball",
    country: "China",
    name: "Chinese 8-Ball",
    shortName: "Heyball",
    started: "1980s-1990s roots; 2010s pro boom",
    ballCount: "15 object balls + cue ball",
    accent: "#14b8a6",
    originLink: "China's hybrid 8-ball game, now promoted internationally as Heyball.",
    heroImage: "https://commons.wikimedia.org/wiki/Special:FilePath/8-ball_Rack_in_Billiards.jpg?width=1600",
    imageCredit: "Chinese 8-ball teaching diagrams created for this guide; overview rack photo from Wikimedia Commons.",
    beginnerSummary:
      "Chinese 8-ball feels familiar to pool players, but its tight pockets and call-shot logic make planning and precision much more important.",
    steps: [
      {
        title: "Goal",
        image: eightBallGoal,
        imageFit: "contain",
        visualIcon: "8",
        visualLabel: "Finish ball",
        body: "Choose or receive a group, clear that group, then legally pocket the 8-ball to win the rack.",
        bullets: ["One player owns solids, the other owns stripes.", "The 8-ball is only legal after your group has been cleared."],
      },
      {
        title: "Initial setup",
        image: eightBallSetup,
        imageFit: "contain",
        visualIcon: "△",
        visualLabel: "Triangle rack",
        body: "Fifteen object balls are racked in a triangle. The 8-ball sits near the center, with one solid and one stripe commonly placed in the two back corners.",
        bullets: ["The cue ball starts behind the head string for the break.", "Groups are decided by the event's rule set, often after a legal potted ball."],
      },
      {
        title: "Your turn",
        image: eightBallTurn,
        imageFit: "contain",
        visualIcon: "S",
        visualLabel: "Solids / stripes",
        body: "Call the intended ball and pocket when required, contact your own group first, and continue only when your called shot is legally made.",
        bullets: ["If you legally pot your group ball, you keep shooting.", "If you miss without fouling, your opponent plays from the leave.", "After a foul, the opponent usually receives ball in hand."],
      },
      {
        title: "What you can do",
        image: eightBallStrategy,
        imageFit: "contain",
        visualIcon: "↔",
        visualLabel: "Pattern plan",
        body: "The game rewards deliberate patterns: open clusters, choose the right order, and leave an angle for the next ball.",
        bullets: ["Play safeties after legal contact.", "Use combinations if your group is contacted first.", "Call and pocket the 8 after all of your group is gone."],
      },
      {
        title: "What you cannot do",
        image: eightBallFoul,
        imageFit: "contain",
        visualIcon: "!",
        visualLabel: "Wrong group",
        body: "The biggest beginner risk is touching the wrong group first or moving to the 8-ball too early.",
        bullets: ["Do not hit your opponent's group first.", "Do not pocket the 8 before your group is cleared.", "Do not scratch or send balls off the table.", "Do not rely on lucky slop when call-shot rules apply."],
      },
      {
        title: "Scoring",
        image: eightBallScorecard,
        imageFit: "contain",
        visualIcon: "1",
        visualLabel: "Rack count",
        body: "Chinese 8-ball is normally scored by racks. A legal 8-ball finish wins one rack; events are usually races to a target number of racks.",
        bullets: ["Object balls do not carry point values.", "The 8-ball is the final winning ball, not an early shortcut."],
      },
    ],
  },
];
