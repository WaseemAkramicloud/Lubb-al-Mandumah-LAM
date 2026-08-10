import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { DetailHero } from "@/components/ui/DetailHero";
import { EmptyState } from "@/components/ui/States";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Partners & Clients | ${siteConfig.shortName}`,
  description: "Trusted collaborations and technological partnerships.",
};

export default function PartnersPage() {
  return (
    <>
      <DetailHero
        eyebrow="Partners & Clients"
        title="Ecosystem Collaboration"
        subtitle="Trusted by leading organisations worldwide. We build strategic relationships to deploy enterprise technology at scale."
      />

      <SectionContainer background="black" size="lg">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "5rem", maxWidth: "1000px", margin: "0 auto" }}>
          
          {/* Partnership Approach */}
          <div>
            <h2 style={{ fontSize: "var(--text-3xl)", marginBottom: "1.5rem" }}>Partnership Approach</h2>
            <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6, fontSize: "var(--text-lg)", marginBottom: "2rem" }}>
              LΛM does not operate in isolation. Our platforms are designed to be the foundational infrastructure upon which other systems integrate and thrive. We collaborate with select technology vendors, integration specialists, and strategic consultancies to deliver uncompromising value to our end clients.
            </p>
          </div>

          <div className="lam-divider" />

          {/* Partner Types Grid */}
          <div>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "2rem" }}>Areas of Collaboration</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
              <div className="lam-card">
                <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem" }}>Technology Partners</h3>
                <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.5 }}>
                  Hardware manufacturers and specialized software vendors whose products integrate natively with the LΛM ecosystem.
                </p>
              </div>
              <div className="lam-card">
                <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem" }}>Implementation Partners</h3>
                <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.5 }}>
                  Certified agencies and system integrators authorized to deploy, configure, and maintain LΛM platforms on-premise or in hybrid clouds.
                </p>
              </div>
              <div className="lam-card">
                <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem" }}>Strategic Partners</h3>
                <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.5 }}>
                  Management consultancies and advisory firms that leverage our platforms to execute large-scale digital transformation mandates.
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: "3rem", textAlign: "center" }}>
              <Link href="/contact?subject=Partnership" className="btn btn-primary btn-lg">
                Become a Partner
              </Link>
            </div>
          </div>

          <div className="lam-divider" />

          {/* Selected Clients (Empty State) */}
          <div>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "2rem" }}>Selected Clients</h2>
            <div style={{ border: "1px dashed var(--lam-border)", borderRadius: "var(--radius-xl)", padding: "4rem 2rem", background: "var(--lam-surface)" }}>
              <EmptyState 
                icon="🔒"
                title="Confidentiality by Design"
                message="LΛM respects the confidentiality of its institutional and enterprise clients. Operating under strict Non-Disclosure Agreements, we do not publicly list client logos or operational metrics. Approved public case studies will appear here once authorized."
              />
            </div>
          </div>

        </div>
      </SectionContainer>
    </>
  );
}
