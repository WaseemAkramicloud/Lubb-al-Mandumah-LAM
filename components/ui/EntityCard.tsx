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
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem", display: "block" }}>
          {eyebrow}
        </span>
      )}
      <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "0.85rem", color: "#0F172A" }}>{title}</h3>
      <p style={{ color: "#334155", lineHeight: 1.65, marginBottom: "1.75rem", flex: 1, fontSize: "var(--text-sm)" }}>
        {description}
      </p>
      <Link href={href} style={{ color: "#1D4ED8", fontWeight: 600, fontSize: "var(--text-sm)", textDecoration: "none" }}>
        {ctaText} &rarr;
      </Link>
    </div>
  );
}
