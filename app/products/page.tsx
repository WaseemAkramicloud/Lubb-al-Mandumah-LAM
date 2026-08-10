import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { DetailHero } from "@/components/ui/DetailHero";
import { ProductCategoryFilter } from "@/components/products/ProductCategoryFilter";
import { ProductCard } from "@/components/products/ProductCard";
import { getProductsByCategory } from "@/lib/config/products";
import { getCmsPage } from "@/lib/cms/client";

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

  const pageData = (await getCmsPage('products')) as any;
  const heroData = pageData['products_hero'] || {};

  return (
    <>
      <DetailHero
        eyebrow={heroData.eyebrow || routeMeta.eyebrow}
        title={heroData.title || routeMeta.title}
        subtitle={heroData.subtitle || routeMeta.subtitle}
      />

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
