// Supabase Edge Function: Stripe Webhook
// Deploy with JWT OFF: supabase functions deploy stripe-webhook --no-verify-jwt

// @ts-expect-error — Deno runtime
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-expect-error — esm.sh
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
// @ts-expect-error — esm.sh
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// @ts-expect-error — Deno global
const env = (k: string) => Deno.env.get(k) ?? '';

type PlanTier = 'free' | 'pro' | 'elite';
type SupabaseClient = ReturnType<typeof createClient>;

serve(async (req: Request) => {
  // Inicializados por request para garantir que os secrets estão disponíveis
  const stripe = new Stripe(env('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' });
  const admin: SupabaseClient = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));
  const PRICE_TO_PLAN: Record<string, PlanTier> = {
    [env('STRIPE_PRICE_PRO')]:   'pro',
    [env('STRIPE_PRICE_ELITE')]: 'elite',
  };

  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      raw, signature, env('STRIPE_WEBHOOK_SECRET'),
    );
  } catch (err) {
    console.error('Webhook verify failed', err);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertSubscription(sub, stripe, admin, PRICE_TO_PLAN);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await upsertSubscription(event.data.object as Stripe.Subscription, stripe, admin, PRICE_TO_PLAN);
        break;
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await upsertSubscription(sub, stripe, admin, PRICE_TO_PLAN);
        }
        break;
      }
    }
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('Handler error', err);
    return new Response('Internal error', { status: 500 });
  }
});

async function upsertSubscription(
  sub: Stripe.Subscription,
  _stripe: Stripe,
  admin: SupabaseClient,
  PRICE_TO_PLAN: Record<string, PlanTier>,
) {
  const userId =
    (sub.metadata?.supabase_user_id as string | undefined) ??
    (await lookupUserByCustomer(sub.customer as string, admin));

  if (!userId) {
    console.error('No user_id for subscription', sub.id);
    return;
  }

  const priceId = sub.items.data[0]?.price?.id;
  const plan: PlanTier = (priceId && PRICE_TO_PLAN[priceId]) || 'free';

  console.log(`Upserting subscription: user=${userId} plan=${plan} status=${sub.status}`);

  await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_subscription_id: sub.id,
      stripe_price_id: priceId ?? null,
      plan,
      status: sub.status,
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: sub.cancel_at_period_end,
    },
    { onConflict: 'user_id' },
  );
}

async function lookupUserByCustomer(customerId: string, admin: SupabaseClient): Promise<string | null> {
  const { data } = await admin
    .from('profiles').select('id').eq('stripe_customer_id', customerId).maybeSingle();
  return data?.id ?? null;
}
