import fs from 'fs';
const envText = fs.readFileSync('/home/z/my-project/.env.local', 'utf-8');
const env = Object.fromEntries(
  envText.split('\n').filter(Boolean).map((l) => l.split('='))
);
const url = env.NEXT_PUBLIC_SUPABASE_URL.trim();
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim();

const res = await fetch(`${url}/rest/v1/products?select=*`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const data = await res.json();
console.log(`Total products: ${data.length}`);
console.log('Columns available:', data.length > 0 ? Object.keys(data[0]).join(', ') : 'N/A');
console.log('---');
data.forEach((p, i) => {
  console.log(`#${i + 1}: ${p.name} — ${p.price} FCFA — cat: ${p.category} — img: ${p.image_url?.slice(0, 60) ?? 'none'}...`);
});
