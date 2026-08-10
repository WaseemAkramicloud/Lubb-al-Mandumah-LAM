import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getInsightById, insights } from "@/lib/config/insights";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";

export async function generateStaticParams() {
  return insights.map((i) => ({
    slug: i.id,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getInsightById(resolvedParams.slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: `${article.title} | Insights | ${siteConfig.shortName}`,
    description: article.excerpt,
  };
}

export default async function InsightDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const article = await getInsightById(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const dateObj = new Date(article.date);
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(dateObj);

  return (
    <>
      <div
        style={{
          paddingTop: "calc(var(--header-height) + 4rem)",
          paddingBottom: "4rem",
          background: "var(--lam-gradient-hero)",
          borderBottom: "1px solid var(--lam-border)",
        }}
      >
        <div className="lam-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
            <span className="lam-eyebrow" style={{ color: "var(--lam-gold)", margin: 0 }}>
              {article.category}
            </span>
            <span style={{ color: "var(--lam-silver-light)", fontSize: "var(--text-sm)" }}>
              {formattedDate}
            </span>
          </div>
          
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "1.5rem", lineHeight: 1.1 }}>
            {article.title}
          </h1>
          
          <p style={{ fontSize: "var(--text-xl)", color: "var(--lam-silver)", marginBottom: "2rem" }}>
            By {article.author}
          </p>
        </div>
      </div>

      <SectionContainer background="black" size="lg">
        <div 
          className="lam-article-content"
          style={{ 
            maxWidth: "800px", 
            margin: "0 auto",
            color: "var(--lam-silver-light)",
            fontSize: "var(--text-lg)",
            lineHeight: 1.8
          }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </SectionContainer>
      
      {/* Basic styles for the injected HTML content */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .lam-article-content h2 {
            font-size: var(--text-2xl);
            color: var(--lam-white);
            margin-top: 3rem;
            margin-bottom: 1.5rem;
          }
          .lam-article-content p {
            margin-bottom: 1.5rem;
          }
        `
      }} />
    </>
  );
}
