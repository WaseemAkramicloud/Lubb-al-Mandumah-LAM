import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { ProductCategoryFilter } from "@/components/products/ProductCategoryFilter";
import { ProductCard } from "@/components/products/ProductCard";
import { getProductsByCategory } from "@/lib/config/products";

const routeMeta = {
  title: "Our Products & Platforms",
  eyebrow: "Products",
  subtitle: "Enterprise-grade software built for ambitious organisations.",
};

export const metadata: Metadata = {
  title: `${routeMeta.title} | ${siteConfig.shortName}`,
  description: routeMeta.subtitle,
};

// Next.js 15+ page component types
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const categoryParam = typeof resolvedParams.category === "string" ? resolvedParams.category : "All";
  
  const products = await getProductsByCategory(categoryParam);

  return (
    <>
      {/* Page hero */}
      <div
        style={{
          paddingTop: "calc(var(--header-height) + 4rem)",
          paddingBottom: "4rem",
          background: "var(--lam-charcoal)",
          borderBottom: "1px solid var(--lam-border)",
        }}
      >
        <div className="lam-container">
          <p className="lam-eyebrow" style={{ marginBottom: "0.75rem" }}>{routeMeta.eyebrow}</p>
          <div className="lam-accent-line" />
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.5rem)", marginBottom: "1rem" }}>
            {routeMeta.title}
          </h1>
          <p style={{ fontSize: "var(--text-xl)", color: "var(--lam-silver-light)", maxWidth: "560px" }}>
            {routeMeta.subtitle}
          </p>
        </div>
      </div>

      <SectionContainer background="black" size="lg">
        <ProductCategoryFilter activeCategory={categoryParam} />

        {products.length === 0 ? (
          <div style={{ padding: "4rem 0", textAlign: "center" }}>
            <p style={{ color: "var(--lam-silver)", fontSize: "var(--text-lg)" }}>
              No products found in this category. Check back soon.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "2rem",
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </SectionContainer>
    </>
  );
}
