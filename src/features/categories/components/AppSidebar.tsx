import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDroppable } from '@dnd-kit/core';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuAction,
  SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Layers, Star, Inbox, Plus, MoreHorizontal, Pencil, Trash2,
  CreditCard, LogOut, Lock, Sparkles, MessageCircle, PuzzleIcon,
} from 'lucide-react';
import { CategoryDialog } from '@/features/categories/components/CategoryDialog';
import { UpgradePrompt } from '@/features/billing/components/PlanGate';
import { FeedbackDialog } from '@/features/feedback/components/FeedbackDialog';
import { useCategories, type Category } from '@/features/categories/hooks/useCategories';
import { useLinks } from '@/features/links/hooks/useLinks';
import { useSubscription } from '@/features/billing/hooks/useSubscription';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { COLOR_CLASSES } from '@/features/categories/lib/category-palette';
import { Logo } from '@/shared/components/Logo';
import { cn } from '@/lib/utils';

// ── View types ────────────────────────────────────────────────────────────

export type SidebarView =
  | { kind: 'all' }
  | { kind: 'all-grouped' }
  | { kind: 'favorites' }
  | { kind: 'uncategorized' }
  | { kind: 'category'; id: string };

export function parseView(param: string | null): SidebarView {
  if (!param || param === 'all') return { kind: 'all' };
  if (param === 'all-grouped') return { kind: 'all-grouped' };
  if (param === 'favorites') return { kind: 'favorites' };
  if (param === 'uncategorized') return { kind: 'uncategorized' };
  return { kind: 'category', id: param };
}

export const CATEGORY_DROP_PREFIX = 'cat:';
export const UNCATEGORIZED_DROP_ID = 'uncategorized-drop';

// ── Droppable item ────────────────────────────────────────────────────────

function DroppableCategoryItem({
  dropId, active, children,
}: {
  dropId: string;
  active: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dropId });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-md transition-colors',
        isOver && 'ring-2 ring-primary ring-offset-1 ring-offset-sidebar bg-primary/10',
      )}
      data-active={active}
    >
      {children}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────

export function AppSidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, signOut } = useSupabaseAuth();
  const { plan, limits } = useSubscription();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { links } = useLinks();

  const view = useMemo(() => parseView(searchParams.get('view')), [searchParams]);

  const setView = (next: SidebarView) => {
    const nextParams = new URLSearchParams(searchParams);
    if (next.kind === 'all') nextParams.delete('view');
    else if (next.kind === 'category') nextParams.set('view', next.id);
    else nextParams.set('view', next.kind);
    setSearchParams(nextParams, { replace: true });
  };

  const allGroupedCount = links.length;

  const visibleCategories = useMemo(() => {
    const limit = limits.categories;
    if (limit === Infinity) return categories;
    return categories.slice(0, limit);
  }, [categories, limits.categories]);

  const hiddenCount = categories.length - visibleCategories.length;

  const favoritesCount     = links.filter((l) => l.is_favorite).length;
  const uncategorizedCount = links.filter((l) => !l.category_id).length;
  const categoryCount      = (id: string) => links.filter((l) => l.category_id === id).length;

  const canCreate = categories.length < limits.categories;

  const [createOpen,    setCreateOpen]    = useState(false);
  const [upgradeOpen,   setUpgradeOpen]   = useState(false);
  const [feedbackOpen,  setFeedbackOpen]  = useState(false);
  const [extOpen,       setExtOpen]       = useState(false);
  const [editing,       setEditing]       = useState<Category | null>(null);
  const [deleting,      setDeleting]      = useState<Category | null>(null);

  const handleNew = () => {
    if (canCreate) setCreateOpen(true);
    else setUpgradeOpen(true);
  };

  const initials = (profile?.full_name || profile?.email || user?.email || '?')
    .split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const isActive = (v: SidebarView) => {
    if (view.kind !== v.kind) return false;
    if (view.kind === 'category' && v.kind === 'category') return view.id === v.id;
    return true;
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <RouterLink to="/dashboard" className="flex items-center gap-2 px-2 py-1.5">
          <Logo className="h-8 w-auto" />
        </RouterLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive({ kind: 'all' })} onClick={() => setView({ kind: 'all' })}>
                  <Layers className="h-4 w-4" />
                  <span>Todos</span>
                  <span className="ml-auto text-xs text-muted-foreground">{links.length}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive({ kind: 'favorites' })} onClick={() => setView({ kind: 'favorites' })}>
                  <Star className="h-4 w-4" />
                  <span>Favoritos</span>
                  <span className="ml-auto text-xs text-muted-foreground">{favoritesCount}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <DroppableCategoryItem dropId={UNCATEGORIZED_DROP_ID} active={isActive({ kind: 'uncategorized' })}>
                  <SidebarMenuButton isActive={isActive({ kind: 'uncategorized' })} onClick={() => setView({ kind: 'uncategorized' })}>
                    <Inbox className="h-4 w-4" />
                    <span>Sem categoria</span>
                    <span className="ml-auto text-xs text-muted-foreground">{uncategorizedCount}</span>
                  </SidebarMenuButton>
                </DroppableCategoryItem>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Categorias</SidebarGroupLabel>
          <SidebarGroupAction title="Nova categoria" onClick={handleNew}>
            {canCreate ? <Plus className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive({ kind: 'all-grouped' })} onClick={() => setView({ kind: 'all-grouped' })}>
                  <Layers className="h-4 w-4" />
                  <span>Todos</span>
                  <span className="ml-auto text-xs text-muted-foreground">{allGroupedCount}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {visibleCategories.map((cat) => {
                const active = isActive({ kind: 'category', id: cat.id });
                return (
                  <SidebarMenuItem key={cat.id}>
                    <DroppableCategoryItem dropId={`${CATEGORY_DROP_PREFIX}${cat.id}`} active={active}>
                      <SidebarMenuButton isActive={active} onClick={() => setView({ kind: 'category', id: cat.id })}>
                        <span className={cn('flex h-5 w-5 items-center justify-center rounded text-xs', COLOR_CLASSES[cat.color].bg)}>
                          {cat.emoji}
                        </span>
                        <span className="truncate">{cat.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{categoryCount(cat.id)}</span>
                      </SidebarMenuButton>
                    </DroppableCategoryItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction aria-label={`Opções de ${cat.name}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(cat)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(cat)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                );
              })}

              {categories.length === 0 && (
                <div className="px-2 py-3 text-xs text-muted-foreground">
                  Nenhuma categoria ainda. Crie uma para organizar seus links.
                </div>
              )}

              {hiddenCount > 0 && (
                <div className="mx-2 mt-2 rounded-md border border-dashed p-2 text-xs text-muted-foreground">
                  {hiddenCount} categoria{hiddenCount > 1 ? 's' : ''} oculta{hiddenCount > 1 ? 's' : ''} pelo plano atual.{' '}
                  <RouterLink to="/billing" className="text-primary hover:underline">Reativar</RouterLink>
                </div>
              )}

              {!canCreate && categories.length > 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setUpgradeOpen(true)} className="text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    <span>Upgrade para criar mais</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        {/* ── Instalar extensão ── */}
        <SidebarMenuButton
          onClick={() => setExtOpen(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <PuzzleIcon className="h-4 w-4" />
          <span>Instalar extensão</span>
        </SidebarMenuButton>

        {/* ── Fale conosco ── */}
        <SidebarMenuButton
          onClick={() => setFeedbackOpen(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Fale conosco</span>
        </SidebarMenuButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-auto py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className="truncate text-sm font-medium">{profile?.full_name ?? 'Usuário'}</span>
                <Badge variant="secondary" className="mt-0.5 uppercase text-[10px]">{plan}</Badge>
              </div>
              <MoreHorizontal className="ml-auto h-4 w-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/billing')}>
              <CreditCard className="mr-2 h-4 w-4" /> Plano & cobrança
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => { await signOut(); navigate('/'); }} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      {/* ── Dialogs ── */}
      <CategoryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (v) => { await createCategory(v); }}
      />

      <CategoryDialog
        open={!!editing}
        onOpenChange={(o) => { if (!o) setEditing(null); }}
        initialValue={editing ? { name: editing.name, color: editing.color, emoji: editing.emoji } : undefined}
        title="Editar categoria"
        description="Ajuste o nome, cor ou emoji."
        onSubmit={async (v) => { if (editing) await updateCategory(editing.id, v); }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => { if (!o) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Os links desta categoria ficarão sem categoria. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleting) {
                  await deleteCategory(deleting.id);
                  if (view.kind === 'category' && view.id === deleting.id) setView({ kind: 'all' });
                }
                setDeleting(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-md p-0">
          <UpgradePrompt
            message={
              plan === 'free'
                ? 'O plano Free inclui apenas 1 categoria. Faça upgrade para organizar melhor seu hub.'
                : 'Você atingiu o limite de categorias do seu plano. Faça upgrade para ilimitado no Elite.'
            }
          />
        </DialogContent>
      </Dialog>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />

      {/* ── Extensão de navegador ── */}
      <Dialog open={extOpen} onOpenChange={setExtOpen}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <PuzzleIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-base">Extensão do Navegador</h2>
                <p className="text-xs text-muted-foreground">Salve links com 1 clique</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Instale a extensão no Chrome ou Edge e salve qualquer página no seu hub sem sair do navegador.
            </p>

            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Como instalar</p>
              <ol className="space-y-2.5 text-sm">
                <li className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">1</span>
                  <span>Baixe os arquivos da extensão clicando no botão abaixo.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">2</span>
                  <span>Extraia a pasta baixada em qualquer lugar do seu computador.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">3</span>
                  <span>
                    Abra <strong>chrome://extensions</strong> (Chrome) ou <strong>edge://extensions</strong> (Edge).
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">4</span>
                  <span>Ative o <strong>Modo desenvolvedor</strong> no canto superior direito.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">5</span>
                  <span>Clique em <strong>Carregar sem compactação</strong> e selecione a pasta extraída.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">6</span>
                  <span>Pronto! O ícone da extensão aparecerá na barra do navegador.</span>
                </li>
              </ol>
            </div>

            <a
              href="https://drive.google.com/drive/folders/1TyTUIj5uD4S0SJpV0yYJjgwV0qb_YgoH?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <PuzzleIcon className="h-4 w-4" />
              Baixar extensão
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
