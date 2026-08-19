interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  titleSize?: "sm" | "base" | "lg";
  theme?: "light" | "dark" | "auto";
}

const titleSizeMap = {
  sm: "var(--text-2xl)",
  base: "var(--text-3xl)",
  lg: "var(--text-4xl)",
};

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  titleSize = "base",
  theme = "auto",
}: SectionHeaderProps) {
  const isLight = theme !== "dark";

  return (
    <div
      style={{
        textAlign: align,
        marginBottom: "2.5rem",
        ...(align === "center" ? { maxWidth: "680px", marginInline: "auto" } : {}),
      }}
    >
      {eyebrow && (
        <p
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: isLight ? "#1D4ED8" : "#38BDF8",
            marginBottom: "0.6rem",
          }}
        >
          {eyebrow}
        </p>
      )}
      <div className="lam-accent-line" style={{ background: isLight ? "#1D4ED8" : "#38BDF8", ...(align === "center" ? { margin: "0 auto 1rem" } : { marginBottom: "1rem" }) }} />
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: titleSizeMap[titleSize],
          fontWeight: 600,
          letterSpacing: "-0.015em",
          color: isLight ? "#0F172A" : "#FFFFFF",
          marginBottom: subtitle ? "0.85rem" : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: "var(--text-base)",
            color: isLight ? "#475569" : "#CBD5E1",
            lineHeight: 1.65,
            maxWidth: "620px",
            ...(align === "center" ? { marginInline: "auto" } : {}),
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
