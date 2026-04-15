// ── Domain types — single source of truth ────────────────────────────────

export type { PlanTier, SubscriptionStatus } from '@/integrations/supabase/types';

// ── Links ────────────────────────────────────────────────────────────────

export interface Link {
  id: string;
  name: string;
  url: string;
  description: string | null;
  is_favorite: boolean;
  display_order: number;
  user_id: string;
  category_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ── Auth ─────────────────────────────────────────────────────────────────

import type { PlanTier, SubscriptionStatus } from '@/integrations/supabase/types';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  slug: string | null;
  plan: PlanTier;
  stripe_customer_id: string | null;
  onboarded: boolean;
}

export interface Subscription {
  plan: PlanTier;
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
}
