import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { logout } from '@/lib/actions/auth'
import { revalidatePath } from 'next/cache'

export const metadata = {
  title: "Change Password | LΛM",
  robots: { index: false, follow: false },
}

export default async function ForceChangePasswordPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/staff-login')
  }

  const adminClient = getSupabaseAdmin()
  const { data: profile } = await adminClient
    .from('staff_profiles')
    .select('requires_password_change')
    .eq('id', user.id)
    .single()

  if (!profile?.requires_password_change) {
    redirect('/control-panel/dashboard')
  }

  async function updatePassword(formData: FormData) {
    "use server"
    const password = formData.get('password') as string
    
    if (password.length < 8) {
      // Basic validation, normally we'd return state to a client form
      throw new Error("Password must be at least 8 characters")
    }

    const sb = await createClient()
    const { error: updateError } = await sb.auth.updateUser({ password })
    
    if (updateError) {
      throw new Error(updateError.message)
    }

    const admin = getSupabaseAdmin()
    await admin
      .from('staff_profiles')
      .update({ requires_password_change: false })
      .eq('id', user!.id)

    revalidatePath('/', 'layout')
    redirect('/control-panel/dashboard')
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--lam-black)",
      padding: "2rem",
    }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <div className="lam-card" style={{ textAlign: "left", background: "var(--lam-gunmetal)" }}>
          <div className="lam-accent-line" />
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", marginBottom: "0.5rem" }}>
            Change Password
          </h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--lam-silver)", marginBottom: "2rem" }}>
            For security reasons, you must change your temporary password before accessing the control panel.
          </p>

          <form action={updatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">New Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="form-input"
                placeholder="Enter new password"
              />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Update & Continue
            </button>
          </form>

          <form action={logout} style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button type="submit" style={{ 
              background: 'none', border: 'none', color: 'var(--lam-silver-dim)', 
              fontSize: 'var(--text-sm)', cursor: 'pointer', textDecoration: 'underline' 
            }}>
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
