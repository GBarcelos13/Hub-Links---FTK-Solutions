import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: Subscription | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfileAndSubscription = useCallback(async (userId: string) => {
    const [{ data: profileData }, { data: subData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase
        .from('subscriptions')
        .select('plan, status, current_period_end, cancel_at_period_end, stripe_subscription_id')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);
    setProfile(profileData as Profile | null);
    setSubscription(subData as Subscription | null);
  }, []);

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          setTimeout(() => { loadProfileAndSubscription(newSession.user.id); }, 0);
        } else {
          setProfile(null);
          setSubscription(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) {
        loadProfileAndSubscription(existing.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => { authSub.unsubscribe(); };
  }, [loadProfileAndSubscription]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`user-${user.id}-profile`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        () => loadProfileAndSubscription(user.id))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${user.id}` },
        () => loadProfileAndSubscription(user.id))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, loadProfileAndSubscription]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    return { error: error as Error | null };
  };

  const refreshProfile = useCallback(async () => {
    if (user?.id) await loadProfileAndSubscription(user.id);
  }, [user?.id, loadProfileAndSubscription]);

  return (
    <AuthContext.Provider
      value={{
        user, session, profile, subscription, loading,
        signUp, signIn, signInWithGoogle, signOut, resetPassword, refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  return ctx;
}
