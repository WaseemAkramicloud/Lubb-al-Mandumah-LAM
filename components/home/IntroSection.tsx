import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function IntroSection({ data }: { data?: Record<string, unknown> | null }) {
  const eyebrow = (data?.eyebrow as string) || "The Ecosystem Core"
  const title = (data?.title as string) || "FROM ENTERPRISE SYSTEMS TO EVERYDAY MOBILE TOOLS"
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
    <SectionContainer background="charcoal" size="lg">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        align="center"
      />

      <div
        style={{
          marginTop: "4rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
        }}
      >
        {(cards as Record<string, string>[]).map((card, index: number) => (
          <div key={index} className={`lam-card ${index === 1 ? 'lam-card--flat' : ''}`}>
            <p className="lam-eyebrow" style={{ marginBottom: "1rem" }}>{card.eyebrow}</p>
            <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "1rem" }}>{card.title}</h3>
            <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6 }}>
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
