import './../../src/styles/globals.css'
import { Toaster } from 'react-hot-toast'
import Sidebar from '@/components/layout/Sidebar'

export const metadata = {
  title: 'CRM',
  description: 'Modern CRM built with Next.js and Supabase',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{
            flex: 1,
            marginLeft: 'var(--sidebar-w)',
            padding: '32px',
            minHeight: '100vh',
            background: 'var(--bg)',
            overflowY: 'auto',
          }}>
            {children}
          </main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
            },
            success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg)' } },
            error: { iconTheme: { primary: 'var(--red)', secondary: 'var(--bg)' } },
          }}
        />
      </body>
    </html>
  )
}
