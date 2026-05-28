const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hnxlfxbclhulkhqaucmf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGxmeGJjbGh1bGtocWF1Y21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDI1MjksImV4cCI6MjA5NTMxODUyOX0.KcJ2_7--i4IoiLK1-4spAsYZCTBw7uKv9bdB9-vU56g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, price, type, status, export_status, created_at');
  
  if (error) {
    console.error('Error fetching products:', error);
  } else {
    console.log('Success! Products fetched:', data);
  }
}

test();
