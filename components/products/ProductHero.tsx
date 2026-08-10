import Link from "next/link";
import { Product } from "@/lib/config/products";

interface ProductHeroProps {
  product: Product;
}

export function ProductHero({ product }: ProductHeroProps) {
  // Determine CTA text and route based on commercial rule
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
      ctaText = "View on App Store";
      ctaHref = "#"; // Placeholder for app links
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
        paddingTop: "calc(var(--header-height) + 4rem)",
        paddingBottom: "6rem",
        background: "var(--lam-gradient-hero)",
        borderBottom: "1px solid var(--lam-border)",
        position: "relative",
      }}
    >
      <div className="lam-container" style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <p className="lam-eyebrow" style={{ color: "var(--lam-gold)", margin: 0 }}>
            {product.category}
          </p>
          {product.restricted && (
            <span className="lam-badge lam-badge--restricted">{product.badge || "Restricted"}</span>
          )}
        </div>
        
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 6vw, 5rem)", marginBottom: "1.5rem", lineHeight: 1.1 }}>
          {product.name}
        </h1>
        
        <p style={{ fontSize: "var(--text-2xl)", color: "var(--lam-white)", marginBottom: "1.5rem", fontWeight: 500 }}>
          {product.tagline}
        </p>
        
        <p style={{ fontSize: "var(--text-lg)", color: "var(--lam-silver-light)", maxWidth: "800px", marginBottom: "3rem", lineHeight: 1.6 }}>
          {product.description}
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href={ctaHref} className="btn btn-primary btn-lg">
            {ctaText}
          </Link>
          <a href="#details" className="btn btn-secondary btn-lg">
            View Capabilities
          </a>
        </div>
      </div>
    </div>
  );
}
