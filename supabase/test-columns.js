const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hnxlfxbclhulkhqaucmf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGxmeGJjbGh1bGtocWF1Y21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDI1MjksImV4cCI6MjA5NTMxODUyOX0.KcJ2_7--i4IoiLK1-4spAsYZCTBw7uKv9bdB9-vU56g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'products' });
  
  if (error) {
    // If RPC doesn't exist, let's just query a single row or do a direct check using raw postgrest
    console.log('RPC failed, trying fallback...');
    const { data: rowData, error: rowError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (rowError) {
      console.error('Error fetching fallback:', rowError);
    } else {
      console.log('Columns fetched:', rowData.length > 0 ? Object.keys(rowData[0]) : 'No rows to inspect columns from.');
    }
  } else {
    console.log('Columns:', data);
  }
}

checkColumns();
