import Link from "next/link";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function SolutionsTeaser() {
  return (
    <SectionContainer background="white" size="lg">
      <SectionHeader
        eyebrow="Ecosystem Architecture"
        title="SOLUTIONS & PLATFORMS"
        subtitle="Explore the structured business classifications of the LΛM ecosystem, from central enterprise SaaS to specialized platforms."
        align="center"
        theme="light"
      />

      <div
        style={{
          marginTop: "4rem",
          display: "flex",
          flexDirection: "column",
          gap: "4rem",
        }}
      >
        {/* Category 1 */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <span className="lam-eyebrow" style={{ color: "var(--lam-gold)" }}>CLASSIFICATION 01</span>
            <h3 style={{ fontSize: "var(--text-xl)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--lam-dark-text)" }}>Enterprise SaaS & Workforce OS</h3>
          </div>
          <p style={{ color: "var(--lam-dark-text-muted)", maxWidth: "800px", marginBottom: "2rem", lineHeight: 1.6 }}>
            Core enterprise software engineered for corporate governance, resource planning, and real-time workforce task orchestration.
          </p>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div className="lam-card lam-card--gold" style={{ flex: 1, minWidth: "280px" }}>
              <span className="lam-eyebrow" style={{ color: "var(--lam-gold)", fontSize: "0.7rem" }}>SaaS</span>
              <h4 style={{ fontSize: "var(--text-lg)", marginBottom: "0.5rem", color: "var(--lam-dark-text)" }}>ATOM</h4>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text-muted)", marginBottom: "1.5rem" }}>
                Enterprise operations platform covering inventory, finance, and procurement.
              </p>
              <Link href="/products/atom" style={{ fontSize: "var(--text-sm)", color: "var(--lam-gold)", fontWeight: 600 }}>Explore ATOM &rarr;</Link>
            </div>
            <div className="lam-card lam-card--gold" style={{ flex: 1, minWidth: "280px" }}>
              <span className="lam-eyebrow" style={{ color: "var(--lam-gold)", fontSize: "0.7rem" }}>SaaS</span>
              <h4 style={{ fontSize: "var(--text-lg)", marginBottom: "0.5rem", color: "var(--lam-dark-text)" }}>NEXORA</h4>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text-muted)", marginBottom: "1.5rem" }}>
                Next-generation workforce & field operations dispatch OS.
              </p>
              <Link href="/products/nexora" style={{ fontSize: "var(--text-sm)", color: "var(--lam-gold)", fontWeight: 600 }}>Explore NEXORA &rarr;</Link>
            </div>
          </div>
        </div>

        <div className="lam-divider" style={{ borderColor: "#E2E8F0" }} />

        {/* Category 2 */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <span className="lam-eyebrow" style={{ color: "var(--lam-gold)" }}>CLASSIFICATION 02</span>
            <h3 style={{ fontSize: "var(--text-xl)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--lam-dark-text)" }}>Education, Institutional & Platforms</h3>
          </div>
          <p style={{ color: "var(--lam-dark-text-muted)", maxWidth: "800px", marginBottom: "2rem", lineHeight: 1.6 }}>
            Domain-focused suites spanning educational search intelligence, diplomatic mission governance, wealth management, and modern retail POS.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            <div className="lam-card lam-card--gold">
              <span className="lam-eyebrow" style={{ color: "var(--lam-gold)", fontSize: "0.7rem" }}>Education</span>
              <h4 style={{ fontSize: "var(--text-lg)", marginBottom: "0.5rem", color: "var(--lam-dark-text)" }}>AimHighSERP</h4>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text-muted)", marginBottom: "1.25rem" }}>
                Search engine intelligence & analytics.
              </p>
              <Link href="/products/aimhighserp" style={{ fontSize: "var(--text-sm)", color: "var(--lam-gold)", fontWeight: 600 }}>Explore &rarr;</Link>
            </div>
            <div className="lam-card lam-card--gold">
              <span className="lam-eyebrow" style={{ color: "var(--lam-gold)", fontSize: "0.7rem" }}>Institutional</span>
              <h4 style={{ fontSize: "var(--text-lg)", marginBottom: "0.5rem", color: "var(--lam-dark-text)" }}>MAAMS</h4>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text-muted)", marginBottom: "1.25rem" }}>
                Restricted diplomatic compliance platform.
              </p>
              <Link href="/products/maams" style={{ fontSize: "var(--text-sm)", color: "var(--lam-gold)", fontWeight: 600 }}>Explore &rarr;</Link>
            </div>
            <div className="lam-card lam-card--gold">
              <span className="lam-eyebrow" style={{ color: "var(--lam-gold)", fontSize: "0.7rem" }}>Platforms</span>
              <h4 style={{ fontSize: "var(--text-lg)", marginBottom: "0.5rem", color: "var(--lam-dark-text)" }}>PointO</h4>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text-muted)", marginBottom: "1.25rem" }}>
                Modern point-of-sale storefront system.
              </p>
              <Link href="/products/pointo" style={{ fontSize: "var(--text-sm)", color: "var(--lam-gold)", fontWeight: 600 }}>Explore &rarr;</Link>
            </div>
            <div className="lam-card lam-card--gold">
              <span className="lam-eyebrow" style={{ color: "var(--lam-gold)", fontSize: "0.7rem" }}>Platforms</span>
              <h4 style={{ fontSize: "var(--text-lg)", marginBottom: "0.5rem", color: "var(--lam-dark-text)" }}>AMAL</h4>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text-muted)", marginBottom: "1.25rem" }}>
                Finance & investment management platform.
              </p>
              <Link href="/products/amal" style={{ fontSize: "var(--text-sm)", color: "var(--lam-gold)", fontWeight: 600 }}>Explore &rarr;</Link>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
