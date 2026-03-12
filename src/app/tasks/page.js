'use client'
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Card, Button, Badge, Modal, Input, Select, Textarea, PageHeader, EmptyState, Avatar } from '@/components/ui'
import { formatDate, PRIORITY_CONFIG } from '@/lib/utils'
import { CheckSquare, Plus, Check, Trash2, Calendar, Circle } from 'lucide-react'

const EMPTY_FORM = {
  title: '', description: '', type: 'task',
  priority: 'medium', due_date: '', contact_id: '', deal_id: '',
}

const TYPE_ICONS = {
  task: '📋', call: '📞', email: '✉️', meeting: '🤝', follow_up: '🔁'
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [tr, cr] = await Promise.all([
      fetch(`/api/tasks?${filter !== 'all' ? `status=${filter}` : ''}`).then(r => r.json()),
      fetch('/api/contacts?limit=100').then(r => r.json()),
    ])
    setTasks(tr || [])
    setContacts(cr.data || [])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const r = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (r.ok) {
      toast.success(newStatus === 'completed' ? 'Task completed!' : 'Reopened')
      load()
    }
  }

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    toast.success('Task deleted')
    load()
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    const r = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await r.json()
    if (!r.ok) { toast.error(d.error || 'Failed'); setSaving(false); return }
    toast.success('Task created!')
    setModal(false); setForm(EMPTY_FORM); load(); setSaving(false)
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle={overdue > 0 ? `${overdue} overdue` : 'Stay on top of your work'}
        actions={<Button onClick={() => setModal(true)}><Plus size={14} /> New Task</Button>}
      />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-1)', padding: 4, borderRadius: 10, border: '1px solid var(--border)', width: 'fit-content' }}>
        {[['pending', 'Pending'], ['in_progress', 'In Progress'], ['completed', 'Completed'], ['all', 'All']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500,
            background: filter === val ? 'var(--accent)' : 'transparent',
            color: filter === val ? '#fff' : 'var(--text-2)',
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Loading...</div>
      ) : tasks.length === 0 ? (
        <Card><EmptyState icon={CheckSquare} title="No tasks" description="Create your first task" action={<Button onClick={() => setModal(true)}><Plus size={14} /> Add Task</Button>} /></Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map(task => {
            const p = PRIORITY_CONFIG[task.priority]
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
            const done = task.status === 'completed'
            return (
              <Card key={task.id} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Checkbox */}
                <button onClick={() => toggleComplete(task)} style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `2px solid ${done ? 'var(--green)' : 'var(--border)'}`,
                  background: done ? 'var(--green)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {done && <Check size={12} color="#fff" strokeWidth={3} />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13 }}>{TYPE_ICONS[task.type] || '📋'}</span>
                    <span style={{
                      fontWeight: 500, fontSize: 13,
                      textDecoration: done ? 'line-through' : 'none',
                      color: done ? 'var(--text-3)' : 'var(--text)',
                    }}>{task.title}</span>
                    <Badge variant={
                      task.priority === 'urgent' ? 'red' :
                      task.priority === 'high' ? 'amber' :
                      'default'
                    } size="sm">{p?.label}</Badge>
                  </div>
                  {task.description && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{task.description}</div>}
                  <div style={{ display: 'flex', gap: 12, marginTop: 4, alignItems: 'center' }}>
                    {task.contacts && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Avatar firstName={task.contacts.first_name} lastName={task.contacts.last_name} size={16} />
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{task.contacts.first_name} {task.contacts.last_name}</span>
                      </div>
                    )}
                    {task.due_date && (
                      <span style={{ fontSize: 11, color: isOverdue ? 'var(--red)' : 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Calendar size={10} />
                        {formatDate(task.due_date)}{isOverdue ? ' — Overdue' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <button onClick={() => deleteTask(task.id)} style={{
                  background: 'none', color: 'var(--text-3)', padding: 6, borderRadius: 6,
                  cursor: 'pointer', transition: 'color 0.15s', flexShrink: 0,
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                >
                  <Trash2 size={14} />
                </button>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Task">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Title *" value={form.title} onChange={f('title')} required placeholder="Follow up with client" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Type" value={form.type} onChange={f('type')}>
              <option value="task">Task</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="follow_up">Follow Up</option>
            </Select>
            <Select label="Priority" value={form.priority} onChange={f('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </div>
          <Input label="Due Date" type="datetime-local" value={form.due_date} onChange={f('due_date')} />
          <Select label="Contact (optional)" value={form.contact_id} onChange={f('contact_id')}>
            <option value="">No contact</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.company}</option>)}
          </Select>
          <Textarea label="Description" value={form.description} onChange={f('description')} placeholder="Additional notes..." rows={3} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
