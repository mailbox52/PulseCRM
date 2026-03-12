# PulseCRM — Next.js + Supabase CRM

A full-featured, production-ready CRM built with **Next.js 14**, **Supabase (PostgreSQL)**, and deployed on **Vercel**.

## Features

- **Contacts & Leads** — manage your full contact database with search, filters, and detail views
- **Deals / Pipeline** — drag-and-drop Kanban board with 6 stages
- **Tasks & Activities** — create, assign, and complete tasks with priority and due dates
- **Email Integration** — compose and track emails via [Resend](https://resend.com)
- **Analytics** — charts for revenue trends, pipeline breakdown, win rate, and task stats
- **Activity Log** — automatic audit trail of all CRM actions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (optional) |
| Email | Resend API |
| Charts | Recharts |
| Hosting | Vercel |

---

## Project Structure

```
crm/
├── src/
│   ├── app/
│   │   ├── page.js                    # Dashboard
│   │   ├── layout.js                  # Root layout + sidebar
│   │   ├── contacts/
│   │   │   ├── page.js                # Contacts list
│   │   │   └── [id]/page.js           # Contact detail
│   │   ├── leads/page.js              # Leads
│   │   ├── pipeline/page.js           # Kanban pipeline
│   │   ├── tasks/page.js              # Tasks
│   │   ├── emails/page.js             # Email compose + history
│   │   ├── analytics/page.js          # Analytics charts
│   │   └── api/
│   │       ├── contacts/route.js
│   │       ├── contacts/[id]/route.js
│   │       ├── leads/route.js
│   │       ├── deals/route.js
│   │       ├── deals/[id]/route.js
│   │       ├── tasks/route.js
│   │       ├── tasks/[id]/route.js
│   │       ├── emails/route.js
│   │       └── analytics/route.js
│   ├── components/
│   │   ├── layout/Sidebar.js
│   │   └── ui/index.js                # Card, Button, Modal, Badge, Avatar, etc.
│   ├── lib/
│   │   ├── supabase.js                # Client + server Supabase clients
│   │   └── utils.js                  # Helpers, constants
│   └── styles/globals.css
├── supabase/
│   └── schema.sql                     # Full DB schema + seed data
├── .env.local.example
├── vercel.json
└── package.json
```

---

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **Anon Key** from Settings → API
3. Also copy the **Service Role Key** (keep this secret!)

### 2. Run the Database Schema

In your Supabase dashboard, go to **SQL Editor** and run the contents of `supabase/schema.sql`.

This creates all tables, indexes, RLS policies, and seeds sample data.

### 3. Install & Configure Locally

```bash
# Clone and install
npm install

# Copy env file
cp .env.local.example .env.local

# Fill in your values:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4. Run Dev Server

```bash
npm run dev
# → http://localhost:3000
```

---

## Email Integration (Optional)

This CRM uses [Resend](https://resend.com) for transactional email.

1. Sign up at [resend.com](https://resend.com) — free tier is 3,000 emails/month
2. Create an API key
3. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_...
   EMAIL_FROM=crm@yourdomain.com
   ```
4. Verify your domain in Resend (or use `onboarding@resend.dev` for testing)

Without `RESEND_API_KEY`, emails are logged to Supabase but not sent.

---

## Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel

# Set env vars:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY  # optional

# Deploy to production:
vercel --prod
```

### Option B: GitHub + Vercel Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repository
3. Add environment variables in the Vercel dashboard
4. Deploy

---

## Adding Authentication

This CRM currently has no auth (designed for internal team use). To add Supabase Auth:

1. Enable auth providers in Supabase Dashboard → Authentication
2. Wrap your layout with a session check using `@supabase/ssr`
3. The RLS policies in `schema.sql` already use `authenticated` role

See [Supabase Auth docs](https://supabase.com/docs/guides/auth/server-side/nextjs) for Next.js setup.

---

## Customization

| What | Where |
|------|-------|
| Colors / theme | `src/styles/globals.css` CSS variables |
| Deal stages | `src/lib/utils.js` → `DEAL_STAGES` |
| Navigation | `src/components/layout/Sidebar.js` |
| Email template | `src/app/api/emails/route.js` |
| Seed data | `supabase/schema.sql` bottom section |

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List contacts (search, filter, paginate) |
| POST | `/api/contacts` | Create contact |
| GET | `/api/contacts/:id` | Get contact + related data |
| PATCH | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Delete contact |
| GET | `/api/leads` | List leads |
| POST | `/api/leads` | Create lead |
| GET | `/api/deals` | List deals (filter by stage) |
| POST | `/api/deals` | Create deal |
| PATCH | `/api/deals/:id` | Update deal (incl. stage change) |
| GET | `/api/tasks` | List tasks (filter by status) |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update/complete task |
| GET | `/api/emails` | List emails |
| POST | `/api/emails` | Send email |
| GET | `/api/analytics` | Full analytics summary |
