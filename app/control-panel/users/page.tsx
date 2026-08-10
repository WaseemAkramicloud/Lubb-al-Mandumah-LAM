import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { toggleUserStatus } from '@/lib/actions/users'

export const metadata = {
  title: "User Management | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.user_metadata?.role !== 'super_admin') {
    redirect('/control-panel/dashboard')
  }

  const adminClient = getSupabaseAdmin()
  const { data: users, error } = await adminClient
    .from('staff_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)' }}>
          User Management
        </h1>
        <Link href="/control-panel/users/create" className="btn btn-primary">
          + Create User
        </Link>
      </div>

      <div className="lam-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--lam-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Staff ID</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Role / Designation</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Email</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                <td style={{ padding: '1rem', color: 'var(--lam-silver)', fontSize: 'var(--text-sm)' }}>
                  {u.staff_id}
                </td>
                <td style={{ padding: '1rem', color: 'var(--lam-white)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  {u.first_name} {u.last_name}
                </td>
                <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                  {u.designation}
                </td>
                <td style={{ padding: '1rem', color: 'var(--lam-silver)', fontSize: 'var(--text-sm)' }}>
                  {u.work_email}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background: u.status === 'active' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                    color: u.status === 'active' ? '#2ecc71' : '#e74c3c'
                  }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Link href={`/control-panel/users/${u.id}/edit`} style={{
                    display: 'inline-block',
                    background: 'none',
                    border: '1px solid var(--lam-gold)',
                    color: 'var(--lam-gold)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: 'var(--text-xs)',
                    transition: 'all 0.2s'
                  }}>
                    Edit Access
                  </Link>
                  {u.id !== user.id && (
                    <form action={async () => {
                      "use server"
                      await toggleUserStatus(u.id, u.status)
                    }}>
                      <button type="submit" style={{
                        background: 'none',
                        border: '1px solid var(--lam-border)',
                        color: 'var(--lam-silver)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: 'var(--text-xs)',
                        transition: 'all 0.2s'
                      }}>
                        {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            
            {!users || users.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No staff users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
