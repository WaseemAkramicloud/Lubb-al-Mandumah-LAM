import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { logout } from '@/lib/actions/auth'

export const metadata = {
  title: "Leads Dashboard | LΛM Control Hub",
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  // 1. Authenticate user via cookies
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/staff-login')
  }

  // 2. Fetch leads bypassing RLS using Service Role
  const adminClient = getSupabaseAdmin()
  
  const { data: demoRequests } = await adminClient
    .from('demo_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: contactRequests } = await adminClient
    .from('contact_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div style={{ minHeight: '100vh', padding: 'var(--header-height) 2rem 2rem', background: 'var(--lam-black)' }}>
      <div className="lam-container" style={{ paddingTop: '2rem' }}>
        
        {/* Header Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '3rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: '0.25rem' }}>Control Hub Leads</h1>
            <p style={{ color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
              Logged in as <span style={{ color: 'var(--lam-gold)' }}>{user.email}</span> 
              <span style={{ margin: '0 0.5rem', color: 'var(--lam-border-light)' }}>|</span>
              Role: {user.user_metadata?.role || 'Staff'}
            </p>
          </div>
          <form action={logout}>
            <button type="submit" className="btn btn-secondary btn-sm">
              Sign Out
            </button>
          </form>
        </div>

        {/* Demo Requests Section */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ 
            fontSize: 'var(--text-lg)', 
            marginBottom: '1.5rem', 
            borderBottom: '1px solid var(--lam-border)', 
            paddingBottom: '0.5rem',
            color: 'var(--lam-white)'
          }}>
            Enterprise Demo Requests
          </h2>
          
          {!demoRequests || demoRequests.length === 0 ? (
            <div className="lam-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--lam-silver)' }}>No demo requests at this time.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {demoRequests.map((req: any) => (
                <div key={req.id} className="lam-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ 
                      fontSize: 'var(--text-xs)', 
                      padding: '0.25rem 0.5rem', 
                      background: 'rgba(201, 168, 76, 0.1)', 
                      color: 'var(--lam-gold)', 
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      {req.product_of_interest}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: 'var(--text-md)', margin: '0.5rem 0 0.25rem' }}>{req.company}</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-silver-light)' }}>
                      {req.name} <br/>
                      <a href={`mailto:${req.email}`} style={{ color: 'var(--lam-silver)' }}>{req.email}</a> 
                      {req.phone && ` • ${req.phone}`}
                    </p>
                  </div>
                  
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.75rem', 
                    background: 'var(--lam-surface)', 
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--lam-mist)'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-xs)' }}>REQUIREMENTS</strong>
                    {req.requirements}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Requests Section */}
        <div>
          <h2 style={{ 
            fontSize: 'var(--text-lg)', 
            marginBottom: '1.5rem', 
            borderBottom: '1px solid var(--lam-border)', 
            paddingBottom: '0.5rem',
            color: 'var(--lam-white)'
          }}>
            General Inquiries
          </h2>
          
          {!contactRequests || contactRequests.length === 0 ? (
            <div className="lam-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--lam-silver)' }}>No general inquiries at this time.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {contactRequests.map((req: any) => (
                <div key={req.id} className="lam-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ 
                      fontSize: 'var(--text-xs)', 
                      padding: '0.25rem 0.5rem', 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      color: 'var(--lam-silver)', 
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      {req.enquiry_type}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: 'var(--text-md)', margin: '0.5rem 0 0.25rem' }}>{req.name}</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-silver-light)' }}>
                      <a href={`mailto:${req.email}`} style={{ color: 'var(--lam-silver)' }}>{req.email}</a>
                    </p>
                  </div>
                  
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.75rem', 
                    background: 'var(--lam-surface)', 
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--lam-mist)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {req.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
