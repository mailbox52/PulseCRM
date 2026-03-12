'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Card, Button, Badge, Modal, Input, Select, Textarea, PageHeader, Avatar, EmptyState } from '@/components/ui'
import { formatRelativeDate } from '@/lib/utils'
import { Mail, Plus, Send, Inbox, ArrowUpRight } from 'lucide-react'

const EMPTY_FORM = { contact_id: '', subject: '', body: '', to_email: '' }

const STATUS_BADGE = {
  sent: 'green', delivered: 'green', opened: 'accent',
  clicked: 'blue', bounced: 'red', failed: 'red', draft: 'default',
}

export default function EmailsPage() {
  const [emails, setEmails] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [sending, setSending] = useState(false)

  const load = async () => {
    const [er, cr] = await Promise.all([
      fetch('/api/emails').then(r => r.json()),
      fetch('/api/contacts?limit=100').then(r => r.json()),
    ])
    setEmails(er || [])
    setContacts(cr.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const onContactChange = (e) => {
    const id = e.target.value
    const contact = contacts.find(c => c.id === id)
    setForm(p => ({ ...p, contact_id: id, to_email: contact?.email || '' }))
  }

  const handleSend = async (e) => {
    e.preventDefault(); setSending(true)
    const r = await fetch('/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await r.json()
    if (!r.ok) { toast.error(d.error || 'Failed to send'); setSending(false); return }
    if (d.status === 'failed') toast.error('Email failed to send (check RESEND_API_KEY)')
    else toast.success('Email sent!')
    setModal(false); setForm(EMPTY_FORM); load(); setSending(false)
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const sent = emails.filter(e => e.direction === 'outbound').length
  const opened = emails.filter(e => e.status === 'opened').length

  return (
    <div>
      <PageHeader
        title="Emails"
        subtitle={`${sent} sent · ${opened} opened`}
        actions={<Button onClick={() => setModal(true)}><Plus size={14} /> Compose</Button>}
      />

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Sent', value: emails.filter(e => ['sent','delivered'].includes(e.status)).length, color: 'var(--green)' },
          { label: 'Opened', value: opened, color: 'var(--accent-2)' },
          { label: 'Failed', value: emails.filter(e => e.status === 'failed').length, color: 'var(--red)' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-head)', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Loading...</div>
      ) : emails.length === 0 ? (
        <Card><EmptyState icon={Mail} title="No emails yet" description="Compose your first email to a contact" action={<Button onClick={() => setModal(true)}><Plus size={14} /> Compose</Button>} /></Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {emails.map((email, i) => (
            <div key={email.id} style={{
              padding: '14px 20px',
              borderBottom: i < emails.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: email.direction === 'outbound' ? 'var(--accent-dim)' : 'var(--green-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {email.direction === 'outbound'
                  ? <ArrowUpRight size={16} color="var(--accent-2)" />
                  : <Inbox size={16} color="var(--green)" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{email.subject}</span>
                  <Badge variant={STATUS_BADGE[email.status] || 'default'} size="sm">{email.status}</Badge>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                  To: {email.to_email}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0 }}>
                {formatRelativeDate(email.sent_at)}
              </div>
            </div>
          ))}
        </Card>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Compose Email" width={540}>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="To (Contact) *" value={form.contact_id} onChange={onContactChange} required>
            <option value="">Select a contact</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.email}</option>)}
          </Select>
          {form.to_email && (
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: -8 }}>Sending to: {form.to_email}</div>
          )}
          <Input label="Subject *" value={form.subject} onChange={f('subject')} required placeholder="Following up on our conversation" />
          <Textarea label="Message *" value={form.body} onChange={f('body')} required placeholder="Hi [name],&#10;&#10;I wanted to follow up..." rows={8} />
          <div style={{ padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 8, fontSize: 12, color: 'var(--text-3)' }}>
            <strong style={{ color: 'var(--amber)' }}>Note:</strong> To send real emails, set <code>RESEND_API_KEY</code> in your environment. Without it, emails are logged only.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={sending}><Send size={13} /> Send Email</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
