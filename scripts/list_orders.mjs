import fs from 'fs';
const envText = fs.readFileSync('/home/z/my-project/.env.local', 'utf-8');
const env = Object.fromEntries(envText.split('\n').filter(Boolean).map((l) => l.split('=')));
const url = env.NEXT_PUBLIC_SUPABASE_URL.trim();
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim();
const res = await fetch(`${url}/rest/v1/orders?select=*`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const list = await res.json();
console.log(`Total orders: ${list.length}`);
list.forEach((o, i) => console.log(`#${i + 1}: id=${o.id.slice(0, 8)} product=${o.product_id?.slice(0, 8)} store=${o.store_id?.slice(0, 8)} zone=${o.delivery_zone} total=${o.total_amount} status=${o.status} escrow=${o.escrow_status} pay=${o.payment_method}`));
