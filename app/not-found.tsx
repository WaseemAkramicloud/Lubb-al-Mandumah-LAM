import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--lam-black)",
        padding: "2rem",
        paddingTop: "calc(var(--header-height) + 2rem)",
        textAlign: "center",
      }}
    >
      <div>
        <p
          className="lam-eyebrow"
          style={{ marginBottom: "1rem", fontSize: "var(--text-base)", letterSpacing: "0.3em" }}
        >
          404
        </p>
        <div className="lam-accent-line" style={{ margin: "0 auto 1.5rem" }} />
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, var(--text-5xl))",
            marginBottom: "1rem",
          }}
        >
          Page Not Found
        </h1>
        <p
          style={{
            color: "var(--lam-silver)",
            fontSize: "var(--text-lg)",
            maxWidth: "400px",
            marginInline: "auto",
            marginBottom: "2.5rem",
          }}
        >
          The page you are looking for does not exist or has been moved.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">
            Return Home
          </Link>
          <Link href="/contact" className="btn btn-secondary">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
