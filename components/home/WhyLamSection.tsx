import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function WhyLamSection({ data }: { data?: Record<string, unknown> | null }) {
  const eyebrow = (data?.eyebrow as string) || "The Ecosystem Advantage"
  const title = (data?.title as string) || "Why Choose LΛM"
  const subtitle = (data?.subtitle as string) || "Unifying fragmented business operations into a single, cohesive command plane."

  const defaultPoints = [
    {
      title: "True Interoperability",
      description: "Our platforms are built from the ground up to communicate natively. Data flows seamlessly between ATOM ERP, NEXORA workforce OS, and financial ledgers without third-party middleware."
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
    <SectionContainer background="stone" size="lg">
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
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2.5rem",
        }}
      >
        {(points as Record<string, string>[]).map((point, index: number) => (
          <div key={index} className="lam-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "0.375rem", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontWeight: "600", fontSize: "0.9rem" }}>
              0{index + 1}
            </div>
            <h3 style={{ fontSize: "var(--text-xl)", color: "var(--lam-dark-text)" }}>{point.title}</h3>
            <p style={{ color: "var(--lam-dark-text-muted)", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
              {point.description}
            </p>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
