-- ============================================
-- CRM Database Schema for Supabase (PostgreSQL)
-- Run this in your Supabase SQL editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CONTACTS
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lead')),
  source TEXT CHECK (source IN ('website', 'referral', 'cold_outreach', 'event', 'social', 'other')),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEADS
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted')),
  source TEXT CHECK (source IN ('website', 'referral', 'cold_outreach', 'event', 'social', 'other')),
  notes TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DEALS (Pipeline)
-- ============================================
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  value NUMERIC(12,2) NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'prospecting' CHECK (stage IN (
    'prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
  )),
  probability INTEGER DEFAULT 10 CHECK (probability BETWEEN 0 AND 100),
  expected_close_date DATE,
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS & ACTIVITIES
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'task' CHECK (type IN ('task', 'call', 'email', 'meeting', 'follow_up')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMAILS
-- ============================================
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  from_email TEXT,
  to_email TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  resend_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACTIVITIES LOG (audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'lead', 'deal', 'task', 'email')),
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_leads_contact_id ON leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_tasks_contact_id ON tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_emails_contact_id ON emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all for authenticated" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON deals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON emails FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- SEED DATA (optional - for testing)
-- ============================================
INSERT INTO contacts (first_name, last_name, email, phone, company, job_title, status, source) VALUES
  ('Sarah', 'Chen', 'sarah.chen@techcorp.com', '+1 555-0101', 'TechCorp Inc', 'VP Engineering', 'active', 'referral'),
  ('Marcus', 'Rivera', 'marcus@growthco.io', '+1 555-0102', 'GrowthCo', 'CEO', 'active', 'website'),
  ('Priya', 'Patel', 'priya.patel@ventures.com', '+1 555-0103', 'Patel Ventures', 'Partner', 'lead', 'event'),
  ('James', 'O''Brien', 'james@startupxyz.com', '+1 555-0104', 'StartupXYZ', 'Founder', 'lead', 'cold_outreach'),
  ('Elena', 'Vasquez', 'elena.v@enterprise.net', '+1 555-0105', 'Enterprise Net', 'Director of Ops', 'active', 'social')
ON CONFLICT (email) DO NOTHING;

INSERT INTO deals (title, value, stage, probability, expected_close_date, notes)
SELECT
  'Enterprise Plan - ' || c.company,
  CASE c.company
    WHEN 'TechCorp Inc' THEN 48000
    WHEN 'GrowthCo' THEN 24000
    WHEN 'Enterprise Net' THEN 96000
    ELSE 12000
  END,
  CASE c.company
    WHEN 'TechCorp Inc' THEN 'proposal'
    WHEN 'GrowthCo' THEN 'qualification'
    WHEN 'Enterprise Net' THEN 'negotiation'
    ELSE 'prospecting'
  END,
  CASE c.company
    WHEN 'TechCorp Inc' THEN 60
    WHEN 'GrowthCo' THEN 30
    WHEN 'Enterprise Net' THEN 80
    ELSE 10
  END,
  NOW() + INTERVAL '30 days',
  'Initial discovery call completed'
FROM contacts c
WHERE c.company IN ('TechCorp Inc', 'GrowthCo', 'Enterprise Net')
ON CONFLICT DO NOTHING;
