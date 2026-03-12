'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, TrendingUp, Briefcase,
  CheckSquare, Mail, BarChart3, Settings, Zap
} from 'lucide-react'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/leads', label: 'Leads', icon: TrendingUp },
  { href: '/pipeline', label: 'Pipeline', icon: Briefcase },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/emails', label: 'Emails', icon: Mail },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      background: 'var(--bg-1)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={16} color="#fff" fill="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>
              PulseCRM
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Workspace</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 8,
                color: active ? 'var(--accent-2)' : 'var(--text-2)',
                background: active ? 'var(--accent-dim)' : 'transparent',
                fontWeight: active ? 500 : 400,
                fontSize: 13.5,
                transition: 'all 0.15s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.background = 'var(--bg-2)'
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 10px', borderTop: '1px solid var(--border)' }}>
        <Link
          href="/settings"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', borderRadius: 8,
            color: 'var(--text-3)', fontSize: 13.5,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'var(--bg-2)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' }}
        >
          <Settings size={15} />
          Settings
        </Link>
      </div>
    </aside>
  )
}
