'use client'

import { useActionState, useState } from 'react'
import { onboardCustomerCompanyAction, OnboardingActionState } from '@/lib/actions/customer-onboarding'
import Link from 'next/link'

interface ProductItem {
  slug: string
  name: string
  product_id?: string
  restricted?: boolean
}

interface Props {
  products?: ProductItem[]
}

const initialState: OnboardingActionState = {}

export default function OnboardingForm({ products = [] }: Props) {
  const [state, formAction, isPending] = useActionState(onboardCustomerCompanyAction, initialState)
  const [isReviewStep, setIsReviewStep] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCreds, setCopiedCreds] = useState(false)
  const [showTempPwd, setShowTempPwd] = useState(false)

  // Form field state
  const [formData, setFormData] = useState({
    company_name: '',
    legal_name: '',
    company_type: 'standard',
    country: '',
    owner_first_name: '',
    owner_last_name: '',
    owner_email: '',
    product_slug: 'nexora',
    plan_tier: 'starter',
    max_seats: '10',
    expires_days: '',
    provision_mode: 'password',
    initial_password: ''
  })

  const fillUnicoreDemoPreset = () => {
    setFormData({
      company_name: 'Unicore Enterprises',
      legal_name: 'Unicore Enterprises sp. z.o.o',
      company_type: 'demo',
      country: 'Poland',
      owner_first_name: 'Muhammad',
      owner_last_name: 'Maaz',
      owner_email: 'waazimrana@gmail.com',
      product_slug: 'nexora',
      plan_tier: 'demo',
      max_seats: '10',
      expires_days: '30',
      provision_mode: 'password',
      initial_password: ''
    })
  }

  const fillPurembilPreset = () => {
    setFormData({
      company_name: 'Purembil',
      legal_name: 'Purembil Commercial LLC',
      company_type: 'standard',
      country: 'United Arab Emirates',
      owner_first_name: 'Ayesha',
      owner_last_name: 'Siddiqua',
      owner_email: 'ayesha@purembil.com',
      product_slug: 'nexora',
      plan_tier: 'starter',
      max_seats: '10',
      expires_days: '',
      provision_mode: 'password',
      initial_password: ''
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleReviewStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.company_name.trim() || !formData.owner_first_name.trim() || !formData.owner_email.trim()) {
      alert('Please fill in required fields (Company Name, Owner First Name, Owner Email).')
      return
    }
    setIsReviewStep(true)
  }

  const handleCopyLink = () => {
    if (state?.inviteUrl) {
      navigator.clipboard.writeText(state.inviteUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const handleCopyDetails = () => {
    if (state?.ownerEmail && state?.temporaryPassword) {
      const details = `LAM ID Login Details:\nURL: https://id.lubbalmandumah.com\nLAM ID Email: ${state.ownerEmail}\nTemporary Password: ${state.temporaryPassword}\nNote: Mandatory password change required at first login.`
      navigator.clipboard.writeText(details)
      setCopiedCreds(true)
      setTimeout(() => setCopiedCreds(false), 2500)
    }
  }

  if (state?.success) {
    return (
      <div className="lam-card" style={{ background: 'var(--lam-surface-elevated)', border: '1px solid var(--lam-gold)' }}>
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-gold)', marginBottom: '0.5rem' }}>
            Client Onboarding Complete!
          </h2>
          <p style={{ color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            {state.message}
          </p>

          <div style={{ background: 'var(--lam-black)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--lam-border)', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: 'var(--text-xs)' }}>
              <div>Company: <strong style={{ color: 'var(--lam-white)' }}>{state.companyName}</strong></div>
              <div>Primary Owner: <strong style={{ color: 'var(--lam-white)' }}>{state.ownerFirstName} {state.ownerLastName || ''}</strong></div>
              <div>Company Role: <strong style={{ color: 'var(--lam-gold)' }}>Company Owner</strong></div>
              <div>LAM ID / Login Email: <strong style={{ color: 'var(--lam-white)' }}>{state.ownerEmail}</strong></div>
              <div>Subscribed Product: <strong style={{ color: 'var(--lam-gold)' }}>{state.productSlug?.toUpperCase()}</strong></div>
              <div>Seat Allowance: <strong style={{ color: 'var(--lam-white)' }}>1 of {state.maxSeats} Seats Used (1 Owner Seat Consumed)</strong></div>
              <div>Owner Product Access: <span style={{ color: '#2ecc71', fontWeight: 600 }}>{state.productSlug?.toUpperCase()} — ACTIVE</span></div>
              <div>Account Status: <strong style={{ color: 'var(--lam-gold)' }}>{state.isExistingIdentity ? 'Active Identity' : 'Awaiting First Login'}</strong></div>
            </div>

            {state.isExistingIdentity ? (
              <div style={{ padding: '0.85rem', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.3)', borderRadius: '4px', color: '#2ecc71', fontSize: 'var(--text-xs)' }}>
                ℹ️ <strong>Existing LAM ID Detected:</strong> Primary owner already has a valid LAM ID account ({state.ownerEmail}). Existing login credentials remain valid and were NOT reset.
              </div>
            ) : state.provisionMode === 'password' && state.temporaryPassword ? (
              <div style={{ borderTop: '1px solid var(--lam-border)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 600 }}>
                  🔑 Temporary Login Credentials (One-Time Display)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--text-xs)', background: 'var(--lam-surface)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--lam-border)' }}>
                  <div>Login URL: <code style={{ color: 'var(--lam-gold)' }}>https://id.lubbalmandumah.com</code></div>
                  <div>LAM ID Email: <code style={{ color: 'var(--lam-white)' }}>{state.ownerEmail}</code></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span>Temporary Password:</span>
                    <code style={{ background: 'black', padding: '0.2rem 0.5rem', borderRadius: '3px', color: 'var(--lam-gold)', fontFamily: 'monospace' }}>
                      {showTempPwd ? state.temporaryPassword : '••••••••••••••••'}
                    </code>
                    <button
                      type="button"
                      onClick={() => setShowTempPwd(!showTempPwd)}
                      style={{ background: 'none', border: 'none', color: 'var(--lam-silver-dim)', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
                    >
                      {showTempPwd ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                  <div>Password Status: <span style={{ color: '#f1c40f', fontWeight: 600 }}>Mandatory Change Required at First Login</span></div>
                </div>

                <div style={{ marginTop: '0.85rem' }}>
                  <button
                    type="button"
                    onClick={handleCopyDetails}
                    className="btn btn-primary"
                    style={{ fontSize: 'var(--text-xs)', padding: '0.6rem 1.25rem' }}
                  >
                    {copiedCreds ? 'Login Details Copied! ✓' : 'Copy Login Details'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ borderTop: '1px solid var(--lam-border)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>
                  🔗 Secure Account Setup Link
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    readOnly
                    value={state.inviteUrl || ''}
                    style={{
                      flex: 1,
                      background: 'var(--lam-surface)',
                      border: '1px solid var(--lam-border)',
                      color: 'var(--lam-gold)',
                      padding: '0.6rem 0.8rem',
                      fontSize: 'var(--text-xs)',
                      fontFamily: 'monospace',
                      borderRadius: '4px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 1rem', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}
                  >
                    {copiedLink ? 'Link Copied! ✓' : 'Copy Setup Link'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href={`/control-panel/modules/ecosystem/companies/${state.companyId}`} className="btn btn-primary">
              View Client Profile →
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn"
              style={{ background: 'var(--lam-surface)', color: 'var(--lam-white)', border: '1px solid var(--lam-border)' }}
            >
              Onboard Another Client
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} className="lam-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Hidden inputs */}
      <input type="hidden" name="company_name" value={formData.company_name} />
      <input type="hidden" name="legal_name" value={formData.legal_name} />
      <input type="hidden" name="company_type" value={formData.company_type} />
      <input type="hidden" name="country" value={formData.country} />
      <input type="hidden" name="owner_first_name" value={formData.owner_first_name} />
      <input type="hidden" name="owner_last_name" value={formData.owner_last_name} />
      <input type="hidden" name="owner_email" value={formData.owner_email} />
      <input type="hidden" name="product_slug" value={formData.product_slug} />
      <input type="hidden" name="plan_tier" value={formData.plan_tier} />
      <input type="hidden" name="max_seats" value={formData.max_seats} />
      <input type="hidden" name="expires_days" value={formData.expires_days} />
      <input type="hidden" name="provision_mode" value={formData.provision_mode} />
      <input type="hidden" name="initial_password" value={formData.initial_password} />

      {/* Preset Bars */}
      {!isReviewStep && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          background: 'rgba(201, 168, 76, 0.08)',
          border: '1px solid rgba(201, 168, 76, 0.25)',
          borderRadius: '6px',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-gold)', fontWeight: 500 }}>
            💡 Quick Onboarding Demo Presets:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={fillPurembilPreset}
              className="btn"
              style={{
                fontSize: 'var(--text-xs)',
                padding: '0.35rem 0.75rem',
                background: 'var(--lam-gold)',
                color: 'var(--lam-black)',
                fontWeight: 600
              }}
            >
              Autofill "Purembil" Preset
            </button>
            <button
              type="button"
              onClick={fillUnicoreDemoPreset}
              className="btn"
              style={{
                fontSize: 'var(--text-xs)',
                padding: '0.35rem 0.75rem',
                background: 'var(--lam-surface)',
                color: 'var(--lam-white)',
                border: '1px solid var(--lam-border)',
                fontWeight: 500
              }}
            >
              Autofill "Unicore" Preset
            </button>
          </div>
        </div>
      )}

      {state?.error && (
        <div style={{
          padding: '0.85rem',
          background: 'rgba(231, 76, 60, 0.1)',
          border: '1px solid rgba(231, 76, 60, 0.3)',
          color: '#e74c3c',
          borderRadius: '4px',
          fontSize: 'var(--text-sm)'
        }}>
          {state.error}
        </div>
      )}

      {!isReviewStep ? (
        <>
          {/* Section 1: Company Profile */}
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--lam-gold)', marginBottom: '1rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.5rem' }}>
              1. Company Profile & Account Type
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="lam-form-group">
                <label className="lam-label">Company Name *</label>
                <input
                  type="text"
                  name="company_name"
                  required
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Purembil"
                  className="lam-input"
                />
              </div>

              <div className="lam-form-group">
                <label className="lam-label">Legal Name (Optional)</label>
                <input
                  type="text"
                  name="legal_name"
                  value={formData.legal_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Purembil Commercial LLC"
                  className="lam-input"
                />
              </div>

              <div className="lam-form-group">
                <label className="lam-label">Customer Account Type</label>
                <select
                  name="company_type"
                  value={formData.company_type}
                  onChange={handleInputChange}
                  className="lam-input"
                  style={{ background: 'var(--lam-surface)', color: 'white' }}
                >
                  <option value="standard">Standard Customer Account</option>
                  <option value="demo">Demo / Evaluation Account</option>
                </select>
              </div>

              <div className="lam-form-group">
                <label className="lam-label">Country / Location</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="e.g. United Arab Emirates"
                  className="lam-input"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Primary Owner Identity */}
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--lam-gold)', marginBottom: '1rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.5rem' }}>
              2. Primary Owner Identity
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="lam-form-group">
                <label className="lam-label">Owner First Name *</label>
                <input
                  type="text"
                  name="owner_first_name"
                  required
                  value={formData.owner_first_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Ayesha"
                  className="lam-input"
                />
              </div>

              <div className="lam-form-group">
                <label className="lam-label">Owner Last Name</label>
                <input
                  type="text"
                  name="owner_last_name"
                  value={formData.owner_last_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Siddiqua"
                  className="lam-input"
                />
              </div>

              <div className="lam-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="lam-label">Owner Work Email Address (LAM ID Login) *</label>
                <input
                  type="email"
                  name="owner_email"
                  required
                  value={formData.owner_email}
                  onChange={handleInputChange}
                  placeholder="ayesha@purembil.com"
                  className="lam-input"
                />
                <span style={{ fontSize: '11px', color: 'var(--lam-silver-dim)', marginTop: '0.25rem', display: 'block' }}>
                  The Primary Owner work email serves as their central LAM ID login identifier.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Product Entitlements */}
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--lam-gold)', marginBottom: '1rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.5rem' }}>
              3. SaaS Product Entitlement & Seat Limits
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="lam-form-group">
                <label className="lam-label">Target SaaS Application</label>
                <select name="product_slug" value={formData.product_slug} onChange={handleInputChange} className="lam-input" style={{ background: 'var(--lam-surface)', color: 'white' }}>
                  {products && products.length > 0 ? (
                    products.map(p => (
                      <option key={p.slug} value={p.slug}>
                        {p.name} ({p.product_id || p.slug.toUpperCase()}){p.restricted ? ' — By Invitation' : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="nexora">NEXORA — Next-Gen Enterprise Management</option>
                      <option value="atom">ATOM — Tech & Operations Engine</option>
                      <option value="pointo">PointO — POS & Distribution</option>
                    </>
                  )}
                </select>
              </div>

              <div className="lam-form-group">
                <label className="lam-label">Plan Tier</label>
                <select name="plan_tier" value={formData.plan_tier} onChange={handleInputChange} className="lam-input" style={{ background: 'var(--lam-surface)', color: 'white' }}>
                  <option value="starter">Starter Tier</option>
                  <option value="standard">Standard Tier</option>
                  <option value="enterprise">Enterprise Tier</option>
                  <option value="demo">Demo / Trial Tier</option>
                </select>
              </div>

              <div className="lam-form-group">
                <label className="lam-label">Seat Allowance (Max Users)</label>
                <input
                  type="number"
                  name="max_seats"
                  value={formData.max_seats}
                  onChange={handleInputChange}
                  min={1}
                  max={1000}
                  className="lam-input"
                />
                <span style={{ fontSize: '11px', color: 'var(--lam-silver-dim)', marginTop: '0.25rem', display: 'block' }}>
                  Primary Owner consumes 1 seat automatically upon provisioning.
                </span>
              </div>

              <div className="lam-form-group">
                <label className="lam-label">Optional Demo Expiry (Days from today)</label>
                <input
                  type="number"
                  name="expires_days"
                  value={formData.expires_days}
                  onChange={handleInputChange}
                  placeholder="e.g. 30 (Leave blank for perpetual)"
                  min={1}
                  max={365}
                  className="lam-input"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Owner Account Access Setup */}
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--lam-gold)', marginBottom: '1rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.5rem' }}>
              4. Owner Account Access Setup
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem',
                background: formData.provision_mode === 'password' ? 'rgba(201, 168, 76, 0.1)' : 'var(--lam-surface)',
                border: `1px solid ${formData.provision_mode === 'password' ? 'var(--lam-gold)' : 'var(--lam-border)'}`,
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="provision_mode"
                  value="password"
                  checked={formData.provision_mode === 'password'}
                  onChange={handleInputChange}
                  style={{ marginTop: '0.25rem' }}
                />
                <div>
                  <div style={{ color: 'var(--lam-white)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                    Option A: Temporary Credentials (Recommended for current operation / testing)
                  </div>
                  <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                    Generates a strong temporary password server-side. The LAM Superadmin can copy and deliver the initial credentials to the customer. Forces a mandatory password update at first login.
                  </div>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem',
                background: formData.provision_mode === 'invite' ? 'rgba(201, 168, 76, 0.1)' : 'var(--lam-surface)',
                border: `1px solid ${formData.provision_mode === 'invite' ? 'var(--lam-gold)' : 'var(--lam-border)'}`,
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="provision_mode"
                  value="invite"
                  checked={formData.provision_mode === 'invite'}
                  onChange={handleInputChange}
                  style={{ marginTop: '0.25rem' }}
                />
                <div>
                  <div style={{ color: 'var(--lam-white)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                    Option B: Secure Setup Link
                  </div>
                  <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                    Generates a single-use secure setup link that can be copied and sent via email, WhatsApp, or chat. No customer password is created by the administrator.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Link href="/control-panel/clients" className="btn" style={{ background: 'var(--lam-surface)', color: 'white', border: '1px solid var(--lam-border)' }}>
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleReviewStep}
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem' }}
            >
              Review New Client →
            </button>
          </div>
        </>
      ) : (
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '1.25rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.5rem' }}>
            Review New Client Setup
          </h2>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            Please verify the client company details, primary owner identity, and account access setup before confirming creation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--lam-surface)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--lam-border)' }}>
              <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-gold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Company Profile</h4>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-white)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>Name: <strong>{formData.company_name}</strong></div>
                <div>Legal Name: <span>{formData.legal_name || '-'}</span></div>
                <div>Type: <strong style={{ color: formData.company_type === 'demo' ? '#f1c40f' : '#2ecc71' }}>{formData.company_type.toUpperCase()}</strong></div>
                <div>Location: <span>{formData.country || '-'}</span></div>
              </div>
            </div>

            <div style={{ background: 'var(--lam-surface)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--lam-border)' }}>
              <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-gold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Primary Owner & Access</h4>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-white)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>Owner Name: <strong>{formData.owner_first_name} {formData.owner_last_name}</strong></div>
                <div>LAM ID / Work Email: <strong>{formData.owner_email}</strong></div>
                <div>Company Role: <strong style={{ color: 'var(--lam-gold)' }}>Company Owner</strong></div>
                <div>Access Mode: <span>{formData.provision_mode === 'password' ? 'Temporary Credentials (Option A)' : 'Secure Setup Link (Option B)'}</span></div>
              </div>
            </div>

            <div style={{ background: 'var(--lam-surface)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--lam-border)', gridColumn: 'span 2' }}>
              <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-gold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Product Entitlement & Owner Grant</h4>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-white)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>Product: <strong style={{ color: 'var(--lam-gold)' }}>{formData.product_slug.toUpperCase()}</strong></div>
                <div>Plan: <span>{formData.plan_tier.toUpperCase()}</span></div>
                <div>Seat Limit: <span>{formData.max_seats} Max (1 Seat Consumed by Owner)</span></div>
                <div>Owner Access: <span style={{ color: '#2ecc71', fontWeight: 600 }}>EXPLICIT ACTIVE</span></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setIsReviewStep(false)}
              className="btn"
              style={{ background: 'var(--lam-surface)', color: 'white', border: '1px solid var(--lam-border)' }}
            >
              ← Edit Details
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem' }}
            >
              {isPending ? 'Provisioning Client...' : 'Confirm & Create Client →'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
