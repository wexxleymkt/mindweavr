const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlweXp0cGVnaXdkb2Nna2pqYXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTI5NTksImV4cCI6MjA4Njg2ODk1OX0.Cljt0VqZutxALzKz5Wwmkm7MzsjlKaHJGVwKPHrwtqo';
const PROJECT = 'ypyztpegiwdocgkjjaua';

// Check what tables exist
const r1 = await fetch(`https://${PROJECT}.supabase.co/rest/v1/rpc/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` },
  body: JSON.stringify({ query: "SELECT tablename FROM pg_tables WHERE schemaname='public'" })
});
console.log('rpc/query status:', r1.status, await r1.text());
