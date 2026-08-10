"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/lib/config/navigation";
import { siteConfig } from "@/lib/config/site";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* Scroll-aware header */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  /* Trap focus inside mobile menu */
  useEffect(() => {
    if (!mobileOpen) return;
    const el = menuRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        triggerRef.current?.focus();
      }
      if (e.key === "Tab") {
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };
    document.addEventListener("keydown", onKeydown);
    first?.focus();
    return () => document.removeEventListener("keydown", onKeydown);
  }, [mobileOpen]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        role="banner"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: "var(--header-height)",
          display: "flex",
          alignItems: "center",
          transition: "background var(--transition-slow), border-color var(--transition-slow), box-shadow var(--transition-slow)",
          background: scrolled
            ? "rgba(10, 10, 11, 0.95)"
            : "rgba(10, 10, 11, 0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${scrolled ? "rgba(201,168,76,0.12)" : "rgba(49,49,56,0.6)"}`,
          boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div
          className="lam-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "2rem",
          }}
        >
          {/* ── Logo ── */}
          <Link
            href="/"
            aria-label={`${siteConfig.name} — Home`}
            style={{ display: "flex", flexDirection: "column", lineHeight: 1, flexShrink: 0 }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.6rem",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                background: "var(--lam-gradient-gold)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              L<span style={{ fontStyle: "italic" }}>Λ</span>M
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.5rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--lam-silver)",
                marginTop: "1px",
              }}
            >
              {siteConfig.tagline}
            </span>
          </Link>

          {/* ── Desktop Navigation ── */}
          <nav
            role="navigation"
            aria-label="Primary navigation"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              flex: 1,
              justifyContent: "center",
            }}
            className="header-nav-desktop"
          >
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  letterSpacing: "0.03em",
                  padding: "0.4rem 0.7rem",
                  borderRadius: "var(--radius-sm)",
                  color: isActive(item.href) ? "var(--lam-white)" : "var(--lam-silver-light)",
                  background: isActive(item.href) ? "var(--lam-surface)" : "transparent",
                  transition: "color var(--transition-fast), background var(--transition-fast)",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--lam-white)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.href)) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--lam-silver-light)";
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ── CTA + Hamburger ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
            <Link href="/request-demo" className="btn btn-primary btn-sm header-cta">
              Request Demo
            </Link>
            <button
              ref={triggerRef}
              className="mobile-menu-trigger"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              style={{
                display: "none",
                background: "none",
                border: "1px solid var(--lam-border-light)",
                borderRadius: "var(--radius-sm)",
                color: "var(--lam-white)",
                cursor: "pointer",
                padding: "0.4rem",
                width: "2.25rem",
                height: "2.25rem",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ── */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,8,9,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 998,
          }}
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Menu Panel ── */}
      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(320px, 90vw)",
          background: "var(--lam-gunmetal)",
          borderLeft: "1px solid var(--lam-border)",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform var(--transition-slow)",
          overflowY: "auto",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--lam-border)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              fontWeight: 700,
              background: "var(--lam-gradient-gold)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            L<span style={{ fontStyle: "italic" }}>Λ</span>M
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            style={{
              background: "none",
              border: "none",
              color: "var(--lam-silver)",
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 3L17 17M17 3L3 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav role="navigation" aria-label="Mobile navigation" style={{ flex: 1, padding: "1rem 0" }}>
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0.875rem 1.5rem",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-base)",
                fontWeight: isActive(item.href) ? 600 : 400,
                color: isActive(item.href) ? "var(--lam-white)" : "var(--lam-silver-light)",
                borderLeft: isActive(item.href) ? "2px solid var(--lam-gold)" : "2px solid transparent",
                transition: "all var(--transition-fast)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA in panel */}
        <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--lam-border)" }}>
          <Link href="/request-demo" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Request Demo
          </Link>
        </div>
      </div>

      {/* ── Responsive styles via style tag ── */}
      <style>{`
        @media (max-width: 1023px) {
          .header-nav-desktop { display: none !important; }
          .mobile-menu-trigger { display: flex !important; }
          .header-cta { display: none !important; }
        }
        @media (min-width: 1024px) {
          .mobile-menu-trigger { display: none !important; }
        }
      `}</style>
    </>
  );
}
