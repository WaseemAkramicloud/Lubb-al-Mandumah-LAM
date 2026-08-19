import { SectionContainer } from "@/components/ui/SectionContainer";

export function ClientsPreview() {
  return (
    <SectionContainer background="light" size="sm" style={{ borderTop: "1px solid #CBD5E1", borderBottom: "1px solid #CBD5E1" }}>
      <p style={{ textAlign: "center", marginBottom: "1.75rem", color: "#1D4ED8", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
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
          <div style={{ width: "6px", height: "6px", background: "#1D4ED8", borderRadius: "50%" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "#0F172A", fontWeight: 600, letterSpacing: "0.02em" }}>
            Diplomatic Missions
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "6px", height: "6px", background: "#1D4ED8", borderRadius: "50%" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "#0F172A", fontWeight: 600, letterSpacing: "0.02em" }}>
            Enterprise Retail Brands
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "6px", height: "6px", background: "#1D4ED8", borderRadius: "50%" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "#0F172A", fontWeight: 600, letterSpacing: "0.02em" }}>
            Financial Institutions
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "6px", height: "6px", background: "#1D4ED8", borderRadius: "50%" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "#0F172A", fontWeight: 600, letterSpacing: "0.02em" }}>
            Global Operations
          </span>
        </div>
      </div>
    </SectionContainer>
  );
}
