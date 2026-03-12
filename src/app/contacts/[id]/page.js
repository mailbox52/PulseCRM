'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Card, Button, Badge, Modal, Textarea, PageHeader, Avatar, StatCard } from '@/components/ui'
import { formatCurrency, formatDate, formatRelativeDate, STATUS_CONFIG, DEAL_STAGES } from '@/lib/utils'
import { ArrowLeft, Mail, Phone, Building, Briefcase, Trash2, Send } from 'lucide-react'
import Link from 'next/link'

export default function ContactDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [emailModal, setEmailModal] = useState(false)
  const [emailForm, setEmailForm] = useState({ subject: '', body: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch(`/api/contacts/${id}`)
      .then(r => r.json())
      .then(d => { setContact(d); setLoading(false) })
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this contact and all related data?')) return
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
    toast.success('Contact deleted')
    router.push('/contacts')
  }

  const handleEmail = async (e) => {
    e.preventDefault(); setSending(true)
    const r = await fetch('/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...emailForm, contact_id: id, to_email: contact.email }),
    })
    if (r.ok) { toast.success('Email sent!'); setEmailModal(false); setEmailForm({ subject: '', body: '' }) }
    else toast.error('Failed to send')
    setSending(false)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Loading...</div>
  if (!contact || contact.error) return <div style={{ padding: 40, color: 'var(--red)' }}>Contact not found</div>

  const sc = STATUS_CONFIG[contact.status]

  return (
    <div>
      <Link href="/contacts" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontSize: 13, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to Contacts
      </Link>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
        <Avatar firstName={contact.first_name} lastName={contact.last_name} size={56} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>
              {contact.first_name} {contact.last_name}
            </h1>
            <Badge variant={contact.status === 'active' ? 'green' : contact.status === 'lead' ? 'accent' : 'default'}>
              {sc?.label}
            </Badge>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {contact.job_title && <span style={{ color: 'var(--text-2)', fontSize: 13 }}>{contact.job_title}</span>}
            {contact.company && <span style={{ color: 'var(--text-2)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><Building size={12} />{contact.company}</span>}
            {contact.email && <a href={`mailto:${contact.email}`} style={{ color: 'var(--accent-2)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} />{contact.email}</a>}
            {contact.phone && <span style={{ color: 'var(--text-2)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} />{contact.phone}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => setEmailModal(true)}><Send size={13} /> Email</Button>
          <Button variant="danger" onClick={handleDelete}><Trash2 size={13} /></Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        <StatCard label="Deals" value={(contact.deals || []).length} />
        <StatCard label="Pipeline" value={formatCurrency((contact.deals || []).filter(d => !['closed_won','closed_lost'].includes(d.stage)).reduce((s,d) => s + Number(d.value), 0))} accent="var(--amber)" />
        <StatCard label="Added" value={formatRelativeDate(contact.created_at)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Deals */}
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Deals</div>
          {(contact.deals || []).length === 0
            ? <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No deals</div>
            : (contact.deals || []).map(deal => {
                const stage = DEAL_STAGES.find(s => s.id === deal.stage)
                return (
                  <div key={deal.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{deal.title}</div>
                      <div style={{ fontSize: 11, color: stage?.color }}>{stage?.label}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 14 }}>{formatCurrency(deal.value)}</div>
                  </div>
                )
              })
          }
        </Card>

        {/* Tasks */}
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Tasks</div>
          {(contact.tasks || []).length === 0
            ? <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No tasks</div>
            : (contact.tasks || []).slice(0, 5).map(task => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none', color: task.status === 'completed' ? 'var(--text-3)' : 'var(--text)' }}>
                    {task.title}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{formatDate(task.due_date)}</span>
                </div>
              ))
          }
        </Card>

        {/* Emails */}
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Email History</div>
          {(contact.emails || []).length === 0
            ? <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No emails</div>
            : (contact.emails || []).slice(0, 5).map(email => (
                <div key={email.id} style={{ padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{email.subject}</div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                    <span style={{ textTransform: 'capitalize' }}>{email.status}</span>
                    <span>·</span>
                    <span>{formatRelativeDate(email.sent_at)}</span>
                  </div>
                </div>
              ))
          }
        </Card>

        {/* Notes */}
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Notes</div>
          {contact.notes
            ? <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{contact.notes}</p>
            : <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No notes</div>
          }
          {contact.source && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-3)' }}>
              Source: <span style={{ color: 'var(--text-2)', textTransform: 'capitalize' }}>{contact.source.replace('_', ' ')}</span>
            </div>
          )}
        </Card>
      </div>

      {/* Email Modal */}
      <Modal open={emailModal} onClose={() => setEmailModal(false)} title={`Email ${contact.first_name}`} width={500}>
        <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '8px 12px', background: 'var(--bg-2)', borderRadius: 8, fontSize: 13, color: 'var(--text-2)' }}>To: {contact.email}</div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Subject</label>
            <input value={emailForm.subject} onChange={e => setEmailForm(p => ({ ...p, subject: e.target.value }))} required placeholder="Subject line" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Message</label>
            <textarea rows={6} value={emailForm.body} onChange={e => setEmailForm(p => ({ ...p, body: e.target.value }))} required placeholder={`Hi ${contact.first_name},\n\n`} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => setEmailModal(false)}>Cancel</Button>
            <Button type="submit" loading={sending}><Send size={13} /> Send</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
