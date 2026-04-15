import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { categoriesService } from '@/features/categories/services/categoriesService';
import { normalizeColor, type CategoryColor } from '@/features/categories/lib/category-palette';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: CategoryColor;
  emoji: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryInput {
  name: string;
  color: CategoryColor;
  emoji: string;
}

export type CategoryError = 'LIMIT_REACHED' | 'DUPLICATE' | 'UNKNOWN';

// ── Helpers ───────────────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(40, 'Nome muito longo (máximo 40 caracteres)'),
  emoji: z.string().trim().min(1).max(4),
});

function parseError(err: Error): CategoryError {
  const msg = err.message ?? '';
  if (msg.includes('CATEGORY_LIMIT_REACHED')) return 'LIMIT_REACHED';
  if (msg.includes('23505') || msg.includes('categories_user_name')) return 'DUPLICATE';
  return 'UNKNOWN';
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useCategories() {
  const { user } = useSupabaseAuth();
  const qc = useQueryClient();
  const queryKey = ['categories', user?.id] as const;

  // Realtime: qualquer mudança invalida a query
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`categories-rt-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey }),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Fetch ───────────────────────────────────────────────────────────────

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const rows = await categoriesService.getAll(user!.id);
      return rows.map((c) => ({ ...c, color: normalizeColor(c.color) })) as Category[];
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const categories = query.data ?? [];

  // ── Create ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (input: CategoryInput): Promise<void> => {
      const validation = categorySchema.safeParse(input);
      if (!validation.success) throw new Error(validation.error.errors[0].message);

      const maxOrder = categories.length > 0
        ? Math.max(...categories.map((c) => c.display_order))
        : -1;

      await categoriesService.create({
        name: input.name.trim(),
        color: input.color,
        emoji: input.emoji.trim(),
        display_order: maxOrder + 1,
        user_id: user!.id,
      });
    },
    onSuccess: () => toast.success('Categoria criada!'),
    onError: (err: Error) => {
      const kind = parseError(err);
      if (kind === 'LIMIT_REACHED') {
        toast.error('Limite de categorias do seu plano atingido. Faça upgrade para criar mais.');
      } else if (kind === 'DUPLICATE') {
        toast.error('Já existe uma categoria com esse nome.');
      } else {
        toast.error(err.message || 'Erro ao criar categoria');
      }
    },
  });

  // ── Update ──────────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CategoryInput> }) =>
      categoriesService.update(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success('Categoria atualizada');
    },
    onError: (err: Error) => {
      const kind = parseError(err);
      if (kind === 'DUPLICATE') {
        toast.error('Já existe uma categoria com esse nome.');
      } else {
        toast.error('Erro ao atualizar categoria');
      }
    },
  });

  // ── Delete ──────────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success('Categoria removida');
    },
    onError: () => toast.error('Erro ao remover categoria'),
  });

  // ── Reorder (optimistic) ─────────────────────────────────────────────────

  const reorderCategories = async (reordered: Category[]) => {
    qc.setQueryData<Category[]>(queryKey, reordered);
    await categoriesService.reorder(reordered.map((c, i) => ({ id: c.id, display_order: i })));
  };

  // ── Public API ───────────────────────────────────────────────────────────

  const createCategory = async (input: CategoryInput): Promise<CategoryError | null> => {
    try {
      await createMutation.mutateAsync(input);
      return null;
    } catch (err) {
      return parseError(err as Error);
    }
  };

  const updateCategory = async (
    id: string,
    patch: Partial<CategoryInput>,
  ): Promise<CategoryError | null> => {
    try {
      await updateMutation.mutateAsync({ id, patch });
      return null;
    } catch (err) {
      return parseError(err as Error);
    }
  };

  const deleteCategory = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return {
    categories,
    loading: query.isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
}
