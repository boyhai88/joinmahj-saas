import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  headingId?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  lead,
  headingId,
}: SectionHeaderProps) {
  return (
    <div className="mx-auto mb-[clamp(48px,7vw,80px)] max-w-[680px] text-center">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
        {eyebrow}
      </p>
      <h2
        id={headingId}
        className="mb-5 font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium leading-[1.08] tracking-[-0.02em] text-fg"
      >
        {title}
      </h2>
      {lead ? (
        <p className="mx-auto max-w-[54ch] text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.65] text-muted">
          {lead}
        </p>
      ) : null}
    </div>
  );
}
