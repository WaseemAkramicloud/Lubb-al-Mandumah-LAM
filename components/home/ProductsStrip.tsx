import Link from "next/link";
import { getProductById, Product } from "@/lib/config/products";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface ProductsStripProps {
  data?: any;
}

export async function ProductsStrip({ data }: ProductsStripProps) {
  const eyebrow = data?.eyebrow || "Ecosystem Platforms";
  const title = data?.title || "Featured Product Ecosystem";
  const subtitle = data?.subtitle || "Explore our flagship SaaS applications, educational tools, restricted institutional systems, and platform suites.";
  
  const productSlugs = data?.product_slugs 
    ? data.product_slugs.split(',').map((s: string) => s.trim()).filter(Boolean)
    : ["atom", "nexora", "aimhighserp", "maams", "pointo", "amal"];
  
  const products = (
    await Promise.all(productSlugs.map((slug: string) => getProductById(slug)))
  ).filter((p): p is Product => p !== undefined);

  return (
    <SectionContainer background="soft-grey" size="lg">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem", marginBottom: "2.5rem" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            theme="light"
          />
        </div>
        <Link href="/products" className="btn btn-secondary">
          View All Products &rarr;
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {products.map((product) => (
          <div key={product.id} className="lam-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>
                  {product.category}
                </span>
                <h3 style={{ fontSize: "var(--text-2xl)", margin: 0, color: "var(--lam-dark-text)" }}>{product.name}</h3>
              </div>
              {product.restricted && (
                <span className="lam-badge lam-badge--restricted">{product.badge || "Restricted"}</span>
              )}
            </div>
            
            <p style={{ fontWeight: 600, color: "var(--lam-dark-text)", marginBottom: "0.5rem", fontSize: "var(--text-sm)" }}>
              {product.tagline}
            </p>
            <p style={{ color: "var(--lam-dark-text-muted)", marginBottom: "1.75rem", flex: 1, lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
              {product.description}
            </p>
            
            <Link href={product.href} className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
              Explore {product.name} &rarr;
            </Link>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
