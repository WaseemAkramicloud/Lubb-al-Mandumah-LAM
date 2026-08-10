import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { DetailHero } from "@/components/ui/DetailHero";
import { RequestDemoForm } from "@/components/forms/RequestDemoForm";
import { getCmsPage } from "@/lib/cms/client";

export const metadata: Metadata = {
  title: `Request a Demo | ${siteConfig.shortName}`,
  description: "See our products in action.",
};

export default async function RequestDemoPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams
  const isPreview = searchParams.preview === 'true'
  const pageData = await getCmsPage('request-demo', { preview: isPreview }) as any;
  const heroData = pageData['demo_hero'] || {};

  return (
    <>
      <DetailHero
        eyebrow={heroData.eyebrow || "Demo Request"}
        title={heroData.title || "Experience the Ecosystem"}
        subtitle={heroData.subtitle || "Schedule a personalized demonstration of LΛM platforms tailored to your organizational scale and specific operational challenges."}
      />

      <SectionContainer background="black" size="lg">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4rem", maxWidth: "800px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <p style={{ color: "var(--lam-silver)", fontSize: "var(--text-lg)", lineHeight: 1.6 }}>
              Please provide accurate professional details to help us match you with the appropriate product specialist.
            </p>
          </div>

          <RequestDemoForm />
          
        </div>
      </SectionContainer>
    </>
  );
}
