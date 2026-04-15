import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/shared/components/Header';
import { Footer } from '@/shared/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/features/billing/hooks/useSubscription';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PlanTier } from '@/integrations/supabase/types';

const PLANS: {
  id: PlanTier;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
}[] = [
  {
    id: 'free', name: 'Free', price: 'R$ 0', period: '/mês',
    features: ['Até 5 links', '1 categoria', 'Busca & favoritos', 'Sync em tempo real', 'Suporte comunitário'],
  },
  {
    id: 'pro', name: 'Pro', price: 'R$ 4,99', period: '/mês', highlight: true, badge: 'Mais popular',
    features: ['Até 30 links', '5 categorias', 'Tudo do Free', 'Suporte prioritário'],
  },
  {
    id: 'elite', name: 'Elite', price: 'R$ 9,99', period: '/mês',
    features: ['Até 100 links', 'Categorias ilimitadas', 'Tudo do Pro', 'Suporte dedicado'],
  },
];

export default function Billing() {
  const navigate = useNavigate();
  const { session, refreshProfile } = useSupabaseAuth();
  const { plan, subscription } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<PlanTier | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [params] = useSearchParams();

  useEffect(() => {
    if (params.get('canceled')) { toast.info('Checkout cancelado.'); return; }
    if (!params.get('success')) return;

    toast.success('Pagamento confirmado! Atualizando plano...');

    // Webhook é assíncrono — faz polling para capturar a atualização
    const delays = [2000, 5000, 10000, 20000];
    const timers = delays.map((ms) => setTimeout(() => refreshProfile(), ms));
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upgrade = async (target: PlanTier) => {
    if (target === 'free' || !session) return;
    setLoadingPlan(target);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', { body: { plan: target } });
      if (error) {
        console.error('[stripe-checkout] raw error:', error);
        let detail = (error as { message?: string }).message || 'Erro ao iniciar checkout';
        try {
          const ctx = (error as { context?: Response }).context;
          if (ctx) {
            const text = await ctx.text();
            console.error('[stripe-checkout] response body:', text);
            const body = JSON.parse(text);
            if (body?.error) detail = body.error;
          }
        } catch (parseErr) {
          console.error('[stripe-checkout] parse error:', parseErr);
        }
        throw new Error(detail);
      }
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      console.error('[stripe-checkout] caught:', err);
      toast.error((err as Error).message || 'Erro ao iniciar checkout');
    } finally {
      setLoadingPlan(null);
    }
  };

  const openPortal = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-portal', {});
      if (error) {
        let detail = (error as { message?: string }).message || 'Erro ao abrir portal';
        try {
          const body = await (error as { context?: Response }).context?.json?.();
          if (body?.error) detail = body.error;
        } catch { /* ignora */ }
        throw new Error(detail);
      }
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao abrir portal');
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-5 py-12">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>

          {/* Current plan summary */}
          <div className="mb-12 rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Plano atual</p>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-800 text-foreground capitalize">{plan}</span>
                <Badge variant="secondary" className="uppercase text-[10px] font-display font-700">
                  {plan}
                </Badge>
                {subscription?.cancel_at_period_end && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    Cancela no fim do período
                  </div>
                )}
              </div>
            </div>
            {subscription?.stripe_subscription_id && (
              <Button
                variant="outline"
                onClick={openPortal}
                disabled={loadingPortal}
                className="rounded-xl h-10 shrink-0"
              >
                {loadingPortal && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Gerenciar assinatura
              </Button>
            )}
          </div>

          {/* Plan heading */}
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-800 text-foreground">Escolha seu plano</h2>
            <p className="mt-2 text-muted-foreground">
              Comece grátis. Faça upgrade quando o hub crescer.
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid gap-5 md:grid-cols-3 items-center">
            {PLANS.map((p) => {
              const isCurrent = plan === p.id;
              return (
                <div
                  key={p.id}
                  className={cn(
                    'relative flex flex-col rounded-2xl border p-7 transition-all',
                    p.highlight
                      ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.03]'
                      : 'border-border bg-card',
                    isCurrent && !p.highlight && 'border-primary/40',
                  )}
                >
                  {p.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-primary px-4 py-1 text-xs font-display font-700 text-primary-foreground uppercase tracking-wide shadow">
                        {p.badge}
                      </span>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute top-4 right-4">
                      <span className="flex items-center gap-1 text-[10px] font-display font-700 text-primary uppercase tracking-wide">
                        <Sparkles className="h-3 w-3" /> Atual
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-widest">{p.name}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-800 text-foreground">{p.price}</span>
                      <span className="text-muted-foreground text-sm">{p.period}</span>
                    </div>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button className="w-full rounded-xl h-11" disabled variant="secondary">
                      Plano atual
                    </Button>
                  ) : p.id === 'free' ? (
                    <Button
                      className="w-full rounded-xl h-11"
                      variant="outline"
                      onClick={openPortal}
                      disabled={loadingPortal}
                    >
                      {loadingPortal && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Fazer downgrade
                    </Button>
                  ) : (
                    <Button
                      className={cn('w-full rounded-xl h-11 font-display font-700', p.highlight && 'btn-glow')}
                      variant={p.highlight ? 'default' : 'outline'}
                      onClick={() => upgrade(p.id)}
                      disabled={!!loadingPlan}
                    >
                      {loadingPlan === p.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {plan === 'free' ? `Assinar ${p.name}` : `Mudar para ${p.name}`}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Pagamentos processados com segurança via Stripe. Cancele quando quiser.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
