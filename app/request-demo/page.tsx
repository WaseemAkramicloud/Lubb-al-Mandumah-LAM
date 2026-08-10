import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { RequestDemoForm } from "@/components/forms/RequestDemoForm";

export const metadata: Metadata = {
  title: `Request a Demo | ${siteConfig.shortName}`,
  description: "See our products in action.",
};

export default function RequestDemoPage() {
  return (
    <>
      <div
        style={{
          paddingTop: "calc(var(--header-height) + 4rem)",
          paddingBottom: "4rem",
          background: "var(--lam-charcoal)",
          borderBottom: "1px solid var(--lam-border)",
        }}
      >
        <div className="lam-container">
          <p className="lam-eyebrow" style={{ marginBottom: "0.75rem" }}>Demo Request</p>
          <div className="lam-accent-line" />
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.5rem)", marginBottom: "1rem" }}>
            Experience the Ecosystem
          </h1>
          <p style={{ fontSize: "var(--text-xl)", color: "var(--lam-silver-light)", maxWidth: "560px" }}>
            Schedule a personalized demonstration of LΛM platforms tailored to your organizational scale and specific operational challenges.
          </p>
        </div>
      </div>

      <SectionContainer background="black" size="lg">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4rem", maxWidth: "800px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <p style={{ color: "var(--lam-silver)", fontSize: "var(--text-lg)", lineHeight: 1.6 }}>
              Please provide accurate professional details to help us match you with the appropriate product specialist.
            </p>
          </div>

          <RequestDemoForm />
          
        </div>
      </SectionContainer>
    </>
  );
}
