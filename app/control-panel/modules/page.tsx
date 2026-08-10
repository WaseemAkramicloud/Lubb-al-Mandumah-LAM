export const metadata = {
  title: "Modules | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default function ModulesPage() {
  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: '2rem', color: 'var(--lam-white)' }}>
        Permission-Based Modules
      </h1>
      <div className="lam-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--lam-silver)' }}>
          Modules are currently disabled. Later stages will implement permission checks here.
        </p>
      </div>
    </div>
  )
}
