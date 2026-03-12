'use client'
import { cn } from '@/lib/utils'

export function Card({ children, style, className, onClick }) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Badge({ children, variant = 'default', size = 'sm' }) {
  const variants = {
    default: { bg: 'var(--bg-3)', color: 'var(--text-2)' },
    accent: { bg: 'var(--accent-dim)', color: 'var(--accent-2)' },
    green: { bg: 'var(--green-dim)', color: 'var(--green)' },
    amber: { bg: 'var(--amber-dim)', color: 'var(--amber)' },
    red: { bg: 'var(--red-dim)', color: 'var(--red)' },
    blue: { bg: 'var(--blue-dim)', color: 'var(--blue)' },
  }
  const v = variants[variant] || variants.default
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: size === 'sm' ? '2px 8px' : '4px 10px',
      borderRadius: 20,
      fontSize: size === 'sm' ? 11 : 12,
      fontWeight: 500,
      letterSpacing: '0.02em',
      background: v.bg,
      color: v.color,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, style, type = 'button', loading }) {
  const variants = {
    primary: {
      background: 'var(--accent)',
      color: '#fff',
      border: 'none',
    },
    secondary: {
      background: 'var(--bg-3)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-2)',
      border: '1px solid var(--border)',
    },
    danger: {
      background: 'var(--red-dim)',
      color: 'var(--red)',
      border: '1px solid rgba(240, 82, 82, 0.2)',
    },
  }
  const sizes = {
    sm: { padding: '5px 12px', fontSize: 12 },
    md: { padding: '8px 16px', fontSize: 13 },
    lg: { padding: '11px 22px', fontSize: 14 },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        fontWeight: 500,
        borderRadius: 8,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
        fontFamily: 'var(--font-body)',
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
    >
      {loading ? '...' : children}
    </button>
  )
}

export function Avatar({ firstName, lastName, size = 36, color }) {
  const colors = ['#7c6af7','#22d3a0','#f4a93a','#60a5fa','#f05252','#ec4899']
  const initials = `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`
  const bg = color || colors[(initials.charCodeAt(0) || 0) % colors.length]
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32,
      fontWeight: 600,
      color: '#fff',
      flexShrink: 0,
      fontFamily: 'var(--font-head)',
    }}>
      {initials || '?'}
    </div>
  )
}

export function Input({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{label}</label>}
      <input {...props} />
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

export function Select({ label, children, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{label}</label>}
      <select {...props}>{children}</select>
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

export function Textarea({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{label}</label>}
      <textarea rows={4} {...props} />
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          width: '100%', maxWidth: width,
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', color: 'var(--text-3)', fontSize: 20,
            lineHeight: 1, padding: 4, borderRadius: 6, cursor: 'pointer',
          }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '64px 32px', gap: 12, textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--bg-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
      }}>
        {Icon && <Icon size={24} color="var(--text-3)" />}
      </div>
      <div style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>
      {description && <div style={{ color: 'var(--text-2)', maxWidth: 320, fontSize: 13 }}>{description}</div>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: 28, gap: 16,
    }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 26, letterSpacing: '-0.03em' }}>
          {title}
        </h1>
        {subtitle && <p style={{ color: 'var(--text-2)', marginTop: 4, fontSize: 13 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, sub, accent }) {
  return (
    <Card>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-head)', color: accent || 'var(--text)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{sub}</div>}
    </Card>
  )
}

export function Spinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid var(--border)`,
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}
