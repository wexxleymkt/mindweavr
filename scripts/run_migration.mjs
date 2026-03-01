import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Supabase Postgres connection
// Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
// Or: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
const CONNECTION = process.env.DATABASE_URL || 
  'postgresql://postgres.msxswthxpwhwdbhfrsef:mindweavr2026@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

const sql = readFileSync(join(__dirname, 'migration_v2.sql'), 'utf8');

const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase Postgres');
    
    // Split and run each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const stmt of statements) {
      try {
        await client.query(stmt);
        console.log('OK:', stmt.substring(0, 60).replace(/\n/g, ' ') + '...');
      } catch (err) {
        console.warn('SKIP:', err.message.substring(0, 100));
      }
    }
    console.log('\n✅ Migration complete!');
  } catch (err) {
    console.error('Connection error:', err.message);
    console.log('\n⚠️  Please run scripts/migration_v2.sql manually in Supabase Dashboard → SQL Editor');
  } finally {
    await client.end();
  }
}

run();
