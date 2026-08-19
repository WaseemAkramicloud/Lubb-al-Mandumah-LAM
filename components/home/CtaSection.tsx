import Link from "next/link";
import { SectionContainer } from "@/components/ui/SectionContainer";

export function CtaSection({ data }: { data?: Record<string, unknown> | null }) {
  const eyebrow = (data?.eyebrow as string) || "Contact & Inquiry Hub"
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
          maxWidth: "760px",
          marginInline: "auto",
        }}
      >
        <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
          {eyebrow}
        </p>
        <div className="lam-accent-line" style={{ margin: "0 auto 1.5rem" }} />
        
        <h2 style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)", marginBottom: "1.25rem", color: "var(--lam-dark-text)" }} dangerouslySetInnerHTML={{ __html: (title as string).replace('LΛM', 'L<span style="font-style: italic">Λ</span>M') }}>
        </h2>
        
        <p style={{ fontSize: "var(--text-lg)", color: "var(--lam-dark-text-muted)", marginBottom: "2.5rem", lineHeight: 1.6 }}>
          {description}
        </p>
        
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={primaryLink} className="btn btn-primary btn-lg">
            {primaryText} &rarr;
          </Link>
          <Link href={secondaryLink} className="btn btn-secondary btn-lg">
            {secondaryText}
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
}
