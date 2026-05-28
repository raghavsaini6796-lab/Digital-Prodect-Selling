// Use global fetch

async function inspectSchema() {
  const url = 'https://hnxlfxbclhulkhqaucmf.supabase.co/rest/v1/';
  const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGxmeGJjbGh1bGtocWF1Y21mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc0MjUyOSwiZXhwIjoyMDk1MzE4NTI5fQ.EotYfRtVYPzUdct_FjgL1CNWwqafmb9fKNgc-BAKk1w',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGxmeGJjbGh1bGtocWF1Y21mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc0MjUyOSwiZXhwIjoyMDk1MzE4NTI5fQ.EotYfRtVYPzUdct_FjgL1CNWwqafmb9fKNgc-BAKk1w'
  };

  try {
    const res = await fetch(url, { headers });
    const schema = await res.json();
    console.log('Schema keys:', Object.keys(schema));
    if (schema.definitions) {
      const productsDef = schema.definitions.products;
      console.log('Products columns in DB:', Object.keys(productsDef.properties));
    } else {
      console.log('No definitions. Schema:', JSON.stringify(schema).slice(0, 1000));
    }
  } catch (err) {
    console.error('Error fetching schema:', err);
  }
}

inspectSchema();
