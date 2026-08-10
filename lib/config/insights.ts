export type InsightCategory =
  | "Articles"
  | "Product Updates"
  | "Business Technology"
  | "ERP & Automation"
  | "Digital Transformation"
  | "Guides"
  | "News";

export interface Insight {
  id: string; // slug
  title: string;
  category: InsightCategory;
  date: string;
  author: string;
  excerpt: string;
  content: string; // HTML or Markdown string for now
}

export const insights: Insight[] = [
  {
    id: "interoperability-in-enterprise-architecture",
    title: "Interoperability in Modern Enterprise Architecture",
    category: "Business Technology",
    date: "2026-08-01",
    author: "LΛM Engineering",
    excerpt: "Why the future of corporate software relies on deeply integrated ecosystems rather than isolated applications.",
    content: `
      <h2>The Shift Away from Monoliths</h2>
      <p>For decades, enterprise software was dominated by monolithic structures. While these systems offered broad functionality, their rigidity made adaptation nearly impossible. Today, agility is the primary currency of enterprise technology.</p>
      <h2>The Ecosystem Approach</h2>
      <p>At LΛM, we advocate for the ecosystem approach. Instead of building isolated applications, we architect platforms that inherently communicate. By establishing a single identity layer (LΛM ID) and standardizing API structures across our entire registry, we ensure that adding a new module—whether for procurement, HR, or specialized CRM—feels like unlocking a native capability rather than bolting on a third-party tool.</p>
      <h2>Conclusion</h2>
      <p>True digital transformation is not achieved by migrating legacy monoliths to the cloud. It is achieved by adopting a composable, interoperable architecture that scales precisely alongside the enterprise.</p>
    `
  },
  {
    id: "security-in-diplomatic-systems",
    title: "Zero-Trust Architecture for Diplomatic Systems",
    category: "Guides",
    date: "2026-07-15",
    author: "LΛM Security",
    excerpt: "An overview of how zero-trust protocols and data sovereignty principles protect institutional infrastructure.",
    content: `
      <h2>The Institutional Imperative</h2>
      <p>Diplomatic missions and government entities operate under unique threat vectors. Standard enterprise security is often insufficient when dealing with state-level actors and highly sensitive consular data.</p>
      <h2>Implementing Zero-Trust</h2>
      <p>Zero-trust architecture operates on a simple principle: never trust, always verify. Within platforms like MAAMS, this means every single data request is authenticated and authorized against strict role-based access controls, regardless of where the request originates on the network.</p>
      <h2>Data Sovereignty</h2>
      <p>Beyond encryption, physical data location matters. True institutional security requires deployment architectures that respect national borders and data localization laws, ensuring that sovereign data remains sovereign.</p>
    `
  },
  {
    id: "the-evolution-of-erp",
    title: "The Evolution of ERP: From Ledger to Nervous System",
    category: "ERP & Automation",
    date: "2026-06-20",
    author: "LΛM Strategy",
    excerpt: "How modern ERP platforms act as the central nervous system for complex corporate entities.",
    content: `
      <h2>Beyond Accounting</h2>
      <p>Enterprise Resource Planning originally focused heavily on manufacturing and finance. Today, platforms like ATOM serve a much broader purpose. They are the central nervous system of the organization, routing data from front-line point-of-sale systems directly to the executive dashboard.</p>
      <h2>Predictive Automation</h2>
      <p>The next frontier is predictive automation. By analyzing historical data across supply chains, modern ERPs can automatically trigger procurement protocols before a stockout occurs, transforming supply chain management from reactive to proactive.</p>
    `
  }
];

export const getInsightsByCategory = (category: string) => {
  if (category === "All") return insights;
  return insights.filter((i) => i.category === category);
};

export const getInsightById = (id: string) => {
  return insights.find((i) => i.id === id);
};
