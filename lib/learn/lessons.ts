export type Lesson = {
  day: number;
  dayLabel: string;
  title: string;
  content: string[];
  takeaways: string[];
};

// Temporary hardcoded content — not seeded to the database yet.
export const lessons: Lesson[] = [
  {
    day: 1,
    dayLabel: "Day 1",
    title: "Meet the tiles & the table",
    content: [
      "Welcome to American Mahjong. Before any strategy, it helps to simply get comfortable with what is in front of you: the tiles, the rack, and the rhythm of the table.",
      "There are three suits — Bams (bamboo), Cracks (characters), and Dots (circles) — each numbered 1 through 9. Alongside them sit the honor tiles (Winds and Dragons), Flowers, and the all-important Jokers.",
      "Take your time today. The goal is recognition, not memorization. By the end you should be able to glance at a tile and name it without hesitation.",
    ],
    takeaways: [
      "Learn the three suits, honors, and jokers",
      "Understand how tiles are arranged on the rack",
      "Watch a short, jargon-free intro to the table",
    ],
  },
  {
    day: 2,
    dayLabel: "Day 2",
    title: "Understanding the Charleston",
    content: [
      "The Charleston is unique to American Mahjong — a passing ritual at the start of each hand that lets players trade away tiles they cannot use.",
      "The first Charleston is three passes: right, across, then left. A second, optional Charleston can follow if every player agrees.",
      "It feels awkward at first, then quickly becomes second nature. Today, focus on the direction of each pass and how to choose which tiles to let go.",
    ],
    takeaways: [
      "First Charleston: pass right, across, left",
      "Second Charleston is optional and needs agreement",
      "Practice choosing which tiles to release",
    ],
  },
  {
    day: 3,
    dayLabel: "Day 3",
    title: "Reading the card",
    content: [
      "Every year the National Mah Jongg League publishes a new card listing the winning hands. Learning to read it is the single biggest unlock for beginners.",
      "Hands are grouped into categories — Singles & Pairs, Consecutive Runs, and more. Each line shows the exact tiles you need and how many points it scores.",
      "Don't try to learn every hand. Pick two or three that fit the tiles you already hold, and let the card guide your plan.",
    ],
    takeaways: [
      "Understand categories like Singles & Pairs and Consecutives",
      "Spot a few hands you can realistically build",
      "Save favorite hands to focus your play",
    ],
  },
  {
    day: 4,
    dayLabel: "Day 4",
    title: "Building your first hand",
    content: [
      "Now we put theory into practice. Building a hand is about recognizing patterns and planning a few tiles ahead rather than reacting tile by tile.",
      "Learn the building blocks: pairs, pungs (three of a kind), and kongs (four of a kind). Decide early which hand on the card you are aiming for.",
      "Flexibility matters. Keep options open in the early game, then commit as your tiles take shape.",
    ],
    takeaways: [
      "Pungs, kongs, and pairs explained",
      "Know when to keep vs. break up a hand",
      "Plan a few tiles ahead toward a card hand",
    ],
  },
  {
    day: 5,
    dayLabel: "Day 5",
    title: "Calling & claiming tiles",
    content: [
      "When another player discards a tile you need, you may be able to call it. Today covers when calling is allowed and the etiquette around it.",
      "You can call a discard to complete a pung, kong, or quint — but it must be exposed for the table to see. Jokers add another layer: they can be exchanged when you hold the matching tiles.",
      "Calling speeds up your hand but reveals information. Learn to weigh the trade-off.",
    ],
    takeaways: [
      "Call rules for pung, kong, and quint",
      "Joker exchange basics",
      "Table-talk do's and don'ts",
    ],
  },
  {
    day: 6,
    dayLabel: "Day 6",
    title: "Strategy & table etiquette",
    content: [
      "With the rules in hand, we go a little deeper. Good players read the table — watching discards and exposures to sense what others are building.",
      "Balance offense and defense: push toward your hand when it's strong, and hold dangerous tiles when an opponent looks close.",
      "Etiquette is part of the game. Keep a steady pace, be gracious, and you'll be the guest everyone wants back.",
    ],
    takeaways: [
      "Defensive vs. offensive play",
      "Pick from the wall with confidence",
      "Hosting and guest etiquette",
    ],
  },
  {
    day: 7,
    dayLabel: "Day 7",
    title: "Your first live club game",
    content: [
      "You're ready. The final step is to sit down at a real table — and that's exactly what JoinMahj clubs are for.",
      "Find a beginner-friendly club near you, RSVP, and arrive a few minutes early. Bring curiosity, not pressure; everyone was new once.",
      "After the game, reflect on one thing that clicked and one thing to practice. That's how confidence is built — one warm evening at a time.",
    ],
    takeaways: [
      "Find beginner-friendly clubs near you",
      "RSVP and use a pre-game checklist",
      "Reflect after the game and plan next steps",
    ],
  },
];
