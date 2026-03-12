import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''
  const contactId = searchParams.get('contact_id') || ''

  let query = supabase
    .from('leads')
    .select('*, contacts(id, first_name, last_name, email, company)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (contactId) query = query.eq('contact_id', contactId)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count })
}

export async function POST(request) {
  const supabase = createServerClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('leads')
    .insert([body])
    .select('*, contacts(id, first_name, last_name, company)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from('activities').insert([{
    type: 'lead_created',
    description: `Lead "${body.title}" created`,
    entity_type: 'lead',
    entity_id: data.id,
    metadata: { status: body.status, value: body.value },
  }])

  return NextResponse.json(data, { status: 201 })
}
