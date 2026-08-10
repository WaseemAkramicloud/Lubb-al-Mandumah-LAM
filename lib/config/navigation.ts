// lib/config/navigation.ts
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Solutions", href: "/solutions" },
  { label: "Industries", href: "/industries" },
  { label: "Partners & Clients", href: "/partners" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

export const footerNav = {
  company: [
    { label: "About", href: "/about" },
    { label: "Insights", href: "/insights" },
    { label: "Partners & Clients", href: "/partners" },
    { label: "Contact", href: "/contact" },
  ],
  products: [
    { label: "ATOM", href: "/products#atom" },
    { label: "AimHighSERP", href: "/products#aimhighserp" },
    { label: "MAAMS", href: "/products#maams" },
    { label: "AMAL", href: "/products#amal" },
    { label: "PointO", href: "/products#pointo" },
  ],
  solutions: [
    { label: "Business Management", href: "/solutions/business-management" },
    { label: "Workflow Automation", href: "/solutions/workflow-automation" },
    { label: "Finance & Accounting", href: "/solutions/finance-accounting" },
    { label: "Institutional Admin", href: "/solutions/institutional-administration" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
  ],
};
