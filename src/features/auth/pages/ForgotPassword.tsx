import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, MailCheck, Moon, Sun } from 'lucide-react';
import { Logo } from '@/shared/components/Logo';
import { useTheme } from '@/contexts/ThemeContext';

export default function ForgotPassword() {
  const { resetPassword } = useSupabaseAuth();
  const { theme, toggle } = useTheme();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await resetPassword(email);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative">
      <button
        onClick={toggle}
        className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="w-full max-w-sm space-y-8 animate-fade-up">
        <div className="text-center space-y-4">
          <Link to="/" className="inline-block">
            <Logo className="h-9 mx-auto" />
          </Link>
        </div>

        {sent ? (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MailCheck className="h-8 w-8" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-2xl font-800 text-foreground mb-2">E-mail enviado!</h1>
              <p className="text-sm text-muted-foreground">
                Se houver uma conta com esse e-mail, você receberá o link de recuperação em instantes.
              </p>
            </div>
            <Button asChild variant="outline" className="w-full h-11 rounded-xl">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para login
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-800 text-foreground">Recuperar senha</h1>
              <p className="text-sm text-muted-foreground">
                Enviaremos um link para você redefinir sua senha.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                <Input
                  id="email" type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com" className="h-11 rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl font-display font-700 btn-glow" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {submitting ? 'Enviando...' : 'Enviar link de recuperação'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Voltar ao login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
