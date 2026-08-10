import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { DetailHero } from "@/components/ui/DetailHero";
import { EntityCard } from "@/components/ui/EntityCard";
import { industries } from "@/lib/config/industries";
import { getCmsPage } from "@/lib/cms/client";

const routeMeta = {
  title: "Industries We Serve",
  eyebrow: "Industries",
  subtitle: "Deep domain expertise across critical sectors.",
};

export const metadata: Metadata = {
  title: `${routeMeta.title} | ${siteConfig.shortName}`,
  description: routeMeta.subtitle,
};

export default async function IndustriesPage() {
  const pageData = (await getCmsPage('industries')) as any;
  const heroData = pageData['industries_hero'] || {};

  return (
    <>
      <DetailHero
        eyebrow={heroData.eyebrow || routeMeta.eyebrow}
        title={heroData.title || routeMeta.title}
        subtitle={heroData.subtitle || routeMeta.subtitle}
      />

      <SectionContainer background="black" size="lg">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "2rem",
          }}
        >
          {industries.map((industry) => (
            <EntityCard
              key={industry.id}
              title={industry.name}
              description={industry.description}
              href={`/industries/${industry.id}`}
              ctaText="Explore Industry"
            />
          ))}
        </div>
      </SectionContainer>
    </>
  );
}
