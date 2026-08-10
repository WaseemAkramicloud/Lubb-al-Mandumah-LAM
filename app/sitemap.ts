import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";
import { products } from "@/lib/config/products";
import { solutions } from "@/lib/config/solutions";
import { industries } from "@/lib/config/industries";
import { insights } from "@/lib/config/insights";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  // Define static routes
  const staticRoutes = [
    "",
    "/about",
    "/about/careers",
    "/contact",
    "/request-demo",
    "/partners",
    "/products",
    "/solutions",
    "/industries",
    "/insights",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Map dynamic routes
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const solutionRoutes = solutions.map((solution) => ({
    url: `${baseUrl}/solutions/${solution.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const industryRoutes = industries.map((industry) => ({
    url: `${baseUrl}/industries/${industry.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const insightRoutes = insights.map((article) => ({
    url: `${baseUrl}/insights/${article.id}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...solutionRoutes,
    ...industryRoutes,
    ...insightRoutes,
  ];
}
