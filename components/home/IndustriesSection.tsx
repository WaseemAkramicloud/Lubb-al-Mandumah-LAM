import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Link from "next/link";

export function IndustriesSection() {
  return (
    <SectionContainer background="black" size="lg">
      <SectionHeader
        eyebrow="Target Domains"
        title="INDUSTRIES WE SERVE"
        subtitle="LΛM engineers high-performance platforms tailored to the rigorous demands of specialized sectors."
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
          <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem" }}>Government & Diplomacy</h3>
          <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6, marginBottom: "2rem" }}>
            Secure, restricted-access environments designed for the highest levels of institutional compliance and data sovereignty.
          </p>
          <Link href="/products#maams" style={{ color: "var(--lam-gold)", fontWeight: 600, fontSize: "var(--text-sm)" }}>
            View Compliance Tools →
          </Link>
        </div>

        <div className="lam-card lam-card--gold">
          <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem" }}>Financial Institutions</h3>
          <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6, marginBottom: "2rem" }}>
            Sophisticated portfolio management, real-time analytics, and high-frequency data processing for demanding financial entities.
          </p>
          <Link href="/products#amal" style={{ color: "var(--lam-gold)", fontWeight: 700, fontSize: "var(--text-sm)" }}>
            Explore AMAL Platform →
          </Link>
        </div>

        <div className="lam-card lam-card--flat">
          <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem" }}>Enterprise Retail</h3>
          <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6, marginBottom: "2rem" }}>
            Omnichannel commerce, inventory synchronization, and next-generation point-of-sale infrastructure for global brands.
          </p>
          <Link href="/products#pointo" style={{ color: "var(--lam-gold)", fontWeight: 600, fontSize: "var(--text-sm)" }}>
            Discover PointO →
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
}
