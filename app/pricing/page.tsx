import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import PricingSection from "@/components/sections/pricing/pricing-section";

export const metadata = {
  title: "Pricing — JoinMahj",
  description: "Choose your path. Start free, upgrade when you're ready.",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <SiteHeader userEmail={user?.email ?? null} />
      <main className="pt-24">
        <PricingSection />
      </main>
    </>
  );
}
