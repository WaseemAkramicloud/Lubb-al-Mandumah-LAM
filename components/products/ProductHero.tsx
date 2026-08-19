import Link from "next/link";
import { Product } from "@/lib/config/products";

interface ProductHeroProps {
  product: Product;
}

export function ProductHero({ product }: ProductHeroProps) {
  let ctaText = "Request Demo";
  let ctaHref = "/request-demo";

  switch (product.detail.ctaType) {
    case "quote":
      ctaText = "Request a Quote";
      break;
    case "institutional":
      ctaText = "Institutional Enquiry";
      ctaHref = "/contact";
      break;
    case "partnership":
      ctaText = "Discuss Partnership";
      ctaHref = "/contact";
      break;
    case "app":
      ctaText = "View Application";
      ctaHref = "/contact";
      break;
    case "demo":
    default:
      ctaText = "Request Demo";
      ctaHref = "/request-demo";
      break;
  }

  return (
    <div
      style={{
        paddingTop: "calc(var(--header-height) + 3.5rem)",
        paddingBottom: "4.5rem",
        background: "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)",
        borderBottom: "1px solid #E2E8F0",
        position: "relative",
      }}
    >
      <div className="lam-container" style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
          <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
            {product.category}
          </p>
          {product.restricted && (
            <span className="lam-badge lam-badge--restricted">{product.badge || "Restricted"}</span>
          )}
        </div>
        
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.75rem, 5.5vw, 4.5rem)", marginBottom: "1rem", lineHeight: 1.1, color: "var(--lam-dark-text)" }}>
          {product.name}
        </h1>
        
        <p style={{ fontSize: "var(--text-xl)", color: "var(--lam-dark-text)", marginBottom: "1.25rem", fontWeight: 600 }}>
          {product.tagline}
        </p>
        
        <p style={{ fontSize: "var(--text-lg)", color: "var(--lam-dark-text-muted)", maxWidth: "800px", marginBottom: "2.5rem", lineHeight: 1.6 }}>
          {product.description}
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href={ctaHref} className="btn btn-primary btn-lg">
            {ctaText} &rarr;
          </Link>
          <a href="#details" className="btn btn-secondary btn-lg">
            View Capabilities
          </a>
        </div>
      </div>
    </div>
  );
}
