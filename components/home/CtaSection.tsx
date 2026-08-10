import Link from "next/link";
import { SectionContainer } from "@/components/ui/SectionContainer";

export function CtaSection() {
  return (
    <SectionContainer background="charcoal" size="xl" style={{ borderTop: "1px solid var(--lam-border)" }}>
      <div
        style={{
          textAlign: "center",
          maxWidth: "800px",
          marginInline: "auto",
        }}
      >
        <p className="lam-eyebrow" style={{ marginBottom: "1rem" }}>
          CONTACT & INQUIRY HUB
        </p>
        <div className="lam-accent-line" style={{ margin: "0 auto 1.5rem" }} />
        
        <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", marginBottom: "1.5rem" }}>
          Connect with L<span style={{ fontStyle: "italic" }}>Λ</span>M Systems
        </h2>
        
        <p style={{ fontSize: "var(--text-lg)", color: "var(--lam-silver-light)", marginBottom: "3rem", lineHeight: 1.6 }}>
          Establish communication with our regional sales office, technical support team, or security compliance architects.
        </p>
        
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/products" className="btn btn-primary btn-lg">
            Explore Ecosystem
          </Link>
          <Link href="/request-demo" className="btn btn-secondary btn-lg">
            Request Demo Access
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
}
