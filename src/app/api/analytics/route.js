import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServerClient()

  const [
    contactsResult,
    leadsResult,
    dealsResult,
    tasksResult,
    emailsResult,
    recentDealsResult,
    recentContactsResult,
  ] = await Promise.all([
    supabase.from('contacts').select('status', { count: 'exact' }),
    supabase.from('leads').select('status', { count: 'exact' }),
    supabase.from('deals').select('stage, value, created_at'),
    supabase.from('tasks').select('status, priority'),
    supabase.from('emails').select('status, direction', { count: 'exact' }),
    supabase.from('deals')
      .select('id, title, value, stage, created_at, contacts(first_name, last_name, company)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('contacts')
      .select('id, first_name, last_name, company, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const deals = dealsResult.data || []
  const tasks = tasksResult.data || []
  const contacts = contactsResult.data || []

  // Pipeline metrics
  const pipelineValue = deals
    .filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
    .reduce((sum, d) => sum + Number(d.value), 0)

  const wonValue = deals
    .filter(d => d.stage === 'closed_won')
    .reduce((sum, d) => sum + Number(d.value), 0)

  // Stage breakdown
  const stageBreakdown = deals.reduce((acc, d) => {
    acc[d.stage] = (acc[d.stage] || 0) + 1
    return acc
  }, {})

  // Monthly deals (last 6 months)
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const month = date.toLocaleString('default', { month: 'short' })
    const monthDeals = deals.filter(d => {
      const dDate = new Date(d.created_at)
      return dDate.getMonth() === date.getMonth() &&
             dDate.getFullYear() === date.getFullYear()
    })
    monthlyData.push({
      month,
      deals: monthDeals.length,
      value: monthDeals.reduce((sum, d) => sum + Number(d.value), 0),
    })
  }

  // Contact status breakdown
  const contactStatusBreakdown = contacts.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})

  // Task summary
  const taskSummary = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {})

  return NextResponse.json({
    summary: {
      totalContacts: contactsResult.count || 0,
      totalLeads: leadsResult.count || 0,
      totalDeals: deals.length,
      pipelineValue,
      wonValue,
      totalEmails: emailsResult.count || 0,
      pendingTasks: taskSummary.pending || 0,
      completedTasks: taskSummary.completed || 0,
    },
    stageBreakdown,
    contactStatusBreakdown,
    taskSummary,
    monthlyData,
    recentDeals: recentDealsResult.data || [],
    recentContacts: recentContactsResult.data || [],
  })
}
