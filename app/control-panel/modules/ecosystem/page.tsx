import { redirect } from 'next/navigation'

export const metadata = {
  title: "Clients | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default function EcosystemRedirectPage() {
  redirect('/control-panel/clients')
}
