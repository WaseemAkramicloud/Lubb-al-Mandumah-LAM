import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { DetailHero } from "@/components/ui/DetailHero";
import { EntityCard } from "@/components/ui/EntityCard";
import { solutions } from "@/lib/config/solutions";
import { getCmsPage } from "@/lib/cms/client";

const routeMeta = {
  title: "Solutions by Need",
  eyebrow: "Solutions",
  subtitle: "Tailored approaches across disciplines and industries.",
};

export const metadata: Metadata = {
  title: `${routeMeta.title} | ${siteConfig.shortName}`,
  description: routeMeta.subtitle,
};

export default async function SolutionsPage() {
  const pageData = (await getCmsPage('solutions')) as any;
  const heroData = pageData['solutions_hero'] || {};

  return (
    <>
      <DetailHero
        eyebrow={heroData.eyebrow || routeMeta.eyebrow}
        title={heroData.title || routeMeta.title}
        subtitle={heroData.subtitle || routeMeta.subtitle}
      />

      <SectionContainer background="light" size="lg">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "2rem",
          }}
        >
          {solutions.map((solution) => (
            <EntityCard
              key={solution.id}
              title={solution.name}
              description={solution.description}
              href={`/solutions/${solution.id}`}
              ctaText="Explore Solution"
            />
          ))}
        </div>
      </SectionContainer>
    </>
  );
}
