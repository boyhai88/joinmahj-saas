"use client";

import { useState } from "react";
import Container from "@/components/ui/container";
import SectionHeader from "@/components/ui/section-header";

type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: "Do I need to know the rules before joining?",
    answer: "No. Most members start as complete beginners.",
  },
  {
    question: "What version of Mahjong do you teach?",
    answer: "American Mahjong.",
  },
  {
    question: "Do I need my own Mahjong set?",
    answer: "No. Clubs provide everything.",
  },
  {
    question: "Is the AI Coach beginner friendly?",
    answer: "Yes. Designed specifically for beginners.",
  },
  {
    question: "Can I join without attending local clubs?",
    answer: "Yes. Many members learn online first.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-[clamp(72px,10vw,120px)]">
      <Container>
        <SectionHeader
          eyebrow="FAQ"
          title="Questions before your first game?"
          lead="Everything beginners ask before joining a table."
        />

        <div className="mx-auto max-w-[720px]">
          {faqs.map((faq, index) => {
            const isOpen = index === openIndex;
            return (
              <div key={faq.question} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 py-6 text-left font-display text-[1.25rem] font-medium text-fg"
                >
                  {faq.question}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                    className={`shrink-0 text-muted transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0">
                    <p className="pb-6 text-[15px] leading-[1.65] text-muted">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
