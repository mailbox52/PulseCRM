import { clsx } from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeDate(date) {
  if (!date) return '—'
  const now = new Date()
  const then = new Date(date)
  const diffMs = now - then
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

export function getInitials(firstName, lastName) {
  return `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`
}

export const DEAL_STAGES = [
  { id: 'prospecting', label: 'Prospecting', color: '#6366f1', probability: 10 },
  { id: 'qualification', label: 'Qualification', color: '#8b5cf6', probability: 30 },
  { id: 'proposal', label: 'Proposal', color: '#f59e0b', probability: 60 },
  { id: 'negotiation', label: 'Negotiation', color: '#f97316', probability: 80 },
  { id: 'closed_won', label: 'Closed Won', color: '#10b981', probability: 100 },
  { id: 'closed_lost', label: 'Closed Lost', color: '#ef4444', probability: 0 },
]

export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#6b7280' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#f97316' },
  urgent: { label: 'Urgent', color: '#ef4444' },
}

export const STATUS_CONFIG = {
  active: { label: 'Active', color: '#10b981' },
  inactive: { label: 'Inactive', color: '#6b7280' },
  lead: { label: 'Lead', color: '#6366f1' },
}
