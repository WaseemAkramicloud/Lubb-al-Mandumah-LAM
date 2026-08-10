import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function WhyLamSection({ data }: { data?: Record<string, unknown> | null }) {
  const eyebrow = (data?.eyebrow as string) || "The Ecosystem Advantage"
  const title = (data?.title as string) || "WHY CHOOSE LΛM"
  const subtitle = (data?.subtitle as string) || "Unifying fragmented business operations into a single, cohesive command plane."

  const defaultPoints = [
    {
      title: "True Interoperability",
      description: "Our platforms are built from the ground up to communicate natively. Data flows seamlessly between ATOM ERP, PointO retail systems, and financial ledgers without third-party middleware."
    },
    {
      title: "Single Identity Core",
      description: "LΛM ID provides federated, role-based access control across all applications. Manage thousands of employees and permissions from one unified directory."
    },
    {
      title: "Predictable Scaling",
      description: "Start with the core infrastructure you need today, and instantly unlock new capabilities as your enterprise grows, all under consolidated billing and support."
    }
  ]
  const pointsList = data?.points as Record<string, string>[] | undefined;
  const points = pointsList?.length ? pointsList : defaultPoints

  return (
    <SectionContainer background="gunmetal" size="lg">
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
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2.5rem",
        }}
      >
        {(points as Record<string, string>[]).map((point, index: number) => (
          <div key={index} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--lam-gradient-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lam-black)", fontWeight: "bold" }}>
              {index + 1}
            </div>
            <h3 style={{ fontSize: "var(--text-xl)" }}>{point.title}</h3>
            <p style={{ color: "var(--lam-silver-light)", lineHeight: 1.6 }}>
              {point.description}
            </p>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
