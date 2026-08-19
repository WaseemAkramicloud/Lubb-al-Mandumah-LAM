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

      <SectionContainer background="light" size="lg" id="details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3.5rem", maxWidth: "1000px", margin: "0 auto" }}>
          
          {/* Overview Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "0.75rem", color: "#2563EB" }}>What it is</h2>
              <p style={{ color: "var(--lam-dark-text-muted)", lineHeight: 1.6 }}>{product.detail.whatItIs}</p>
            </div>
            <div>
              <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "0.75rem", color: "#2563EB" }}>Who it is for</h2>
              <p style={{ color: "var(--lam-dark-text-muted)", lineHeight: 1.6 }}>{product.detail.whoItIsFor}</p>
            </div>
          </div>

          <div className="lam-divider" />

          {/* Core Problem & Capabilities */}
          {product.detail?.problemsSolved && product.detail.problemsSolved.length > 0 && (
            <div>
              <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "1.5rem", color: "var(--lam-dark-text)" }}>Business Problems Solved</h2>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {product.detail.problemsSolved.map((problem, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <span style={{ color: "#E11D48", marginTop: "0.25rem", fontWeight: "bold" }}>—</span>
                    <span style={{ color: "var(--lam-dark-text-muted)", lineHeight: 1.6 }}>{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.detail?.keyCapabilities && product.detail.keyCapabilities.length > 0 && (
            <div>
              <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "1.5rem", color: "var(--lam-dark-text)" }}>Key Capabilities</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
                {product.detail.keyCapabilities.map((capability, i) => (
                  <div key={i} className="lam-card">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <div style={{ width: "6px", height: "6px", background: "#2563EB", borderRadius: "50%" }} />
                      <span style={{ fontWeight: 600, fontSize: "var(--text-xs)", color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.06em" }}>Capability 0{i + 1}</span>
                    </div>
                    <p style={{ color: "var(--lam-dark-text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
                      {capability}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="lam-divider" />

          {/* Benefits & Deployment */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>
            {product.detail?.benefits && product.detail.benefits.length > 0 && (
              <div>
                <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "1.25rem", color: "var(--lam-dark-text)" }}>Strategic Benefits</h2>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {product.detail.benefits.map((benefit, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                      <span style={{ color: "#2563EB", marginTop: "0.25rem", fontWeight: "bold" }}>✓</span>
                      <span style={{ color: "var(--lam-dark-text-muted)", lineHeight: 1.5 }}>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="lam-card">
              <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "0.75rem", color: "var(--lam-dark-text)" }}>
                Deployment Architecture
              </h2>
              <p style={{ color: "var(--lam-dark-text-muted)", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
                {product.detail.deploymentNote}
              </p>
              
              <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid #E2E8F0" }}>
                <Link href={product.detail.ctaType === "institutional" || product.detail.ctaType === "partnership" ? "/contact" : "/request-demo"} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  {product.detail.ctaType === "institutional" ? "Request Access" : "Enquire Now"} &rarr;
                </Link>
              </div>
            </div>
          </div>

        </div>
      </SectionContainer>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <SectionContainer background="soft-grey" size="base" style={{ borderTop: "1px solid #E2E8F0" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "2rem", color: "var(--lam-dark-text)" }}>Explore Ecosystem Integrations</h2>
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
