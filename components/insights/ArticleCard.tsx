import Link from "next/link";
import { Insight } from "@/lib/config/insights";

interface ArticleCardProps {
  article: Insight;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const dateObj = new Date(article.date);
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(dateObj);

  return (
    <div className="lam-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {article.category}
        </span>
        <span style={{ fontSize: "var(--text-xs)", color: "#475569", fontWeight: 500 }}>
          {formattedDate}
        </span>
      </div>
      
      <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "0.85rem", lineHeight: 1.35, color: "#0F172A" }}>
        <Link href={`/insights/${article.id}`} style={{ color: "#0F172A", textDecoration: "none" }}>
          {article.title}
        </Link>
      </h3>
      
      <p style={{ color: "#334155", lineHeight: 1.65, marginBottom: "1.75rem", flex: 1, fontSize: "var(--text-sm)" }}>
        {article.excerpt}
      </p>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #CBD5E1", paddingTop: "1rem" }}>
        <span style={{ fontSize: "var(--text-xs)", color: "#475569", fontWeight: 500 }}>
          {article.author}
        </span>
        <Link href={`/insights/${article.id}`} style={{ color: "#1D4ED8", fontWeight: 600, fontSize: "var(--text-sm)", textDecoration: "none" }}>
          Read Article &rarr;
        </Link>
      </div>
    </div>
  );
}
