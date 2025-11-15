import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLinks } from '@/hooks/useLinks';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableLinkItem } from '@/components/DraggableLinkItem';

export default function Admin() {
  const { links, addLink, removeLink, reorderLinks, saveLinkOrder, cancelReorder, hasChanges, canEditLink, isAdmin } = useLinks();
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newLinkName.trim() && newLinkUrl.trim()) {
      addLink(newLinkName, newLinkUrl);
      setNewLinkName('');
      setNewLinkUrl('');
    }
  };

  const handleRemoveLink = (id: string, name: string) => {
    removeLink(id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      reorderLinks(newLinks);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Dashboard
          </Button>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Gerenciar Links
            </h2>
            <p className="text-muted-foreground">
              Adicione ou remova links do hub
            </p>
          </div>

          <div className="grid gap-6">
            {/* Add Link Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Adicionar Novo Link
                </CardTitle>
                <CardDescription>
                  Preencha os campos abaixo para adicionar um novo link
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddLink} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkName">Nome do Link</Label>
                      <Input
                        id="linkName"
                        placeholder="Ex: BROADWORKS"
                        value={newLinkName}
                        onChange={(e) => setNewLinkName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkUrl">URL</Label>
                      <Input
                        id="linkUrl"
                        type="url"
                        placeholder="https://exemplo.com"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Link
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Links List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Links Atuais</CardTitle>
                    <CardDescription>
                      {links.length} {links.length === 1 ? 'link disponível' : 'links disponíveis'} - Arraste para reordenar
                    </CardDescription>
                  </div>
                  {hasChanges && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={cancelReorder}
                        size="sm"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={saveLinkOrder}
                        size="sm"
                      >
                        Salvar Ordem
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {links.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum link cadastrado ainda
                  </div>
                ) : (
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={links.map(l => l.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {links.map((link) => (
                          <DraggableLinkItem
                            key={link.id}
                            link={link}
                            canEdit={canEditLink(link)}
                            onRemove={handleRemoveLink}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
