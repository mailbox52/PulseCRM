'use client'
import { useState, useEffect } from 'react'
import { Card, StatCard, PageHeader, Badge } from '@/components/ui'
import { formatCurrency, DEAL_STAGES } from '@/lib/utils'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = ['#7c6af7', '#22d3a0', '#f4a93a', '#60a5fa', '#f05252', '#ec4899']

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Loading analytics...</div>

  const s = data?.summary || {}

  // Stage pie data
  const stagePieData = DEAL_STAGES
    .filter(stage => (data?.stageBreakdown?.[stage.id] || 0) > 0)
    .map(stage => ({
      name: stage.label,
      value: data?.stageBreakdown?.[stage.id] || 0,
      color: stage.color,
    }))

  // Contact status pie
  const contactPieData = Object.entries(data?.contactStatusBreakdown || {}).map(([k, v], i) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1),
    value: v,
    color: COLORS[i % COLORS.length],
  }))

  const winRate = s.totalDeals > 0
    ? Math.round(((data?.stageBreakdown?.closed_won || 0) / s.totalDeals) * 100)
    : 0

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Business performance overview" />

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Contacts" value={s.totalContacts || 0} accent="var(--blue)" />
        <StatCard label="Open Pipeline" value={formatCurrency(s.pipelineValue || 0)} accent="var(--amber)" />
        <StatCard label="Revenue Won" value={formatCurrency(s.wonValue || 0)} accent="var(--green)" />
        <StatCard label="Win Rate" value={`${winRate}%`} accent="var(--accent-2)" />
        <StatCard label="Total Deals" value={s.totalDeals || 0} />
        <StatCard label="Emails Sent" value={s.totalEmails || 0} />
      </div>

      {/* Monthly Trends */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 13 }}>Monthly Deal Volume & Revenue</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.monthlyData || []}>
              <defs>
                <linearGradient id="colValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3a0" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22d3a0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colDeals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c6af7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c6af7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v, n) => n === 'value' ? formatCurrency(v) : v}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-2)' }} />
              <Area type="monotone" dataKey="value" name="Revenue" stroke="#22d3a0" fill="url(#colValue)" strokeWidth={2} />
              <Area type="monotone" dataKey="deals" name="Deals" stroke="#7c6af7" fill="url(#colDeals)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 13 }}>Pipeline by Stage</div>
          {stagePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stagePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {stagePieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              No deals yet
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {stagePieData.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                  <span style={{ color: 'var(--text-2)' }}>{s.name}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Second row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 13 }}>Contact Status Breakdown</div>
          {contactPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={contactPieData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {contactPieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>No contacts yet</div>
          )}
        </Card>

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 13 }}>Task Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(data?.taskSummary || {}).map(([status, count], i) => {
              const total = Object.values(data?.taskSummary || {}).reduce((s, v) => s + v, 0)
              const pct = total ? Math.round((count / total) * 100) : 0
              const colors = { pending: 'var(--amber)', in_progress: 'var(--accent)', completed: 'var(--green)', cancelled: 'var(--text-3)' }
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-2)', textTransform: 'capitalize' }}>{status.replace('_', ' ')}</span>
                    <span style={{ fontWeight: 600 }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: colors[status] || 'var(--accent)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              )
            })}
            {Object.keys(data?.taskSummary || {}).length === 0 && (
              <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No tasks yet</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
