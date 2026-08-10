import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

// Homepage sections
import { HeroSlider } from "@/components/home/HeroSlider";
import { IntroSection } from "@/components/home/IntroSection";
import { ProductsStrip } from "@/components/home/ProductsStrip";
import { SolutionsTeaser } from "@/components/home/SolutionsTeaser";
import { IndustriesSection } from "@/components/home/IndustriesSection";
import { WhyLamSection } from "@/components/home/WhyLamSection";
import { SecuritySection } from "@/components/home/SecuritySection";
import { ClientsPreview } from "@/components/home/ClientsPreview";
import { InsightsPreview } from "@/components/home/InsightsPreview";
import { CtaSection } from "@/components/home/CtaSection";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
};

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <IntroSection />
      <ProductsStrip />
      <SolutionsTeaser />
      <IndustriesSection />
      <WhyLamSection />
      <SecuritySection />
      <ClientsPreview />
      <InsightsPreview />
      <CtaSection />
    </>
  );
}
