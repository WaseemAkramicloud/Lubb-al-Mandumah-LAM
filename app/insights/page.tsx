import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { DetailHero } from "@/components/ui/DetailHero";
import { ArticleCard } from "@/components/insights/ArticleCard";
import { createClient } from "@/lib/supabase/server";
import { getCmsPage } from "@/lib/cms/client";

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
  
  let query = createClient().then(supabase => supabase
    .from("cms_insights")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false }));

  let { data: insights } = await query;
  
  if (categoryParam !== "All" && insights) {
    insights = insights.filter((item: any) => item.category === categoryParam);
  }

  const pageData = (await getCmsPage('insights')) as any;
  const heroData = pageData['insights_hero'] || {};

  return (
    <>
      <DetailHero
        eyebrow={heroData.eyebrow || routeMeta.eyebrow}
        title={heroData.title || routeMeta.title}
        subtitle={heroData.subtitle || routeMeta.subtitle}
      />

      <SectionContainer background="black" size="lg">
        {(!insights || insights.length === 0) ? (
          <div style={{ padding: "4rem 0", textAlign: "center" }}>
            <p style={{ color: "var(--lam-silver)", fontSize: "var(--text-lg)" }}>
              No articles found.
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
            {insights.map((article: any) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </SectionContainer>
    </>
  );
}
