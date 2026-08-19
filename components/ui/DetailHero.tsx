interface DetailHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function DetailHero({ eyebrow, title, subtitle }: DetailHeroProps) {
  return (
    <div
      style={{
        paddingTop: "calc(var(--header-height) + 3.5rem)",
        paddingBottom: "3.5rem",
        background: "linear-gradient(180deg, #F8FAFC 0%, #EDF2F7 100%)",
        borderBottom: "1px solid var(--lam-light-border)",
      }}
    >
      <div className="lam-container">
        <p className="lam-eyebrow" style={{ color: "var(--lam-gold)", marginBottom: "0.75rem" }}>
          {eyebrow}
        </p>
        <div className="lam-accent-line" style={{ marginBottom: "1rem" }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "1.25rem", lineHeight: 1.1, color: "var(--lam-dark-text)" }}>
          {title}
        </h1>
        <p style={{ fontSize: "var(--text-xl)", color: "var(--lam-dark-text-muted)", maxWidth: "800px", lineHeight: 1.6 }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
