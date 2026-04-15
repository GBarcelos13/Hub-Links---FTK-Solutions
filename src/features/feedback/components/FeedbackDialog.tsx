import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle2, MessageCircle } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: Props) {
  const { profile, user } = useSupabaseAuth();

  const [name,    setName]    = useState(profile?.full_name ?? '');
  const [email,   setEmail]   = useState(profile?.email ?? user?.email ?? '');
  const [phone,   setPhone]   = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleClose = (v: boolean) => {
    if (!sending) {
      onOpenChange(v);
      if (!v) {
        // reset após fechar (com pequeno delay para evitar flash)
        setTimeout(() => { setSent(false); setPhone(''); setMessage(''); }, 300);
      }
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!WEB3FORMS_KEY) {
      toast.error('Chave Web3Forms não configurada. Adicione VITE_WEB3FORMS_KEY no .env');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `[HUB Links] Feedback de ${name || email}`,
          name:    name.trim()    || 'Sem nome',
          email:   email.trim()   || 'Sem e-mail',
          phone:   phone.trim()   || 'Não informado',
          message: message.trim(),
          // Metadados extras — aparecem no e-mail recebido
          from_name: 'HUB Links Feedback',
        }),
      });

      const json = await res.json() as { success: boolean; message?: string };

      if (!res.ok || !json.success) {
        throw new Error(json.message ?? 'Erro no envio');
      }

      setSent(true);
    } catch (err) {
      toast.error((err as Error).message || 'Não foi possível enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">Fale conosco</DialogTitle>
          <DialogDescription className="text-center">
            Dúvidas, sugestões ou problemas? Nos conta — respondemos rápido.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="h-14 w-14 text-primary" />
            <div>
              <p className="font-display text-lg font-700 text-foreground">Mensagem enviada!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Obrigado pelo contato. Retornaremos em breve.
              </p>
            </div>
            <Button className="mt-2 w-full rounded-xl" onClick={() => handleClose(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="fb-name">Nome</Label>
              <Input
                id="fb-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fb-phone">Telefone</Label>
              <Input
                id="fb-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 91234-5678"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fb-email">E-mail</Label>
              <Input
                id="fb-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fb-message">Mensagem <span className="text-destructive">*</span></Label>
              <Textarea
                id="fb-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Conta o que você está precisando..."
                rows={4}
                required
                className="resize-none rounded-xl"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => handleClose(false)}
                disabled={sending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-xl font-display font-700 btn-glow"
                disabled={sending || !message.trim()}
              >
                {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {sending ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
