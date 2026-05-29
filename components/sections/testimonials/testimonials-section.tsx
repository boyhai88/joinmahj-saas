import Container from "@/components/ui/container";

type Testimonial = {
  quote: string;
  name: string;
  city: string;
};

const testimonials: Testimonial[] = [
  {
    quote: "I went from completely confused to hosting my own Mahjong nights.",
    name: "Sarah",
    city: "Austin",
  },
  {
    quote: "JoinMahj made Mahjong finally feel approachable and social.",
    name: "Emily",
    city: "Chicago",
  },
  {
    quote:
      "The AI Coach helped me feel confident before my first real table.",
    name: "Rachel",
    city: "Nashville",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-[clamp(72px,10vw,120px)]">
      <Container>
        <div className="mx-auto grid max-w-[560px] grid-cols-1 gap-[clamp(20px,3vw,28px)] lg:max-w-none lg:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="group relative flex flex-col gap-6 overflow-hidden rounded-card border border-border bg-surface p-[clamp(28px,4vw,40px)] shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-card before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-linear-to-r before:from-accent before:to-[oklch(72%_0.085_75/0.35)] before:opacity-0 before:transition-opacity before:duration-300 before:content-[''] hover:before:opacity-100"
            >
              <span
                aria-hidden
                className="-mt-2 font-display text-[3.5rem] leading-none text-[oklch(72%_0.085_75/0.35)]"
              >
                &ldquo;
              </span>
              <blockquote className="flex-1 font-display text-[clamp(1.25rem,2vw,1.5rem)] font-medium italic leading-[1.45] text-fg">
                {item.quote}
              </blockquote>
              <footer className="flex items-center gap-3.5 border-t border-border pt-2">
                <div
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-surface bg-linear-to-br from-gold-light to-[oklch(85%_0.04_80)] font-display text-[1.125rem] font-semibold text-primary shadow-[0_2px_8px_oklch(18%_0.012_280/0.08)]"
                >
                  {item.name.charAt(0)}
                </div>
                <cite className="text-sm not-italic leading-[1.4] text-muted">
                  <strong className="block text-[15px] font-semibold text-fg">
                    {item.name}
                  </strong>
                  {item.city}
                </cite>
              </footer>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
