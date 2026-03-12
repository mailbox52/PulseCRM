import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''
  const priority = searchParams.get('priority') || ''
  const contactId = searchParams.get('contact_id') || ''
  const dealId = searchParams.get('deal_id') || ''
  const dueToday = searchParams.get('due_today') === 'true'

  let query = supabase
    .from('tasks')
    .select('*, contacts(id, first_name, last_name, email, company), deals(id, title)')
    .order('due_date', { ascending: true, nullsLast: true })

  if (status) query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)
  if (contactId) query = query.eq('contact_id', contactId)
  if (dealId) query = query.eq('deal_id', dealId)
  if (dueToday) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    query = query.gte('due_date', today.toISOString()).lt('due_date', tomorrow.toISOString())
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request) {
  const supabase = createServerClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('tasks')
    .insert([body])
    .select('*, contacts(id, first_name, last_name), deals(id, title)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
