import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function IntroSection() {
  return (
    <SectionContainer background="charcoal" size="lg">
      <SectionHeader
        eyebrow="The Ecosystem Core"
        title="FROM ENTERPRISE SYSTEMS TO EVERYDAY MOBILE TOOLS"
        subtitle="LΛM is the parent company and foundational technology layer orchestrating an expanding ecosystem of SaaS products, platforms, and mobile applications."
        align="center"
      />

      <div
        style={{
          marginTop: "4rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
        }}
      >
        <div className="lam-card">
          <p className="lam-eyebrow" style={{ marginBottom: "1rem" }}>01. Parent Infrastructure</p>
          <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem" }}>Architectural Integrity</h3>
          <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6 }}>
            Engineered for resilience, the LΛM core provides the central foundation that powers 
            our entire ecosystem of business applications.
          </p>
        </div>

        <div className="lam-card lam-card--flat">
          <p className="lam-eyebrow" style={{ marginBottom: "1rem" }}>02. Expanding Ecosystem</p>
          <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem" }}>Interconnected Platforms</h3>
          <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6 }}>
            From enterprise ERPs to mobile retail solutions, our products are designed to work 
            seamlessly together or stand alone as best-in-class tools.
          </p>
        </div>

        <div className="lam-card">
          <p className="lam-eyebrow" style={{ marginBottom: "1rem" }}>03. Unified Experience</p>
          <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem" }}>Single Command Plane</h3>
          <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6 }}>
            Rather than managing disconnected tools with fragmented logins, LΛM integrates 
            everything under a singular unified identity and SaaS Control Hub.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
