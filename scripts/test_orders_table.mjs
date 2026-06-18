// Probe Supabase 'orders' table — schema and existing rows
import fs from 'fs';

const envText = fs.readFileSync('/home/z/my-project/.env.local', 'utf-8');
const env = Object.fromEntries(
  envText.split('\n').filter(Boolean).map((l) => l.split('='))
);
const url = env.NEXT_PUBLIC_SUPABASE_URL.trim();
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim();

console.log('--- GET /rest/v1/orders?select=* ---');
const res = await fetch(`${url}/rest/v1/orders?select=*`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
console.log('HTTP status:', res.status);
const text = await res.text();
console.log('Body (first 800 chars):');
console.log(text.slice(0, 800));

console.log('\n--- POST a test order to confirm schema ---');
const testOrder = {
  product_id: '1a729389-2c74-48bf-a7a7-f714cfa8a2b0', // iPhone 13 Pro (existing product id)
  store_id: 'a1b2c3d4-1234-5678-9101-e11213141516',
  client_phone: '2250700000000',
  delivery_zone: 'Cocody',
  total_amount: 451500, // 450000 + 1500
  status: 'paid',
  escrow_status: 'held',
  payment_method: 'wave',
};

const postRes = await fetch(`${url}/rest/v1/orders`, {
  method: 'POST',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  },
  body: JSON.stringify(testOrder),
});
console.log('POST HTTP status:', postRes.status);
const postText = await postRes.text();
console.log('POST body:');
console.log(postText.slice(0, 600));

console.log('\n--- GET all orders after insert ---');
const listRes = await fetch(`${url}/rest/v1/orders?select=*`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const list = await listRes.json();
console.log(`Total orders: ${list.length}`);
if (list.length > 0) {
  console.log('Columns:', Object.keys(list[0]).join(', '));
  list.forEach((o, i) =>
    console.log(
      `#${i + 1}: id=${o.id} product_id=${o.product_id?.slice(0, 8)}... total=${o.total_amount} status=${o.status} escrow=${o.escrow_status} pay=${o.payment_method}`,
    ),
  );
}
