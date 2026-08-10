import Link from "next/link";
import { Insight } from "@/lib/config/insights";

interface ArticleCardProps {
  article: Insight;
}

export function ArticleCard({ article }: ArticleCardProps) {
  // Format date elegantly
  const dateObj = new Date(article.date);
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(dateObj);

  return (
    <div className="lam-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <span className="lam-eyebrow" style={{ color: "var(--lam-gold)", margin: 0 }}>
          {article.category}
        </span>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--lam-silver)" }}>
          {formattedDate}
        </span>
      </div>
      
      <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem", lineHeight: 1.3 }}>
        <Link href={`/insights/${article.id}`} style={{ color: "inherit", textDecoration: "none" }}>
          {article.title}
        </Link>
      </h3>
      
      <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6, marginBottom: "2rem", flex: 1 }}>
        {article.excerpt}
      </p>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--lam-border)", paddingTop: "1rem" }}>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver)", fontWeight: 500 }}>
          {article.author}
        </span>
        <Link href={`/insights/${article.id}`} style={{ color: "var(--lam-gold)", fontWeight: 600, fontSize: "var(--text-sm)", textDecoration: "none" }}>
          Read Article →
        </Link>
      </div>
    </div>
  );
}
