'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/',          label: 'Dashboard', icon: 'fa-solid fa-gauge-high' },
  { href: '/contacts',  label: 'Contacts',  icon: 'fa-solid fa-address-book' },
  { href: '/leads',     label: 'Leads',     icon: 'fa-solid fa-chart-line' },
  { href: '/pipeline',  label: 'Pipeline',  icon: 'fa-solid fa-filter' },
  { href: '/tasks',     label: 'Tasks',     icon: 'fa-solid fa-circle-check' },
  { href: '/emails',    label: 'Emails',    icon: 'fa-solid fa-envelope' },
  { href: '/analytics', label: 'Analytics', icon: 'fa-solid fa-chart-bar' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close sidebar on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--accent), #9b6cff)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(108,99,255,0.4)',
            flexShrink: 0,
          }}>
            <i className="fa-solid fa-bolt" style={{ color: '#fff', fontSize: 15 }} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-head)', fontWeight: 800,
              fontSize: 16, color: 'var(--text)', letterSpacing: '-0.02em',
            }}>PulseCRM</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>Workspace</div>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setOpen(false)}
          style={{
            display: 'none',
            background: 'var(--bg-3)', border: '1px solid var(--border)',
            color: 'var(--text-2)', borderRadius: 8,
            width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
            fontSize: 14, cursor: 'pointer',
          }}
          className="sidebar-close-btn"
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1, padding: '14px 10px',
        display: 'flex', flexDirection: 'column', gap: 3,
        overflowY: 'auto',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '4px 10px 8px',
        }}>Main Menu</div>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 12px', borderRadius: 9,
              color: active ? '#fff' : 'var(--text-2)',
              background: active
                ? 'linear-gradient(90deg, rgba(108,99,255,0.25), rgba(108,99,255,0.1))'
                : 'transparent',
              borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
              fontWeight: active ? 600 : 400,
              fontSize: 14, transition: 'all 0.15s',
              textDecoration: 'none', letterSpacing: '-0.01em',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text)' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)' } }}
            >
              <i className={icon} style={{ fontSize: 15, width: 20, textAlign: 'center', color: active ? 'var(--accent-2)' : 'inherit' }} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <Link href="/settings" style={{
          display: 'flex', alignItems: 'center', gap: 11,
          padding: '9px 12px', borderRadius: 9,
          color: 'var(--text-3)', fontSize: 14,
          transition: 'all 0.15s', borderLeft: '3px solid transparent',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg-2)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' }}
        >
          <i className="fa-solid fa-gear" style={{ fontSize: 15, width: 20, textAlign: 'center' }} />
          Settings
        </Link>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', marginTop: 6,
          background: 'var(--bg-2)', borderRadius: 9,
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), #9b6cff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            <i className="fa-solid fa-user" style={{ fontSize: 12 }} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>My Workspace</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Free plan</div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        /* Desktop sidebar */
        .sidebar-desktop {
          width: var(--sidebar-w);
          position: fixed;
          top: 0; left: 0; bottom: 0;
          background: var(--bg-1);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 100;
        }

        /* Mobile top bar */
        .mobile-topbar {
          display: none;
        }

        /* Mobile drawer overlay */
        .mobile-overlay {
          display: none;
        }

        /* Mobile sidebar drawer */
        .sidebar-drawer {
          display: none;
        }

        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }

          .mobile-topbar {
            display: flex;
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 56px;
            background: var(--bg-1);
            border-bottom: 1px solid var(--border);
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            z-index: 200;
          }

          .mobile-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(4px);
            z-index: 300;
          }

          .sidebar-drawer {
            position: fixed;
            top: 0; left: 0; bottom: 0;
            width: 280px;
            background: var(--bg-1);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            z-index: 400;
            overflow-y: auto;
          }

          .sidebar-close-btn {
            display: flex !important;
          }
        }
      `}</style>

      {/* Desktop sidebar */}
      <aside className="sidebar-desktop">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'var(--bg-3)', border: '1px solid var(--border)',
            color: 'var(--text)', borderRadius: 9,
            width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, cursor: 'pointer',
          }}
        >
          <i className="fa-solid fa-bars" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg, var(--accent), #9b6cff)',
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="fa-solid fa-bolt" style={{ color: '#fff', fontSize: 12 }} />
          </div>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>
            PulseCRM
          </span>
        </div>

        <div style={{ width: 38 }} />
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="mobile-overlay" onClick={() => setOpen(false)} />
          <aside className="sidebar-drawer">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
