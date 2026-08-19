import Link from "next/link";
import { getProductById, Product } from "@/lib/config/products";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface ProductsStripProps {
  data?: any;
}

export async function ProductsStrip({ data }: ProductsStripProps) {
  // Extract data with fallback
  const eyebrow = data?.eyebrow || "Ecosystem Platforms";
  const title = data?.title || "FEATURED PRODUCT ECOSYSTEM";
  const subtitle = data?.subtitle || "Explore our flagship SaaS applications, educational platforms, restricted diplomatic systems, and modern platform solutions.";
  
  // Use product_slugs from CMS if available, otherwise fallback to default featured products
  const productSlugs = data?.product_slugs 
    ? data.product_slugs.split(',').map((s: string) => s.trim()).filter(Boolean)
    : ["atom", "nexora", "aimhighserp", "maams", "pointo", "amal"];
  
  // Fetch products dynamically
  const products = (
    await Promise.all(productSlugs.map((slug: string) => getProductById(slug)))
  ).filter((p): p is Product => p !== undefined);

  return (
    <SectionContainer background="soft-grey" size="lg">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem", marginBottom: "3rem" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            theme="light"
          />
        </div>
        <Link href="/products" className="btn btn-primary">
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
          <div key={product.id} className="lam-card lam-card--gold" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <span className="lam-eyebrow" style={{ color: "var(--lam-gold)", marginBottom: "0.4rem", display: "block" }}>
                  {product.category}
                </span>
                <h3 style={{ fontSize: "var(--text-2xl)", margin: 0, color: "var(--lam-dark-text)" }}>{product.name}</h3>
              </div>
              {product.restricted && (
                <span className="lam-badge lam-badge--restricted">{product.badge || "Restricted"}</span>
              )}
            </div>
            
            <p style={{ fontWeight: 600, color: "var(--lam-dark-text)", marginBottom: "0.5rem" }}>
              {product.tagline}
            </p>
            <p style={{ color: "var(--lam-dark-text-muted)", marginBottom: "2rem", flex: 1, lineHeight: 1.6 }}>
              {product.description}
            </p>
            
            <Link href={product.href} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Explore {product.name}
            </Link>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
