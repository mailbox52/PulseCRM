import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('deals')
    .select('*, contacts(*), tasks(*), emails(*)')
    .eq('id', params.id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request, { params }) {
  const supabase = createServerClient()
  const body = await request.json()

  // If stage changed, log it
  const prev = await supabase.from('deals').select('stage').eq('id', params.id).single()

  const { data, error } = await supabase
    .from('deals')
    .update(body)
    .eq('id', params.id)
    .select('*, contacts(id, first_name, last_name, email, company)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (body.stage && prev.data?.stage !== body.stage) {
    await supabase.from('activities').insert([{
      type: 'deal_stage_changed',
      description: `Deal moved from ${prev.data.stage} to ${body.stage}`,
      entity_type: 'deal',
      entity_id: params.id,
      metadata: { from: prev.data.stage, to: body.stage },
    }])
  }

  return NextResponse.json(data)
}

export async function DELETE(request, { params }) {
  const supabase = createServerClient()
  const { error } = await supabase.from('deals').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
