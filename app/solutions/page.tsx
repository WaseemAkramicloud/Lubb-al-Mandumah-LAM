import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { EntityCard } from "@/components/ui/EntityCard";
import { solutions } from "@/lib/config/solutions";

const routeMeta = {
  title: "Solutions by Need",
  eyebrow: "Solutions",
  subtitle: "Tailored approaches across disciplines and industries.",
};

export const metadata: Metadata = {
  title: `${routeMeta.title} | ${siteConfig.shortName}`,
  description: routeMeta.subtitle,
};

export default function SolutionsPage() {
  return (
    <>
      {/* Page hero */}
      <div
        style={{
          paddingTop: "calc(var(--header-height) + 4rem)",
          paddingBottom: "4rem",
          background: "var(--lam-charcoal)",
          borderBottom: "1px solid var(--lam-border)",
        }}
      >
        <div className="lam-container">
          <p className="lam-eyebrow" style={{ marginBottom: "0.75rem" }}>{routeMeta.eyebrow}</p>
          <div className="lam-accent-line" />
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.5rem)", marginBottom: "1rem" }}>
            {routeMeta.title}
          </h1>
          <p style={{ fontSize: "var(--text-xl)", color: "var(--lam-silver-light)", maxWidth: "560px" }}>
            {routeMeta.subtitle}
          </p>
        </div>
      </div>

      <SectionContainer background="black" size="lg">
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
