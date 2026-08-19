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
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category;
        const href = category === "All" ? "/products" : `/products?category=${encodeURIComponent(category)}`;
        
        return (
          <Link
            key={category}
            href={href}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "0.375rem",
              border: `1px solid ${isActive ? "#0F172A" : "#CBD5E1"}`,
              background: isActive ? "#0F172A" : "#FFFFFF",
              color: isActive ? "#FFFFFF" : "#0F172A",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: isActive ? "0 2px 8px rgba(15,23,42,0.12)" : "none",
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
