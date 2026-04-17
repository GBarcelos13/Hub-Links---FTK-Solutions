// Supabase Edge Function: Stripe Customer Portal
// Deploy: supabase functions deploy stripe-portal

// @ts-expect-error — Deno runtime
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-expect-error — esm.sh
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
// @ts-expect-error — esm.sh
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

// @ts-expect-error — Deno global
const env = (k: string) => Deno.env.get(k) ?? '';

serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);
  if (req.method === 'OPTIONS') return new Response('ok', { headers });

  const stripe = new Stripe(env('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing Authorization' }, 401, headers);

    const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401, headers);

    const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));
    const { data: profile } = await admin
      .from('profiles').select('stripe_customer_id').eq('id', user.id).maybeSingle();

    if (!profile?.stripe_customer_id) {
      return json({ error: 'No Stripe customer for this user' }, 400, headers);
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${env('APP_URL')}/billing`,
    });

    return json({ url: portal.url }, 200, headers);
  } catch (err) {
    console.error('[stripe-portal] error:', err);
    return json({ error: 'Internal server error' }, 500, headers);
  }
});

function json(body: unknown, status = 200, hdrs: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...hdrs, 'Content-Type': 'application/json' },
  });
}
