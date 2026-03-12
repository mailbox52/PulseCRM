import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const contactId = searchParams.get('contact_id') || ''

  let query = supabase
    .from('emails')
    .select('*, contacts(id, first_name, last_name, email)')
    .order('sent_at', { ascending: false })

  if (contactId) query = query.eq('contact_id', contactId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request) {
  const supabase = createServerClient()
  const body = await request.json()
  const { contact_id, deal_id, subject, body: emailBody, to_email } = body

  let resendId = null
  let status = 'sent'

  // Send via Resend if API key is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'CRM <onboarding@resend.dev>',
          to: [to_email],
          subject,
          html: emailBody.replace(/\n/g, '<br>'),
        }),
      })
      const result = await response.json()
      if (response.ok) {
        resendId = result.id
        status = 'sent'
      } else {
        status = 'failed'
      }
    } catch (err) {
      status = 'failed'
    }
  }

  const { data, error } = await supabase
    .from('emails')
    .insert([{
      contact_id,
      deal_id,
      subject,
      body: emailBody,
      direction: 'outbound',
      status,
      to_email,
      from_email: process.env.EMAIL_FROM,
      resend_id: resendId,
      sent_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (contact_id) {
    await supabase.from('activities').insert([{
      type: 'email_sent',
      description: `Email sent: "${subject}"`,
      entity_type: 'email',
      entity_id: data.id,
      metadata: { to_email, subject, status },
    }])
  }

  return NextResponse.json(data, { status: 201 })
}
