import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  let query = supabase
    .from('contacts')
    .select('*, leads(count), deals(count)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
  }
  if (status) query = query.eq('status', status)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count, page, limit })
}

export async function POST(request) {
  const supabase = createServerClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('contacts')
    .insert([body])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Log activity
  await supabase.from('activities').insert([{
    type: 'contact_created',
    description: `Contact ${body.first_name} ${body.last_name} created`,
    entity_type: 'contact',
    entity_id: data.id,
  }])

  return NextResponse.json(data, { status: 201 })
}
