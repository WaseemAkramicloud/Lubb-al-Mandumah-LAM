import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { DetailHero } from "@/components/ui/DetailHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { getCmsPage } from "@/lib/cms/client";

export const metadata: Metadata = {
  title: `Contact | ${siteConfig.shortName}`,
  description: "Get in touch with LΛM.",
};

export default async function ContactPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams
  const isPreview = searchParams.preview === 'true'
  const pageData = await getCmsPage('contact', { preview: isPreview }) as any;
  const heroData = pageData['contact_hero'] || {};
  const officesData = pageData['contact_offices'] || {};

  return (
    <>
      <DetailHero
        eyebrow={heroData.eyebrow || "Get in Touch"}
        title={heroData.title || "Contact LΛM"}
        subtitle={heroData.subtitle || "Reach out to our global teams for corporate inquiries, partnership opportunities, or technical support."}
      />

      <SectionContainer background="black" size="lg">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4rem", maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem", alignItems: "start" }}>
            {/* Contact Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {officesData.offices && officesData.offices.length > 0 ? (
                officesData.offices.map((office: any, index: number) => (
                  <div key={index}>
                    <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "0.5rem" }}>{office.city}</h3>
                    <p style={{ color: "var(--lam-silver)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {office.address}
                    </p>
                    <p style={{ color: "var(--lam-silver-light)", marginTop: "0.5rem" }}>
                      <a href={`tel:${office.phone}`} style={{ color: "var(--lam-gold)", textDecoration: "none" }}>{office.phone}</a><br />
                      <a href={`mailto:${office.email}`} style={{ color: "var(--lam-silver)", textDecoration: "none" }}>{office.email}</a>
                    </p>
                  </div>
                ))
              ) : (
                <>
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
                </>
              )}
              
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
