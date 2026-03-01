import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://msxswthxpwhwdbhfrsef.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeHN3dGh4cHdod2RiaGZyc2VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA2NDg4MywiZXhwIjoyMDg3NjQwODgzfQ.QDvIMGckI4C-2bUpyyYhU8_vutK1krJtIAh5TB_raMQ';

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const EMAIL    = 'suporte.euwesleysilvaa@gmail.com';
const PASSWORD = 'Android0-';

async function main() {
  console.log('\n👤  Criando usuário:', EMAIL);

  // 1. Create user with email_confirm = true (auto-verified)
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,       // already verified — no email needed
    user_metadata: {
      full_name: 'Wesley Silva',
    },
  });

  if (createErr) {
    // If already exists, fetch and update instead
    if (createErr.message?.includes('already been registered') || createErr.message?.includes('already exists')) {
      console.log('  ℹ️  Usuário já existe — buscando...');
      const { data: list } = await admin.auth.admin.listUsers();
      const existing = list?.users?.find(u => u.email === EMAIL);
      if (existing) {
        // Confirm email if not confirmed
        if (!existing.email_confirmed_at) {
          const { error: updateErr } = await admin.auth.admin.updateUserById(existing.id, {
            email_confirm: true,
            password: PASSWORD,
          });
          if (updateErr) console.log('  ⚠️  Update error:', updateErr.message);
          else console.log('  ✅  Email verificado e senha atualizada');
        } else {
          console.log('  ✅  Usuário já verificado');
        }

        // Ensure profile exists
        await ensureProfile(existing.id, EMAIL);
      }
      return;
    }
    console.error('  ❌  Erro ao criar:', createErr.message);
    return;
  }

  const user = created.user;
  console.log('  ✅  Usuário criado:', user.id);
  console.log('  ✅  Email verificado:', user.email_confirmed_at ? 'Sim' : 'Não');

  // 2. Ensure profile exists in public.profiles
  await ensureProfile(user.id, EMAIL);
}

async function ensureProfile(userId, email) {
  console.log('\n  📋  Verificando profile no banco...');

  const { data: existing } = await admin
    .from('profiles')
    .select('id, email, plan, credits')
    .eq('id', userId)
    .single();

  if (existing) {
    console.log('  ✅  Profile já existe:');
    console.log(`      email:   ${existing.email}`);
    console.log(`      plano:   ${existing.plan}`);
    console.log(`      créditos: ${existing.credits}`);
    return;
  }

  // Insert manually (trigger should have done this, but just in case)
  const { error: insertErr } = await admin.from('profiles').insert({
    id:                 userId,
    email:              email,
    full_name:          'Wesley Silva',
    plan:               'free',
    credits:            10,
    plan_credits_limit: 10,
    credits_reset_at:   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  if (insertErr) {
    console.log('  ⚠️  Profile insert error:', insertErr.message);
  } else {
    console.log('  ✅  Profile criado no banco');
  }

  // Final verification
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profile) {
    console.log('\n  📊  Profile final:');
    console.log(`      id:      ${profile.id}`);
    console.log(`      email:   ${profile.email}`);
    console.log(`      nome:    ${profile.full_name}`);
    console.log(`      plano:   ${profile.plan}`);
    console.log(`      créditos: ${profile.credits}`);
  }

  console.log('\n  🎉  Pronto! Usuário pode fazer login em http://localhost:3000/login\n');
}

main().catch(console.error);
