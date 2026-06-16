// Quick smoke test — fetch products directly from Supabase REST API
import fs from 'fs';

const envText = fs.readFileSync('/home/z/my-project/.env.local', 'utf-8');
const env = Object.fromEntries(
  envText.split('\n').filter(Boolean).map((line) => line.split('='))
);

const url = env.NEXT_PUBLIC_SUPABASE_URL.trim();
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim();

console.log('URL:', url);
console.log('Key (first 20 chars):', key.slice(0, 20) + '...');

try {
  const res = await fetch(`${url}/rest/v1/products?select=*`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  console.log('HTTP status:', res.status);
  const text = await res.text();
  console.log('Body (first 800 chars):');
  console.log(text.slice(0, 800));
} catch (e) {
  console.error('Network error:', e.message);
}
