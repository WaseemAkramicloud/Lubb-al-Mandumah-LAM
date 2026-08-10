import Link from "next/link";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function SolutionsTeaser() {
  return (
    <SectionContainer background="charcoal" size="lg">
      <SectionHeader
        eyebrow="Ecosystem Architecture"
        title="SOLUTIONS & PLATFORMS"
        subtitle="Explore the different operational tiers of the LΛM ecosystem, from core enterprise infrastructure to mobile workforce extensions."
        align="center"
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
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <span className="lam-eyebrow" style={{ color: "var(--lam-silver)" }}>TIER 01</span>
            <h3 style={{ fontSize: "var(--text-xl)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Core SaaS Infrastructure</h3>
          </div>
          <p style={{ color: "var(--lam-silver-light)", maxWidth: "800px", marginBottom: "2rem" }}>
            The foundational tier of the LΛM ecosystem. We provide enterprise-grade platforms covering resource management, compliance, and marketing intelligence.
          </p>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div className="lam-card" style={{ flex: 1, minWidth: "280px" }}>
              <h4 style={{ fontSize: "var(--text-lg)", marginBottom: "0.5rem" }}>ATOM ERP</h4>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver)", marginBottom: "1.5rem" }}>
                Enterprise resource management with real-time analytics.
              </p>
              <Link href="/products#atom" style={{ fontSize: "var(--text-sm)", color: "var(--lam-gold)", fontWeight: 600 }}>Explore ATOM →</Link>
            </div>
            <div className="lam-card lam-card--flat" style={{ flex: 1, minWidth: "280px" }}>
              <h4 style={{ fontSize: "var(--text-lg)", marginBottom: "0.5rem" }}>AimHighSERP</h4>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver)", marginBottom: "1.5rem" }}>
                Advanced SEO intelligence and automated ranking tools.
              </p>
              <Link href="/products#aimhighserp" style={{ fontSize: "var(--text-sm)", color: "var(--lam-gold)", fontWeight: 600 }}>Explore AimHighSERP →</Link>
            </div>
            <div className="lam-card" style={{ flex: 1, minWidth: "280px", borderLeft: "4px solid #e0896a" }}>
              <h4 style={{ fontSize: "var(--text-lg)", color: "#e0896a", marginBottom: "0.5rem" }}>MAAMS</h4>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver)", marginBottom: "1.5rem" }}>
                Restricted compliance platform.
              </p>
              <Link href="/products#maams" style={{ fontSize: "var(--text-sm)", color: "var(--lam-gold)", fontWeight: 600 }}>Request Access →</Link>
            </div>
          </div>
        </div>

        <div className="lam-divider" />

        {/* Category 2 */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <span className="lam-eyebrow" style={{ color: "var(--lam-silver)" }}>TIER 02</span>
            <h3 style={{ fontSize: "var(--text-xl)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mobile Applications Division</h3>
          </div>
          <p style={{ color: "var(--lam-silver-light)", maxWidth: "800px", marginBottom: "2rem" }}>
            We build native iOS and Android tools that extend the reach of enterprise capabilities out into the field,
            providing seamless real-time syncing with LΛM infrastructure.
          </p>
          <div className="lam-card lam-card--gold" style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: "300px" }}>
              <h4 style={{ fontSize: "var(--text-2xl)", marginBottom: "1rem" }}>Mobile Portfolio</h4>
              <p style={{ color: "var(--lam-silver-light)", marginBottom: "1.5rem" }}>
                Dedicated interfaces bridging complex systems into accessible touch-first applications for workforces worldwide.
              </p>
              <Link href="/solutions" className="btn btn-primary">
                View Mobile Solutions
              </Link>
            </div>
            <div style={{ flex: 1, minWidth: "300px", padding: "2rem", background: "var(--lam-surface)", borderRadius: "var(--radius-md)" }}>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ color: "var(--lam-gold)" }}>✓</span> High-performance native rendering
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ color: "var(--lam-gold)" }}>✓</span> Offline-first architecture
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ color: "var(--lam-gold)" }}>✓</span> End-to-end encrypted sync
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
