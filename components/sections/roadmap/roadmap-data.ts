export type RoadmapDay = {
  day: number;
  title: string;
  desc: string;
  items: string[];
  icon: string;
  preview: string;
};

export const roadmapDays: RoadmapDay[] = [
  {
    day: 1,
    title: "Meet the tiles & the table",
    desc: "Start with the basics — what American Mahjong looks like, how the table is set up, and why this game feels so welcoming from the first tile.",
    items: [
      "Learn the three suits, honors, and jokers",
      "Understand how tiles are arranged at the table",
      "Watch a 5-minute intro with zero jargon",
    ],
    icon: "01",
    preview: "Interactive tile explorer with tap-to-learn labels",
  },
  {
    day: 2,
    title: "Understanding the Charleston",
    desc: "The Charleston is unique to American Mahjong — learn the passing ritual step by step until it feels natural.",
    items: [
      "First Charleston: pass right, across, left",
      "Second Charleston: optional second pass",
      "Practice with guided animations",
    ],
    icon: "02",
    preview: "Animated Charleston walkthrough",
  },
  {
    day: 3,
    title: "Reading the card",
    desc: "Every year brings a new card of winning hands. Learn how to read it without feeling overwhelmed.",
    items: [
      "Categories: Singles & Pairs, Consecutives, etc.",
      "How to spot hands you can build",
      "Save favorites to your profile",
    ],
    icon: "03",
    preview: "Scrollable card with hand highlights",
  },
  {
    day: 4,
    title: "Building your first hand",
    desc: "Put theory into practice — start recognizing patterns and planning a few tiles ahead.",
    items: [
      "Pungs, kongs, and pairs explained",
      "When to keep vs. break up a hand",
      "Guided hand-building exercise",
    ],
    icon: "04",
    preview: "Drag-and-drop hand builder",
  },
  {
    day: 5,
    title: "Calling & claiming tiles",
    desc: "Learn when to call a discard, how exposures work, and the etiquette of claiming at the table.",
    items: [
      "Call rules for pung, kong, quint",
      "Joker exchange basics",
      "Table talk do's and don'ts",
    ],
    icon: "05",
    preview: "Scenario-based call trainer",
  },
  {
    day: 6,
    title: "Strategy & table etiquette",
    desc: "Go beyond the rules — read the table, play thoughtfully, and be the guest everyone wants back.",
    items: [
      "Defensive vs. offensive play",
      "Picking from the wall with confidence",
      "Hosting and guest etiquette",
    ],
    icon: "06",
    preview: "Etiquette checklist for your first game",
  },
  {
    day: 7,
    title: "Your first live club game",
    desc: "You're ready. Find a beginner-friendly club, RSVP, and sit down with confidence.",
    items: [
      "Find clubs near you",
      "RSVP and get a pre-game checklist",
      "Post-game reflection & next steps",
    ],
    icon: "07",
    preview: "Club finder with beginner filters",
  },
];
