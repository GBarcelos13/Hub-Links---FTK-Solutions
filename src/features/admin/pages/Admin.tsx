import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/shared/components/Header';
import { Footer } from '@/shared/components/Footer';
import { useLinks } from '@/features/links/hooks/useLinks';
import { useCategories, type Category } from '@/features/categories/hooks/useCategories';
import { useSubscription } from '@/features/billing/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Pencil, Trash2, FolderOpen, MoreHorizontal, Sparkles } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableLinkItem } from '@/features/links/components/DraggableLinkItem';
import { CategoryDialog } from '@/features/categories/components/CategoryDialog';
import { UpgradePrompt } from '@/features/billing/components/PlanGate';
import { COLOR_CLASSES } from '@/features/categories/lib/category-palette';
import { cn } from '@/lib/utils';

const UNCATEGORIZED = '__uncategorized__';

export default function Admin() {
  const { links, addLink, removeLink, reorderLinks, toggleFavorite, moveLinkToCategory } = useLinks();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { plan, limits } = useSubscription();
  const navigate = useNavigate();

  const [newLinkName,        setNewLinkName]        = useState('');
  const [newLinkUrl,         setNewLinkUrl]          = useState('');
  const [newLinkDescription, setNewLinkDescription] = useState('');
  const [newLinkCategory,    setNewLinkCategory]    = useState<string>(UNCATEGORIZED);

  const [createCatOpen, setCreateCatOpen] = useState(false);
  const [editingCat,    setEditingCat]    = useState<Category | null>(null);
  const [deletingCat,   setDeletingCat]   = useState<Category | null>(null);
  const [upgradeOpen,   setUpgradeOpen]   = useState(false);

  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  const canCreateCategory = categories.length < limits.categories;

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLinkName.trim() && newLinkUrl.trim()) {
      const catId = newLinkCategory === UNCATEGORIZED ? null : newLinkCategory;
      addLink(newLinkName, newLinkUrl, newLinkDescription, catId);
      setNewLinkName('');
      setNewLinkUrl('');
      setNewLinkDescription('');
      setNewLinkCategory(UNCATEGORIZED);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);
      reorderLinks(arrayMove(links, oldIndex, newIndex));
    }
  };

  const handleNewCategoryClick = () => {
    if (canCreateCategory) setCreateCatOpen(true);
    else setUpgradeOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Dashboard
          </Button>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Gerenciar</h2>
            <p className="text-muted-foreground">Adicione, organize e categorize seus links</p>
          </div>

          <Tabs defaultValue="links">
            <TabsList className="mb-6">
              <TabsTrigger value="links">Links</TabsTrigger>
              <TabsTrigger value="categories">
                Categorias
                <Badge variant="secondary" className="ml-2 text-[10px]">
                  {categories.length}{limits.categories === Infinity ? '' : `/${limits.categories}`}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* ── Links Tab ── */}
            <TabsContent value="links" className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Adicionar Novo Link
                  </CardTitle>
                  <CardDescription>Preencha os campos abaixo para adicionar um novo link</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddLink} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="linkName">Nome do Link</Label>
                        <Input
                          id="linkName" placeholder="Ex: BROADWORKS"
                          value={newLinkName} onChange={(e) => setNewLinkName(e.target.value)} required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkUrl">URL</Label>
                        <Input
                          id="linkUrl" type="url" placeholder="https://exemplo.com"
                          value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="linkDescription">Descrição (opcional)</Label>
                        <Textarea
                          id="linkDescription" placeholder="Descreva brevemente o que é este link..."
                          value={newLinkDescription} onChange={(e) => setNewLinkDescription(e.target.value)} rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkCategory">Categoria</Label>
                        <Select value={newLinkCategory} onValueChange={setNewLinkCategory}>
                          <SelectTrigger id="linkCategory"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UNCATEGORIZED}>Sem categoria</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                <span className="flex items-center gap-2">
                                  <span>{cat.emoji}</span><span>{cat.name}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full md:w-auto">
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Link
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Links Atuais</CardTitle>
                  <CardDescription>
                    {links.length} {links.length === 1 ? 'link disponível' : 'links disponíveis'} — Arraste para reordenar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {links.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Nenhum link cadastrado ainda</div>
                  ) : (
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                          {links.map((link) => (
                            <div key={link.id} className="flex items-stretch gap-2">
                              <div className="flex-1">
                                <DraggableLinkItem
                                  link={link}
                                  canEdit
                                  category={link.category_id ? categoryById.get(link.category_id) : undefined}
                                  onRemove={(id) => removeLink(id)}
                                  onToggleFavorite={toggleFavorite}
                                />
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="icon" className="self-center" aria-label="Mudar categoria">
                                    <FolderOpen className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuLabel>Mover para</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => moveLinkToCategory(link.id, null)}>
                                    Sem categoria
                                  </DropdownMenuItem>
                                  {categories.map((cat) => (
                                    <DropdownMenuItem key={cat.id} onClick={() => moveLinkToCategory(link.id, cat.id)}>
                                      <span className="mr-2">{cat.emoji}</span>{cat.name}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Categories Tab ── */}
            <TabsContent value="categories">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>Categorias</CardTitle>
                    <CardDescription>
                      Organize seus links com cores e emojis.
                      {limits.categories === Infinity
                        ? ' Plano Elite: ilimitado.'
                        : ` Plano ${plan.toUpperCase()}: até ${limits.categories}.`}
                    </CardDescription>
                  </div>
                  <Button onClick={handleNewCategoryClick} size="sm">
                    {canCreateCategory
                      ? <><Plus className="h-4 w-4 mr-1" />Nova categoria</>
                      : <><Sparkles className="h-4 w-4 mr-1" />Upgrade</>}
                  </Button>
                </CardHeader>
                <CardContent>
                  {categories.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      Nenhuma categoria ainda. Crie a primeira para começar a organizar.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {categories.map((cat) => {
                        const count = links.filter((l) => l.category_id === cat.id).length;
                        return (
                          <div key={cat.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                            <div className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-lg text-xl',
                              COLOR_CLASSES[cat.color].bg,
                            )}>
                              {cat.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{cat.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {count} {count === 1 ? 'link' : 'links'}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingCat(cat)}>
                                  <Pencil className="h-4 w-4 mr-2" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeletingCat(cat)}>
                                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* ── Dialogs ── */}
      <CategoryDialog
        open={createCatOpen}
        onOpenChange={setCreateCatOpen}
        onSubmit={async (v) => { await createCategory(v); }}
      />

      <CategoryDialog
        open={!!editingCat}
        onOpenChange={(o) => { if (!o) setEditingCat(null); }}
        initialValue={editingCat ? { name: editingCat.name, color: editingCat.color, emoji: editingCat.emoji } : undefined}
        title="Editar categoria"
        description="Ajuste o nome, cor ou emoji."
        onSubmit={async (v) => { if (editingCat) await updateCategory(editingCat.id, v); }}
      />

      <AlertDialog open={!!deletingCat} onOpenChange={(o) => { if (!o) setDeletingCat(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Os links desta categoria ficarão sem categoria. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (deletingCat) await deleteCategory(deletingCat.id);
              setDeletingCat(null);
            }}>
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

      <Footer />
    </div>
  );
}
