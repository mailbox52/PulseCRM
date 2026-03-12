import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('contacts')
    .select('*, leads(*), deals(*), tasks(*), emails(*)')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request, { params }) {
  const supabase = createServerClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('contacts')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(request, { params }) {
  const supabase = createServerClient()
  const { error } = await supabase.from('contacts').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
