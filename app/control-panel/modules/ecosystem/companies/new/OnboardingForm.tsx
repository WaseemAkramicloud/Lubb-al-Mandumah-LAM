'use client'

import { useActionState, useState } from 'react'
import { onboardCustomerCompanyAction, OnboardingActionState } from '@/lib/actions/customer-onboarding'
import Link from 'next/link'

const initialState: OnboardingActionState = {}

export default function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(onboardCustomerCompanyAction, initialState)
  const [companyType, setCompanyType] = useState<'standard' | 'demo'>('standard')
  const [provisionMode, setProvisionMode] = useState<'invite' | 'password'>('invite')
  const [isReviewStep, setIsReviewStep] = useState(false)
  const [copied, setCopied] = useState(false)

  // Form field state for review step
  const [formData, setFormData] = useState({
    company_name: '',
    legal_name: '',
    company_type: 'standard',
    country: '',
    owner_first_name: '',
    owner_last_name: '',
    owner_email: '',
    product_slug: 'nexora',
    plan_tier: 'demo',
    max_seats: '10',
    expires_days: '',
    provision_mode: 'invite',
    initial_password: ''
  })

  const fillUnicoreDemoPreset = () => {
    setCompanyType('demo')
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
      provision_mode: 'invite',
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

  const handleCopy = () => {
    if (state?.inviteUrl) {
      navigator.clipboard.writeText(state.inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (state?.success) {
    return (
      <div className="lam-card" style={{ background: 'var(--lam-surface-elevated)', border: '1px solid var(--lam-gold)' }}>
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-gold)', marginBottom: '0.5rem' }}>
            Client Onboarding Complete!
          </h2>
          <p style={{ color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            {state.message}
          </p>

          <div style={{ background: 'var(--lam-black)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--lam-border)', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Invitation Link
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
                onClick={handleCopy}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1rem', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}
              >
                {copied ? 'Copied! ✓' : 'Copy Link'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/control-panel/modules/ecosystem/companies" className="btn btn-primary">
              View All Clients
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
      {/* Hidden inputs to pass data to server action when submitted in review step */}
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

      {/* Demo Preset Bar */}
      {!isReviewStep && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          background: 'rgba(201, 168, 76, 0.08)',
          border: '1px solid rgba(201, 168, 76, 0.25)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-gold)', fontWeight: 500 }}>
            💡 Need to create a demo account for testing or presentation?
          </div>
          <button
            type="button"
            onClick={fillUnicoreDemoPreset}
            className="btn"
            style={{
              fontSize: 'var(--text-xs)',
              padding: '0.35rem 0.75rem',
              background: 'var(--lam-gold)',
              color: 'var(--lam-black)',
              fontWeight: 600
            }}
          >
            Autofill "Unicore Enterprises" Demo Preset
          </button>
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
                  placeholder="e.g. Unicore Enterprises"
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
                  placeholder="e.g. Unicore International LLC"
                  className="lam-input"
                />
              </div>

              <div className="lam-form-group">
                <label className="lam-label">Customer Account Type</label>
                <select
                  name="company_type"
                  value={formData.company_type}
                  onChange={(e) => {
                    setCompanyType(e.target.value as any)
                    handleInputChange(e)
                  }}
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
                  placeholder="e.g. Sarah"
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
                  placeholder="e.g. Al-Mansoor"
                  className="lam-input"
                />
              </div>

              <div className="lam-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="lam-label">Owner Work Email Address *</label>
                <input
                  type="email"
                  name="owner_email"
                  required
                  value={formData.owner_email}
                  onChange={handleInputChange}
                  placeholder="owner@unicore-enterprises.com"
                  className="lam-input"
                />
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
                <label className="lam-label">Target Application</label>
                <select name="product_slug" value={formData.product_slug} onChange={handleInputChange} className="lam-input" style={{ background: 'var(--lam-surface)', color: 'white' }}>
                  <option value="nexora">NEXORA — Next-Gen Enterprise Management</option>
                  <option value="atom">ATOM — Tech & Operations Engine</option>
                  <option value="pointo">PointO — POS & Distribution</option>
                </select>
              </div>

              <div className="lam-form-group">
                <label className="lam-label">Plan Tier</label>
                <select name="plan_tier" value={formData.plan_tier} onChange={handleInputChange} className="lam-input" style={{ background: 'var(--lam-surface)', color: 'white' }}>
                  <option value="demo">Demo / Trial Tier</option>
                  <option value="starter">Starter Tier</option>
                  <option value="standard">Standard Tier</option>
                  <option value="enterprise">Enterprise Tier</option>
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

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Link href="/control-panel/modules/ecosystem/companies" className="btn" style={{ background: 'var(--lam-surface)', color: 'white', border: '1px solid var(--lam-border)' }}>
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
            Please verify the client company details, primary owner identity, and product entitlement setup before confirming creation.
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
              <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-gold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Primary Owner</h4>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-white)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>Owner Name: <strong>{formData.owner_first_name} {formData.owner_last_name}</strong></div>
                <div>Work Email: <strong>{formData.owner_email}</strong></div>
                <div>Role: <span>Company Owner</span></div>
              </div>
            </div>

            <div style={{ background: 'var(--lam-surface)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--lam-border)', gridColumn: 'span 2' }}>
              <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-gold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Product & Entitlement</h4>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-white)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>Product: <strong style={{ color: 'var(--lam-gold)' }}>{formData.product_slug.toUpperCase()}</strong></div>
                <div>Plan: <span>{formData.plan_tier.toUpperCase()}</span></div>
                <div>Seat Limit: <span>{formData.max_seats} Seats</span></div>
                <div>Demo Expiry: <span>{formData.expires_days ? `${formData.expires_days} Days` : 'Perpetual'}</span></div>
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
