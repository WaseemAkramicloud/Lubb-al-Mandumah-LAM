export interface Industry {
  id: string;
  name: string;
  description: string;
  commonNeeds: string[];
  relatedProducts: string[];
}

export const industries: Industry[] = [
  {
    id: "businesses-smes",
    name: "Businesses & SMEs",
    description: "Scalable technology solutions that allow growing businesses to compete at an enterprise level.",
    commonNeeds: [
      "Access to enterprise-grade tools without prohibitive initial capital expenditure.",
      "Systems that can scale effortlessly as the business expands into new markets.",
      "Unified platforms that reduce the need to hire specialized IT personnel for maintenance."
    ],
    relatedProducts: ["atom", "pointo", "aimhighserp"]
  },
  {
    id: "education",
    name: "Education",
    description: "Administrative and operational foundations for schools, universities, and training institutes.",
    commonNeeds: [
      "Managing complex faculty schedules, student records, and campus facilities.",
      "Ensuring strict data privacy for student information.",
      "Handling grants, tuition billing, and institutional finance efficiently."
    ],
    relatedProducts: ["atom"]
  },
  {
    id: "government-institutions",
    name: "Government & Institutions",
    description: "Highly secure, compliant systems for public sector operations and civic administration.",
    commonNeeds: [
      "Uncompromising data sovereignty and compliance with strict national regulations.",
      "Auditable, transparent workflows for procurement and public spending.",
      "Citizen-facing portals for service delivery and record management."
    ],
    relatedProducts: ["maams", "atom"]
  },
  {
    id: "diplomatic-missions",
    name: "Diplomatic Missions",
    description: "Specialized platforms designed for the unique protocols and security requirements of embassies and consulates.",
    commonNeeds: [
      "Encrypted, isolated communication channels separated from public infrastructure.",
      "Efficient processing of visas, passports, and citizen emergency services.",
      "Event and protocol management for high-level diplomatic visits."
    ],
    relatedProducts: ["maams"]
  },
  {
    id: "logistics-distribution",
    name: "Logistics & Distribution",
    description: "End-to-end supply chain visibility and inventory control for complex distribution networks.",
    commonNeeds: [
      "Real-time tracking of inventory across multiple warehouses and transit routes.",
      "Automated procurement triggers based on predictive demand analytics.",
      "Integration with fleet management and third-party logistics providers."
    ],
    relatedProducts: ["atom"]
  },
  {
    id: "retail",
    name: "Retail",
    description: "Omnichannel commerce and point-of-sale systems that bridge the gap between digital and physical storefronts.",
    commonNeeds: [
      "Reliable offline-first point-of-sale systems that never interrupt transactions.",
      "Real-time synchronization between in-store inventory and e-commerce platforms.",
      "Unified customer loyalty profiles across all purchasing channels."
    ],
    relatedProducts: ["pointo", "atom"]
  },
  {
    id: "construction",
    name: "Construction",
    description: "Project management, resource allocation, and financial tracking for large-scale development projects.",
    commonNeeds: [
      "Tracking material costs, labor hours, and equipment depreciation per project.",
      "Managing complex subcontractor relationships and compliance documentation.",
      "Mobile-friendly tools for on-site supervisors to log progress and issues."
    ],
    relatedProducts: ["atom"]
  },
  {
    id: "professional-services",
    name: "Professional Services",
    description: "Time tracking, billing, and client management for agencies, consultancies, and specialized firms.",
    commonNeeds: [
      "Accurate tracking of billable hours and expenses against client retainers.",
      "Advanced digital marketing tools to maintain thought leadership and lead generation.",
      "Secure client portals for document sharing and project updates."
    ],
    relatedProducts: ["atom", "aimhighserp"]
  }
];

import { createClient } from '@/lib/supabase/server';

export const getIndustryById = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('cms_collections')
      .select('*')
      .eq('slug', id)
      .eq('type', 'industry')
      .eq('status', 'published')
      .single();
    
    if (data && data.data) {
      return { ...data.data, id: data.slug, name: data.title } as Industry;
    }
  } catch (err) {
    console.error(`Failed to fetch industry ${id} from CMS, falling back to static config.`, err);
  }

  return industries.find((i) => i.id === id);
};
