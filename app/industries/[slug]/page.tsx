import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getIndustryById, industries } from "@/lib/config/industries";
import { getProductById } from "@/lib/config/products";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { DetailHero } from "@/components/ui/DetailHero";
import { ProductCard } from "@/components/products/ProductCard";
import Link from "next/link";

export async function generateStaticParams() {
  return industries.map((i) => ({
    slug: i.id,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const industry = await getIndustryById(resolvedParams.slug);

  if (!industry) {
    return { title: "Industry Not Found" };
  }

  return {
    title: `${industry.name} | Industries | ${siteConfig.shortName}`,
    description: industry.description,
  };
}

export default async function IndustryDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const industry = await getIndustryById(resolvedParams.slug);

  if (!industry) {
    notFound();
  }

  const relatedProducts = (
    await Promise.all(
      industry.relatedProducts.map((id) => getProductById(id))
    )
  ).filter((p) => p !== undefined);

  // Determine CTA
  const primaryProduct = relatedProducts[0];
  let ctaHref = "/contact";
  let ctaText = "Enquire Now";
  if (primaryProduct) {
    if (primaryProduct.detail.ctaType === "demo") {
      ctaHref = "/request-demo";
      ctaText = "Request Demo";
    } else if (primaryProduct.detail.ctaType === "quote") {
      ctaHref = "/request-demo";
      ctaText = "Request a Quote";
    } else if (primaryProduct.detail.ctaType === "institutional") {
      ctaHref = "/contact";
      ctaText = "Request Access";
    }
  }

  return (
    <>
      <DetailHero
        eyebrow="Industry Overview"
        title={industry.name}
        subtitle={industry.description}
      />

      <SectionContainer background="black" size="lg">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4rem", maxWidth: "1000px", margin: "0 auto" }}>
          
          <div>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "2rem" }}>Sector Challenges & Needs</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {industry.commonNeeds.map((need, i) => (
                <div key={i} className="lam-card lam-card--flat">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div style={{ width: "8px", height: "8px", background: "var(--lam-gold)", borderRadius: "50%" }} />
                    <span style={{ fontWeight: 600 }}>Challenge 0{i + 1}</span>
                  </div>
                  <p style={{ color: "var(--lam-silver-light)", fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
                    {need}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lam-divider" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "1.5rem" }}>Our Approach</h2>
              <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                LΛM understands the unique constraints and scale of the {industry.name.toLowerCase()} sector. We deploy robust, compliant, and highly interoperable software platforms that solve domain-specific problems without compromising security or architectural integrity.
              </p>
              <Link href={ctaHref} className="btn btn-primary">
                {ctaText}
              </Link>
            </div>
          </div>

        </div>
      </SectionContainer>

      {/* Relevant Products */}
      {relatedProducts.length > 0 && (
        <SectionContainer background="gunmetal" size="base" style={{ borderTop: "1px solid var(--lam-border)" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "2rem" }}>Relevant Platforms</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
              {relatedProducts.map(rp => (
                <ProductCard key={rp!.id} product={rp!} />
              ))}
            </div>
          </div>
        </SectionContainer>
      )}
    </>
  );
}
