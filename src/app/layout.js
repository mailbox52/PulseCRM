import './../../src/styles/globals.css'
import { Toaster } from 'react-hot-toast'
import Sidebar from '@/components/layout/Sidebar'

export const metadata = {
  title: 'PulseCRM',
  description: 'Modern CRM built with Next.js and Supabase',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <style>{`
          .main-content {
            flex: 1;
            margin-left: var(--sidebar-w);
            padding: 32px 36px;
            min-height: 100vh;
            background: var(--bg);
            overflow-x: hidden;
          }
          @media (max-width: 768px) {
            .main-content {
              margin-left: 0;
              padding: 80px 16px 24px;
            }
          }
        `}</style>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-2)',
              color: 'var(--text)',
              border: '1px solid var(--border-light)',
              fontSize: '13.5px',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg)' } },
            error:   { iconTheme: { primary: 'var(--red)',   secondary: 'var(--bg)' } },
          }}
        />
      </body>
    </html>
  )
}
