import { SectionContainer } from "@/components/ui/SectionContainer";

export function ClientsPreview() {
  return (
    <SectionContainer background="light" size="sm" style={{ borderTop: "1px solid var(--lam-light-border)", borderBottom: "1px solid var(--lam-light-border)" }}>
      <p style={{ textAlign: "center", marginBottom: "1.75rem", color: "#2563EB", fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Trusted by Ambitious Organisations Worldwide
      </p>
      
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "2.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "6px", height: "6px", background: "#2563EB", borderRadius: "50%" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text)", fontWeight: 600, letterSpacing: "0.02em" }}>
            Diplomatic Missions
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "6px", height: "6px", background: "#2563EB", borderRadius: "50%" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text)", fontWeight: 600, letterSpacing: "0.02em" }}>
            Enterprise Retail Brands
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "6px", height: "6px", background: "#2563EB", borderRadius: "50%" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text)", fontWeight: 600, letterSpacing: "0.02em" }}>
            Financial Institutions
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "6px", height: "6px", background: "#2563EB", borderRadius: "50%" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text)", fontWeight: 600, letterSpacing: "0.02em" }}>
            Global Operations
          </span>
        </div>
      </div>
    </SectionContainer>
  );
}
