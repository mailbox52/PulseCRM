'use client'

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
    default: { bg: 'var(--bg-3)', color: 'var(--text-2)', border: '1px solid var(--border)' },
    accent:  { bg: 'var(--accent-dim)', color: 'var(--accent-2)', border: '1px solid rgba(108,99,255,0.2)' },
    green:   { bg: 'var(--green-dim)',  color: 'var(--green)',    border: '1px solid rgba(45,230,176,0.2)' },
    amber:   { bg: 'var(--amber-dim)',  color: 'var(--amber)',    border: '1px solid rgba(255,184,48,0.2)' },
    red:     { bg: 'var(--red-dim)',    color: 'var(--red)',      border: '1px solid rgba(255,95,95,0.2)' },
    blue:    { bg: 'var(--blue-dim)',   color: 'var(--blue)',     border: '1px solid rgba(95,179,255,0.2)' },
  }
  const v = variants[variant] || variants.default
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: size === 'sm' ? '2px 8px' : '4px 10px',
      borderRadius: 20,
      fontSize: size === 'sm' ? 11 : 12,
      fontWeight: 600,
      letterSpacing: '0.02em',
      background: v.bg,
      color: v.color,
      border: v.border,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, style, type = 'button', loading }) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--accent), #8b7fff)',
      color: '#fff',
      border: 'none',
      boxShadow: '0 2px 12px rgba(108,99,255,0.35)',
    },
    secondary: {
      background: 'var(--bg-3)',
      color: 'var(--text)',
      border: '1px solid var(--border-light)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-2)',
      border: '1px solid var(--border)',
    },
    danger: {
      background: 'var(--red-dim)',
      color: 'var(--red)',
      border: '1px solid rgba(255,95,95,0.25)',
    },
  }
  const sizes = {
    sm: { padding: '5px 12px', fontSize: 12, gap: 5 },
    md: { padding: '8px 16px', fontSize: 13.5, gap: 7 },
    lg: { padding: '11px 22px', fontSize: 14.5, gap: 8 },
  }
  const s = sizes[size]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        fontWeight: 600,
        borderRadius: 9,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
        fontFamily: 'var(--font-body)',
        letterSpacing: '-0.01em',
        ...variants[variant],
        padding: s.padding,
        fontSize: s.fontSize,
        ...style,
      }}
    >
      {loading ? <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 13 }} /> : children}
    </button>
  )
}

export function Avatar({ firstName, lastName, size = 36 }) {
  const colors = [
    'linear-gradient(135deg,#6c63ff,#9b6cff)',
    'linear-gradient(135deg,#2de6b0,#1ab88d)',
    'linear-gradient(135deg,#ffb830,#ff8c00)',
    'linear-gradient(135deg,#5fb3ff,#3b8de0)',
    'linear-gradient(135deg,#ff5f5f,#d93535)',
    'linear-gradient(135deg,#ec4899,#be185d)',
  ]
  const initials = `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`
  const bg = colors[(initials.charCodeAt(0) || 0) % colors.length]
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32,
      fontWeight: 700,
      color: '#fff',
      flexShrink: 0,
      fontFamily: 'var(--font-head)',
      letterSpacing: '-0.02em',
    }}>
      {initials || <i className="fa-solid fa-user" style={{ fontSize: size * 0.4 }} />}
    </div>
  )
}

export function Input({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '-0.01em' }}>
          {label}
        </label>
      )}
      <input {...props} />
      {error && <span style={{ fontSize: 11.5, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <i className="fa-solid fa-circle-exclamation" /> {error}
      </span>}
    </div>
  )
}

export function Select({ label, children, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '-0.01em' }}>
          {label}
        </label>
      )}
      <select {...props}>{children}</select>
      {error && <span style={{ fontSize: 11.5, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

export function Textarea({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '-0.01em' }}>
          {label}
        </label>
      )}
      <textarea rows={4} {...props} />
      {error && <span style={{ fontSize: 11.5, color: 'var(--red)' }}>{error}</span>}
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
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          width: '100%', maxWidth: width,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          animation: 'fadeIn 0.18s ease',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-head)',
            fontWeight: 700, fontSize: 16,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'var(--bg-3)',
            color: 'var(--text-2)',
            width: 28, height: 28,
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 13,
            border: '1px solid var(--border)',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg-2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'var(--bg-3)' }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ icon, faIcon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '56px 32px', gap: 12, textAlign: 'center',
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: '50%',
        background: 'var(--bg-3)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
      }}>
        {faIcon
          ? <i className={faIcon} style={{ fontSize: 22, color: 'var(--text-3)' }} />
          : icon && (() => { const Icon = icon; return <Icon size={24} color="var(--text-3)" /> })()
        }
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', fontFamily: 'var(--font-head)' }}>{title}</div>
      {description && <div style={{ color: 'var(--text-2)', maxWidth: 300, fontSize: 13.5, lineHeight: 1.6 }}>{description}</div>}
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
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
        <h1 style={{
          fontFamily: 'var(--font-head)',
          fontWeight: 800, fontSize: 26,
          color: 'var(--text)',
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: 'var(--text-2)', marginTop: 5, fontSize: 13.5, fontWeight: 400 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginTop: 2 }}>{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, sub, accent }) {
  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Subtle glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 80, height: 80,
        background: accent ? `${accent}10` : 'var(--accent-dim)',
        borderRadius: '50%',
        transform: 'translate(20px, -20px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        fontSize: 11, fontWeight: 600,
        color: 'var(--text-3)',
        textTransform: 'uppercase',
        letterSpacing: '0.09em',
        marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 28, fontWeight: 800,
        fontFamily: 'var(--font-head)',
        color: accent || 'var(--text)',
        letterSpacing: '-0.03em',
        lineHeight: 1,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>
      )}
    </Card>
  )
}

export function Spinner({ size = 20 }) {
  return (
    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: size, color: 'var(--accent)' }} />
  )
}
