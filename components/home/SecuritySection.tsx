import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function SecuritySection() {
  return (
    <SectionContainer background="charcoal" size="lg" style={{ background: "#0F172A" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4rem", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <SectionHeader
            eyebrow="Security & Governance"
            title="Uncompromising Data Sovereignty"
            subtitle="Engineered to satisfy the requirements of diplomatic missions and enterprise organizations."
            theme="dark"
          />
          <p style={{ color: "#CBD5E1", lineHeight: 1.65, marginBottom: "2rem", fontSize: "var(--text-sm)" }}>
            The LΛM ecosystem employs enterprise encryption and zero-trust architecture. Data isolation is maintained through strict row-level security and federated access protocols, ensuring that your enterprise information remains completely sovereign.
          </p>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ color: "#38BDF8", fontWeight: "bold" }}>✓</span>
              <span style={{ color: "#FFFFFF", fontSize: "var(--text-sm)", fontWeight: 500 }}>SOC2 Type II & GDPR Compliant</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ color: "#38BDF8", fontWeight: "bold" }}>✓</span>
              <span style={{ color: "#FFFFFF", fontSize: "var(--text-sm)", fontWeight: 500 }}>Role-Based Access Control (RBAC)</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ color: "#38BDF8", fontWeight: "bold" }}>✓</span>
              <span style={{ color: "#FFFFFF", fontSize: "var(--text-sm)", fontWeight: 500 }}>End-to-End Encrypted Transit</span>
            </li>
          </ul>
        </div>
        
        <div style={{ flex: 1, minWidth: "300px" }}>
          <div style={{ background: "#1E293B", padding: "2.5rem", borderRadius: "var(--radius-lg)", border: "1px solid #475569" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>99.999%</p>
                <p style={{ marginTop: "0.5rem", color: "#CBD5E1", fontSize: "var(--text-xs)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>Uptime SLA</p>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>256-bit</p>
                <p style={{ marginTop: "0.5rem", color: "#CBD5E1", fontSize: "var(--text-xs)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>AES Encryption</p>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>ISO</p>
                <p style={{ marginTop: "0.5rem", color: "#CBD5E1", fontSize: "var(--text-xs)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>27001 Certified</p>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>&lt;10ms</p>
                <p style={{ marginTop: "0.5rem", color: "#CBD5E1", fontSize: "var(--text-xs)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>Isolation Latency</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
