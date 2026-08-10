interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  titleSize?: "sm" | "base" | "lg";
}

const titleSizeMap = {
  sm: "var(--text-3xl)",
  base: "var(--text-4xl)",
  lg: "var(--text-5xl)",
};

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  titleSize = "base",
}: SectionHeaderProps) {
  return (
    <div
      style={{
        textAlign: align,
        marginBottom: "3rem",
        ...(align === "center" ? { maxWidth: "680px", marginInline: "auto" } : {}),
      }}
    >
      {eyebrow && (
        <p className="lam-eyebrow" style={{ marginBottom: "0.75rem" }}>
          {eyebrow}
        </p>
      )}
      <div className="lam-accent-line" style={align === "center" ? { margin: "0 auto 1rem" } : {}} />
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: titleSizeMap[titleSize],
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--lam-white)",
          marginBottom: subtitle ? "1rem" : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: "var(--text-lg)",
            color: "var(--lam-silver-light)",
            lineHeight: 1.65,
            maxWidth: "600px",
            ...(align === "center" ? { marginInline: "auto" } : {}),
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
