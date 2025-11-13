import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLinks } from '@/contexts/LinksContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, ExternalLink, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const { links, addLink, removeLink } = useLinks();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newLinkName.trim() && newLinkUrl.trim()) {
      addLink(newLinkName, newLinkUrl);
      setNewLinkName('');
      setNewLinkUrl('');
      toast.success('Link adicionado com sucesso!');
    }
  };

  const handleRemoveLink = (id: string, name: string) => {
    removeLink(id);
    toast.success(`${name} removido com sucesso!`);
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
                <CardTitle>Links Atuais</CardTitle>
                <CardDescription>
                  {links.length} {links.length === 1 ? 'link disponível' : 'links disponíveis'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground truncate">
                            {link.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {link.url}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLink(link.id, link.name)}
                        className="flex-shrink-0 ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {links.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum link cadastrado ainda
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
