'use client'

import { useState } from 'react'
import Link from 'next/link'
import { publishPricingPlan, archivePricingPlan } from '@/lib/actions/pricing'

export function PricingListClient({ plan, canEdit, canPublish, canManage }: { plan: any, canEdit: boolean, canPublish: boolean, canManage: boolean }) {
  const [loading, setLoading] = useState(false)
  
  const handlePublishToggle = async () => {
    if (!window.confirm(`Are you sure you want to ${plan.status === 'published' ? 'unpublish' : 'publish'} this plan?`)) return
    
    setLoading(true)
    try {
      const res = await publishPricingPlan(plan.id, plan.status !== 'published')
      if (!res.success) alert(res.error)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async () => {
    if (!window.confirm(`Are you sure you want to archive this plan? It will no longer be visible on the public site or this list.`)) return
    
    setLoading(true)
    try {
      const res = await archivePricingPlan(plan.id)
      if (!res.success) alert(res.error)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--lam-border)', paddingTop: '1rem', marginTop: 'auto' }}>
      {canEdit && (
        <Link href={`/control-panel/modules/pricing/${plan.id}/edit`} className="btn" style={{ flex: 1, background: 'var(--lam-gunmetal)', color: 'white', border: '1px solid var(--lam-border)', textAlign: 'center' }}>
          Edit
        </Link>
      )}
      
      {canPublish && (
        <button 
          onClick={handlePublishToggle}
          disabled={loading}
          className="btn" 
          style={{ 
            flex: 1, 
            background: plan.status === 'published' ? 'transparent' : 'var(--lam-gold)', 
            color: plan.status === 'published' ? 'var(--lam-silver)' : 'var(--lam-black)',
            border: plan.status === 'published' ? '1px solid var(--lam-border)' : 'none'
          }}
        >
          {plan.status === 'published' ? 'Unpublish' : 'Publish'}
        </button>
      )}
      
      {canManage && (
        <button 
          onClick={handleArchive}
          disabled={loading}
          className="btn"
          style={{ background: 'transparent', color: '#e74c3c', border: '1px solid var(--lam-border)' }}
          title="Archive Plan"
        >
          🗑
        </button>
      )}
    </div>
  )
}
