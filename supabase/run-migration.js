const fs = require('fs');
const path = require('path');

// Load .env.local
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0 && !line.startsWith('#') && line.trim()) {
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim();
    env[k] = v;
  }
});

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_KEY  = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const migrationFile = process.argv[2] || '0006_payment_system.sql';
const sql = fs.readFileSync(
  path.join(__dirname, 'migrations', path.basename(migrationFile)),
  'utf8'
);

// Extract project ref from URL: https://abc123.supabase.co -> abc123
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

async function run() {
  console.log('Running migration on project:', projectRef);

  // Try Supabase Management API SQL endpoint
  const mgmtUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

  // Try direct SQL via REST admin endpoint
  const restSqlUrl = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;

  // Fall back to individual table creation via REST
  // Split SQL into individual statements
  const statements = sql
    .split(/;\s*(?:\r?\n|$)/)
    .map(s => s.trim())
    .filter(s => s.length > 3 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to run`);

  let success = 0;
  let skipped = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    
    try {
      const res = await fetch(restSqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ sql: stmt }),
      });
      
      const text = await res.text();
      
      if (res.ok) {
        success++;
        process.stdout.write('.');
      } else if (
        text.includes('already exists') ||
        text.includes('PGRST202') ||
        text.includes('duplicate')
      ) {
        skipped++;
        process.stdout.write('s');
      } else {
        skipped++;
        process.stdout.write('w');
      }
    } catch (e) {
      skipped++;
      process.stdout.write('e');
    }
  }

  console.log(`\n\nDone: ${success} executed, ${skipped} skipped/warned`);
  console.log('\nIMPORTANT: If exec_sql RPC is not available, run the migration manually:');
  console.log(`Dashboard: ${SUPABASE_URL.replace('.supabase.co', '').replace('https://', 'https://supabase.com/dashboard/project/')}/sql/new`);
  console.log(`\nSQL file: supabase/migrations/${path.basename(migrationFile)}`);
}

run().catch(e => {
  console.error('Error:', e.message);
  console.log('Run migration manually in Supabase SQL Editor');
});
