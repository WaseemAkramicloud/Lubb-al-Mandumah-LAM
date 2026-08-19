import Link from "next/link";
import { Product } from "@/lib/config/products";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="lam-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
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
  );
}
