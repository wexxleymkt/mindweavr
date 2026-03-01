import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// ─── Plan mapping ────────────────────────────────────────────────────────────
const PLAN_BY_CODE: Record<string, 'essencial' | 'creator' | 'pro'> = {
  PPLQQOQSA: 'essencial',
  PPLQQOQSE: 'creator',
  PPLQQOQSC: 'pro',
};

const PLAN_CREDITS: Record<string, number> = {
  essencial: 5,
  creator: 10,
  pro: 999999,
};

// ─── Statuses that mean "subscription is active / paid" ─────────────────────
const ACTIVE_STATUSES  = ['APRO', 'approved', 'complete', 'COMP'];
// Statuses that mean "subscription should be revoked"
const REVOKED_STATUSES = ['CANC', 'cancelled', 'REFU', 'refunded', 'CHAR', 'chargeback'];

export async function POST(req: NextRequest) {
  let rawPayload: Record<string, unknown> = {};

  try {
    // PerfectPay sends JSON
    rawPayload = await req.json();
  } catch {
    // Try form-encoded fallback
    try {
      const text = await req.text();
      rawPayload = Object.fromEntries(new URLSearchParams(text));
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }
  }

  // ─── Log the raw event first ────────────────────────────────────────────
  const { data: eventRow } = await supabaseAdmin
    .from('webhook_events')
    .insert({
      sale_id:     String(rawPayload.sale_id     ?? rawPayload.id ?? ''),
      sale_status: String(rawPayload.sale_status ?? rawPayload.status ?? ''),
      plan_code:   String(rawPayload.plan_code   ?? rawPayload.product_plan_code ?? ''),
      buyer_email: String(rawPayload.buyer_email ?? rawPayload.customer_email ?? rawPayload.email ?? ''),
      raw_payload: rawPayload,
    })
    .select('id')
    .single();

  const eventId = eventRow?.id;

  // ─── Extract fields (PerfectPay sends various field names) ──────────────
  const saleStatus   = String(rawPayload.sale_status ?? rawPayload.status ?? '').toUpperCase();
  const buyerEmail   = String(
    rawPayload.buyer_email ?? rawPayload.customer_email ?? rawPayload.email ?? ''
  ).trim().toLowerCase();
  const planCode     = String(
    rawPayload.plan_code ?? rawPayload.product_plan_code ?? rawPayload.plan ?? ''
  ).trim().toUpperCase();
  const productCode  = String(rawPayload.product_code ?? '').trim();
  const saleId       = String(rawPayload.sale_id ?? rawPayload.id ?? '').trim();
  const buyerName    = String(rawPayload.buyer_name ?? rawPayload.customer_name ?? '').trim();
  const buyerPhone   = String(rawPayload.buyer_phone ?? rawPayload.customer_phone ?? '').replace(/\D/g, '');
  const amount       = Number(rawPayload.amount ?? rawPayload.price ?? 0);

  // ─── Validate required fields ───────────────────────────────────────────
  if (!buyerEmail || !planCode) {
    await markEventError(eventId, 'Missing buyer_email or plan_code');
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const plan = PLAN_BY_CODE[planCode];
  if (!plan) {
    await markEventError(eventId, `Unknown plan_code: ${planCode}`);
    return NextResponse.json({ error: `Unknown plan_code: ${planCode}` }, { status: 400 });
  }

  // ─── Handle status ───────────────────────────────────────────────────────
  const statusUp = saleStatus.toUpperCase();
  const isActive  = ACTIVE_STATUSES.some(s  => statusUp.includes(s.toUpperCase()));
  const isRevoked = REVOKED_STATUSES.some(s => statusUp.includes(s.toUpperCase()));

  if (isActive) {
    // Upsert subscription — active
    const { error: subErr } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        email:          buyerEmail,
        plan,
        plan_code:      planCode,
        product_code:   productCode,
        sale_id:        saleId,
        status:         'active',
        buyer_name:     buyerName,
        buyer_phone:    buyerPhone,
        amount,
        activated_at:   new Date().toISOString(),
        cancelled_at:   null,
        updated_at:     new Date().toISOString(),
      }, { onConflict: 'email' });

    if (subErr) {
      await markEventError(eventId, `Subscription upsert error: ${subErr.message}`);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    // If a user account already exists with this email, sync their profile
    await syncProfilePlan(buyerEmail, plan);

  } else if (isRevoked) {
    // Mark subscription as cancelled
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status:        'cancelled',
        cancelled_at:  new Date().toISOString(),
        updated_at:    new Date().toISOString(),
      })
      .eq('email', buyerEmail);

    // Downgrade user profile if they exist
    await supabaseAdmin
      .from('profiles')
      .update({ plan: 'essencial', updated_at: new Date().toISOString() })
      .eq('email', buyerEmail);
  }
  // Pending / other statuses — just log, do nothing

  // Mark event as processed
  if (eventId) {
    await supabaseAdmin
      .from('webhook_events')
      .update({ processed: true })
      .eq('id', eventId);
  }

  return NextResponse.json({ ok: true, plan, status: saleStatus });
}

// ─── Helper: sync plan to profiles table ────────────────────────────────────
async function syncProfilePlan(email: string, plan: 'essencial' | 'creator' | 'pro') {
  const credits = PLAN_CREDITS[plan];
  await supabaseAdmin
    .from('profiles')
    .update({
      plan,
      credits,
      plan_credits_limit: credits,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email);
}

// ─── Helper: mark event as errored ──────────────────────────────────────────
async function markEventError(eventId: string | undefined, msg: string) {
  if (!eventId) return;
  await supabaseAdmin
    .from('webhook_events')
    .update({ processed: true, error_message: msg })
    .eq('id', eventId);
}

// PerfectPay may send a GET for validation
export async function GET() {
  return NextResponse.json({ status: 'MindWeavr webhook active' });
}
