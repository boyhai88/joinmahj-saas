import Image from "next/image";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";

const proofAvatars = [
  "/images/avatar-1.jpg",
  "/images/avatar-2.jpg",
  "/images/avatar-3.jpg",
  "/images/avatar-4.jpg",
];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden py-[clamp(72px,10vw,120px)]"
    >
      {/* Warm radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-30%] right-[-15%] h-[90%] w-[70%]"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, oklch(88% 0.07 75 / 0.45), transparent 62%)",
        }}
      />
      {/* Bottom hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--border), transparent)",
        }}
      />

      <Container className="relative grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Content */}
        <div className="order-2 lg:order-1">
          <h1 className="mb-6 max-w-[11.5ch] font-display text-[clamp(3.1rem,6.8vw,5.5rem)] font-medium leading-[1.04] tracking-[-0.02em] text-fg sm:mb-8">
            Learn Mahjong.
            <br />
            Join the Table with Confidence.
          </h1>

          <p className="mb-8 max-w-[46ch] text-[clamp(1.08rem,1.65vw,1.35rem)] leading-[1.65] text-muted sm:mb-11">
            Master American Mahjong through beginner-friendly lessons, AI
            practice tools, and welcoming social club experiences.
          </p>

          <div className="mb-9 flex flex-wrap items-center gap-3 sm:mb-12">
            <Button href="#cta" size="lg">
              Start Free
            </Button>
            <Button href="#clubs" variant="secondary" size="lg">
              Explore Clubs
            </Button>
          </div>

          <div className="flex items-center gap-[18px]">
            <div className="flex shrink-0" aria-hidden>
              {proofAvatars.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  width={40}
                  height={40}
                  className={`h-10 w-10 rounded-full border-[2.5px] border-surface object-cover shadow-[0_2px_8px_oklch(18%_0.012_280/0.08)] ${
                    i === 0 ? "" : "-ml-3"
                  }`}
                />
              ))}
            </div>
            <p className="text-[15px] leading-[1.45] text-muted">
              <strong className="font-semibold text-fg">2,000+ beginners</strong>{" "}
              joined this month
            </p>
          </div>
        </div>

        {/* Visual */}
        <div className="order-1 lg:order-2">
          <figure className="relative m-0 aspect-4/3 overflow-hidden rounded-[clamp(20px,2.5vw,28px)] shadow-[0_4px_6px_oklch(18%_0.012_280/0.04),0_24px_64px_oklch(18%_0.012_280/0.12),0_48px_96px_oklch(38%_0.045_130/0.08)] sm:aspect-16/10 lg:aspect-5/6">
            <Image
              src="/images/hero-table.jpg"
              alt="Friends learning Mahjong together at a warm-lit table"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="scale-105 object-cover object-[center_32%]"
            />

            {/* Color grade */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-1"
              style={{
                background:
                  "linear-gradient(180deg, oklch(72% 0.085 75 / 0.12) 0%, transparent 22%), linear-gradient(0deg, oklch(18% 0.012 280 / 0.62) 0%, transparent 38%), radial-gradient(ellipse 90% 70% at 65% 25%, oklch(88% 0.08 75 / 0.28), transparent 58%)",
              }}
            />
            {/* Film grain */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-2 opacity-[0.04]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />

            <figcaption className="absolute inset-x-[clamp(20px,3.5vw,28px)] bottom-[clamp(20px,3.5vw,28px)] z-3 rounded-2xl border border-[oklch(100%_0_0/0.55)] bg-[oklch(99%_0.01_90/0.88)] px-[22px] py-[18px] shadow-[0_12px_36px_oklch(18%_0.012_280/0.12)] backdrop-blur-[18px]">
              <span className="mb-1 block font-display text-[clamp(1.15rem,2vw,1.35rem)] font-medium leading-[1.2] tracking-[-0.01em] text-fg">
                Thursday at the table
              </span>
              <span className="block text-[13px] leading-[1.45] text-muted">
                Warm light, coffee, and friends learning together
              </span>
            </figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}
