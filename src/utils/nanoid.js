// Tiny nanoid-like ID generator (no dependency needed)
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export function nanoid(size = 8) {
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (const b of bytes) id += alphabet[b % alphabet.length];
  return id;
}
