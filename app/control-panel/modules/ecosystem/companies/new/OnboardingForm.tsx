'use client'

import { useActionState, useState } from 'react'
import { onboardCustomerCompanyAction, OnboardingActionState } from '@/lib/actions/customer-onboarding'
import Link from 'next/link'

const initialState: OnboardingActionState = {}

export default function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(onboardCustomerCompanyAction, initialState)
  const [companyType, setCompanyType] = useState<'standard' | 'demo'>('standard')
  const [provisionMode, setProvisionMode] = useState<'invite' | 'password'>('invite')
  const [copied, setCopied] = useState(false)

  // Quick Preset for Demo (e.g. Unicore Enterprises)
  const fillUnicoreDemoPreset = () => {
    setCompanyType('demo')
    const form = document.querySelector('form') as HTMLFormElement | null
    if (form) {
      const compName = form.querySelector('[name="company_name"]') as HTMLInputElement
      const typeSel = form.querySelector('[name="company_type"]') as HTMLSelectElement
      const planSel = form.querySelector('[name="plan_tier"]') as HTMLSelectElement
      const seatsInput = form.querySelector('[name="max_seats"]') as HTMLInputElement
      const expiresInput = form.querySelector('[name="expires_days"]') as HTMLInputElement

      if (compName) compName.value = 'Unicore Enterprises'
      if (typeSel) typeSel.value = 'demo'
      if (planSel) planSel.value = 'demo'
      if (seatsInput) seatsInput.value = '5'
      if (expiresInput) expiresInput.value = '30'
    }
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
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '1rem'
          }}>🎉</div>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-gold)', marginBottom: '0.5rem' }}>
            Customer Onboarding Complete!
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
              View All Customer Accounts
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn"
              style={{ background: 'var(--lam-surface)', color: 'var(--lam-white)', border: '1px solid var(--lam-border)' }}
            >
              Onboard Another Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} className="lam-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Demo Preset Bar */}
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
              placeholder="e.g. Unicore Enterprises"
              className="lam-input"
            />
          </div>

          <div className="lam-form-group">
            <label className="lam-label">Legal Name (Optional)</label>
            <input
              type="text"
              name="legal_name"
              placeholder="e.g. Unicore International LLC"
              className="lam-input"
            />
          </div>

          <div className="lam-form-group">
            <label className="lam-label">Customer Account Type</label>
            <select
              name="company_type"
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value as any)}
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
              placeholder="e.g. Sarah"
              className="lam-input"
            />
          </div>

          <div className="lam-form-group">
            <label className="lam-label">Owner Last Name</label>
            <input
              type="text"
              name="owner_last_name"
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
              placeholder="owner@unicore-enterprises.com"
              className="lam-input"
            />
            <span style={{ fontSize: '11px', color: 'var(--lam-silver-dim)', marginTop: '4px', display: 'block' }}>
              Configurable primary email for account identity & invitation delivery.
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: Product Entitlements & Allocation */}
      <div>
        <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--lam-gold)', marginBottom: '1rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.5rem' }}>
          3. SaaS Product Entitlement & Seat Limits
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="lam-form-group">
            <label className="lam-label">Target Application</label>
            <select name="product_slug" className="lam-input" style={{ background: 'var(--lam-surface)', color: 'white' }}>
              <option value="nexora">NEXORA — Next-Gen Enterprise Management</option>
              <option value="atom">ATOM — Tech & Operations Engine</option>
              <option value="pointo">PointO — POS & Distribution</option>
            </select>
          </div>

          <div className="lam-form-group">
            <label className="lam-label">Plan Tier</label>
            <select name="plan_tier" className="lam-input" style={{ background: 'var(--lam-surface)', color: 'white' }}>
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
              defaultValue={10}
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
              placeholder="e.g. 30 (Leave blank for perpetual)"
              min={1}
              max={365}
              className="lam-input"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Provisioning & Credentials Mode */}
      <div>
        <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--lam-gold)', marginBottom: '1rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.5rem' }}>
          4. Provisioning & Credentials Method
        </h3>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
          <label style={{
            flex: 1,
            padding: '1rem',
            background: provisionMode === 'invite' ? 'rgba(201, 168, 76, 0.1)' : 'var(--lam-surface)',
            border: `1px solid ${provisionMode === 'invite' ? 'var(--lam-gold)' : 'var(--lam-border)'}`,
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            <input
              type="radio"
              name="provision_mode"
              value="invite"
              checked={provisionMode === 'invite'}
              onChange={() => setProvisionMode('invite')}
              style={{ marginRight: '0.5rem' }}
            />
            <strong style={{ color: 'var(--lam-white)' }}>Send Invitation Link</strong>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', marginTop: '0.25rem' }}>
              Generates a secure redemption link for the customer owner to create their password.
            </p>
          </label>

          <label style={{
            flex: 1,
            padding: '1rem',
            background: provisionMode === 'password' ? 'rgba(201, 168, 76, 0.1)' : 'var(--lam-surface)',
            border: `1px solid ${provisionMode === 'password' ? 'var(--lam-gold)' : 'var(--lam-border)'}`,
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            <input
              type="radio"
              name="provision_mode"
              value="password"
              checked={provisionMode === 'password'}
              onChange={() => setProvisionMode('password')}
              style={{ marginRight: '0.5rem' }}
            />
            <strong style={{ color: 'var(--lam-white)' }}>Set Temporary Initial Password</strong>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', marginTop: '0.25rem' }}>
              Creates active Auth user immediately with a temporary password (never hardcoded in source).
            </p>
          </label>
        </div>

        {provisionMode === 'password' && (
          <div className="lam-form-group">
            <label className="lam-label">Temporary Initial Password *</label>
            <input
              type="password"
              name="initial_password"
              required={provisionMode === 'password'}
              placeholder="••••••••••••"
              minLength={8}
              className="lam-input"
            />
            <span style={{ fontSize: '11px', color: 'var(--lam-silver-dim)', marginTop: '4px', display: 'block' }}>
              Managed server-side via Supabase Auth. The user can change their password after signing in.
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <Link href="/control-panel/modules/ecosystem/companies" className="btn" style={{ background: 'var(--lam-surface)', color: 'white', border: '1px solid var(--lam-border)' }}>
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary"
          style={{ padding: '0.85rem 2rem' }}
        >
          {isPending ? 'Provisioning Account...' : 'Complete Onboarding & Provision →'}
        </button>
      </div>
    </form>
  )
}
