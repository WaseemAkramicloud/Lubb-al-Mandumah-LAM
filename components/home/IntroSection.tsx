import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function IntroSection({ data }: { data?: Record<string, unknown> | null }) {
  const eyebrow = (data?.eyebrow as string) || "The Ecosystem Core"
  const title = (data?.title as string) || "From Enterprise Systems to Everyday Mobile Tools"
  const subtitle = (data?.subtitle as string) || "LΛM is the parent company and foundational technology layer orchestrating an expanding ecosystem of SaaS products, platforms, and mobile applications."
  
  const defaultCards = [
    {
      eyebrow: "01. Parent Infrastructure",
      title: "Architectural Integrity",
      description: "Engineered for resilience, the LΛM core provides the central foundation that powers our entire ecosystem of business applications."
    },
    {
      eyebrow: "02. Expanding Ecosystem",
      title: "Interconnected Platforms",
      description: "From enterprise ERPs to mobile retail solutions, our products are designed to work seamlessly together or stand alone as best-in-class tools."
    },
    {
      eyebrow: "03. Unified Experience",
      title: "Single Command Plane",
      description: "Rather than managing disconnected tools with fragmented logins, LΛM integrates everything under a singular unified identity and SaaS Control Hub."
    }
  ];

  const cardsList = data?.cards as Record<string, string>[] | undefined;
  const cards = cardsList?.length ? cardsList : defaultCards;

  return (
    <SectionContainer background="light" size="lg">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        align="center"
        theme="light"
      />

      <div
        style={{
          marginTop: "3rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
        }}
      >
        {(cards as Record<string, string>[]).map((card, index: number) => (
          <div key={index} className="lam-card">
            <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>
              {card.eyebrow}
            </p>
            <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "0.85rem", color: "var(--lam-dark-text)" }}>{card.title}</h3>
            <p style={{ color: "var(--lam-dark-text-muted)", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
