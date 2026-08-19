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
import { getCmsPage } from "@/lib/cms/client";

export default async function CareersPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const isPreview = searchParams.preview === 'true';
  
  const supabase = await createClient();
  const { data: careers } = await supabase
    .from('cms_collections')
    .select('*')
    .eq('type', 'career')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const pageData = (await getCmsPage('careers', { preview: isPreview })) as any;
  const heroData = pageData['careers_hero'] || {};
  const whyData = pageData['careers_why'] || {};
  const internshipsData = pageData['careers_internships'] || {};

  return (
    <>
      <DetailHero
        eyebrow={heroData.eyebrow || "Careers at LΛM"}
        title={heroData.title || "Engineer the Ecosystem"}
        subtitle={heroData.subtitle || "We are looking for exceptional talent to help architect, build, and scale the foundational platforms that power modern enterprises."}
      />

      <SectionContainer background="light" size="lg">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4rem", maxWidth: "1000px", margin: "0 auto" }}>
          
          {/* Why work with LAM */}
          <div>
            <h2 style={{ fontSize: "var(--text-3xl)", marginBottom: "1.25rem", color: "#0F172A" }}>{whyData.title || "Why LΛM?"}</h2>
            <p style={{ color: "#334155", lineHeight: 1.65, fontSize: "var(--text-lg)", marginBottom: "2.5rem" }}>
              {whyData.main_text || "Working at Lubb al-Mandūmah means operating at the nexus of multiple technological disciplines. Our engineers don't just maintain isolated applications; they build interoperable platforms. We offer an environment where technical excellence is the baseline, and where architectural decisions impact multiple industries simultaneously."}
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.75rem" }}>
              {(whyData.pillars || [
                { title: "Uncompromising Standards", description: "We prioritize clean, maintainable, and highly secure code above rapid, fragile feature delivery." },
                { title: "Ecosystem Impact", description: "Your work on a core module—like the LΛM ID authentication layer—will instantly benefit every platform within our registry." },
                { title: "Deep Autonomy", description: "We hire brilliant individuals and get out of their way. We measure outcomes, not arbitrary processes." }
              ]).map((pillar: any, index: number) => (
                <div key={index} className="lam-card">
                  <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "0.75rem", color: "#1D4ED8" }}>{pillar.title}</h3>
                  <p style={{ color: "#334155", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lam-divider" style={{ borderColor: "#CBD5E1" }} />

          {/* Open Positions */}
          <div>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "1.5rem", color: "#0F172A" }}>Open Positions</h2>
            
            {careers && careers.length > 0 ? (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                {careers.map((career) => (
                  <div key={career.slug} className="lam-card" style={{ padding: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                      <div>
                        <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "0.5rem", color: "#0F172A" }}>{career.title}</h3>
                        <div style={{ display: "flex", gap: "1rem", color: "#475569", fontSize: "var(--text-sm)", fontWeight: 500 }}>
                          <span>{career.data?.department}</span>
                          <span>•</span>
                          <span>{career.data?.location}</span>
                          <span>•</span>
                          <span>{career.data?.type}</span>
                        </div>
                      </div>
                      <Link href={`/contact?subject=Application:%20${career.title}`} className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "var(--text-sm)" }}>
                        Apply Now &rarr;
                      </Link>
                    </div>
                    <p style={{ color: "#334155", lineHeight: 1.65, marginBottom: "1.5rem" }}>
                      {career.data?.description}
                    </p>
                    
                    {career.data?.requirements && career.data.requirements.length > 0 && (
                      <div>
                        <h4 style={{ color: "#1D4ED8", fontSize: "var(--text-sm)", marginBottom: "0.5rem", fontWeight: 700 }}>Key Requirements</h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {career.data.requirements.map((req: string, i: number) => (
                            <li key={i} style={{ display: "flex", gap: "0.5rem", color: "#334155", fontSize: "var(--text-sm)" }}>
                              <span style={{ color: "#1D4ED8", fontWeight: "bold" }}>✓</span> {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ border: "1px dashed #CBD5E1", borderRadius: "var(--radius-xl)", padding: "4rem 2rem", background: "#FFFFFF" }}>
                <EmptyState 
                  icon="⌘"
                  title="No Public Openings"
                  message="Currently, there are no open positions listed publicly. However, LΛM is always looking for exceptional software engineers, systems architects, and product strategists."
                />
              </div>
            )}
          </div>

          <div className="lam-divider" style={{ borderColor: "#CBD5E1" }} />

          {/* Internships & Application */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3.5rem" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "1.25rem", color: "#0F172A" }}>{internshipsData.internship_title || "Internships & Collaborations"}</h2>
              <p style={{ color: "#334155", lineHeight: 1.65 }}>
                {internshipsData.internship_desc || "LΛM frequently collaborates with leading academic institutions and research bodies. If you are seeking a highly technical internship or wish to propose a research collaboration regarding enterprise architecture or digital security, we want to hear from you."}
              </p>
            </div>
            <div className="lam-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "0.85rem", color: "#0F172A" }}>{internshipsData.cta_title || "Submit Your Details"}</h2>
              <p style={{ color: "#334155", lineHeight: 1.65, fontSize: "var(--text-sm)", marginBottom: "1.75rem" }}>
                {internshipsData.cta_desc || "Send us your CV, portfolio, or GitHub profile. We review all proactive applications."}
              </p>
              <Link href={internshipsData.button_link || "/contact?subject=Careers"} className="btn btn-primary btn-lg" style={{ justifyContent: "center", width: "100%" }}>
                {internshipsData.button_text || "Submit Application"} &rarr;
              </Link>
            </div>
          </div>

        </div>
      </SectionContainer>
    </>
  );
}
