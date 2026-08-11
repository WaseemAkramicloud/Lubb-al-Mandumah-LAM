import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'

export const metadata = {
  title: "Redeem Invitation | LΛM ID",
}

type Props = {
  params: Promise<{ token: string }>
}

export default async function InvitationRedeemPage({ params }: Props) {
  const resolvedParams = await params
  const token = resolvedParams.token
  const supabase = getSupabaseAdmin()

  const { data: invite, error } = await supabase
    .from('customer_invitations')
    .select('*, company:crm_companies(name)')
    .eq('token', token)
    .single()

  const isValid = invite && invite.status === 'pending' && new Date(invite.expires_at) > new Date()
  const companyName = (invite as any)?.company?.name || 'Organization'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--lam-black)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: 'var(--lam-white)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        padding: '2.5rem',
        background: 'rgba(20, 20, 20, 0.8)',
        border: '1px solid var(--lam-border)',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
          L<span style={{ color: 'var(--lam-gold)' }}>Λ</span>M ID
        </div>
        <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '2rem' }}>
          Team Invitation Redemption
        </div>

        {!isValid ? (
          <div>
            <div style={{ color: '#e74c3c', fontSize: 'var(--text-base)', marginBottom: '1rem', fontWeight: 600 }}>
              Invitation Link Invalid or Expired
            </div>
            <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '2rem', lineHeight: 1.5 }}>
              This invitation token has already been redeemed, revoked, or has expired.
            </p>
            <Link href="/id/login" className="btn btn-primary" style={{ display: 'inline-block', width: '100%', textDecoration: 'none' }}>
              Go to Sign In
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ color: 'var(--lam-gold)', fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: '0.5rem' }}>
              You&apos;ve Been Invited!
            </div>
            <p style={{ color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)', marginBottom: '2rem', lineHeight: 1.6 }}>
              You were invited to join <strong style={{ color: 'var(--lam-white)' }}>{companyName}</strong> as a <span style={{ textTransform: 'capitalize', color: 'var(--lam-gold)' }}>{invite.role}</span> with access to entitled SaaS applications.
            </p>

            <div style={{ background: 'var(--lam-surface)', padding: '1rem', borderRadius: '4px', marginBottom: '2rem', textAlign: 'left', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>
              Invited Email: <strong style={{ color: 'var(--lam-white)' }}>{invite.email}</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link
                href={`/id/register?email=${encodeURIComponent(invite.email)}`}
                className="btn btn-primary"
                style={{ width: '100%', textDecoration: 'none', padding: '0.85rem' }}
              >
                Create Account & Join {companyName}
              </Link>
              
              <Link
                href="/id/login"
                className="btn"
                style={{ width: '100%', textDecoration: 'none', background: 'var(--lam-surface)', color: 'var(--lam-silver)', border: '1px solid var(--lam-border)', padding: '0.85rem' }}
              >
                Sign In with Existing Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
