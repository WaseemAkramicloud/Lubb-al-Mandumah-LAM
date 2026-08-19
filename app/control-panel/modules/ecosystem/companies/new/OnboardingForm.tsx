'use client'

import { useActionState, useState } from 'react'
import { onboardCustomerCompanyAction, OnboardingActionState } from '@/lib/actions/customer-onboarding'
import Link from 'next/link'

interface ProductItem {
  slug: string
  name: string
  product_id?: string
  restricted?: boolean
  identity_mode?: string
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
  const [copiedPwdOnly, setCopiedPwdOnly] = useState(false)
  const [showInitialPwd, setShowInitialPwd] = useState(false)

  // Filter products to ONLY identity_mode = 'lam_sso'
  const eligibleProducts = products.filter(p => p.identity_mode === 'lam_sso' && !['pointo', 'amal'].includes(p.slug.toLowerCase()))

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
      alert('Please fill in required fields (Company Name, Owner First Name, Verified Work Email).')
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

  const handleCopyPassword = () => {
    if (state?.temporaryPassword) {
      navigator.clipboard.writeText(state.temporaryPassword)
      setCopiedPwdOnly(true)
      setTimeout(() => setCopiedPwdOnly(false), 2500)
    }
  }

  const handleCopyDetails = () => {
    if (state?.ownerEmail && state?.temporaryPassword) {
      const details = `LAM Access / Owner Credentials:\nLogin Hub: https://access.lubbalmandumah.com\nCustomer Account Code: ${state.customerAccountCode || 'N/A'}\nOrganization Code: ${state.organizationCode || 'N/A'}\nWorkspace Code: ${state.workspaceCode || 'N/A'}\nOwner Work Email: ${state.ownerEmail}\nInitial Password: ${state.temporaryPassword}\nNote: Log in as Company Owner using Work Email + Password at https://access.lubbalmandumah.com.`
      navigator.clipboard.writeText(details)
      setCopiedCreds(true)
      setTimeout(() => setCopiedCreds(false), 2500)
    }
  }

  if (state?.success) {
    return (
      <div className="lam-card" style={{ background: 'var(--lam-surface-elevated)', border: '1px solid var(--lam-gold)' }}>
        <div style={{ padding: '1.5rem 0' }}>
          <div style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
          <h2 style={{ textAlign: 'center', fontSize: 'var(--text-xl)', color: 'var(--lam-gold)', marginBottom: '0.5rem' }}>
            Client Onboarding Complete!
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            {state.message}
          </p>

          <div style={{ background: 'var(--lam-black)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--lam-border)', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-gold)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.5rem' }}>
              📋 Provisioned Account Hierarchy & Owner Credentials
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: 'var(--text-xs)' }}>
              <div>Customer Account: <strong style={{ color: 'var(--lam-white)' }}>{state.companyName}</strong></div>
              <div>Customer Account Code: <strong style={{ color: 'var(--lam-gold)', fontFamily: 'monospace' }}>{state.customerAccountCode || '-'}</strong></div>
              <div>Organization Code: <strong style={{ color: 'var(--lam-gold)', fontFamily: 'monospace' }}>{state.organizationCode || '-'}</strong></div>
              <div>Subscribed Product Workspace: <strong style={{ color: 'var(--lam-gold)', fontFamily: 'monospace' }}>{state.workspaceCode || '-'} ({state.productSlug?.toUpperCase()})</strong></div>
              <div>Primary Company Owner: <strong style={{ color: 'var(--lam-white)' }}>{state.ownerFirstName} {state.ownerLastName || ''}</strong></div>
              <div>Owner Work Email: <strong style={{ color: 'var(--lam-gold)' }}>{state.ownerEmail}</strong></div>
              <div>Seat Allowance: <strong style={{ color: 'var(--lam-white)' }}>1 of {state.maxSeats} Active Seats Used</strong></div>
              <div>Access Hub URL: <strong style={{ color: 'var(--lam-gold)' }}>https://access.lubbalmandumah.com</strong></div>
            </div>

            {state.isExistingIdentity ? (
              <div style={{ padding: '0.85rem', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.3)', borderRadius: '4px', color: '#2ecc71', fontSize: 'var(--text-xs)' }}>
                ℹ️ <strong>Existing Company Owner Identity Detected:</strong> Primary owner already has a valid LAM account ({state.ownerEmail}). Existing login credentials remain operational.
              </div>
            ) : state.provisionMode === 'password' && state.temporaryPassword ? (
              <div style={{ borderTop: '1px solid var(--lam-border)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-gold)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 600 }}>
                  🔑 ONE-TIME OWNER CREDENTIALS BLOCK
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--text-xs)', background: 'var(--lam-surface)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--lam-border)' }}>
                  <div>Login URL: <code style={{ color: 'var(--lam-gold)' }}>https://access.lubbalmandumah.com</code></div>
                  <div>Owner Work Email: <code style={{ color: 'var(--lam-white)' }}>{state.ownerEmail}</code></div>
                  <div>Workspace Code: <code style={{ color: 'var(--lam-gold)', fontFamily: 'monospace' }}>{state.workspaceCode}</code></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span>Initial Password:</span>
                    <code style={{ background: 'black', padding: '0.2rem 0.5rem', borderRadius: '3px', color: 'var(--lam-gold)', fontFamily: 'monospace' }}>
                      {showInitialPwd ? state.temporaryPassword : '••••••••••••••••'}
                    </code>
                    <button
                      type="button"
                      onClick={() => setShowInitialPwd(!showInitialPwd)}
                      className="btn"
                      style={{ background: 'var(--lam-surface)', border: '1px solid var(--lam-border)', color: 'var(--lam-silver-light)', fontSize: '11px', padding: '0.2rem 0.5rem' }}
                    >
                      {showInitialPwd ? 'Hide' : 'Reveal'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="btn"
                      style={{ background: 'var(--lam-surface)', border: '1px solid var(--lam-border)', color: 'var(--lam-white)', fontSize: '11px', padding: '0.2rem 0.5rem' }}
                    >
                      {copiedPwdOnly ? 'Password Copied! ✓' : 'Copy Password'}
                    </button>
                  </div>
                  <div style={{ color: 'var(--lam-silver-dim)', fontSize: '11px', marginTop: '0.25rem' }}>
                    ⚠️ Note: Company Owner logs in via <strong>Work Email + Password</strong> at <code>https://access.lubbalmandumah.com</code>. The Workspace Code is assigned to the workspace, not used as the Owner's login username.
                  </div>
                </div>

                <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={handleCopyDetails}
                    className="btn btn-primary"
                    style={{ fontSize: 'var(--text-xs)', padding: '0.6rem 1.25rem' }}
                  >
                    {copiedCreds ? 'Owner Credentials Copied! ✓' : 'Copy Owner Credentials'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ borderTop: '1px solid var(--lam-border)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>
                  🔗 Secure Setup Link
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
              1. Commercial Client Profile & Account Type
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="lam-form-group">
                <label className="lam-label">Commercial Client / Customer Account Name *</label>
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

          {/* Section 2: Primary Company Owner Identity */}
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--lam-gold)', marginBottom: '1rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.5rem' }}>
              2. Company Owner Identity & Credentials
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
                <label className="lam-label" style={{ color: 'var(--lam-gold)', fontWeight: 600 }}>
                  Verified Work Email *
                </label>
                <input
                  type="email"
                  name="owner_email"
                  required
                  value={formData.owner_email}
                  onChange={handleInputChange}
                  placeholder="owner@company.com (e.g. ayesha@purembil.com)"
                  className="lam-input"
                  style={{ border: '1px solid var(--lam-gold)' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--lam-silver-dim)', marginTop: '0.35rem', display: 'block', lineHeight: 1.4 }}>
                  Company Owner logs in via <strong>Work Email + Password</strong> at <code>https://access.lubbalmandumah.com</code>.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Product Entitlements (SSO Products Only) */}
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--lam-gold)', marginBottom: '1rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.5rem' }}>
              3. SaaS Product Workspace Provisioning (LAM SSO Eligible Products Only)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="lam-form-group">
                <label className="lam-label">Target Product Workspace</label>
                <select name="product_slug" value={formData.product_slug} onChange={handleInputChange} className="lam-input" style={{ background: 'var(--lam-surface)', color: 'white' }}>
                  {eligibleProducts && eligibleProducts.length > 0 ? (
                    eligibleProducts.map(p => (
                      <option key={p.slug} value={p.slug}>
                        {p.name} ({p.product_id || p.slug.toUpperCase()}){p.restricted ? ' — By Invitation' : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="nexora">NEXORA — Enterprise Operations & Management</option>
                      <option value="atom">ATOM — Tech & Operations Engine</option>
                      <option value="aimhighserp">AimHighSERP — SEO & Search Analytics</option>
                      <option value="maams">MAAMS — Diplomatic Mission Asset Management</option>
                    </>
                  )}
                </select>
                <span style={{ fontSize: '11px', color: 'var(--lam-silver-dim)', marginTop: '0.25rem', display: 'block' }}>
                  PointO & AMAL operate independently outside central SSO and are excluded from workspace provisioning.
                </span>
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
                <label className="lam-label">Seat Allowance (Max Workspace Users)</label>
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
                  Company Owner consumes 1 active seat automatically.
                </span>
              </div>

              <div className="lam-form-group">
                <label className="lam-label">Optional Evaluation Expiry (Days from today)</label>
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
              4. Owner Access Credentials Setup
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
                    Option A: Direct Initial Password (Default)
                  </div>
                  <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                    Generates an initial password server-side. The administrator provides the credentials block to the Company Owner.
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
                    Option B: Secure Invitation Link
                  </div>
                  <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                    Generates a single-use setup link for the owner to complete password registration.
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
              Review Client Onboarding →
            </button>
          </div>
        </>
      ) : (
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '1.25rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.5rem' }}>
            Review New Client Setup
          </h2>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            Please verify the client details, primary owner identity, and product workspace configuration before confirming creation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--lam-surface)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--lam-border)' }}>
              <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-gold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Company Profile</h4>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-white)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>Client Name: <strong>{formData.company_name}</strong></div>
                <div>Legal Name: <span>{formData.legal_name || '-'}</span></div>
                <div>Type: <strong style={{ color: formData.company_type === 'demo' ? '#f1c40f' : '#2ecc71' }}>{formData.company_type.toUpperCase()}</strong></div>
                <div>Location: <span>{formData.country || '-'}</span></div>
              </div>
            </div>

            <div style={{ background: 'var(--lam-surface)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--lam-border)' }}>
              <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-gold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Company Owner Identity
              </h4>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-white)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>Owner Name: <strong>{formData.owner_first_name} {formData.owner_last_name}</strong></div>
                <div>Work Email: <strong style={{ color: 'var(--lam-gold)' }}>{formData.owner_email}</strong></div>
                <div>Access URL: <code style={{ color: 'var(--lam-gold)' }}>https://access.lubbalmandumah.com</code></div>
                <div>Role: <strong>Company Owner</strong></div>
              </div>
            </div>

            <div style={{ background: 'var(--lam-surface)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--lam-border)', gridColumn: 'span 2' }}>
              <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-gold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Product Workspace & Entitlements</h4>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-white)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>Product: <strong style={{ color: 'var(--lam-gold)' }}>{formData.product_slug.toUpperCase()}</strong></div>
                <div>Plan: <span>{formData.plan_tier.toUpperCase()}</span></div>
                <div>Seat Limit: <span>{formData.max_seats} Max Seats</span></div>
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
              {isPending ? 'Provisioning Client...' : 'Confirm & Provision Client →'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
