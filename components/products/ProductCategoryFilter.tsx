import Link from "next/link";

interface ProductCategoryFilterProps {
  activeCategory: string;
}

export const CATEGORIES = [
  "All",
  "SaaS",
  "Education",
  "Institutional",
  "Platforms",
];

export function ProductCategoryFilter({ activeCategory }: ProductCategoryFilterProps) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "3rem" }}>
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
              border: `1px solid ${isActive ? "var(--lam-gold)" : "var(--lam-border-light)"}`,
              background: isActive ? "var(--lam-gold)" : "var(--lam-light-surface)",
              color: isActive ? "#000000" : "var(--lam-dark-text)",
              fontSize: "var(--text-sm)",
              fontWeight: isActive ? 600 : 500,
              textDecoration: "none",
              boxShadow: isActive ? "0 2px 8px rgba(201, 168, 76, 0.25)" : "0 1px 3px rgba(0,0,0,0.05)",
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
