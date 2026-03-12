'use client'
import { useState, useEffect } from 'react'
import { Card, StatCard, Badge, Avatar, PageHeader } from '@/components/ui'
import { formatCurrency, formatRelativeDate, DEAL_STAGES } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Users, Briefcase, TrendingUp, CheckSquare, Mail, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>Loading...</div>
    </div>
  )

  const s = data?.summary || {}

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
      />

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Contacts" value={s.totalContacts || 0} sub="Total contacts" accent="var(--blue)" />
        <StatCard label="Leads" value={s.totalLeads || 0} sub="Active leads" accent="var(--accent-2)" />
        <StatCard label="Pipeline" value={formatCurrency(s.pipelineValue || 0)} sub="Open deals value" accent="var(--amber)" />
        <StatCard label="Won" value={formatCurrency(s.wonValue || 0)} sub="Closed won" accent="var(--green)" />
        <StatCard label="Tasks" value={s.pendingTasks || 0} sub={`${s.completedTasks || 0} completed`} />
        <StatCard label="Emails" value={s.totalEmails || 0} sub="Total sent" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 13 }}>Deal Activity (6 months)</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data?.monthlyData || []}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text)' }}
              />
              <Area type="monotone" dataKey="deals" stroke="var(--accent)" fill="url(#areaGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 13 }}>Revenue by Stage</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data?.monthlyData || []}>
              <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => formatCurrency(v)}
              />
              <Bar dataKey="value" fill="var(--green)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Recent Deals</div>
            <Link href="/pipeline" style={{ fontSize: 12, color: 'var(--accent-2)' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data?.recentDeals || []).length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No deals yet</div>}
            {(data?.recentDeals || []).map(deal => {
              const stage = DEAL_STAGES.find(s => s.id === deal.stage)
              return (
                <Link key={deal.id} href={`/pipeline`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px', borderRadius: 8, background: 'var(--bg-2)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{deal.title}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{deal.contacts?.company || '—'}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--green)' }}>{formatCurrency(deal.value)}</div>
                    <div style={{ fontSize: 11, color: stage?.color }}>{stage?.label}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Recent Contacts</div>
            <Link href="/contacts" style={{ fontSize: 12, color: 'var(--accent-2)' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(data?.recentContacts || []).length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No contacts yet</div>}
            {(data?.recentContacts || []).map(c => (
              <Link key={c.id} href={`/contacts/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--bg-2)' }}>
                <Avatar firstName={c.first_name} lastName={c.last_name} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{c.first_name} {c.last_name}</div>
                  <div style={{ color: 'var(--text-3)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.company || '—'}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{formatRelativeDate(c.created_at)}</div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
