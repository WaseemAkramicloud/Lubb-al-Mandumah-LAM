import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { DetailHero } from "@/components/ui/DetailHero";
import Link from "next/link";
import { getCmsPage } from "@/lib/cms/client";

export const metadata: Metadata = {
  title: `About | ${siteConfig.shortName}`,
  description: "Building the software ecosystem that powers tomorrow.",
};

export default async function AboutPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams
  const isPreview = searchParams.preview === 'true'
  const pageData = (await getCmsPage('about', { preview: isPreview })) as any;
  const heroData = pageData['about_hero'] || {};
  const introData = pageData['about_intro'] || {};
  const philosophyData = pageData['about_philosophy'] || {};
  const futureData = pageData['about_future'] || {};
  const ctaData = pageData['about_cta'] || {};

  return (
    <>
      <DetailHero
        eyebrow={heroData.eyebrow || "About Lubb al-Mandūmah"}
        title={heroData.title || "The Ecosystem Developers"}
        subtitle={heroData.subtitle || "LΛM is the parent technology company behind an expanding ecosystem of business software, SaaS, platforms, and enterprise applications."}
      />

      <SectionContainer background="light" size="lg">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4rem", maxWidth: "1000px", margin: "0 auto" }}>
          
          {/* Who We Are & What We Build */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3.5rem" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "1.25rem", color: "#0F172A" }}>{introData.who_we_are_title || "Who We Are"}</h2>
              <p style={{ color: "#334155", lineHeight: 1.65 }}>
                {introData.who_we_are_desc || "Lubb al-Mandūmah (LΛM) is an engineering and technology holding entity focused on solving complex operational challenges. We operate behind the scenes, providing the foundational code, architecture, and compliance standards that allow businesses to operate seamlessly on a global scale."}
              </p>
            </div>
            <div>
              <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "1.25rem", color: "#0F172A" }}>{introData.what_we_build_title || "What We Build"}</h2>
              <p style={{ color: "#334155", lineHeight: 1.65 }}>
                {introData.what_we_build_desc || "Our portfolio spans multiple domains, from core enterprise resource planning (ATOM) to highly restricted institutional governance systems (MAAMS) and specialized B2B software as a service (AimHighSERP). We do not build disjointed applications; we build unified platforms."}
              </p>
            </div>
          </div>

          <div className="lam-divider" style={{ borderColor: "#CBD5E1" }} />

          {/* Philosophy / Ecosystem Approach */}
          <div>
            <h2 style={{ fontSize: "var(--text-3xl)", marginBottom: "1.75rem", color: "#0F172A" }}>{philosophyData.title || "Our Ecosystem Philosophy"}</h2>
            <div className="lam-card" style={{ padding: "3rem" }}>
              <p style={{ fontSize: "var(--text-xl)", lineHeight: 1.6, marginBottom: "2rem", color: "#0F172A", fontWeight: 600 }}>
                {philosophyData.main_quote || "We believe that the future of enterprise software is not a collection of isolated tools, but a synchronized ecosystem of interoperable nodes."}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
                {(philosophyData.pillars || [
                  { title: "Single Identity", description: "A unified identity layer (LΛM ID) powers authentication across all subsidiary products, ensuring cross-platform security." },
                  { title: "Predictable Scaling", description: "By sharing core infrastructural elements, new products can be spun up, tested, and deployed at unprecedented speeds." }
                ]).map((pillar: any, index: number) => (
                  <div key={index}>
                    <h4 style={{ color: "#1D4ED8", marginBottom: "0.5rem", fontWeight: 700 }}>{pillar.title}</h4>
                    <p style={{ color: "#334155", fontSize: "var(--text-sm)", lineHeight: 1.6 }}>{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security & Future Direction */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3.5rem" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "1.25rem", color: "#0F172A" }}>{futureData.security_title || "Security & Trust"}</h2>
              <p style={{ color: "#334155", lineHeight: 1.65 }}>
                {futureData.security_desc || "Because we serve diplomatic missions, financial institutions, and global enterprises, security is not an afterthought—it is the bedrock of our code. From 256-bit AES encryption to strict compliance frameworks and zero-trust internal architecture, LΛM protects data sovereignty at all costs."}
              </p>
            </div>
            <div>
              <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "1.25rem", color: "#0F172A" }}>{futureData.future_title || "Future Direction"}</h2>
              <p style={{ color: "#334155", lineHeight: 1.65 }}>
                {futureData.future_desc || "We continue to expand our product registry into new verticals where legacy software still dictates inefficient workflows. Our roadmap includes further development into AI-driven predictive analytics and localized compliance modules tailored for emerging markets."}
              </p>
            </div>
          </div>

          <div className="lam-divider" style={{ borderColor: "#CBD5E1" }} />

          {/* CTA to Careers */}
          <div style={{ textAlign: "center", background: "#FFFFFF", padding: "3.5rem 2rem", borderRadius: "var(--radius-xl)", border: "1px solid #CBD5E1", boxShadow: "0 4px 14px rgba(15,23,42,0.06)" }}>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "1rem", color: "#0F172A" }}>{ctaData.title || "Join the Ecosystem"}</h2>
            <p style={{ color: "#334155", marginBottom: "2rem", maxWidth: "600px", margin: "0 auto 2rem", lineHeight: 1.65 }}>
              {ctaData.description || "We are continually seeking exceptional engineers, architects, and strategic thinkers to contribute to the LΛM core and our subsidiary platforms."}
            </p>
            <Link href={ctaData.button_link || "/about/careers"} className="btn btn-primary btn-lg">
              {ctaData.button_text || "View Careers & Collaborations"} &rarr;
            </Link>
          </div>

        </div>
      </SectionContainer>
    </>
  );
}
