import { SectionContainer } from "@/components/ui/SectionContainer";

export function ClientsPreview() {
  return (
    <SectionContainer background="light" size="sm" style={{ borderTop: "1px solid var(--lam-light-border)", borderBottom: "1px solid var(--lam-light-border)" }}>
      <p className="lam-eyebrow" style={{ textAlign: "center", marginBottom: "2rem", color: "var(--lam-gold)" }}>
        TRUSTED BY AMBITIOUS ORGANISATIONS WORLDWIDE
      </p>
      
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "3rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "8px", height: "8px", background: "var(--lam-gold)", borderRadius: "50%" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Diplomatic Missions
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "8px", height: "8px", background: "var(--lam-gold)", borderRadius: "50%" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Enterprise Retail Brands
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "8px", height: "8px", background: "var(--lam-gold)", borderRadius: "50%" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Financial Institutions
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "8px", height: "8px", background: "var(--lam-gold)", borderRadius: "50%" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "var(--lam-dark-text)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Global Operations
          </span>
        </div>
      </div>
    </SectionContainer>
  );
}
