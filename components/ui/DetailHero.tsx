interface DetailHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function DetailHero({ eyebrow, title, subtitle }: DetailHeroProps) {
  return (
    <div
      style={{
        paddingTop: "calc(var(--header-height) + 3rem)",
        paddingBottom: "3rem",
        background: "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)",
        borderBottom: "1px solid #E2E8F0",
      }}
    >
      <div className="lam-container">
        <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
          {eyebrow}
        </p>
        <div className="lam-accent-line" style={{ marginBottom: "1rem" }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)", marginBottom: "1rem", lineHeight: 1.15, color: "var(--lam-dark-text)" }}>
          {title}
        </h1>
        <p style={{ fontSize: "var(--text-lg)", color: "var(--lam-dark-text-muted)", maxWidth: "780px", lineHeight: 1.6 }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
