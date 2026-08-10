import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { getCmsPage } from "@/lib/cms/client";

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

export default async function HomePage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams
  const isPreview = searchParams.preview === 'true'
  const pageData = await getCmsPage('home', { preview: isPreview })

  return (
    <>
      <HeroSlider data={pageData['home_hero']} />
      <IntroSection data={pageData['home_intro']} />
      <ProductsStrip data={pageData['home_products']} />
      <SolutionsTeaser />
      <IndustriesSection />
      <WhyLamSection data={pageData['home_why_lam']} />
      <SecuritySection />
      <ClientsPreview />
      <InsightsPreview />
      <CtaSection data={pageData['home_cta']} />
    </>
  );
}
