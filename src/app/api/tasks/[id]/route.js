import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PATCH(request, { params }) {
  const supabase = createServerClient()
  const body = await request.json()

  // Auto-set completed_at when marking complete
  if (body.status === 'completed' && !body.completed_at) {
    body.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(body)
    .eq('id', params.id)
    .select('*, contacts(id, first_name, last_name), deals(id, title)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(request, { params }) {
  const supabase = createServerClient()
  const { error } = await supabase.from('tasks').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
