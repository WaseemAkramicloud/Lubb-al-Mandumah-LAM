import Link from "next/link";
import { Product } from "@/lib/config/products";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="lam-card lam-card--gold" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <span className="lam-eyebrow" style={{ color: "var(--lam-silver)", marginBottom: "0.5rem", display: "block" }}>
            {product.category}
          </span>
          <h3 style={{ fontSize: "var(--text-2xl)", margin: 0 }}>{product.name}</h3>
        </div>
        {product.restricted && (
          <span className="lam-badge lam-badge--restricted">{product.badge || "Restricted"}</span>
        )}
      </div>
      
      <p style={{ fontWeight: 500, color: "var(--lam-white)", marginBottom: "0.5rem" }}>
        {product.tagline}
      </p>
      <p style={{ color: "var(--lam-silver)", marginBottom: "2rem", flex: 1 }}>
        {product.description}
      </p>
      
      <Link href={product.href} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
        Explore {product.name}
      </Link>
    </div>
  );
}
