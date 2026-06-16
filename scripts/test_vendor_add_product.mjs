// Simulates exactly what VendorAddProduct.handleSubmit does — insert a test product
// into Supabase via the JS client, then list products to confirm.
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envText = fs.readFileSync('/home/z/my-project/.env.local', 'utf-8');
const env = Object.fromEntries(
  envText.split('\n').filter(Boolean).map((l) => l.split('='))
);
const url = env.NEXT_PUBLIC_SUPABASE_URL.trim();
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim();

const supabase = createClient(url, key);

const STORE_ID = 'a1b2c3d4-1234-5678-9101-e11213141516';

async function main() {
  console.log('--- Before insert ---');
  const before = await supabase.from('products').select('*');
  console.log(`Products count: ${before.data.length}`);
  before.data.forEach((p, i) =>
    console.log(`  #${i + 1}: ${p.name} — ${p.price} FCFA — ${p.category}`)
  );

  console.log('\n--- Inserting test product ---');
  const newProduct = {
    name: 'Sac à Dos Urbain Test',
    description: 'Sac à dos robuste testé via Supabase. Parfait pour usage quotidien.',
    price: 12000,
    image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop',
    category: 'Mode',
    store_id: STORE_ID,
  };
  console.log('Payload:', newProduct);

  const { data, error } = await supabase
    .from('products')
    .insert([newProduct])
    .select();

  if (error) {
    console.error('INSERT ERROR:', error.message);
    console.error('Code:', error.code);
    console.error('Details:', error.details);
    process.exit(1);
  }
  console.log('\nInsert OK. Returned row:');
  console.log(data[0]);

  console.log('\n--- After insert ---');
  const after = await supabase.from('products').select('*');
  console.log(`Products count: ${after.data.length}`);
  after.data.forEach((p, i) =>
    console.log(`  #${i + 1}: ${p.name} — ${p.price} FCFA — ${p.category}`)
  );
}

main();
