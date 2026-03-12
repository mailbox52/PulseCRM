'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Button, Modal, Input, Select, PageHeader, Avatar, Badge } from '@/components/ui'
import { formatCurrency, DEAL_STAGES } from '@/lib/utils'
import { Plus, GripVertical } from 'lucide-react'

const EMPTY_FORM = {
  title: '', value: '', stage: 'prospecting',
  probability: 10, expected_close_date: '', notes: '', contact_id: '',
}

export default function PipelinePage() {
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [dragging, setDragging] = useState(null)

  const load = async () => {
    const [dr, cr] = await Promise.all([
      fetch('/api/deals').then(r => r.json()),
      fetch('/api/contacts?limit=100').then(r => r.json()),
    ])
    setDeals(dr || [])
    setContacts(cr.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const dealsByStage = DEAL_STAGES.reduce((acc, s) => {
    acc[s.id] = deals.filter(d => d.stage === s.id)
    return acc
  }, {})

  const stageValue = (stageId) => dealsByStage[stageId]?.reduce((s, d) => s + Number(d.value), 0) || 0

  const handleDrop = async (e, targetStage) => {
    e.preventDefault()
    if (!dragging || dragging.stage === targetStage) return
    const updated = deals.map(d => d.id === dragging.id ? { ...d, stage: targetStage } : d)
    setDeals(updated)
    setDragging(null)
    const r = await fetch(`/api/deals/${dragging.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: targetStage }),
    })
    if (!r.ok) { toast.error('Failed to move deal'); load() }
    else toast.success(`Moved to ${DEAL_STAGES.find(s => s.id === targetStage)?.label}`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const r = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, value: Number(form.value) || 0, probability: Number(form.probability) }),
    })
    const d = await r.json()
    if (!r.ok) { toast.error(d.error || 'Failed'); setSaving(false); return }
    toast.success('Deal created!')
    setModal(false); setForm(EMPTY_FORM); load(); setSaving(false)
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const totalPipeline = deals
    .filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
    .reduce((s, d) => s + Number(d.value), 0)

  return (
    <div>
      <PageHeader
        title="Pipeline"
        subtitle={`${formatCurrency(totalPipeline)} open pipeline`}
        actions={<Button onClick={() => setModal(true)}><Plus size={14} /> New Deal</Button>}
      />

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Loading pipeline...</div>
      ) : (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
          {DEAL_STAGES.map(stage => (
            <div
              key={stage.id}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, stage.id)}
              style={{
                minWidth: 240, width: 240, flexShrink: 0,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
            >
              {/* Stage Header */}
              <div style={{
                background: 'var(--bg-1)',
                border: '1px solid var(--border)',
                borderTop: `3px solid ${stage.color}`,
                borderRadius: 10,
                padding: '10px 14px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.02em' }}>{stage.label}</div>
                  <div style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 6px',
                    borderRadius: 10, background: 'var(--bg-3)', color: 'var(--text-3)'
                  }}>
                    {dealsByStage[stage.id]?.length || 0}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                  {formatCurrency(stageValue(stage.id))}
                </div>
              </div>

              {/* Deal Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 100 }}>
                {dealsByStage[stage.id]?.map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => setDragging(deal)}
                    onDragEnd={() => setDragging(null)}
                    style={{
                      background: 'var(--bg-1)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: 14,
                      cursor: 'grab',
                      opacity: dragging?.id === deal.id ? 0.5 : 1,
                      transition: 'opacity 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, lineHeight: 1.3 }}>{deal.title}</div>
                    {deal.contacts && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Avatar firstName={deal.contacts.first_name} lastName={deal.contacts.last_name} size={20} />
                        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                          {deal.contacts.first_name} {deal.contacts.last_name}
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--green)' }}>
                        {formatCurrency(deal.value)}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                        {deal.probability}%
                      </span>
                    </div>
                    {deal.expected_close_date && (
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
                        Close: {new Date(deal.expected_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty drop zone */}
                {!dealsByStage[stage.id]?.length && (
                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 10, padding: 20,
                    textAlign: 'center', color: 'var(--text-3)',
                    fontSize: 12,
                  }}>
                    Drop deals here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Deal" width={480}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Deal Title *" value={form.title} onChange={f('title')} required placeholder="Enterprise License - Acme Corp" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Value ($)" type="number" value={form.value} onChange={f('value')} placeholder="0" />
            <Input label="Probability (%)" type="number" min="0" max="100" value={form.probability} onChange={f('probability')} />
          </div>
          <Select label="Stage" value={form.stage} onChange={f('stage')}>
            {DEAL_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
          <Select label="Contact" value={form.contact_id} onChange={f('contact_id')}>
            <option value="">No contact</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.company}</option>)}
          </Select>
          <Input label="Expected Close Date" type="date" value={form.expected_close_date} onChange={f('expected_close_date')} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Deal</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
