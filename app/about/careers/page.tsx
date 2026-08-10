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

import { createClient } from "@/lib/supabase/server";

export default async function CareersPage() {
  const supabase = await createClient();
  const { data: careers } = await supabase
    .from('cms_collections')
    .select('*')
    .eq('type', 'career')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

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

          {/* Open Positions */}
          <div>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "2rem" }}>Open Positions</h2>
            
            {careers && careers.length > 0 ? (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                {careers.map((career) => (
                  <div key={career.slug} className="lam-card" style={{ padding: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                      <div>
                        <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "0.5rem" }}>{career.title}</h3>
                        <div style={{ display: "flex", gap: "1rem", color: "var(--lam-silver)", fontSize: "var(--text-sm)" }}>
                          <span>{career.data?.department}</span>
                          <span>•</span>
                          <span>{career.data?.location}</span>
                          <span>•</span>
                          <span>{career.data?.type}</span>
                        </div>
                      </div>
                      <Link href={`/contact?subject=Application:%20${career.title}`} className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "var(--text-sm)" }}>
                        Apply Now
                      </Link>
                    </div>
                    <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                      {career.data?.description}
                    </p>
                    
                    {career.data?.requirements && career.data.requirements.length > 0 && (
                      <div>
                        <h4 style={{ color: "var(--lam-gold)", fontSize: "var(--text-sm)", marginBottom: "0.5rem" }}>Key Requirements</h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {career.data.requirements.map((req: string, i: number) => (
                            <li key={i} style={{ display: "flex", gap: "0.5rem", color: "var(--lam-silver-light)", fontSize: "var(--text-sm)" }}>
                              <span style={{ color: "var(--lam-gold)" }}>✓</span> {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ border: "1px dashed var(--lam-border)", borderRadius: "var(--radius-xl)", padding: "4rem 2rem", background: "var(--lam-surface)" }}>
                <EmptyState 
                  icon="⌘"
                  title="No Public Openings"
                  message="Currently, there are no open positions listed publicly. However, LΛM is always looking for exceptional software engineers, systems architects, and product strategists."
                />
              </div>
            )}
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
