import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function SecuritySection() {
  return (
    <SectionContainer background="charcoal" size="lg">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4rem", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <SectionHeader
            eyebrow="Security & Governance"
            title="UNCOMPROMISING DATA SOVEREIGNTY"
            subtitle="Built to meet the stringent requirements of diplomatic missions and global financial institutions."
          />
          <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6, marginBottom: "2rem" }}>
            The LΛM ecosystem employs military-grade encryption and zero-trust architecture. Data isolation is maintained through strict row-level security and federated access protocols, ensuring that your enterprise information remains completely sovereign.
          </p>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ color: "var(--lam-gold)" }}>✓</span>
              <span style={{ color: "var(--lam-white)" }}>SOC2 Type II & GDPR Compliant</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ color: "var(--lam-gold)" }}>✓</span>
              <span style={{ color: "var(--lam-white)" }}>Role-Based Access Control (RBAC)</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ color: "var(--lam-gold)" }}>✓</span>
              <span style={{ color: "var(--lam-white)" }}>End-to-End Encrypted Transit</span>
            </li>
          </ul>
        </div>
        
        <div style={{ flex: 1, minWidth: "300px" }}>
          <div style={{ background: "var(--lam-black)", padding: "3rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--lam-border)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 700, color: "var(--lam-white)", lineHeight: 1 }}>99.999%</p>
                <p className="lam-eyebrow" style={{ marginTop: "0.5rem", color: "var(--lam-silver)" }}>Uptime SLA</p>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 700, color: "var(--lam-white)", lineHeight: 1 }}>256-bit</p>
                <p className="lam-eyebrow" style={{ marginTop: "0.5rem", color: "var(--lam-silver)" }}>AES Encryption</p>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 700, color: "var(--lam-white)", lineHeight: 1 }}>ISO</p>
                <p className="lam-eyebrow" style={{ marginTop: "0.5rem", color: "var(--lam-silver)" }}>27001 Certified</p>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 700, color: "var(--lam-white)", lineHeight: 1 }}>&lt;10ms</p>
                <p className="lam-eyebrow" style={{ marginTop: "0.5rem", color: "var(--lam-silver)" }}>Isolation Latency</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
