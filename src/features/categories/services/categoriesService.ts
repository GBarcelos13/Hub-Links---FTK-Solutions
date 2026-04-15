import { supabase } from '@/integrations/supabase/client';
import type { CategoryColor } from '@/features/categories/lib/category-palette';

// ── Types ─────────────────────────────────────────────────────────────────

export interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  emoji: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type CategoryInsert = {
  name: string;
  color: CategoryColor;
  emoji: string;
  display_order: number;
  user_id: string;
};

export type CategoryPatch = Partial<Pick<CategoryInsert, 'name' | 'color' | 'emoji'>>;

// ── Helper ────────────────────────────────────────────────────────────────

function assertNoError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

// ── Service ───────────────────────────────────────────────────────────────

export const categoriesService = {
  getAll: async (userId: string): Promise<CategoryRow[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true });
    assertNoError(error);
    return (data ?? []) as CategoryRow[];
  },

  create: async (payload: CategoryInsert): Promise<void> => {
    const { error } = await supabase.from('categories').insert(payload);
    assertNoError(error);
  },

  update: async (id: string, patch: CategoryPatch): Promise<void> => {
    const { error } = await supabase.from('categories').update(patch).eq('id', id);
    assertNoError(error);
  },

  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    assertNoError(error);
  },

  reorder: async (items: { id: string; display_order: number }[]): Promise<void> => {
    await Promise.all(
      items.map(({ id, display_order }) =>
        supabase.from('categories').update({ display_order }).eq('id', id),
      ),
    );
  },
};
