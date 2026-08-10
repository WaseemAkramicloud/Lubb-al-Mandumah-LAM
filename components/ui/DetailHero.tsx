interface DetailHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function DetailHero({ eyebrow, title, subtitle }: DetailHeroProps) {
  return (
    <div
      style={{
        paddingTop: "calc(var(--header-height) + 4rem)",
        paddingBottom: "4rem",
        background: "var(--lam-gradient-hero)",
        borderBottom: "1px solid var(--lam-border)",
      }}
    >
      <div className="lam-container">
        <p className="lam-eyebrow" style={{ color: "var(--lam-gold)", marginBottom: "1rem", margin: 0 }}>
          {eyebrow}
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "1.5rem", lineHeight: 1.1 }}>
          {title}
        </h1>
        <p style={{ fontSize: "var(--text-xl)", color: "var(--lam-silver-light)", maxWidth: "800px", lineHeight: 1.6 }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
