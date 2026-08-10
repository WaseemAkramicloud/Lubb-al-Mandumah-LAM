"use client";

import { usePathname } from "next/navigation";

export default function LayoutWrapper({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isControlPanel =
    pathname?.startsWith("/control-panel") ||
    pathname?.startsWith("/staff-login") ||
    pathname?.startsWith("/force-change-password");

  return (
    <>
      {!isControlPanel && header}
      <main id="main-content" style={isControlPanel ? { minHeight: '100vh', display: 'flex', flexDirection: 'column' } : {}}>
        {children}
      </main>
      {!isControlPanel && footer}
    </>
  );
}
