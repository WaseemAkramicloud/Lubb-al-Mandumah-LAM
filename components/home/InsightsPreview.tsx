import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Link from "next/link";

export function InsightsPreview() {
  const insights = [
    {
      id: 1,
      category: "Engineering",
      title: "Scaling Next-Generation ERP Architecture",
      date: "August 2026",
      readTime: "5 min read",
      href: "/insights/scaling-erp",
    },
    {
      id: 2,
      category: "Compliance",
      title: "Data Sovereignty in Federated Systems",
      date: "July 2026",
      readTime: "7 min read",
      href: "/insights/data-sovereignty",
    },
    {
      id: 3,
      category: "Ecosystem Updates",
      title: "Announcing the LΛM Control Hub",
      date: "June 2026",
      readTime: "4 min read",
      href: "/insights/control-hub-beta",
    },
  ];

  return (
    <SectionContainer background="soft-grey" size="lg">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem", marginBottom: "2.5rem" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <SectionHeader
            eyebrow="Company News"
            title="Latest Insights"
            subtitle="Explore our latest thoughts on software engineering, enterprise scale, and compliance."
            theme="light"
          />
        </div>
        <Link href="/insights" className="btn btn-secondary">
          View All Insights &rarr;
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {insights.map((post) => (
          <Link key={post.id} href={post.href} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
            <div className="lam-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span className="lam-badge" style={{ background: "rgba(29,78,216,0.08)", color: "#1D4ED8", border: "1px solid rgba(29,78,216,0.25)" }}>
                  {post.category}
                </span>
                <span style={{ fontSize: "var(--text-xs)", color: "#475569", fontWeight: 500 }}>{post.readTime}</span>
              </div>
              
              <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "1rem", lineHeight: 1.4, color: "#0F172A" }}>
                {post.title}
              </h3>
              
              <div style={{ marginTop: "auto", paddingTop: "1.25rem", borderTop: "1px solid #CBD5E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "var(--text-xs)", color: "#475569", fontWeight: 500 }}>{post.date}</span>
                <span style={{ color: "#1D4ED8", fontSize: "1.1rem" }}>&rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
