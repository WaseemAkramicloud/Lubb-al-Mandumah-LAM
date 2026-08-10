export type ProductCategory =
  | "Business Software"
  | "Education"
  | "Institutional Systems"
  | "Platform Ecosystems"
  | "Applications";

export type CtaType = "demo" | "quote" | "institutional" | "partnership" | "app";

export interface ProductDetail {
  whatItIs: string;
  whoItIsFor: string;
  problemsSolved: string[];
  keyCapabilities: string[];
  benefits: string[];
  deploymentNote: string;
  relatedSolutions?: string[];
  ctaType: CtaType;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: ProductCategory;
  href: string;
  restricted?: boolean;
  comingSoon?: boolean;
  badge?: string;
  detail: ProductDetail;
}

export const products: Product[] = [
  {
    id: "atom",
    name: "ATOM",
    tagline: "Enterprise Operations Platform",
    description: "A comprehensive ERP and operations platform built for modern enterprises — covering inventory, procurement, sales, finance and more.",
    category: "Business Software",
    href: "/products/atom",
    detail: {
      whatItIs: "ATOM is a central nervous system for complex corporate entities. It consolidates disparate data streams and workflows into a single, scalable enterprise resource planning (ERP) environment.",
      whoItIsFor: "Mid-to-large tier enterprises, multinational corporations, and multi-subsidiary conglomerates requiring unified oversight.",
      problemsSolved: [
        "Siloed departmental data leading to inaccurate financial forecasting.",
        "Fragmented supply chain tracking across regional boundaries.",
        "Inefficient manual reconciliation processes in finance and HR."
      ],
      keyCapabilities: [
        "Real-time General Ledger and multi-currency financial consolidation.",
        "End-to-end supply chain and inventory tracking.",
        "Automated procurement and vendor management workflows.",
        "Human capital and payroll administration."
      ],
      benefits: [
        "Complete visibility into enterprise health in real-time.",
        "Reduction in operational overhead by automating repetitive administrative tasks.",
        "Scalable architecture that supports rapid mergers and acquisitions."
      ],
      deploymentNote: "Deployed via LΛM Cloud with optional hybrid-cloud configurations for stringent regulatory environments.",
      relatedSolutions: ["pointo", "aimhighserp"],
      ctaType: "demo",
    }
  },
  {
    id: "aimhighserp",
    name: "AimHighSERP",
    tagline: "SEO Intelligence Platform",
    description: "Advanced search engine intelligence that helps your brand dominate rankings with data-driven insights and automated optimisation.",
    category: "Business Software",
    href: "/products/aimhighserp",
    detail: {
      whatItIs: "An advanced digital marketing and search engine intelligence suite. AimHighSERP analyzes competitive landscapes and automatically highlights optimization vectors for enterprise web properties.",
      whoItIsFor: "Digital marketing agencies, enterprise CMOs, and large-scale e-commerce brands.",
      problemsSolved: [
        "Loss of organic traffic to aggressive competitors.",
        "Inability to track keyword performance across hundreds of thousands of SKUs.",
        "Disconnect between content creation and search intent data."
      ],
      keyCapabilities: [
        "Predictive ranking algorithms and competitor tracking.",
        "Automated technical SEO audits at scale.",
        "Content gap analysis using NLP and machine learning.",
        "Backlink profile health monitoring."
      ],
      benefits: [
        "Increased organic acquisition through data-driven content strategies.",
        "Early warning systems for algorithmic penalties or drops in visibility.",
        "Actionable, prioritized tasks for marketing teams."
      ],
      deploymentNote: "SaaS deployment with dedicated account management and API access for custom dashboard integration.",
      relatedSolutions: ["atom"],
      ctaType: "quote",
    }
  },
  {
    id: "maams",
    name: "MAAMS",
    tagline: "Multi-tenant Administration & Access Management System",
    description: "A restricted-access compliance and governance platform for diplomatic missions and approved institutions.",
    category: "Institutional Systems",
    href: "/products/maams",
    restricted: true,
    badge: "By Invitation",
    detail: {
      whatItIs: "MAAMS is a highly secure, restricted-access governance system designed exclusively to handle the operational complexities, protocols, and security requirements of diplomatic missions.",
      whoItIsFor: "Embassies, consulates, diplomatic missions, and intergovernmental organizations.",
      problemsSolved: [
        "Insecure transmission of sensitive diplomatic communications.",
        "Complex visa, consular, and citizen service management.",
        "Lack of unified protocol management across multiple missions."
      ],
      keyCapabilities: [
        "Encrypted, isolated communication and document transmission.",
        "Consular service tracking (visas, passports, citizen registry).",
        "Protocol and event management tailored for diplomatic requirements.",
        "Strict row-level security and compliance auditing."
      ],
      benefits: [
        "Complete data sovereignty and compliance with international data laws.",
        "Streamlined consular services resulting in better citizen support.",
        "Uncompromising security standards backed by zero-trust architecture."
      ],
      deploymentNote: "Available strictly by invitation. Deployed on dedicated infrastructure with rigorous isolation standards.",
      relatedSolutions: ["atom"],
      ctaType: "institutional",
    }
  },
  {
    id: "amal",
    name: "AMAL",
    tagline: "Finance & Investment Management",
    description: "A sophisticated financial management and investment portfolio platform designed for discerning institutions.",
    category: "Platform Ecosystems",
    href: "/products/amal",
    detail: {
      whatItIs: "AMAL is a comprehensive wealth and investment management platform. It aggregates complex asset classes into a singular analytical view, facilitating intelligent portfolio decisions.",
      whoItIsFor: "Family offices, wealth managers, private equity firms, and institutional investors.",
      problemsSolved: [
        "Scattered asset data across disparate global markets and brokers.",
        "Delayed reporting leading to missed investment opportunities.",
        "Complex compliance reporting for high-net-worth portfolios."
      ],
      keyCapabilities: [
        "Multi-asset class portfolio aggregation.",
        "Real-time risk analytics and exposure modeling.",
        "Automated compliance and tax reporting structures.",
        "Client portal with customized visualization."
      ],
      benefits: [
        "Precision in asset allocation through unified data views.",
        "Reduced administrative burden for wealth managers.",
        "Enhanced client trust via transparent, real-time reporting."
      ],
      deploymentNote: "Enterprise SaaS with optional integration into existing banking infrastructure via secure APIs.",
      relatedSolutions: ["atom"],
      ctaType: "partnership",
    }
  },
  {
    id: "pointo",
    name: "PointO",
    tagline: "Modern Point of Sale",
    description: "A sleek, intelligent point-of-sale platform for retail and hospitality businesses seeking operational excellence.",
    category: "Business Software",
    href: "/products/pointo",
    detail: {
      whatItIs: "PointO bridges the gap between digital infrastructure and the physical storefront. It is a modern, tablet-first POS system that seamlessly synchronizes with enterprise inventory.",
      whoItIsFor: "Multi-location retail chains, high-volume hospitality venues, and franchise operators.",
      problemsSolved: [
        "Disconnection between front-of-house sales and back-office inventory.",
        "Unreliable offline operation during internet outages.",
        "Clunky interfaces that slow down transaction times."
      ],
      keyCapabilities: [
        "Offline-first architecture ensuring uninterrupted sales.",
        "Real-time synchronization with centralized ATOM inventory.",
        "Integrated loyalty programs and customer relationship management.",
        "Advanced staff permission and shift management."
      ],
      benefits: [
        "Faster checkout experiences leading to higher customer satisfaction.",
        "Elimination of stock discrepancies through real-time sync.",
        "Intuitive interface that minimizes staff training time."
      ],
      deploymentNote: "Cloud-synchronized application deployed on specialized hardware or standard tablet devices.",
      relatedSolutions: ["atom"],
      ctaType: "partnership",
    }
  }
];

import { createClient } from '@/lib/supabase/server';

export const getProductsByCategory = async (category: string) => {
  try {
    const supabase = await createClient();
    const query = supabase.from('cms_products').select('*').eq('status', 'published');
    
    if (category !== "All") {
      query.eq('category', category);
    }
    
    const { data } = await query.order('created_at');
    
    if (data && data.length > 0) {
      return data as Product[];
    }
  } catch (err) {
    console.error('Failed to fetch products from CMS, falling back to static config.', err);
  }

  if (category === "All") return products;
  return products.filter((p) => p.category === category);
};

export const getProductById = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('cms_products').select('*').eq('slug', id).eq('status', 'published').single();
    
    if (data) {
      // Map slug back to id for type compatibility
      return { ...data, id: data.slug } as Product;
    }
  } catch (err) {
    console.error(`Failed to fetch product ${id} from CMS, falling back to static config.`, err);
  }

  return products.find((p) => p.id === id);
};
