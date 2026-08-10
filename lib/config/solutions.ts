export interface Solution {
  id: string;
  name: string;
  description: string;
  commonNeeds: string[];
  relatedProducts: string[];
}

export const solutions: Solution[] = [
  {
    id: "business-management",
    name: "Business Management",
    description: "Holistic oversight and administration of enterprise operations, from human resources to strategic planning.",
    commonNeeds: [
      "Consolidating fragmented data from multiple departments into a single source of truth.",
      "Automating routine administrative tasks to focus on strategic growth.",
      "Ensuring compliance and unified reporting across international subsidiaries."
    ],
    relatedProducts: ["atom"]
  },
  {
    id: "finance-accounting",
    name: "Finance & Accounting",
    description: "Advanced financial workflows, ledger management, and institutional portfolio analytics.",
    commonNeeds: [
      "Real-time reconciliation of complex, multi-currency general ledgers.",
      "Aggregating distributed asset data for accurate wealth and portfolio management.",
      "Automating tax, compliance, and regulatory reporting."
    ],
    relatedProducts: ["atom", "amal"]
  },
  {
    id: "crm-sales",
    name: "CRM & Sales",
    description: "End-to-end customer relationship and sales pipeline management for B2B and B2C environments.",
    commonNeeds: [
      "Tracking the complete customer journey from lead acquisition to final sale.",
      "Providing sales teams with offline-capable tools for field and retail environments.",
      "Integrating front-of-house sales data directly with back-office inventory."
    ],
    relatedProducts: ["atom", "pointo"]
  },
  {
    id: "inventory-operations",
    name: "Inventory & Operations",
    description: "Robust supply chain, procurement, and real-time stock synchronization.",
    commonNeeds: [
      "Preventing stockouts and overstock scenarios via predictive analytics.",
      "Synchronizing multi-warehouse inventory with retail point-of-sale systems.",
      "Streamlining vendor relationships and automated procurement cycles."
    ],
    relatedProducts: ["atom", "pointo"]
  },
  {
    id: "workflow-automation",
    name: "Workflow Automation",
    description: "Intelligent systems that remove friction from repetitive processes and accelerate decision making.",
    commonNeeds: [
      "Replacing manual data entry with system-to-system integrations.",
      "Standardizing digital marketing and SEO audits at scale.",
      "Enforcing strict approval hierarchies without slowing down operations."
    ],
    relatedProducts: ["atom", "aimhighserp"]
  },
  {
    id: "education-management",
    name: "Education Management",
    description: "Comprehensive administration systems for academic institutions, covering staff, resources, and campus operations.",
    commonNeeds: [
      "Managing complex timetables, faculty assignments, and campus resources.",
      "Handling tuition billing, grants, and institutional finance.",
      "Ensuring secure, role-based access to academic and administrative records."
    ],
    relatedProducts: ["atom"]
  },
  {
    id: "institutional-administration",
    name: "Institutional Administration",
    description: "Highly secure governance and operational platforms tailored for complex, restricted, or government-level entities.",
    commonNeeds: [
      "Maintaining absolute data sovereignty and encrypted communications.",
      "Managing complex protocol, event, and visitor clearances.",
      "Administering citizen services, visas, and consular documentation."
    ],
    relatedProducts: ["maams", "amal"]
  },
  {
    id: "digital-transformation",
    name: "Digital Transformation",
    description: "Custom business systems and enterprise-wide architectural upgrades to modernize legacy infrastructure.",
    commonNeeds: [
      "Migrating off decades-old, unsupported on-premise software.",
      "Unifying disparate acquisitions under a single corporate technology standard.",
      "Preparing infrastructure for next-generation mobile and AI capabilities."
    ],
    relatedProducts: ["atom", "aimhighserp", "pointo"]
  }
];

export const getSolutionById = (id: string) => {
  return solutions.find((s) => s.id === id);
};
