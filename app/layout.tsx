import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/config/site";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <LayoutWrapper header={<Header />} footer={<Footer />}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
