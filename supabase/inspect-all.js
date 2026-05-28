const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hnxlfxbclhulkhqaucmf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGxmeGJjbGh1bGtocWF1Y21mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc0MjUyOSwiZXhwIjoyMDk1MzE4NTI5fQ.EotYfRtVYPzUdct_FjgL1CNWwqafmb9fKNgc-BAKk1w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectAllTables() {
  const url = 'https://hnxlfxbclhulkhqaucmf.supabase.co/rest/v1/';
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  };

  try {
    const res = await fetch(url, { headers });
    const schema = await res.json();
    console.log('Tables found in DB:', Object.keys(schema.definitions));
    for (const tableName of Object.keys(schema.definitions)) {
      console.log(`\n--- Table: ${tableName} ---`);
      console.log('Columns:', Object.keys(schema.definitions[tableName].properties));
    }
  } catch (err) {
    console.error('Error fetching schema:', err);
  }
}

inspectAllTables();
