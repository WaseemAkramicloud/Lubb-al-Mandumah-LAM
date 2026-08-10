import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSolutionById, solutions } from "@/lib/config/solutions";
import { getProductById } from "@/lib/config/products";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { DetailHero } from "@/components/ui/DetailHero";
import { ProductCard } from "@/components/products/ProductCard";
import Link from "next/link";

export async function generateStaticParams() {
  return solutions.map((s) => ({
    slug: s.id,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const solution = await getSolutionById(resolvedParams.slug);

  if (!solution) {
    return { title: "Solution Not Found" };
  }

  return {
    title: `${solution.name} | Solutions | ${siteConfig.shortName}`,
    description: solution.description,
  };
}

export default async function SolutionDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const solution = await getSolutionById(resolvedParams.slug);

  if (!solution) {
    notFound();
  }

  const relatedProducts = (
    await Promise.all(
      solution.relatedProducts.map((id) => getProductById(id))
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
        eyebrow="Solution Overview"
        title={solution.name}
        subtitle={solution.description}
      />

      <SectionContainer background="black" size="lg">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4rem", maxWidth: "1000px", margin: "0 auto" }}>
          
          <div>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "2rem" }}>Common Business Needs</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {solution.commonNeeds.map((need, i) => (
                <div key={i} className="lam-card lam-card--flat">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div style={{ width: "8px", height: "8px", background: "var(--lam-gold)", borderRadius: "50%" }} />
                    <span style={{ fontWeight: 600 }}>Need 0{i + 1}</span>
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
                LΛM approaches {solution.name.toLowerCase()} by providing enterprise-grade infrastructure that consolidates disparate systems into a unified command plane. We replace fragmented workflows with high-performance, compliant architecture.
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
