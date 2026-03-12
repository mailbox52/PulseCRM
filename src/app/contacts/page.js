'use client'
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  Card, Button, Badge, Avatar, Input, Select, Modal, PageHeader, EmptyState
} from '@/components/ui'
import { formatRelativeDate, STATUS_CONFIG } from '@/lib/utils'
import { Users, Plus, Search, Mail, Phone, Building } from 'lucide-react'
import Link from 'next/link'

const EMPTY_FORM = {
  first_name: '', last_name: '', email: '', phone: '',
  company: '', job_title: '', status: 'active', source: 'website', notes: ''
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    const r = await fetch(`/api/contacts?${params}`)
    const d = await r.json()
    setContacts(d.data || [])
    setTotal(d.count || 0)
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const r = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await r.json()
    if (!r.ok) { toast.error(d.error || 'Failed to create contact'); setSaving(false); return }
    toast.success('Contact created!')
    setModal(false)
    setForm(EMPTY_FORM)
    load()
    setSaving(false)
  }

  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle={`${total} total contacts`}
        actions={
          <Button onClick={() => setModal(true)}>
            <Plus size={14} /> New Contact
          </Button>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, maxWidth: 320, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 140 }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="lead">Lead</option>
        </select>
      </div>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Loading...</div>
        ) : contacts.length === 0 ? (
          <EmptyState icon={Users} title="No contacts found" description="Add your first contact to get started" action={<Button onClick={() => setModal(true)}><Plus size={14} /> Add Contact</Button>} />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Contact', 'Company', 'Status', 'Source', 'Added', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map((c, i) => {
                const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.active
                return (
                  <tr key={c.id} style={{ borderBottom: i < contacts.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar firstName={c.first_name} lastName={c.last_name} size={34} />
                        <div>
                          <Link href={`/contacts/${c.id}`} style={{ fontWeight: 500, fontSize: 13, display: 'block' }}>
                            {c.first_name} {c.last_name}
                          </Link>
                          <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 13 }}>{c.company || '—'}</div>
                      <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{c.job_title || ''}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={c.status === 'active' ? 'green' : c.status === 'lead' ? 'accent' : 'default'}>
                        {sc.label}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)', textTransform: 'capitalize' }}>
                      {c.source?.replace('_', ' ') || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-3)' }}>
                      {formatRelativeDate(c.created_at)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link href={`/contacts/${c.id}`}>
                        <Button size="sm" variant="ghost">View</Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* New Contact Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="New Contact" width={520}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="First Name *" value={form.first_name} onChange={f('first_name')} required placeholder="Sarah" />
            <Input label="Last Name *" value={form.last_name} onChange={f('last_name')} required placeholder="Chen" />
          </div>
          <Input label="Email *" type="email" value={form.email} onChange={f('email')} required placeholder="sarah@company.com" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Phone" value={form.phone} onChange={f('phone')} placeholder="+1 555-0100" />
            <Input label="Company" value={form.company} onChange={f('company')} placeholder="Acme Inc" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Job Title" value={form.job_title} onChange={f('job_title')} placeholder="CEO" />
            <Select label="Status" value={form.status} onChange={f('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="lead">Lead</option>
            </Select>
          </div>
          <Select label="Source" value={form.source} onChange={f('source')}>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="cold_outreach">Cold Outreach</option>
            <option value="event">Event</option>
            <option value="social">Social</option>
            <option value="other">Other</option>
          </Select>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button type="button" variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Contact</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
