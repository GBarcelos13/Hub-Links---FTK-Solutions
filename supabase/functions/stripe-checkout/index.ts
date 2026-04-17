// Supabase Edge Function: create Stripe Checkout Session
// Deploy: supabase functions deploy stripe-checkout --no-verify-jwt=false
// Secrets needed: STRIPE_SECRET_KEY, STRIPE_PRICE_PRO, STRIPE_PRICE_TEAM, APP_URL

// @ts-expect-error — Deno runtime imports resolved at deploy time
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-expect-error — esm.sh import resolved at deploy time
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
// @ts-expect-error — esm.sh import resolved at deploy time
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

// @ts-expect-error — Deno global
const env = (k: string) => Deno.env.get(k) ?? '';

serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);
  if (req.method === 'OPTIONS') return new Response('ok', { headers });

  const stripe = new Stripe(env('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' });
  const PRICE_MAP: Record<string, string> = {
    pro:   env('STRIPE_PRICE_PRO'),
    elite: env('STRIPE_PRICE_ELITE'),
  };

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing Authorization' }, 401, headers);

    const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401, headers);

    const { plan } = await req.json();
    const priceId = PRICE_MAP[plan];
    if (!priceId) return json({ error: 'Invalid plan' }, 400, headers);

    // get or create Stripe customer
    const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));
    const { data: profile } = await admin
      .from('profiles').select('stripe_customer_id, email').eq('id', user.id).maybeSingle();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const appUrl = env('APP_URL');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${appUrl}/billing?success=1`,
      cancel_url:  `${appUrl}/billing?canceled=1`,
      metadata: { supabase_user_id: user.id, plan },
      subscription_data: { metadata: { supabase_user_id: user.id, plan } },
    });

    return json({ url: session.url }, 200, headers);
  } catch (err) {
    console.error('[stripe-checkout] error:', err);
    return json({ error: 'Internal server error' }, 500, headers);
  }
});

function json(body: unknown, status = 200, hdrs: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...hdrs, 'Content-Type': 'application/json' },
  });
}
