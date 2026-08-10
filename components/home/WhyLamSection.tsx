import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function WhyLamSection() {
  return (
    <SectionContainer background="gunmetal" size="lg">
      <SectionHeader
        eyebrow="The Ecosystem Advantage"
        title="WHY CHOOSE LΛM"
        subtitle="Unifying fragmented business operations into a single, cohesive command plane."
        align="center"
      />

      <div
        style={{
          marginTop: "4rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2.5rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--lam-gradient-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lam-black)", fontWeight: "bold" }}>
            1
          </div>
          <h3 style={{ fontSize: "var(--text-xl)" }}>True Interoperability</h3>
          <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6 }}>
            Our platforms are built from the ground up to communicate natively. Data flows seamlessly between ATOM ERP, PointO retail systems, and financial ledgers without third-party middleware.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--lam-gradient-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lam-black)", fontWeight: "bold" }}>
            2
          </div>
          <h3 style={{ fontSize: "var(--text-xl)" }}>Single Identity Core</h3>
          <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6 }}>
            LΛM ID provides federated, role-based access control across all applications. Manage thousands of employees and permissions from one unified directory.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--lam-gradient-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lam-black)", fontWeight: "bold" }}>
            3
          </div>
          <h3 style={{ fontSize: "var(--text-xl)" }}>Predictable Scaling</h3>
          <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6 }}>
            Start with the core infrastructure you need today, and instantly unlock new capabilities as your enterprise grows, all under consolidated billing and support.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
