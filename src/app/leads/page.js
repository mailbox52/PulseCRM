'use client'
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Card, Button, Badge, Modal, Input, Select, Textarea, PageHeader, EmptyState, Avatar } from '@/components/ui'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import { TrendingUp, Plus, Search } from 'lucide-react'
import Link from 'next/link'

const EMPTY_FORM = {
  title: '', value: '', status: 'new', source: 'website',
  notes: '', contact_id: '', assigned_to: '',
}

const STATUS_VARIANT = {
  new: 'accent', contacted: 'blue', qualified: 'green',
  unqualified: 'default', converted: 'green',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [lr, cr] = await Promise.all([
      fetch('/api/leads').then(r => r.json()),
      fetch('/api/contacts?limit=100').then(r => r.json()),
    ])
    setLeads(lr.data || lr || [])
    setContacts(cr.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = leads.filter(l =>
    !search ||
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.contacts?.company?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    const r = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, value: Number(form.value) || 0 }),
    })
    const d = await r.json()
    if (!r.ok) { toast.error(d.error || 'Failed'); setSaving(false); return }
    toast.success('Lead created!')
    setModal(false); setForm(EMPTY_FORM); load(); setSaving(false)
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const totalValue = leads.filter(l => l.status !== 'unqualified').reduce((s, l) => s + Number(l.value || 0), 0)

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${leads.length} leads · ${formatCurrency(totalValue)} potential value`}
        actions={<Button onClick={() => setModal(true)}><Plus size={14} /> New Lead</Button>}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, maxWidth: 320, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon={TrendingUp} title="No leads yet" description="Add leads to track your sales pipeline" action={<Button onClick={() => setModal(true)}><Plus size={14} /> Add Lead</Button>} /></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {filtered.map(lead => (
            <Card key={lead.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3, flex: 1 }}>{lead.title}</div>
                <Badge variant={STATUS_VARIANT[lead.status] || 'default'} size="sm">
                  {lead.status?.replace('_', ' ')}
                </Badge>
              </div>
              {lead.contacts && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar firstName={lead.contacts.first_name} lastName={lead.contacts.last_name} size={28} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.contacts.first_name} {lead.contacts.last_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{lead.contacts.company}</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {lead.value > 0 && (
                  <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: 15 }}>{formatCurrency(lead.value)}</span>
                )}
                <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 'auto' }}>{formatRelativeDate(lead.created_at)}</span>
              </div>
              {lead.notes && <div style={{ fontSize: 12, color: 'var(--text-3)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>{lead.notes}</div>}
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Lead">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Lead Title *" value={form.title} onChange={f('title')} required placeholder="Enterprise software opportunity" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Estimated Value ($)" type="number" value={form.value} onChange={f('value')} placeholder="0" />
            <Select label="Status" value={form.status} onChange={f('status')}>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="unqualified">Unqualified</option>
              <option value="converted">Converted</option>
            </Select>
          </div>
          <Select label="Contact" value={form.contact_id} onChange={f('contact_id')}>
            <option value="">No contact</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.company}</option>)}
          </Select>
          <Select label="Source" value={form.source} onChange={f('source')}>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="cold_outreach">Cold Outreach</option>
            <option value="event">Event</option>
            <option value="social">Social</option>
            <option value="other">Other</option>
          </Select>
          <Textarea label="Notes" value={form.notes} onChange={f('notes')} placeholder="Additional context..." rows={3} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Lead</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
