import React from "react";

interface SectionContainerProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  size?: "sm" | "base" | "lg" | "xl";
  background?: "black" | "charcoal" | "gunmetal" | "surface";
  style?: React.CSSProperties;
}

const bgMap: Record<string, string> = {
  black: "var(--lam-black)",
  charcoal: "var(--lam-charcoal)",
  gunmetal: "var(--lam-gunmetal)",
  surface: "var(--lam-surface)",
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
  background = "black",
  style,
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={`${sizeClass[size]} ${className}`}
      style={{ background: bgMap[background], ...style }}
    >
      <div className="lam-container">{children}</div>
    </section>
  );
}
