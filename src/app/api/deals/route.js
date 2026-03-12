import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const stage = searchParams.get('stage') || ''
  const contactId = searchParams.get('contact_id') || ''

  let query = supabase
    .from('deals')
    .select('*, contacts(id, first_name, last_name, email, company, avatar_url)')
    .order('created_at', { ascending: false })

  if (stage) query = query.eq('stage', stage)
  if (contactId) query = query.eq('contact_id', contactId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request) {
  const supabase = createServerClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('deals')
    .insert([body])
    .select('*, contacts(id, first_name, last_name, email, company)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from('activities').insert([{
    type: 'deal_created',
    description: `Deal "${body.title}" created — ${body.stage}`,
    entity_type: 'deal',
    entity_id: data.id,
    metadata: { value: body.value, stage: body.stage },
  }])

  return NextResponse.json(data, { status: 201 })
}
