import Link from "next/link";

interface EntityCardProps {
  title: string;
  description: string;
  href: string;
  ctaText?: string;
  eyebrow?: string;
}

export function EntityCard({ title, description, href, ctaText = "Learn More", eyebrow }: EntityCardProps) {
  return (
    <div className="lam-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {eyebrow && (
        <span className="lam-eyebrow" style={{ color: "var(--lam-silver)", marginBottom: "1rem", display: "block" }}>
          {eyebrow}
        </span>
      )}
      <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem" }}>{title}</h3>
      <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6, marginBottom: "2rem", flex: 1 }}>
        {description}
      </p>
      <Link href={href} style={{ color: "var(--lam-gold)", fontWeight: 600, fontSize: "var(--text-sm)", textDecoration: "none" }}>
        {ctaText} →
      </Link>
    </div>
  );
}
