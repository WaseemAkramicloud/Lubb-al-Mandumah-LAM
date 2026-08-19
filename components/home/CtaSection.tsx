import Link from "next/link";
import { SectionContainer } from "@/components/ui/SectionContainer";

export function CtaSection({ data }: { data?: Record<string, unknown> | null }) {
  const eyebrow = (data?.eyebrow as string) || "CONTACT & INQUIRY HUB"
  const title = (data?.title as string) || "Connect with LΛM Systems"
  const description = (data?.description as string) || "Establish communication with our regional sales office, technical support team, or security compliance architects."
  const primaryText = (data?.primary_button_text as string) || "Explore Ecosystem"
  const primaryLink = (data?.primary_button_link as string) || "/products"
  const secondaryText = (data?.secondary_button_text as string) || "Request Demo Access"
  const secondaryLink = (data?.secondary_button_link as string) || "/request-demo"

  return (
    <SectionContainer background="light" size="xl" style={{ borderTop: "1px solid var(--lam-light-border)" }}>
      <div
        style={{
          textAlign: "center",
          maxWidth: "800px",
          marginInline: "auto",
        }}
      >
        <p className="lam-eyebrow" style={{ marginBottom: "1rem", color: "var(--lam-gold)" }}>
          {eyebrow}
        </p>
        <div className="lam-accent-line" style={{ margin: "0 auto 1.5rem" }} />
        
        <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", marginBottom: "1.5rem", color: "var(--lam-dark-text)" }} dangerouslySetInnerHTML={{ __html: (title as string).replace('LΛM', 'L<span style="font-style: italic">Λ</span>M') }}>
        </h2>
        
        <p style={{ fontSize: "var(--text-lg)", color: "var(--lam-dark-text-muted)", marginBottom: "3rem", lineHeight: 1.6 }}>
          {description}
        </p>
        
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={primaryLink} className="btn btn-primary btn-lg">
            {primaryText}
          </Link>
          <Link href={secondaryLink} className="btn btn-secondary btn-lg" style={{ color: "var(--lam-dark-text)", borderColor: "var(--lam-light-border)" }}>
            {secondaryText}
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
}
