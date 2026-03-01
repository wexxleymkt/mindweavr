import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ hasActive: false, plan: null }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, status')
    .eq('email', email.toLowerCase().trim())
    .eq('status', 'active')
    .single();

  return NextResponse.json({
    hasActive: !!data,
    plan: data?.plan ?? null,
  });
}
