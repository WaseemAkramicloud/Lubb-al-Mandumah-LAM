import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { ArticleCard } from "@/components/insights/ArticleCard";
import { insights } from "@/lib/config/insights";

const routeMeta = {
  title: "Insights & Updates",
  eyebrow: "Insights",
  subtitle: "Perspectives on technology, strategy, and enterprise architecture.",
};

export const metadata: Metadata = {
  title: `${routeMeta.title} | ${siteConfig.shortName}`,
  description: routeMeta.subtitle,
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function InsightsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const categoryParam = typeof resolvedParams.category === "string" ? resolvedParams.category : "All";
  
  const filteredInsights = categoryParam === "All" 
    ? insights 
    : insights.filter(i => i.category === categoryParam);

  return (
    <>
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
        {filteredInsights.length === 0 ? (
          <div style={{ padding: "4rem 0", textAlign: "center" }}>
            <p style={{ color: "var(--lam-silver)", fontSize: "var(--text-lg)" }}>
              No articles found in this category.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "2rem",
            }}
          >
            {filteredInsights.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </SectionContainer>
    </>
  );
}
