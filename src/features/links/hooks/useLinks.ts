import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { linksService } from '@/features/links/services/linksService';
import { toast } from 'sonner';
import type { Link } from '@/shared/types';

export type { Link };

// ── Validation ────────────────────────────────────────────────────────────

const linkSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo (máximo 100 caracteres)'),
  url: z
    .string().trim().url('Formato de URL inválido').max(2000, 'URL muito longa')
    .refine((u) => u.startsWith('http://') || u.startsWith('https://'), 'URL deve começar com http:// ou https://'),
});

// ── Hook ──────────────────────────────────────────────────────────────────

export function useLinks() {
  const { user } = useSupabaseAuth();
  const qc = useQueryClient();
  const queryKey = ['links', user?.id] as const;

  // Realtime: qualquer mudança no banco invalida a query
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`links-rt-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'links', filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey }),
      )
      .subscribe((status, err) => {
        if (err) console.error('[links-realtime] subscription error:', err);
      });
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Fetch ───────────────────────────────────────────────────────────────

  const query = useQuery({
    queryKey,
    queryFn: () => linksService.getAll(user!.id),
    enabled: !!user,
    staleTime: 30_000,
  });

  const links = query.data ?? [];

  // ── Add ─────────────────────────────────────────────────────────────────

  const addMutation = useMutation({
    mutationFn: async ({
      name, url, description, categoryId,
    }: { name: string; url: string; description?: string; categoryId?: string | null }) => {
      const validation = linkSchema.safeParse({ name, url });
      if (!validation.success) throw new Error(validation.error.errors[0].message);

      const maxOrder = links.length > 0 ? Math.max(...links.map((l) => l.display_order)) : -1;
      await linksService.create({
        name: name.toUpperCase(),
        url,
        description: description?.trim() || null,
        display_order: maxOrder + 1,
        user_id: user!.id,
        category_id: categoryId ?? null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success('Link adicionado com sucesso!');
    },
    onError: (err: Error) => {
      if (err.message?.includes('LINK_LIMIT_REACHED')) {
        toast.error('Limite do seu plano atingido. Faça upgrade para adicionar mais.');
      } else {
        toast.error(err.message || 'Erro ao adicionar link');
      }
    },
  });

  // ── Remove ──────────────────────────────────────────────────────────────

  const removeMutation = useMutation({
    mutationFn: (id: string) => linksService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success('Link removido');
    },
    onError: () => toast.error('Erro ao remover link'),
  });

  // ── Update ──────────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: async ({
      id, name, url, description,
    }: { id: string; name: string; url: string; description?: string | null }) => {
      const validation = linkSchema.safeParse({ name, url });
      if (!validation.success) throw new Error(validation.error.errors[0].message);
      await linksService.update(id, {
        name: name.toUpperCase(),
        url,
        description: description?.trim() || null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success('Link atualizado');
    },
    onError: (err: Error) => toast.error(err.message || 'Erro ao atualizar link'),
  });

  // ── Toggle favorite (optimistic) ────────────────────────────────────────

  const toggleFavMutation = useMutation({
    mutationFn: ({ id, newValue }: { id: string; newValue: boolean }) =>
      linksService.update(id, { is_favorite: newValue }),
    onMutate: async ({ id, newValue }) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<Link[]>(queryKey);
      qc.setQueryData<Link[]>(queryKey, (old = []) =>
        old.map((l) => (l.id === id ? { ...l, is_favorite: newValue } : l)),
      );
      return { previous };
    },
    onError: (_, __, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKey, ctx.previous);
      toast.error('Erro ao atualizar favorito');
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  // ── Move to category (optimistic) ───────────────────────────────────────

  const moveCatMutation = useMutation({
    mutationFn: ({ linkId, categoryId }: { linkId: string; categoryId: string | null }) =>
      linksService.update(linkId, { category_id: categoryId }),
    onMutate: async ({ linkId, categoryId }) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<Link[]>(queryKey);
      qc.setQueryData<Link[]>(queryKey, (old = []) =>
        old.map((l) => (l.id === linkId ? { ...l, category_id: categoryId } : l)),
      );
      return { previous };
    },
    onError: (_, __, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKey, ctx.previous);
      toast.error('Erro ao mover link');
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  // ── Reorder (optimistic, no toast needed) ───────────────────────────────

  const reorderLinks = async (reordered: Link[]) => {
    qc.setQueryData<Link[]>(queryKey, reordered);
    await linksService.reorder(reordered.map((l, i) => ({ id: l.id, display_order: i })));
  };

  // ── Public API ───────────────────────────────────────────────────────────

  return {
    links,
    loading: query.isLoading,
    addLink: (name: string, url: string, description?: string, categoryId?: string | null) =>
      addMutation.mutateAsync({ name, url, description, categoryId }),
    removeLink: (id: string) => removeMutation.mutateAsync(id),
    updateLink: (id: string, name: string, url: string, description?: string | null) =>
      updateMutation.mutateAsync({ id, name, url, description }),
    toggleFavorite: (id: string) => {
      const link = links.find((l) => l.id === id);
      if (link) toggleFavMutation.mutate({ id, newValue: !link.is_favorite });
    },
    moveLinkToCategory: (linkId: string, categoryId: string | null) =>
      moveCatMutation.mutateAsync({ linkId, categoryId }),
    reorderLinks,
  };
}
