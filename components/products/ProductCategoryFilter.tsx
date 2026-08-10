import Link from "next/link";

interface ProductCategoryFilterProps {
  activeCategory: string;
}

export const CATEGORIES = [
  "All",
  "Business Software",
  "Education",
  "Institutional Systems",
  "Platform Ecosystems",
  "Applications",
];

export function ProductCategoryFilter({ activeCategory }: ProductCategoryFilterProps) {
  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" }}>
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category;
        const href = category === "All" ? "/products" : `/products?category=${encodeURIComponent(category)}`;
        
        return (
          <Link
            key={category}
            href={href}
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: "var(--radius-full)",
              border: `1px solid ${isActive ? "var(--lam-gold)" : "var(--lam-border)"}`,
              background: isActive ? "rgba(201, 168, 76, 0.1)" : "transparent",
              color: isActive ? "var(--lam-gold)" : "var(--lam-silver)",
              fontSize: "var(--text-sm)",
              fontWeight: isActive ? 600 : 400,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            {category}
          </Link>
        );
      })}
    </div>
  );
}
