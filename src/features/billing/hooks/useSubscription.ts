import { useMemo } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import type { PlanTier } from '@/shared/types';

export const PLAN_LIMITS: Record<
  PlanTier,
  { links: number; categories: number; analytics: boolean; customization: boolean; customDomain: boolean }
> = {
  free:  { links: 5,   categories: 1,        analytics: false, customization: false, customDomain: false },
  pro:   { links: 30,  categories: 5,        analytics: true,  customization: true,  customDomain: false },
  elite: { links: 100, categories: Infinity, analytics: true,  customization: true,  customDomain: true  },
};

export function useSubscription() {
  const { profile, subscription } = useSupabaseAuth();

  const plan: PlanTier = profile?.plan ?? 'free';
  const limits = PLAN_LIMITS[plan];

  return useMemo(() => ({
    plan,
    limits,
    subscription,
    isFree:   plan === 'free',
    isPro:    plan === 'pro',
    isElite:  plan === 'elite',
    isActive: subscription?.status === 'active' || subscription?.status === 'trialing',
    canUse: (feature: keyof typeof limits) => Boolean(limits[feature]),
  }), [plan, limits, subscription]);
}
