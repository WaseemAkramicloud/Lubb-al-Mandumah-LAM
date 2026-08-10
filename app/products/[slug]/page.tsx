import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductById, products } from "@/lib/config/products";
import { siteConfig } from "@/lib/config/site";
import { ProductHero } from "@/components/products/ProductHero";
import { SectionContainer } from "@/components/ui/SectionContainer";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";

export async function generateStaticParams() {
  return products.map((p) => ({
    slug: p.id,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} | ${siteConfig.shortName}`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (
    await Promise.all(
      (product.detail.relatedSolutions || []).map((id) => getProductById(id))
    )
  ).filter((p) => p !== undefined);

  return (
    <>
      <ProductHero product={product} />

      <SectionContainer background="black" size="lg" id="details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4rem", maxWidth: "1000px", margin: "0 auto" }}>
          
          {/* Overview Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem", color: "var(--lam-gold)" }}>What it is</h2>
              <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6 }}>{product.detail.whatItIs}</p>
            </div>
            <div>
              <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem", color: "var(--lam-gold)" }}>Who it is for</h2>
              <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6 }}>{product.detail.whoItIsFor}</p>
            </div>
          </div>

          <div className="lam-divider" />

          {/* Core Problem & Capabilities */}
          <div>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "2rem" }}>Business Problems Solved</h2>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {product.detail.problemsSolved.map((problem, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <span style={{ color: "var(--lam-danger, #e0896a)", marginTop: "0.25rem" }}>—</span>
                  <span style={{ color: "var(--lam-silver-light)", lineHeight: 1.6 }}>{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "2rem" }}>Key Capabilities</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {product.detail.keyCapabilities.map((capability, i) => (
                <div key={i} className="lam-card lam-card--flat">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div style={{ width: "8px", height: "8px", background: "var(--lam-gold)", borderRadius: "50%" }} />
                    <span style={{ fontWeight: 600 }}>Capability 0{i + 1}</span>
                  </div>
                  <p style={{ color: "var(--lam-silver-light)", fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
                    {capability}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lam-divider" />

          {/* Benefits & Deployment */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "1.5rem" }}>Strategic Benefits</h2>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {product.detail.benefits.map((benefit, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <span style={{ color: "var(--lam-gold)", marginTop: "0.25rem" }}>✓</span>
                    <span style={{ color: "var(--lam-silver-light)", lineHeight: 1.5 }}>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div style={{ background: "var(--lam-charcoal)", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--lam-border)" }}>
              <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Deployment Architecture
              </h2>
              <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
                {product.detail.deploymentNote}
              </p>
              
              <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--lam-border-light)" }}>
                <Link href={product.detail.ctaType === "institutional" || product.detail.ctaType === "partnership" ? "/contact" : "/request-demo"} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  {product.detail.ctaType === "institutional" ? "Request Access" : "Enquire Now"}
                </Link>
              </div>
            </div>
          </div>

        </div>
      </SectionContainer>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <SectionContainer background="gunmetal" size="base" style={{ borderTop: "1px solid var(--lam-border)" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "2rem" }}>Explore Ecosystem Integrations</h2>
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
