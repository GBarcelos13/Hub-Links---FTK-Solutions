// @ts-expect-error — Deno global
const APP_URL = (Deno.env.get('APP_URL') ?? '').replace(/\/$/, '');

const ALLOWED_ORIGINS = [
  APP_URL,
  'http://localhost:5173',
  'http://localhost:8080',
].filter(Boolean);

export function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}
