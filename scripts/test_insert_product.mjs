// Test the exact insert that VendorAddProduct does
import fs from 'fs';

const envText = fs.readFileSync('/home/z/my-project/.env.local', 'utf-8');
const env = Object.fromEntries(
  envText.split('\n').filter(Boolean).map((l) => l.split('='))
);
const url = env.NEXT_PUBLIC_SUPABASE_URL.trim();
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim();

const TEST_PRODUCT = {
  name: '[TEST AUTO] Casque Audio Bluetooth',
  description: 'Produit de test inséré via script de validation Supabase',
  price: 25000,
  image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
  category: 'Accessoires',
  store_id: 'a1b2c3d4-1234-5678-9101-e11213141516',
};

console.log('Inserting test product...');
const res = await fetch(`${url}/rest/v1/products`, {
  method: 'POST',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  },
  body: JSON.stringify(TEST_PRODUCT),
});

console.log('HTTP status:', res.status);
const text = await res.text();
console.log('Response:', text.slice(0, 500));

// If success, list all products to confirm
if (res.ok) {
  console.log('\n--- All products in table now ---');
  const listRes = await fetch(`${url}/rest/v1/products?select=id,name,price,category`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const list = await listRes.json();
  list.forEach((p, i) => console.log(`#${i + 1}: ${p.name} — ${p.price} FCFA — cat: ${p.category}`));
}
