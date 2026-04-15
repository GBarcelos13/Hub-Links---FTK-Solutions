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
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Diagnóstico temporário — remover após validar
  const url = new URL(req.url);
  if (url.pathname.endsWith('/health')) {
    return json({
      stripe_key_set:    env('STRIPE_SECRET_KEY').length > 0,
      price_pro_set:     env('STRIPE_PRICE_PRO').length > 0,
      price_elite_set:   env('STRIPE_PRICE_ELITE').length > 0,
      supabase_url_set:  env('SUPABASE_URL').length > 0,
      anon_key_set:      env('SUPABASE_ANON_KEY').length > 0,
      service_key_set:   env('SUPABASE_SERVICE_ROLE_KEY').length > 0,
    });
  }

  const stripe = new Stripe(env('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' });
  const PRICE_MAP: Record<string, string> = {
    pro:   env('STRIPE_PRICE_PRO'),
    elite: env('STRIPE_PRICE_ELITE'),
  };

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing Authorization' }, 401);

    const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const { plan } = await req.json();
    const priceId = PRICE_MAP[plan];
    if (!priceId) return json({ error: 'Invalid plan' }, 400);

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

    return json({ url: session.url });
  } catch (err) {
    console.error(err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
