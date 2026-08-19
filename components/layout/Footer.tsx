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
        background: "#0F172A",
        borderTop: "1px solid #334155",
        paddingTop: "4rem",
        paddingBottom: "2.5rem",
        color: "#CBD5E1",
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
          <div style={{ maxWidth: "300px" }}>
            <Link
              href="/"
              aria-label={`${siteConfig.name} — Home`}
              style={{ display: "inline-block", marginBottom: "0.75rem" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.85rem",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "-0.03em",
                }}
              >
                L<span style={{ fontStyle: "italic", color: "#38BDF8" }}>Λ</span>M
              </span>
            </Link>
            <p
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#94A3B8",
                marginBottom: "0.85rem",
              }}
            >
              {siteConfig.tagline}
            </p>
            <p style={{ fontSize: "var(--text-sm)", color: "#CBD5E1", lineHeight: 1.6 }}>
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

        {/* ── Divider ── */}
        <div
          style={{
            height: "1px",
            background: "#334155",
            marginBottom: "1.75rem",
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
          <p style={{ fontSize: "var(--text-xs)", color: "#94A3B8" }}>
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            {footerNav.legal.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ fontSize: "var(--text-xs)", color: "#CBD5E1" }}
              >
                {item.label}
              </Link>
            ))}

            {/* Client Portal — discreet, footer link */}
            <Link
              href="/id/login"
              style={{
                fontSize: "var(--text-xs)",
                color: "#CBD5E1",
                borderLeft: "1px solid #334155",
                paddingLeft: "1.5rem",
              }}
            >
              Client Portal
            </Link>

            {/* Staff Login — discreet, footer only */}
            <Link
              href="/staff-login"
              style={{
                fontSize: "var(--text-xs)",
                color: "#CBD5E1",
                borderLeft: "1px solid #334155",
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
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#FFFFFF",
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
                color: "#CBD5E1",
                transition: "color var(--transition-fast)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#FFFFFF"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#CBD5E1"; }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
