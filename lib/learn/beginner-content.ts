export type CourseContentSection = {
  heading: string;
  paragraphs: string[];
};

export type CourseContent = {
  slug: string;
  intro: string;
  sections: CourseContentSection[];
  keyTips: string[];
  commonMistakes: string[];
};

const content: Record<string, CourseContent> = {
  "recognize-mahjong-tiles": {
    slug: "recognize-mahjong-tiles",
    intro:
      "Before you can play a single hand, you need to read the tiles fluently. A standard Mahjong set has 136 tiles, but they are built from a small number of repeating families. Once you see the structure, the wall of tiles in front of you stops looking like noise and starts looking like a language you can read at a glance.",
    sections: [
      {
        heading: "The three number suits",
        paragraphs: [
          "Most of the set is made of three suits that each run from 1 to 9: Characters (also called man or wan), Dots (pin or tong), and Bamboo (sou or tiao). Each suit has four copies of every number, so there are four 1-Dots, four 2-Dots, and so on, all the way up to four 9-Dots. Three suits times nine numbers times four copies gives you 108 number tiles, the bulk of the game.",
          "The suits behave the same way mechanically. A run of 3-4-5 Dots works exactly like a run of 3-4-5 Bamboo. Learning to think in terms of number and suit, rather than memorizing each picture separately, is the single biggest speed-up for a beginner. When you look at a tile, name it in your head as a number plus a suit: not just a picture, but a 7-Bamboo.",
        ],
      },
      {
        heading: "Honor tiles: winds and dragons",
        paragraphs: [
          "On top of the numbers there are seven honor tiles. Four of them are winds: East, South, West, and North. Three of them are dragons: Red, Green, and White. Like the numbers, each honor has four copies, adding 28 more tiles.",
          "Honors are special because they have no neighbors. A 5-Dot can join a run with 4 and 6, but East wind can never form a run. The only way to use an honor is to collect a pair or three of a kind. That single fact shapes a lot of beginner strategy: lone honor tiles are often the first things you discard, unless you have a specific reason to keep them.",
        ],
      },
      {
        heading: "Bonus tiles: flowers and seasons",
        paragraphs: [
          "Many sets include eight bonus tiles: four flowers and four seasons. In the variants that use them, these tiles are not part of your playing hand. When you draw one, you set it aside and immediately draw a replacement tile. They usually act as small scoring bonuses rather than building blocks.",
          "As a beginner you mostly need to recognize them so you do not try to build sets out of them. If your variant ignores bonus tiles entirely, you can safely skip this family for now and focus on suits and honors.",
        ],
      },
      {
        heading: "How a hand is composed",
        paragraphs: [
          "A complete hand is almost always four sets plus one pair. A set is either a run of three consecutive numbers in one suit, or three identical tiles. The pair is simply two identical tiles. Knowing the target shape tells you why some tiles are valuable: a 5-Dot is flexible because it can pair, become a triplet, or sit in many different runs.",
          "When you scan your hand, group tiles by suit first, then look for tiles that are already next to each other or already matched. This grouping habit is what lets strong players evaluate a hand in a second or two.",
        ],
      },
      {
        heading: "Reading tiles at speed",
        paragraphs: [
          "Speed comes from chunking. Instead of reading thirteen separate tiles, you learn to see clusters: a finished run here, a pair there, two tiles that almost make a run somewhere else. Practice by sorting a random handful into suits and calling out the number of each tile out loud.",
          "Within a few sessions, the pictures fade into the background and you simply see numbers and suits. That fluency is the foundation for everything else in this course track.",
        ],
      },
    ],
    keyTips: [
      "Name every tile as a number plus a suit, not as a picture, to read faster.",
      "Honors and terminals (1s and 9s) are less flexible than middle numbers (3 to 7).",
      "Always remember the target: four sets and one pair.",
      "Sort your hand by suit before you make any decision.",
    ],
    commonMistakes: [
      "Trying to build a run out of honor tiles, which is impossible.",
      "Confusing Bamboo 1 with a bird design and misreading the suit.",
      "Holding too many lone honors hoping they will pair up.",
      "Reading tiles one by one instead of grouping them into clusters.",
    ],
  },

  "drawing-and-discarding": {
    slug: "drawing-and-discarding",
    intro:
      "Mahjong is a game of draw and discard. On every turn you take one tile in and let one tile go, slowly shaping thirteen tiles toward a winning fourteen. Mastering this rhythm, and learning to choose your discards on purpose, is what turns random luck into skill.",
    sections: [
      {
        heading: "The turn cycle",
        paragraphs: [
          "Play moves around the table, usually counter-clockwise. On your turn you draw one tile from the wall, look at your now fourteen tiles, and then discard exactly one, returning to thirteen. The discarded tile goes face up in the middle where everyone can see it.",
          "This simple loop, draw then discard, repeats until someone completes a hand or the wall runs out. Understanding that you always end your turn at thirteen tiles keeps you from miscounting, which is one of the most common beginner errors.",
        ],
      },
      {
        heading: "Your starting hand",
        paragraphs: [
          "You begin with thirteen tiles. They will rarely be close to a win, and that is normal. Your job over the next many turns is to trade away tiles that do not help and keep tiles that move you closer to four sets and a pair.",
          "Think of your hand as a work in progress. Early on you keep your options wide and discard only the most clearly useless tiles. As the hand develops, you commit to a direction and start cutting tiles that no longer fit your plan.",
        ],
      },
      {
        heading: "Choosing what to discard",
        paragraphs: [
          "The discard is your real decision each turn. A good default is to release isolated tiles first: a lone 9 with no neighbors does less for you than a 5 that touches many possible runs. Tiles in the middle of a suit, the 3 through 7 range, connect to more shapes and are usually worth keeping longer.",
          "Ask a simple question before every discard: which tile, if removed, costs me the fewest future sets? The answer is your discard. This single habit, thinking in terms of lost potential, will outperform pure instinct very quickly.",
        ],
      },
      {
        heading: "Reading the discards",
        paragraphs: [
          "The pile of discards in the middle is public information. If three of the four East winds are already discarded, your lone East is nearly worthless and safe to release. If many low Dots have appeared, runs in that area are harder for everyone.",
          "Beginners often ignore the discard pile entirely. Even a light habit of glancing at what has been thrown gives you a real edge in deciding both what to keep and what is safe to let go.",
        ],
      },
      {
        heading: "Tempo and patience",
        paragraphs: [
          "There is a balance between speed and value. Rushing to any cheap hand can win small and often, while holding out for a bigger hand risks the wall running out before you finish. As a beginner, lean toward steady, simple progress: a hand you can actually complete beats a beautiful hand you never finish.",
          "Patience also means not panicking when your draws are poor. Some hands simply will not come together, and recognizing that early lets you switch to a safer, defensive posture instead of forcing a loss.",
        ],
      },
    ],
    keyTips: [
      "You always end your turn holding thirteen tiles; count to stay honest.",
      "Discard isolated terminals and honors before flexible middle tiles.",
      "Before discarding, ask which tile costs you the fewest future sets.",
      "Glance at the discard pile every turn to judge what is safe and what is dead.",
    ],
    commonMistakes: [
      "Holding fourteen tiles by forgetting to discard, which is an illegal hand.",
      "Throwing away flexible 3 to 7 tiles too early.",
      "Ignoring the discard pile and keeping tiles that can no longer complete.",
      "Forcing a big hand when the draws clearly are not cooperating.",
    ],
  },

  "chi-pong-kong-win": {
    slug: "chi-pong-kong-win",
    intro:
      "Sometimes you do not have to wait for the wall to give you the tile you need. When another player discards, you may be able to claim it with a call: Chi, Pong, or Kong. Calling speeds up your hand but comes with trade-offs. This lesson covers the four core actions and when each one helps.",
    sections: [
      {
        heading: "What calling means",
        paragraphs: [
          "A call lets you take a tile that someone else discarded and immediately use it to complete a set in your hand. You reveal the completed set face up in front of you, and play continues from your position. Because the set is exposed, everyone can see part of what you are building.",
          "Calling is powerful because it can save many turns of drawing. But an exposed set is information for your opponents, and in many scoring systems an open hand is worth fewer points. The art is knowing when the speed is worth the cost.",
        ],
      },
      {
        heading: "Chi: claiming a sequence",
        paragraphs: [
          "Chi lets you complete a run using a discard, but only from the player immediately to your left, the one who plays right before you. If you hold 4 and 6 Dots and the left player discards 5 Dots, you can Chi to form the 4-5-6 run.",
          "Chi is the most flexible call because runs are common, but it only works on that one neighbor. Use it when the sequence genuinely advances your plan, not just because a tile happens to fit.",
        ],
      },
      {
        heading: "Pong and Kong",
        paragraphs: [
          "Pong claims a triplet. If you hold two identical tiles and any player discards the third, you may Pong to complete three of a kind. Unlike Chi, Pong works against a discard from any player at the table.",
          "Kong is four of a kind. You can call Kong on a discard when you already hold three matching tiles, or declare a Kong from your own hand. After any Kong you draw a replacement tile, because a four-tile set still only counts as one set toward your four-sets-and-a-pair goal.",
        ],
      },
      {
        heading: "Declaring a win",
        paragraphs: [
          "You win when a tile completes your final hand of four sets and a pair. If the winning tile comes from the wall on your own draw, it is a self-draw, often called tsumo. If it comes from another player's discard, you claim it as a win, often called ron.",
          "The moment your hand is complete you announce the win before the next player draws. Hesitate too long and you may miss the claim, so it pays to know in advance exactly which tiles complete your hand.",
        ],
      },
      {
        heading: "Open versus closed hands",
        paragraphs: [
          "Every call opens your hand, and an open hand is usually easier to finish but lower scoring, and it often gives up access to certain bonuses reserved for fully concealed hands. A closed hand, built only from your own draws, is slower but typically worth more.",
          "A reliable beginner guideline: call when you are clearly going for a fast, simple hand and the tile is hard to draw otherwise. Stay closed when you are aiming for value or when calling would barely save you any time.",
        ],
      },
    ],
    keyTips: [
      "Chi only works on the discard from the player to your immediate left.",
      "Pong and Kong can be claimed from any player's discard.",
      "After a Kong you draw a replacement tile, since it still counts as one set.",
      "Calling trades speed for points; weigh the value you give up.",
    ],
    commonMistakes: [
      "Trying to Chi from a player other than the one on your left.",
      "Calling on every fitting tile and exposing the whole hand needlessly.",
      "Forgetting to draw the replacement tile after a Kong.",
      "Opening a hand and accidentally losing access to higher-value concealed bonuses.",
    ],
  },

  "your-first-winning-hand": {
    slug: "your-first-winning-hand",
    intro:
      "Everything so far has been preparation for one moment: completing a legal winning hand. In this lesson you will build a hand from start to finish, see how the pieces lock together, and learn how to declare and verify the win with confidence.",
    sections: [
      {
        heading: "The shape of a win",
        paragraphs: [
          "A standard winning hand is four sets plus one pair, fourteen tiles in total at the moment you win. A set is three tiles: either a run of three consecutive numbers in one suit, or three identical tiles. The pair, sometimes called the eye, is two identical tiles.",
          "Hold this picture in your mind constantly. Every keep-or-discard decision is really a question of whether a tile helps you reach four sets and one pair. If it does not contribute to a set or the pair, it is a candidate to throw.",
        ],
      },
      {
        heading: "Building block by block",
        paragraphs: [
          "Start by identifying the pieces you already have. Maybe you hold a finished run of 2-3-4 Bamboo, a pair of West winds, and a few loose tiles. Those are your anchors. The loose tiles are what you reshape over the coming turns.",
          "Aim to convert partial shapes into finished ones. Two tiles like 5 and 6 Dots need only a 4 or a 7 to become a run, so they are valuable. A lone tile far from any neighbor is weak and usually the first to go.",
        ],
      },
      {
        heading: "A worked example",
        paragraphs: [
          "Suppose your hand grows to 2-3-4 Bamboo, 6-7-8 Bamboo, 3-3-3 Dots, 5-6 Dots, and a pair of White dragons. You already have three sets and a pair locked, plus the 5-6 Dots waiting to finish.",
          "Now you simply need a 4-Dot or a 7-Dot to complete that last run. The moment one appears, by your own draw or an opponent's discard, your hand becomes four sets and a pair, and you have a complete winning hand.",
        ],
      },
      {
        heading: "Declaring the win",
        paragraphs: [
          "When the completing tile arrives, announce your win immediately. If you drew it yourself it is a self-draw; if you took it from a discard it is claimed before the next player acts. Reveal your hand so the table can confirm the shape.",
          "Speed matters here. Because you should already know which tiles complete your hand, recognizing the winning tile instantly prevents you from accidentally passing on it.",
        ],
      },
      {
        heading: "Checking legality",
        paragraphs: [
          "Before you celebrate, verify that the fourteen tiles really do split cleanly into four sets and a pair with no tiles left over. Many variants also require at least one scoring element, a minimal condition for a valid win, so check the rules you are playing.",
          "Counting carefully becomes second nature with practice. A clean, confirmed win is far better than a hopeful announcement that turns out to be one tile short.",
        ],
      },
    ],
    keyTips: [
      "Keep the target shape in mind: four sets plus one pair.",
      "Two-tile shapes that are one tile from a run are your most valuable loose tiles.",
      "Know your completing tiles in advance so you never miss a win.",
      "Confirm the hand splits cleanly into sets and a pair before declaring.",
    ],
    commonMistakes: [
      "Announcing a win that is actually one tile short of complete.",
      "Discarding a tile that was about to complete a set.",
      "Forgetting the pair and trying to build five full sets.",
      "Missing a winning discard because you did not know your waits.",
    ],
  },

  "common-mahjong-patterns": {
    slug: "common-mahjong-patterns",
    intro:
      "Strong players do not read tiles one at a time; they recognize patterns. The same handful of shapes appear in almost every hand, and learning to spot them instantly is what makes fast, confident play possible. This lesson catalogs the everyday patterns you will use constantly.",
    sections: [
      {
        heading: "Runs and sequences",
        paragraphs: [
          "A run is three consecutive numbers in one suit, like 4-5-6 Dots. Runs are the workhorse of most hands because the tiles are easy to draw and easy to claim. The partial shapes that lead to runs are just as important to recognize.",
          "A two-sided shape such as 5-6 can be completed by either end, a 4 or a 7, giving you two chances. An edge shape like 1-2 can only be completed by a 3, and a gap shape like 5-7 needs exactly the 6. Knowing which partial run you hold tells you how many tiles can help.",
        ],
      },
      {
        heading: "Triplets and quads",
        paragraphs: [
          "A triplet is three identical tiles, and a quad is four. Triplets are slower to build than runs because there are only ever four copies of any tile, and other players may hold or discard them. Still, triplet-heavy hands are common, especially when you collect honors.",
          "When you hold a pair, you are one tile from a triplet. Recognizing pairs as triplet-starters helps you judge how flexible your hand is and whether to lean toward runs or triplets.",
        ],
      },
      {
        heading: "The pair and the eye",
        paragraphs: [
          "Every standard hand needs exactly one pair, often called the eye. Beginners frequently forget to reserve a pair and end up with four sets and a single leftover tile that can never complete.",
          "Keep at least one promising pair candidate throughout the hand. If you have several pairs early, one becomes the eye and the others can grow into triplets, which is a comfortable, flexible position.",
        ],
      },
      {
        heading: "Mixed and overlapping shapes",
        paragraphs: [
          "Real hands are messy, and tiles often belong to more than one possible shape at once. A cluster like 3-4-5-6 can be read as a 3-4-5 run with a leftover 6, or a 4-5-6 run with a leftover 3. Recognizing this flexibility helps you keep your options open.",
          "Overlapping shapes are valuable precisely because they accept many tiles. When you must choose what to discard, prefer cutting from rigid shapes and keeping the flexible clusters that can finish in several ways.",
        ],
      },
      {
        heading: "Recognizing patterns at a glance",
        paragraphs: [
          "The goal is to look at thirteen tiles and instantly see the finished sets, the near-finished shapes, and the dead weight. This comes from repetition: the more hands you sort, the faster the patterns jump out.",
          "Practice by dealing yourself random hands and naming every shape out loud, finished runs, two-sided waits, pairs, and lone tiles. Within a short time the structure of any hand will become obvious at a glance, and your decisions will speed up dramatically.",
        ],
      },
    ],
    keyTips: [
      "Two-sided shapes like 5-6 accept two tiles; edge and gap shapes accept only one.",
      "A pair is a triplet waiting for one more tile.",
      "Always reserve one pair as the eye for your hand.",
      "Keep flexible overlapping clusters and discard from rigid shapes.",
    ],
    commonMistakes: [
      "Keeping edge shapes like 1-2 when a two-sided shape was available.",
      "Forgetting to set aside a pair and ending with no eye.",
      "Breaking a flexible cluster instead of cutting a rigid leftover.",
      "Reading tiles individually instead of seeing whole shapes.",
    ],
  },
};

export function getBeginnerContent(slug: string): CourseContent | null {
  return content[slug] ?? null;
}
