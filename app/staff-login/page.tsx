import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata = {
  title: `Internal Access | ${siteConfig.shortName}`,
  description: "Secure internal staff access portal.",
  robots: { index: false, follow: false },
};

export default function StaffLoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--lam-black)",
        paddingTop: "var(--header-height)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "2rem" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.5rem",
              fontWeight: 700,
              background: "var(--lam-gradient-gold)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            L<em>Λ</em>M
          </span>
        </div>

        {/* Card */}
        <div
          className="lam-card"
          style={{ textAlign: "left", background: "var(--lam-gunmetal)" }}
        >
          <div className="lam-accent-line" />
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-2xl)",
              marginBottom: "0.5rem",
            }}
          >
            Internal Access
          </h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver)", marginBottom: "2rem" }}>
            This portal is for authorised Lubb al-Mandūmah staff only.
          </p>

          <LoginForm />
        </div>

        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: "1.5rem",
            fontSize: "var(--text-sm)",
            color: "var(--lam-silver-dim)",
          }}
        >
          ← Return to website
        </Link>
      </div>
    </div>
  );
}
