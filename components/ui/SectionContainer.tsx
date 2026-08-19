import React from "react";

export type SectionBackground =
  | "black"
  | "charcoal"
  | "gunmetal"
  | "surface"
  | "light"
  | "stone"
  | "soft-grey"
  | "white";

interface SectionContainerProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  size?: "sm" | "base" | "lg" | "xl";
  background?: SectionBackground;
  style?: React.CSSProperties;
}

const bgMap: Record<SectionBackground, string> = {
  black: "var(--lam-black)",
  charcoal: "var(--lam-charcoal)",
  gunmetal: "var(--lam-gunmetal)",
  surface: "var(--lam-surface)",
  light: "var(--lam-light-bg)",
  stone: "var(--lam-stone-bg)",
  "soft-grey": "var(--lam-grey-bg)",
  white: "#ffffff",
};

const sizeClass: Record<string, string> = {
  sm: "lam-section--sm",
  base: "lam-section",
  lg: "lam-section--lg",
  xl: "lam-section--xl",
};

export function SectionContainer({
  children,
  id,
  className = "",
  size = "base",
  background = "light",
  style,
}: SectionContainerProps) {
  const isLightMode = ["light", "stone", "soft-grey", "white"].includes(background);

  return (
    <section
      id={id}
      className={`${sizeClass[size]} ${isLightMode ? "lam-section--light" : "lam-section--dark"} ${className}`}
      style={{ background: bgMap[background], color: isLightMode ? "var(--lam-dark-text)" : "var(--lam-white)", ...style }}
    >
      <div className="lam-container">{children}</div>
    </section>
  );
}
