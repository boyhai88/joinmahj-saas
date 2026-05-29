import Container from "@/components/ui/container";
import SectionHeader from "@/components/ui/section-header";
import Button from "@/components/ui/button";

type Plan = {
  tier: string;
  name: string;
  amount: string;
  period?: string;
  features: string[];
  cta: string;
  featured?: boolean;
  badge?: string;
};

const plans: Plan[] = [
  {
    tier: "Starter",
    name: "Free",
    amount: "$0",
    features: ["7-Day Roadmap", "Basic Tile Guide", "Community Access"],
    cta: "Get Started",
  },
  {
    tier: "Individual",
    name: "Mahj Member",
    amount: "$19",
    period: "/month",
    features: [
      "Everything in Free",
      "AI Coach",
      "Weekly Challenges",
      "Priority Club Access",
    ],
    cta: "Become a Member",
    featured: true,
    badge: "Most Popular",
  },
  {
    tier: "For organizers",
    name: "Club Pro",
    amount: "$49",
    period: "/month",
    features: [
      "Everything in Member",
      "Host Tools",
      "Club Management",
      "Event Promotion",
    ],
    cta: "Start Club Pro",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-[clamp(72px,10vw,120px)]">
      <Container>
        <SectionHeader
          eyebrow="Membership"
          title="Choose your path"
          lead={<>Start free, level up when you&rsquo;re ready.</>}
        />

        <div className="mx-auto grid max-w-[420px] grid-cols-1 items-stretch gap-6 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-card bg-surface p-10 transition duration-200 ${
                plan.featured
                  ? "border border-accent shadow-elevated lg:scale-[1.02] hover:lg:-translate-y-1"
                  : "border border-border shadow-soft hover:-translate-y-1 hover:shadow-card"
              }`}
            >
              {plan.badge ? (
                <span className="absolute left-1/2 top-[-14px] -translate-x-1/2 rounded-full bg-accent px-4 py-[7px] text-[11px] font-bold uppercase tracking-[0.08em] text-fg">
                  {plan.badge}
                </span>
              ) : null}

              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                {plan.tier}
              </p>
              <h3 className="mb-3 font-display text-[1.75rem] font-medium text-fg">
                {plan.name}
              </h3>
              <p className="mb-8 border-b border-border pb-8 font-display text-[3.25rem] font-semibold leading-none text-fg [font-variant-numeric:tabular-nums]">
                {plan.amount}
                {plan.period ? (
                  <span className="text-base font-normal text-muted">
                    {plan.period}
                  </span>
                ) : null}
              </p>

              <ul className="mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="relative py-2.5 pl-[26px] text-sm leading-[1.45] text-muted before:absolute before:left-0 before:top-4 before:h-[7px] before:w-[7px] before:rounded-full before:bg-accent before:content-['']"
                  >
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                href="#cta"
                variant={plan.featured ? "primary" : "secondary"}
                className="w-full"
              >
                {plan.cta}
              </Button>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
