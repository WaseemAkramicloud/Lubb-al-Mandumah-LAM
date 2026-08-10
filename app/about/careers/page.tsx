import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { DetailHero } from "@/components/ui/DetailHero";
import { EmptyState } from "@/components/ui/States";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Careers & Collaborations | ${siteConfig.shortName}`,
  description: "Join the engineers and architects building the LΛM ecosystem.",
};

export default function CareersPage() {
  return (
    <>
      <DetailHero
        eyebrow="Careers at LΛM"
        title="Engineer the Ecosystem"
        subtitle="We are looking for exceptional talent to help architect, build, and scale the foundational platforms that power modern enterprises."
      />

      <SectionContainer background="black" size="lg">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "5rem", maxWidth: "1000px", margin: "0 auto" }}>
          
          {/* Why work with LAM */}
          <div>
            <h2 style={{ fontSize: "var(--text-3xl)", marginBottom: "1.5rem" }}>Why LΛM?</h2>
            <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6, fontSize: "var(--text-lg)", marginBottom: "3rem" }}>
              Working at Lubb al-Mandūmah means operating at the nexus of multiple technological disciplines. Our engineers don&apos;t just maintain isolated applications; they build interoperable platforms. We offer an environment where technical excellence is the baseline, and where architectural decisions impact multiple industries simultaneously.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
              <div className="lam-card">
                <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem", color: "var(--lam-gold)" }}>Uncompromising Standards</h3>
                <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.5 }}>
                  We prioritize clean, maintainable, and highly secure code above rapid, fragile feature delivery.
                </p>
              </div>
              <div className="lam-card">
                <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem", color: "var(--lam-gold)" }}>Ecosystem Impact</h3>
                <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.5 }}>
                  Your work on a core module—like the LΛM ID authentication layer—will instantly benefit every platform within our registry.
                </p>
              </div>
              <div className="lam-card">
                <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem", color: "var(--lam-gold)" }}>Deep Autonomy</h3>
                <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.5 }}>
                  We hire brilliant individuals and get out of their way. We measure outcomes, not arbitrary processes.
                </p>
              </div>
            </div>
          </div>

          <div className="lam-divider" />

          {/* Open Positions (Empty State) */}
          <div>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "2rem" }}>Open Positions</h2>
            <div style={{ border: "1px dashed var(--lam-border)", borderRadius: "var(--radius-xl)", padding: "4rem 2rem", background: "var(--lam-surface)" }}>
              <EmptyState 
                icon="⌘"
                title="No Public Openings"
                message="Currently, there are no open positions listed publicly. However, LΛM is always looking for exceptional software engineers, systems architects, and product strategists."
              />
            </div>
          </div>

          <div className="lam-divider" />

          {/* Internships & Application */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "1.5rem" }}>Internships & Collaborations</h2>
              <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6 }}>
                LΛM frequently collaborates with leading academic institutions and research bodies. If you are seeking a highly technical internship or wish to propose a research collaboration regarding enterprise architecture or digital security, we want to hear from you.
              </p>
            </div>
            <div style={{ background: "var(--lam-charcoal)", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--lam-border)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem" }}>Submit Your Details</h2>
              <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6, fontSize: "var(--text-sm)", marginBottom: "2rem" }}>
                Send us your CV, portfolio, or GitHub profile. We review all proactive applications.
              </p>
              <Link href="/contact?subject=Careers" className="btn btn-primary" style={{ justifyContent: "center", width: "100%" }}>
                Submit Application
              </Link>
            </div>
          </div>

        </div>
      </SectionContainer>
    </>
  );
}
