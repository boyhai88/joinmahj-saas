export type CourseTier = "free" | "pro";

export type AcademyCourse = {
  slug: string;
  title: string;
  summary: string;
  duration: string;
  tier: CourseTier;
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
      },
      {
        slug: "shanten-fundamentals",
        title: "Shanten Fundamentals",
        summary:
          "Learn to count how far you are from a winning hand and use it to guide every decision.",
        duration: "38 min",
        tier: "pro",
      },
      {
        slug: "defensive-mahjong",
        title: "Defensive Mahjong",
        summary:
          "Know when to fold, what is safe to discard, and how to avoid feeding your opponents.",
        duration: "36 min",
        tier: "pro",
      },
      {
        slug: "reading-opponents",
        title: "Reading Opponents",
        summary:
          "Use discards and calls to infer what the players around you are collecting.",
        duration: "32 min",
        tier: "pro",
      },
      {
        slug: "real-game-analysis",
        title: "Real Game Analysis",
        summary:
          "Walk through full hands and see how the concepts connect under real pressure.",
        duration: "42 min",
        tier: "pro",
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
      },
      {
        slug: "professional-thinking",
        title: "Professional Thinking",
        summary:
          "Develop the disciplined, expected-value mindset that separates pros from strong amateurs.",
        duration: "44 min",
        tier: "pro",
      },
      {
        slug: "advanced-defense",
        title: "Advanced Defense",
        summary:
          "Layer safe-tile reasoning, push-or-fold math, and risk control into one fluid system.",
        duration: "46 min",
        tier: "pro",
      },
      {
        slug: "high-level-hand-reading",
        title: "High Level Hand Reading",
        summary:
          "Narrow opponents to precise waits using subtle timing and discard signals.",
        duration: "48 min",
        tier: "pro",
      },
      {
        slug: "championship-case-studies",
        title: "Championship Case Studies",
        summary:
          "Dissect decisive hands from championship play and learn what the winners saw.",
        duration: "52 min",
        tier: "pro",
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
    title,
    duration: `${per} min`,
    locked: course.tier === "pro",
  }));
}
