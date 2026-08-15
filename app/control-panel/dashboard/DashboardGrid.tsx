'use client'

import Link from 'next/link'

interface Props {
  layout: string[]
  data: Record<string, number>
}

export default function DashboardGrid({ data }: Props) {
  const cards = [
    {
      title: 'Total Clients',
      subtitle: 'Customer companies & organizations',
      count: data.totalClientsCount || 0,
      badgeText: 'Clients',
      badgeColor: '#c9a84c',
      href: '/control-panel/modules/ecosystem/companies',
      btnText: 'Manage Clients'
    },
    {
      title: 'Active Subscriptions',
      subtitle: 'Customer product entitlement grants',
      count: data.activeSubscriptionsCount || 0,
      badgeText: 'Active',
      badgeColor: '#2ecc71',
      href: '/control-panel/modules/ecosystem/entitlements',
      btnText: 'View Subscriptions'
    },
    {
      title: 'Products',
      subtitle: 'Public SaaS portfolio products',
      count: data.totalProductsCount || 0,
      badgeText: 'Portfolio',
      badgeColor: '#3498db',
      href: '/control-panel/modules/site-management',
      btnText: 'Website Products'
    },
    {
      title: 'New / Pending Requests',
      subtitle: 'Unprocessed business contact inquiries',
      count: data.newRequestsCount || 0,
      badgeText: 'New',
      badgeColor: '#e67e22',
      href: '/control-panel/modules/leads-clients',
      btnText: 'Review Requests'
    },
    {
      title: 'Expiring Subscriptions',
      subtitle: 'Subscriptions renewing within 30 days',
      count: data.expiringSubscriptionsCount || 0,
      badgeText: 'Expiring',
      badgeColor: '#f1c40f',
      href: '/control-panel/modules/ecosystem/entitlements',
      btnText: 'Check Renewals'
    },
    {
      title: 'Pending Actions',
      subtitle: 'Total requests and renewal items requiring staff attention',
      count: data.pendingActionsCount || 0,
      badgeText: 'Action Required',
      badgeColor: data.pendingActionsCount > 0 ? '#e74c3c' : '#2ecc71',
      href: '/control-panel/modules/ecosystem/companies',
      btnText: 'Take Action'
    }
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.5rem',
      alignItems: 'stretch'
    }}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="lam-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'var(--lam-surface-elevated)',
            border: '1px solid var(--lam-border)',
            borderRadius: '8px',
            padding: '1.5rem',
            transition: 'border-color 0.2s, transform 0.2s'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: 'var(--text-md)', color: 'var(--lam-white)', margin: 0, fontWeight: 600 }}>
                {card.title}
              </h3>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '3px',
                  background: `rgba(${parseInt(card.badgeColor.slice(1, 3), 16)}, ${parseInt(card.badgeColor.slice(3, 5), 16)}, ${parseInt(card.badgeColor.slice(5, 7), 16)}, 0.15)`,
                  color: card.badgeColor,
                  border: `1px solid rgba(${parseInt(card.badgeColor.slice(1, 3), 16)}, ${parseInt(card.badgeColor.slice(3, 5), 16)}, ${parseInt(card.badgeColor.slice(5, 7), 16)}, 0.3)`
                }}
              >
                {card.badgeText}
              </span>
            </div>

            <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {card.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--lam-white)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
              {card.count}
            </div>

            <Link
              href={card.href}
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.85rem', fontSize: 'var(--text-xs)' }}
            >
              {card.btnText} →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
