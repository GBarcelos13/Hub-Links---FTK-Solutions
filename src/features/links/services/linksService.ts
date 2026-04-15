import { supabase } from '@/integrations/supabase/client';
import type { Link } from '@/shared/types';

// ── Types ─────────────────────────────────────────────────────────────────

export type LinkInsert = {
  name: string;
  url: string;
  description: string | null;
  display_order: number;
  user_id: string;
  category_id: string | null;
};

type LinkUpdate = Partial<Pick<
  Link,
  'name' | 'url' | 'description' | 'is_favorite' | 'category_id' | 'display_order'
>>;

// ── Helper ────────────────────────────────────────────────────────────────

function assertNoError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

// ── Service ───────────────────────────────────────────────────────────────

export const linksService = {
  getAll: async (userId: string): Promise<Link[]> => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true });
    assertNoError(error);
    return (data ?? []) as Link[];
  },

  create: async (payload: LinkInsert): Promise<void> => {
    const { error } = await supabase.from('links').insert(payload);
    assertNoError(error);
  },

  update: async (id: string, patch: LinkUpdate): Promise<void> => {
    const { error } = await supabase.from('links').update(patch).eq('id', id);
    assertNoError(error);
  },

  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('links').delete().eq('id', id);
    assertNoError(error);
  },

  reorder: async (items: { id: string; display_order: number }[]): Promise<void> => {
    await Promise.all(
      items.map(({ id, display_order }) =>
        supabase.from('links').update({ display_order }).eq('id', id),
      ),
    );
  },
};
