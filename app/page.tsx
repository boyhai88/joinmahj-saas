import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import HeroSection from "@/components/sections/hero/hero-section";
import WhySection from "@/components/sections/why/why-section";
import RoadmapSection from "@/components/sections/roadmap/roadmap-section";
import CoachSection from "@/components/sections/coach/coach-section";
import PracticeSection from "@/components/sections/practice/practice-section";
import CommunitySection from "@/components/sections/community/community-section";
import TestimonialsSection from "@/components/sections/testimonials/testimonials-section";
import ClubsSection from "@/components/sections/clubs/clubs-section";
import PricingSection from "@/components/sections/pricing/pricing-section";
import FaqSection from "@/components/sections/faq/faq-section";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <SiteHeader userEmail={user?.email ?? null} />
      <main className="flex-1 pt-24">
        <HeroSection />
        <WhySection />
        <RoadmapSection />
        <CoachSection />
        <PracticeSection />
        <CommunitySection />
        <TestimonialsSection />
        <ClubsSection />
        <PricingSection />
        <FaqSection />
      </main>
    </>
  );
}
