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
          paddingTop: "calc(var(--header-height) + 3rem)",
          paddingBottom: "3rem",
          background: "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)",
          borderBottom: "1px solid #CBD5E1",
        }}
      >
        <div className="lam-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.25rem" }}>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {article.category}
            </span>
            <span style={{ color: "#475569", fontSize: "var(--text-sm)", fontWeight: 500 }}>
              {formattedDate}
            </span>
          </div>
          
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)", marginBottom: "1.25rem", lineHeight: 1.15, color: "#0F172A" }}>
            {article.title}
          </h1>
          
          <p style={{ fontSize: "var(--text-base)", color: "#475569", fontWeight: 600 }}>
            By {article.author}
          </p>
        </div>
      </div>

      <SectionContainer background="light" size="lg">
        <div 
          className="lam-article-content"
          style={{ 
            maxWidth: "800px", 
            margin: "0 auto",
            color: "#334155",
            fontSize: "var(--text-lg)",
            lineHeight: 1.8
          }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </SectionContainer>
      
      {/* High contrast styles for injected HTML content */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .lam-article-content h2 {
            font-size: var(--text-2xl);
            color: #0F172A;
            margin-top: 2.5rem;
            margin-bottom: 1.25rem;
            font-family: var(--font-display);
          }
          .lam-article-content p {
            margin-bottom: 1.5rem;
            color: #334155;
          }
          .lam-article-content ul, .lam-article-content ol {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
            color: #334155;
          }
        `
      }} />
    </>
  );
}
