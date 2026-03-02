import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// URL correta do webhook na Perfect Pay: https://mindweavr.app/api/webhook/perfectpay
// (não usar /api/we ou /api/web — deve ser o caminho completo acima)

// ─── Formato Perfect Pay (documentação oficial) ─────────────────────────────
// - customer.email, plan.code, product.code, code (id da venda), sale_amount
// - sale_status_enum: 2 = approved, 8 = authorized, 10 = completed => ativo
//                    6 = cancelled, 7 = refunded, 9 = charged_back => revogado

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

// sale_status_enum (Perfect Pay): 2 = approved, 8 = authorized, 10 = completed
const ACTIVE_STATUS_ENUMS = [2, 8, 10];
// 6 = cancelled, 7 = refunded, 9 = charged_back
const REVOKED_STATUS_ENUMS = [6, 7, 9];

function getPayloadString(obj: unknown, key: string): string {
  if (!obj || typeof obj !== 'object') return '';
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === 'string' ? v.trim() : String(v ?? '').trim();
}

function getPayloadNumber(obj: unknown, key: string): number {
  if (!obj || typeof obj !== 'object') return 0;
  const v = (obj as Record<string, unknown>)[key];
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string') return parseInt(v, 10) || 0;
  return 0;
}

export async function POST(req: NextRequest) {
  let rawPayload: Record<string, unknown> = {};

  try {
    rawPayload = await req.json();
  } catch {
    try {
      const text = await req.text();
      rawPayload = Object.fromEntries(new URLSearchParams(text)) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }
  }

  // ─── Extração no formato Perfect Pay (campos aninhados) ───────────────────
  const customer = (rawPayload.customer as Record<string, unknown>) ?? {};
  const planObj = (rawPayload.plan as Record<string, unknown>) ?? {};
  const productObj = (rawPayload.product as Record<string, unknown>) ?? {};

  const buyerEmail = getPayloadString(customer, 'email').toLowerCase();
  const planCode = getPayloadString(planObj, 'code').toUpperCase();
  const productCode = getPayloadString(productObj, 'code');
  const saleId = getPayloadString(rawPayload, 'code') || getPayloadString(rawPayload, 'sale_id') || getPayloadString(rawPayload, 'id');
  const saleStatusEnum = getPayloadNumber(rawPayload, 'sale_status_enum');
  const saleStatusDetail = getPayloadString(rawPayload, 'sale_status_detail');
  const buyerName = getPayloadString(customer, 'full_name');
  const buyerPhone = [
    getPayloadString(customer, 'phone_area_code'),
    getPayloadString(customer, 'phone_number'),
  ].filter(Boolean).join('').replace(/\D/g, '');
  const amount = Number(rawPayload.sale_amount ?? rawPayload.amount ?? rawPayload.sale_amount ?? 0) || getPayloadNumber(rawPayload, 'sale_amount');

  // Fallback: se ainda vier em formato “flat” (ex: integração antiga)
  const email = buyerEmail || getPayloadString(rawPayload, 'buyer_email').toLowerCase() || getPayloadString(rawPayload, 'customer_email').toLowerCase() || getPayloadString(rawPayload, 'email').toLowerCase();
  const code = planCode || getPayloadString(rawPayload, 'plan_code').toUpperCase() || getPayloadString((rawPayload.plan as Record<string, unknown>) ?? {}, 'code').toUpperCase();

  // ─── Log do evento (para debug) ───────────────────────────────────────────
  const { data: eventRow } = await supabaseAdmin
    .from('webhook_events')
    .insert({
      sale_id: saleId,
      sale_status: String(saleStatusEnum) + (saleStatusDetail ? ` ${saleStatusDetail}` : ''),
      plan_code: code,
      buyer_email: email,
      raw_payload: rawPayload,
    })
    .select('id')
    .single();

  const eventId = eventRow?.id;

  if (!email) {
    await markEventError(eventId, 'Missing customer.email (or buyer_email)');
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }
  if (!code) {
    await markEventError(eventId, 'Missing plan.code (or plan_code)');
    return NextResponse.json({ error: 'Missing plan code' }, { status: 400 });
  }

  let plan = PLAN_BY_CODE[code];
  if (!plan) {
    plan = 'essencial';
    await markEventError(eventId, `Unknown plan_code: ${code} — defaulted to essencial`);
  }

  // ─── Status: Perfect Pay usa sale_status_enum (número) ────────────────────
  const isActive = ACTIVE_STATUS_ENUMS.includes(saleStatusEnum);
  const isRevoked = REVOKED_STATUS_ENUMS.includes(saleStatusEnum);

  if (isActive) {
    const { error: subErr } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        email: email,
        plan,
        plan_code: code,
        product_code: productCode || null,
        sale_id: saleId || null,
        status: 'active',
        buyer_name: buyerName || null,
        buyer_phone: buyerPhone || null,
        amount: Number.isFinite(amount) ? amount : null,
        activated_at: new Date().toISOString(),
        cancelled_at: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (subErr) {
      await markEventError(eventId, `Subscription upsert: ${subErr.message}`);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    await syncProfilePlan(email, plan);
  } else if (isRevoked) {
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('email', email);

    // Sem plano ativo: perfil volta a "none" (após migration) ou mantém; não falha se constraint não tiver 'none'
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update({ plan: 'none', credits: 0, plan_credits_limit: 0, updated_at: new Date().toISOString() })
      .eq('email', email);
    if (profileErr) {
      // Fallback: downgrade para essencial com 0 créditos se a tabela ainda não permitir 'none'
      await supabaseAdmin
        .from('profiles')
        .update({ plan: 'essencial', credits: 0, plan_credits_limit: 0, updated_at: new Date().toISOString() })
        .eq('email', email);
    }
  }

  if (eventId) {
    await supabaseAdmin
      .from('webhook_events')
      .update({ processed: true })
      .eq('id', eventId);
  }

  return NextResponse.json({ ok: true, plan, sale_status_enum: saleStatusEnum });
}

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

async function markEventError(eventId: string | undefined, msg: string) {
  if (!eventId) return;
  await supabaseAdmin
    .from('webhook_events')
    .update({ processed: true, error_message: msg })
    .eq('id', eventId);
}

export async function GET() {
  return NextResponse.json({ status: 'MindWeavr webhook active' });
}
