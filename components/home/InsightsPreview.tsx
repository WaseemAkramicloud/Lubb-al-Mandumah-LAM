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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem", marginBottom: "3rem" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <SectionHeader
            eyebrow="Company News"
            title="LATEST INSIGHTS"
            subtitle="Explore our latest thoughts on software engineering, enterprise scale, and compliance."
            theme="light"
          />
        </div>
        <Link href="/insights" className="btn btn-secondary" style={{ color: "var(--lam-dark-text)", borderColor: "var(--lam-light-border)" }}>
          View All Insights &rarr;
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
        }}
      >
        {insights.map((post) => (
          <Link key={post.id} href={post.href} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
            <div className="lam-card lam-card--gold" style={{ display: "flex", flexDirection: "column", height: "100%", transition: "border-color 0.3s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span className="lam-badge" style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--lam-gold)", border: "1px solid rgba(201, 168, 76, 0.3)" }}>
                  {post.category}
                </span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--lam-dark-text-muted)" }}>{post.readTime}</span>
              </div>
              
              <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "1rem", lineHeight: 1.4, color: "var(--lam-dark-text)" }}>
                {post.title}
              </h3>
              
              <div style={{ marginTop: "auto", paddingTop: "1.5rem", borderTop: "1px solid var(--lam-light-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text-muted)" }}>{post.date}</span>
                <span style={{ color: "var(--lam-gold)", fontSize: "1.2rem" }}>&rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
