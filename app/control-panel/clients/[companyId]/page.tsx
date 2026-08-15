import EcosystemCompanyDetailPage from '../../modules/ecosystem/companies/[id]/page'

export const metadata = {
  title: 'Client Profile & Management | LΛM Control Panel',
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ companyId: string }>
}

export default async function CanonicalClientDetailPage({ params }: Props) {
  const resolved = await params
  return <EcosystemCompanyDetailPage params={Promise.resolve({ id: resolved.companyId })} />
}
