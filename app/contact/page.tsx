import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: `Contact | ${siteConfig.shortName}`,
  description: "Get in touch with LΛM.",
};

export default function ContactPage() {
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
          <p className="lam-eyebrow" style={{ marginBottom: "0.75rem" }}>Contact LΛM</p>
          <div className="lam-accent-line" />
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.5rem)", marginBottom: "1rem" }}>
            Get In Touch
          </h1>
          <p style={{ fontSize: "var(--text-xl)", color: "var(--lam-silver-light)", maxWidth: "560px" }}>
            Whether you are seeking institutional deployment, partnership opportunities, or general information, our team is ready to assist.
          </p>
        </div>
      </div>

      <SectionContainer background="black" size="lg">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4rem", maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem", alignItems: "start" }}>
            {/* Contact Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div>
                <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "0.5rem" }}>Corporate Headquarters</h3>
                <p style={{ color: "var(--lam-silver)", lineHeight: 1.6 }}>
                  Global operations are coordinated from our central offices. Meetings are strictly by appointment only.
                </p>
              </div>
              
              <div>
                <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "0.5rem" }}>Secure Communications</h3>
                <p style={{ color: "var(--lam-silver)", lineHeight: 1.6 }}>
                  For institutional clients requiring encrypted channels, please select &quot;Institutional Inquiry&quot; in the form to receive our PGP public keys.
                </p>
              </div>
              
              <div className="lam-card lam-card--flat" style={{ marginTop: "1rem" }}>
                <h4 style={{ color: "var(--lam-gold)", marginBottom: "0.5rem", fontSize: "var(--text-sm)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Support Routing</h4>
                <p style={{ color: "var(--lam-silver)", fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
                  Existing clients should submit support tickets directly through their secure internal Control Hub for SLA-compliant response times.
                </p>
              </div>
            </div>

            {/* The Form */}
            <div>
              <ContactForm />
            </div>
          </div>
          
        </div>
      </SectionContainer>
    </>
  );
}
