"use client";

import Link from "next/link";
import { footerNav } from "@/lib/config/navigation";
import { siteConfig } from "@/lib/config/site";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      style={{
        background: "var(--lam-charcoal)",
        borderTop: "1px solid var(--lam-border)",
        paddingTop: "4rem",
        paddingBottom: "2rem",
      }}
    >
      <div className="lam-container">
        {/* ── Top: Logo + columns ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3rem",
            marginBottom: "3rem",
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div style={{ maxWidth: "280px" }}>
            <Link
              href="/"
              aria-label={`${siteConfig.name} — Home`}
              style={{ display: "inline-block", marginBottom: "1rem" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  fontWeight: 700,
                  background: "var(--lam-gradient-gold)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.03em",
                }}
              >
                L<span style={{ fontStyle: "italic" }}>Λ</span>M
              </span>
            </Link>
            <p
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--lam-silver)",
                marginBottom: "1rem",
              }}
            >
              {siteConfig.tagline}
            </p>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver)", lineHeight: 1.6 }}>
              Building the software ecosystem that powers ambitious organisations worldwide.
            </p>
          </div>

          {/* Company column */}
          <FooterColumn title="Company" links={footerNav.company} />

          {/* Products column */}
          <FooterColumn title="Products" links={footerNav.products} />

          {/* Solutions column */}
          <FooterColumn title="Solutions" links={footerNav.solutions} />
        </div>

        {/* ── Gold divider ── */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, var(--lam-gold-dark), transparent)",
            marginBottom: "1.5rem",
            opacity: 0.4,
          }}
          role="separator"
          aria-hidden="true"
        />

        {/* ── Bottom bar ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <p style={{ fontSize: "var(--text-xs)", color: "var(--lam-silver-dim)" }}>
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            {footerNav.legal.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ fontSize: "var(--text-xs)", color: "var(--lam-silver-dim)" }}
              >
                {item.label}
              </Link>
            ))}

            {/* Staff Login — discreet, footer only */}
            <Link
              href="/staff-login"
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--lam-silver-dim)",
                opacity: 0.6,
                borderLeft: "1px solid var(--lam-border)",
                paddingLeft: "1.5rem",
              }}
            >
              Staff Login
            </Link>
          </div>
        </div>
      </div>

      {/* Responsive grid styles */}
      <style>{`
        @media (min-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1.5fr 1fr 1fr 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--lam-mist)",
          marginBottom: "1rem",
        }}
      >
        {title}
      </h3>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--lam-silver)",
                transition: "color var(--transition-fast)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--lam-gold)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--lam-silver)"; }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
