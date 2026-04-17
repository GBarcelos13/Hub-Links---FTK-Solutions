import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Sparkles, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

const SEED_LINKS = [
  { name: 'CHAT GPT',   url: 'https://chatgpt.com',       description: 'Assistente de IA', is_favorite: true  },
  { name: 'CLAUDE',     url: 'https://claude.ai',          description: 'IA da Anthropic',  is_favorite: false },
  { name: 'PERPLEXITY', url: 'https://perplexity.ai',      description: 'Busca com IA',     is_favorite: false },
];

export function OnboardingDialog() {
  const { user, profile, refreshProfile } = useSupabaseAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && profile && !profile.onboarded) setOpen(true);
  }, [user, profile]);

  const finish = async (seed: boolean) => {
    if (!user) return;
    setLoading(true);
    try {
      if (seed) {
        const rows = SEED_LINKS
          .filter((l) => l.url.startsWith('http'))
          .map((l, i) => ({ ...l, user_id: user.id, display_order: i }));
        if (rows.length) {
          const { error } = await supabase.from('links').insert(rows);
          if (error) throw error;
        }
      }
      await supabase.from('profiles').update({ onboarded: true }).eq('id', user.id);
      await refreshProfile();
      setOpen(false);
      if (seed) toast.success('Links de exemplo criados! Personalize à vontade.');
    } catch (err) {
      toast.error((err as Error).message || 'Erro no onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) setOpen(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Bem-vindo ao HUB Links!</DialogTitle>
          <DialogDescription className="text-center">
            Quer que a gente crie alguns links de exemplo para você começar?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 my-2">
          {SEED_LINKS.map((l) => (
            <div key={l.name} className="flex items-center gap-2 text-sm p-2 rounded bg-muted">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{l.name}</span>
              <span className="text-muted-foreground truncate">— {l.description}</span>
            </div>
          ))}
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => finish(false)} disabled={loading}>
            Começar vazio
          </Button>
          <Button onClick={() => finish(true)} disabled={loading}>
            Criar exemplos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
