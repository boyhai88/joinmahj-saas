export type CourseTier = "free" | "pro";

export type AcademyCourse = {
  slug: string;
  title: string;
  summary: string;
  duration: string;
  tier: CourseTier;
  lessons?: string[];
  objectives?: string[];
  audience?: string[];
};

export type AcademyCategory = {
  id: string;
  level: string;
  tier: CourseTier;
  description: string;
  courses: AcademyCourse[];
};

export const academyCategories: AcademyCategory[] = [
  {
    id: "beginner",
    level: "Beginner",
    tier: "free",
    description:
      "Start from zero. Learn the tiles, the basic flow of play, and how to complete your very first winning hand.",
    courses: [
      {
        slug: "recognize-mahjong-tiles",
        title: "Recognize Mahjong Tiles",
        summary:
          "Meet the suits, honors, and bonus tiles, and learn how to read a full set at a glance.",
        duration: "18 min",
        tier: "free",
      },
      {
        slug: "drawing-and-discarding",
        title: "Drawing and Discarding",
        summary:
          "Understand the turn cycle: how you draw, what you keep, and how to discard with purpose.",
        duration: "22 min",
        tier: "free",
      },
      {
        slug: "chi-pong-kong-win",
        title: "Chi, Pong, Kong, Win",
        summary:
          "Learn the four core calls and when claiming a tile actually helps your hand.",
        duration: "26 min",
        tier: "free",
      },
      {
        slug: "your-first-winning-hand",
        title: "Your First Winning Hand",
        summary:
          "Put the rules together and build a complete, legal winning hand step by step.",
        duration: "24 min",
        tier: "free",
      },
      {
        slug: "common-mahjong-patterns",
        title: "Common Mahjong Patterns",
        summary:
          "Recognize the everyday shapes and sequences that show up in almost every game.",
        duration: "30 min",
        tier: "free",
      },
    ],
  },
  {
    id: "intermediate",
    level: "Intermediate",
    tier: "pro",
    description:
      "Move from playing legally to playing well. Build efficiency, count shanten, and start thinking about defense.",
    courses: [
      {
        slug: "tile-efficiency",
        title: "Tile Efficiency",
        summary:
          "Keep the tiles that give you the most ways to improve and let go of the dead weight.",
        duration: "34 min",
        tier: "pro",
        lessons: [
          "Counting acceptance and ukeire",
          "Two-sided vs closed wait shapes",
          "Choosing between equal discards",
          "Floating tiles and backup shapes",
          "Speed-first decision drills",
        ],
        objectives: [
          "Count how many tiles improve your hand for any discard.",
          "Compare candidate discards by their acceptance, not by feel.",
          "Recognize which partial shapes are worth keeping.",
          "Make faster, more confident efficiency decisions.",
        ],
        audience: [
          "Players who know the rules and want to win more often.",
          "Anyone who tends to draw well but discards the wrong tile.",
        ],
      },
      {
        slug: "shanten-fundamentals",
        title: "Shanten Fundamentals",
        summary:
          "Learn to count how far you are from a winning hand and use it to guide every decision.",
        duration: "38 min",
        tier: "pro",
        lessons: [
          "What shanten really measures",
          "Counting shanten quickly by hand",
          "Standard hand vs special shapes",
          "Using shanten to pick discards",
          "Shanten and acceptance together",
        ],
        objectives: [
          "Define shanten and count it for any hand.",
          "Use shanten to know when to push and when to reshape.",
          "Balance lowering shanten against keeping acceptance.",
          "Spot the fastest path to tenpai.",
        ],
        audience: [
          "Players comfortable with tile efficiency basics.",
          "Anyone who wants a clear, numeric read on hand progress.",
        ],
      },
      {
        slug: "defensive-mahjong",
        title: "Defensive Mahjong",
        summary:
          "Know when to fold, what is safe to discard, and how to avoid feeding your opponents.",
        duration: "36 min",
        tier: "pro",
        lessons: [
          "Reading the danger signals",
          "Safe tiles and genbutsu",
          "Suji and wall-based reasoning",
          "When to fold a live hand",
          "Defense under time pressure",
        ],
        objectives: [
          "Identify when an opponent is likely tenpai.",
          "Find genuinely safe tiles to discard under threat.",
          "Decide between pushing for the win and folding.",
          "Cut your deal-in rate without going fully passive.",
        ],
        audience: [
          "Players who win hands but lose points to big deal-ins.",
          "Anyone ready to balance offense with real defense.",
        ],
      },
      {
        slug: "reading-opponents",
        title: "Reading Opponents",
        summary:
          "Use discards and calls to infer what the players around you are collecting.",
        duration: "32 min",
        tier: "pro",
        lessons: [
          "Reading the discard order",
          "What calls reveal about a hand",
          "Tracking suits and honors",
          "Estimating waits and value",
          "Putting reads into action",
        ],
        objectives: [
          "Infer an opponent's direction from their discards.",
          "Use exposed calls to narrow their likely hand.",
          "Estimate which tiles are dangerous to each player.",
          "Turn reads into concrete keep-or-fold choices.",
        ],
        audience: [
          "Players who track their own hand but ignore opponents.",
          "Anyone who wants to play the table, not just the tiles.",
        ],
      },
      {
        slug: "real-game-analysis",
        title: "Real Game Analysis",
        summary:
          "Walk through full hands and see how the concepts connect under real pressure.",
        duration: "42 min",
        tier: "pro",
        lessons: [
          "Framing a hand from the deal",
          "Early-game shaping decisions",
          "Mid-game pivots and reads",
          "Endgame push-or-fold calls",
          "Reviewing your own games",
        ],
        objectives: [
          "Connect efficiency, defense, and reads in real hands.",
          "Narrate the reasoning behind each decision point.",
          "Spot the turning points that decided a hand.",
          "Build a repeatable self-review habit.",
        ],
        audience: [
          "Players who know the concepts but struggle to apply them live.",
          "Anyone who learns best from worked, full-hand examples.",
        ],
      },
    ],
  },
  {
    id: "advanced",
    level: "Advanced",
    tier: "pro",
    description:
      "Train like a competitor. Master tournament strategy, high-level reads, and championship-grade decision making.",
    courses: [
      {
        slug: "tournament-strategy",
        title: "Tournament Strategy",
        summary:
          "Adapt your play to scores, seat positions, and the long arc of a multi-round event.",
        duration: "40 min",
        tier: "pro",
        lessons: [
          "Scoreboard-aware decision making",
          "Seat and dealer-turn strategy",
          "Managing risk across rounds",
          "Closing out a winning position",
          "Mounting a comeback from behind",
        ],
        objectives: [
          "Adjust aggression based on the current score.",
          "Value placement and survival over raw points.",
          "Plan across a full multi-round event.",
          "Protect a lead and chase a deficit correctly.",
        ],
        audience: [
          "Competitive players preparing for ranked or live events.",
          "Anyone who plays well per hand but mismanages the match.",
        ],
      },
      {
        slug: "professional-thinking",
        title: "Professional Thinking",
        summary:
          "Develop the disciplined, expected-value mindset that separates pros from strong amateurs.",
        duration: "44 min",
        tier: "pro",
        lessons: [
          "Thinking in expected value",
          "Separating results from decisions",
          "Managing tilt and focus",
          "Building consistent routines",
          "Studying like a professional",
        ],
        objectives: [
          "Evaluate plays by expected value, not outcome.",
          "Avoid results-oriented thinking after wins and losses.",
          "Stay composed and focused over long sessions.",
          "Build a deliberate, repeatable study process.",
        ],
        audience: [
          "Strong players who want a professional mental game.",
          "Anyone whose results swing with their mood.",
        ],
      },
      {
        slug: "advanced-defense",
        title: "Advanced Defense",
        summary:
          "Layer safe-tile reasoning, push-or-fold math, and risk control into one fluid system.",
        duration: "46 min",
        tier: "pro",
        lessons: [
          "Layered safe-tile reasoning",
          "Quantifying push-or-fold",
          "Defending against multiple threats",
          "Reading double and chase riichi",
          "Risk control in the endgame",
        ],
        objectives: [
          "Combine suji, walls, and reads into one safety model.",
          "Estimate push-or-fold value under pressure.",
          "Defend correctly against more than one opponent.",
          "Minimize losses in high-danger endgames.",
        ],
        audience: [
          "Players who have mastered basic defense.",
          "Anyone bleeding points in multi-threat situations.",
        ],
      },
      {
        slug: "high-level-hand-reading",
        title: "High Level Hand Reading",
        summary:
          "Narrow opponents to precise waits using subtle timing and discard signals.",
        duration: "48 min",
        tier: "pro",
        lessons: [
          "Timing tells in the discards",
          "Negative reads and absent tiles",
          "Combining calls with timing",
          "Pinpointing exact waits",
          "Reading value and intent",
        ],
        objectives: [
          "Use discard timing to refine your reads.",
          "Reason from tiles that are missing, not just present.",
          "Narrow an opponent to a precise wait.",
          "Anticipate both the wait and the hand value.",
        ],
        audience: [
          "Advanced players who already read opponents well.",
          "Anyone chasing the last edge in close decisions.",
        ],
      },
      {
        slug: "championship-case-studies",
        title: "Championship Case Studies",
        summary:
          "Dissect decisive hands from championship play and learn what the winners saw.",
        duration: "52 min",
        tier: "pro",
        lessons: [
          "Anatomy of a championship hand",
          "Decisive pushes under pressure",
          "Game-saving defensive folds",
          "Reads that won the title",
          "Lessons you can apply today",
        ],
        objectives: [
          "Break down high-stakes hands move by move.",
          "Understand why champions chose each line.",
          "Recognize the moments that decided a match.",
          "Translate elite decisions into your own play.",
        ],
        audience: [
          "Tournament-minded players studying the very best.",
          "Anyone who wants to learn from championship games.",
        ],
      },
    ],
  },
];

export function getAcademyCourse(slug: string):
  | { course: AcademyCourse; category: AcademyCategory }
  | null {
  for (const category of academyCategories) {
    const course = category.courses.find((item) => item.slug === slug);
    if (course) {
      return { course, category };
    }
  }
  return null;
}

export function getAllAcademyCourseSlugs(): string[] {
  return academyCategories.flatMap((category) =>
    category.courses.map((course) => course.slug),
  );
}

export type CourseLesson = {
  index: number;
  title: string;
  duration: string;
  locked: boolean;
};

const lessonTitleTemplates = [
  "Introduction & goals",
  "Core concepts",
  "Worked examples",
  "Hands-on practice",
  "Recap & next steps",
];

export function getCourseLessons(course: AcademyCourse): CourseLesson[] {
  const totalMinutes = Number.parseInt(course.duration, 10) || 25;
  const per = Math.max(
    3,
    Math.round(totalMinutes / lessonTitleTemplates.length),
  );

  return lessonTitleTemplates.map((title, index) => ({
    index: index + 1,
    title: course.lessons?.[index] ?? title,
    duration: `${per} min`,
    locked: course.tier === "pro",
  }));
}
