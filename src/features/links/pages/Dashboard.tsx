import { useMemo, useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { OnboardingDialog } from '@/features/auth/components/OnboardingDialog';
import { LinkButton } from '@/features/links/components/LinkButton';
import { DraggableLinkCard, LINK_DRAG_PREFIX } from '@/features/links/components/DraggableLinkCard';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AppSidebar, parseView, CATEGORY_DROP_PREFIX, UNCATEGORIZED_DROP_ID,
} from '@/features/categories/components/AppSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Footer } from '@/shared/components/Footer';
import { useLinks, type Link } from '@/features/links/hooks/useLinks';
import { useCategories, type Category } from '@/features/categories/hooks/useCategories';
import { useSubscription } from '@/features/billing/hooks/useSubscription';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Star, Search, X, Sparkles, Inbox, Sun, Moon, Plus } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { COLOR_CLASSES } from '@/features/categories/lib/category-palette';
import { cn } from '@/lib/utils';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, pointerWithin,
} from '@dnd-kit/core';

function LinkGrid({
  items,
  toggleFavorite,
  onEdit,
  onRemove,
}: {
  items: Link[];
  toggleFavorite: (id: string) => void;
  onEdit: (link: Link) => void;
  onRemove: (link: Link) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
      {items.map((link, index) => {
        const isLastAndOdd = items.length % 2 !== 0 && index === items.length - 1;
        return (
          <div key={link.id} className={isLastAndOdd ? 'md:col-span-2 flex justify-center' : ''}>
            <div className={isLastAndOdd ? 'w-full max-w-sm' : 'w-full'}>
              <DraggableLinkCard
                id={link.id}
                name={link.name}
                url={link.url}
                description={link.description}
                isFavorite={link.is_favorite}
                onToggleFavorite={() => toggleFavorite(link.id)}
                onEdit={() => onEdit(link)}
                onRemove={() => onRemove(link)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CategoryHeader({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-2 mb-5 max-w-3xl mx-auto">
      <span className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg text-lg',
        COLOR_CLASSES[category.color].bg,
      )}>
        {category.emoji}
      </span>
      <h3 className={cn('text-lg font-semibold', COLOR_CLASSES[category.color].text)}>
        {category.name}
      </h3>
    </div>
  );
}

export default function Dashboard() {
  const { links, loading, toggleFavorite, moveLinkToCategory, removeLink, updateLink } = useLinks();
  const { categories, loading: loadingCategories } = useCategories();
  const { plan, limits } = useSubscription();
  const { theme, toggle } = useTheme();
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const view = useMemo(() => parseView(searchParams.get('view')), [searchParams]);
  const [draggingLinkId, setDraggingLinkId] = useState<string | null>(null);
  const [editingLink,   setEditingLink]   = useState<Link | null>(null);
  const [deletingLink,  setDeletingLink]  = useState<Link | null>(null);
  const [editName,      setEditName]      = useState('');
  const [editUrl,       setEditUrl]       = useState('');
  const [editDesc,      setEditDesc]      = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const openEdit = (link: Link) => {
    setEditingLink(link);
    setEditName(link.name);
    setEditUrl(link.url);
    setEditDesc(link.description ?? '');
  };

  const handleSaveEdit = async () => {
    if (!editingLink) return;
    await updateLink(editingLink.id, editName, editUrl, editDesc);
    setEditingLink(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const idStr = String(event.active.id);
    if (idStr.startsWith(LINK_DRAG_PREFIX)) {
      setDraggingLinkId(idStr.slice(LINK_DRAG_PREFIX.length));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingLinkId(null);
    const { active, over } = event;
    if (!over) return;
    const activeIdStr = String(active.id);
    if (!activeIdStr.startsWith(LINK_DRAG_PREFIX)) return;
    const linkId = activeIdStr.slice(LINK_DRAG_PREFIX.length);
    const overId = String(over.id);

    if (overId === UNCATEGORIZED_DROP_ID) {
      const link = links.find((l) => l.id === linkId);
      if (link && link.category_id !== null) moveLinkToCategory(linkId, null);
      return;
    }
    if (overId.startsWith(CATEGORY_DROP_PREFIX)) {
      const categoryId = overId.slice(CATEGORY_DROP_PREFIX.length);
      const link = links.find((l) => l.id === linkId);
      if (link && link.category_id !== categoryId) moveLinkToCategory(linkId, categoryId);
    }
  };

  const draggingLink = draggingLinkId ? links.find((l) => l.id === draggingLinkId) : null;

  const usagePct = Math.min(100, Math.round((links.length / limits.links) * 100));
  const nearLimit = usagePct >= 80;
  const query = search.trim().toLowerCase();

  const visibleCategoryIds = useMemo(() => {
    const limit = limits.categories;
    const slice = limit === Infinity ? categories : categories.slice(0, limit);
    return new Set(slice.map((c) => c.id));
  }, [categories, limits.categories]);

  const filtered = useMemo(() => {
    const list = query
      ? links.filter((l) =>
          l.name.toLowerCase().includes(query) ||
          l.url.toLowerCase().includes(query) ||
          (l.description?.toLowerCase().includes(query) ?? false),
        )
      : links;

    if (view.kind === 'all') return list;
    if (view.kind === 'favorites') return list.filter((l) => l.is_favorite);
    if (view.kind === 'uncategorized') {
      return list.filter((l) => !l.category_id || !visibleCategoryIds.has(l.category_id));
    }
    return list.filter((l) => l.category_id === view.id);
  }, [links, query, view, visibleCategoryIds]);

  const activeCategory =
    view.kind === 'category' ? categories.find((c) => c.id === view.id) : null;

  const pageTitle = (() => {
    switch (view.kind) {
      case 'favorites':     return 'Favoritos';
      case 'uncategorized': return 'Sem categoria';
      case 'category':      return activeCategory?.name ?? 'Categoria';
      default:              return 'Todos os links';
    }
  })();

  const favoriteLinks = view.kind === 'all' ? filtered.filter((l) => l.is_favorite) : [];
  const regularLinks  = view.kind === 'all' ? filtered.filter((l) => !l.is_favorite) : filtered;

  const grouped = useMemo(() => {
    if (view.kind !== 'all') return null;
    const byCategory = new Map<string, Link[]>();
    const uncategorized: Link[] = [];
    for (const link of regularLinks) {
      if (link.category_id && visibleCategoryIds.has(link.category_id)) {
        const list = byCategory.get(link.category_id) ?? [];
        list.push(link);
        byCategory.set(link.category_id, list);
      } else {
        uncategorized.push(link);
      }
    }
    return { byCategory, uncategorized };
  }, [regularLinks, view.kind, visibleCategoryIds]);

  if (loading || loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggingLinkId(null)}
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <OnboardingDialog />
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
            <header className="flex items-center gap-2 border-b border-border bg-background/90 backdrop-blur px-4 h-14 sticky top-0 z-40">
              <SidebarTrigger />
              <div className="flex items-center gap-2 ml-1 flex-1">
                {view.kind === 'category' && activeCategory && (
                  <span className={cn(
                    'flex h-6 w-6 items-center justify-center rounded text-sm',
                    COLOR_CLASSES[activeCategory.color].bg,
                  )}>
                    {activeCategory.emoji}
                  </span>
                )}
                {view.kind === 'favorites' && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                {view.kind === 'uncategorized' && <Inbox className="h-4 w-4 text-muted-foreground" />}
                <h1 className="text-sm font-display font-700">{pageTitle}</h1>
              </div>
              <Button asChild size="sm" className="gap-1.5 font-display font-700 btn-glow">
                <RouterLink to="/admin">
                  <Plus className="h-4 w-4" />
                  Adicionar link
                </RouterLink>
              </Button>
              <button
                onClick={toggle}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </header>

            <main className="container mx-auto px-4 py-10 flex-1">
              <div className="max-w-5xl mx-auto">
                <div className="max-w-md mx-auto mb-8">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      Plano <span className="font-medium uppercase">{plan}</span> · {links.length}/{limits.links} links
                    </span>
                    {plan === 'free' && (
                      <Button asChild size="sm" variant="ghost" className="h-auto py-1">
                        <RouterLink to="/billing" className="gap-1">
                          <Sparkles className="h-3 w-3" /> Upgrade
                        </RouterLink>
                      </Button>
                    )}
                  </div>
                  <Progress value={usagePct} className={nearLimit ? '[&>div]:bg-destructive' : ''} />
                </div>

                <div className="max-w-md mx-auto mb-10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar links..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {view.kind === 'all' && grouped && (
                  <>
                    {favoriteLinks.length > 0 && (
                      <section className="mb-12">
                        <div className="flex items-center gap-2 mb-5 max-w-3xl mx-auto">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <h3 className="text-lg font-semibold text-foreground">Favoritos</h3>
                        </div>
                        <LinkGrid items={favoriteLinks} toggleFavorite={toggleFavorite} onEdit={openEdit} onRemove={setDeletingLink} />
                      </section>
                    )}

                    {categories
                      .filter((c) => visibleCategoryIds.has(c.id))
                      .map((cat) => {
                        const items = grouped.byCategory.get(cat.id) ?? [];
                        if (items.length === 0) return null;
                        return (
                          <section key={cat.id} className="mb-12">
                            <CategoryHeader category={cat} />
                            <LinkGrid items={items} toggleFavorite={toggleFavorite} onEdit={openEdit} onRemove={setDeletingLink} />
                          </section>
                        );
                      })}

                    {grouped.uncategorized.length > 0 && (
                      <section className="mb-12">
                        <div className="flex items-center gap-2 mb-5 max-w-3xl mx-auto">
                          <Inbox className="h-5 w-5 text-muted-foreground" />
                          <h3 className="text-lg font-semibold text-foreground">Sem categoria</h3>
                        </div>
                        <LinkGrid items={grouped.uncategorized} toggleFavorite={toggleFavorite} onEdit={openEdit} onRemove={setDeletingLink} />
                      </section>
                    )}
                  </>
                )}

                {view.kind !== 'all' && (
                  <LinkGrid items={filtered} toggleFavorite={toggleFavorite} onEdit={openEdit} onRemove={setDeletingLink} />
                )}

                {filtered.length === 0 && links.length > 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      {query ? `Nenhum link encontrado para "${search}"` : 'Nenhum link nesta visualização.'}
                    </p>
                  </div>
                )}

                {links.length === 0 && (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <span className="text-2xl">📋</span>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Nenhum link disponível no momento.
                    </p>
                    <Button asChild className="mt-4">
                      <RouterLink to="/admin">Adicionar links</RouterLink>
                    </Button>
                  </div>
                )}
              </div>
            </main>
            <Footer />
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* ── Edit dialog ── */}
      <Dialog open={!!editingLink} onOpenChange={(o) => { if (!o) setEditingLink(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome do link"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Descrição (opcional)</Label>
              <Textarea
                id="edit-desc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Breve descrição..."
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingLink(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim() || !editUrl.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deletingLink} onOpenChange={(o) => { if (!o) setDeletingLink(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir link?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deletingLink?.name}" será removido permanentemente. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                if (deletingLink) await removeLink(deletingLink.id);
                setDeletingLink(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DragOverlay>
        {draggingLink ? (
          <div className="pointer-events-none opacity-90 rotate-[-1deg] shadow-xl rounded-2xl">
            <LinkButton
              name={draggingLink.name}
              url={draggingLink.url}
              description={draggingLink.description}
              isFavorite={draggingLink.is_favorite}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
