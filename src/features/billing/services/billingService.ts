import { supabase } from '@/integrations/supabase/client';
import type { PlanTier } from '@/shared/types';

// ── Service ───────────────────────────────────────────────────────────────

export const billingService = {
  /** Cria uma sessão de checkout no Stripe e retorna a URL de redirecionamento. */
  createCheckout: async (plan: Exclude<PlanTier, 'free'>): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: { plan },
    });
    if (error) throw new Error(error.message);
    if (!data?.url) throw new Error('URL de checkout não retornada');
    return data.url as string;
  },

  /** Abre o portal de gerenciamento de assinatura do Stripe. */
  openPortal: async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('stripe-portal', {});
    if (error) throw new Error(error.message);
    if (!data?.url) throw new Error('URL do portal não retornada');
    return data.url as string;
  },
};
