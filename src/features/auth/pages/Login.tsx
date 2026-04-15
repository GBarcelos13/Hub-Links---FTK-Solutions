import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Moon, Sun } from 'lucide-react';
import { Logo } from '@/shared/components/Logo';
import { useTheme } from '@/contexts/ThemeContext';

function AuthSidePanel() {
  const quotes = [
    { text: 'Seus links, suas regras.', sub: 'Hub privado de produtividade' },
    { text: 'Tudo num só lugar.', sub: 'Pare de perder links em abas' },
    { text: 'Organizado do seu jeito.', sub: 'Categorias com cor e emoji' },
  ];
  const q = quotes[Math.floor(Date.now() / 10000) % quotes.length];

  return (
    <div className="relative hidden lg:flex flex-col justify-between bg-header-bg p-12 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute top-20 right-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />

      <div className="relative">
        <Logo className="h-8 text-[hsl(var(--header-fg))]" />
      </div>

      <div className="relative space-y-4">
        <h2 className="font-display text-3xl font-800 text-[hsl(var(--header-fg))] leading-tight">
          {q.text}
        </h2>
        <p className="text-[hsl(var(--header-fg))]/60 text-base">{q.sub}</p>
        <div className="flex gap-1.5 pt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === quotes.indexOf(q) ? 'w-6 bg-primary' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const { user, signIn, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate(from, { replace: true });
  }, [user, authLoading, navigate, from]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) { toast.error(error.message || 'Falha ao entrar'); return; }
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <AuthSidePanel />

      <div className="flex flex-col items-center justify-center p-8 relative">
        <button
          onClick={toggle}
          className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="w-full max-w-sm space-y-8 animate-fade-up">
          <div className="lg:hidden flex justify-center mb-2">
            <Link to="/"><Logo className="h-9" /></Link>
          </div>

          <div className="space-y-1">
            <h1 className="font-display text-2xl font-800 text-foreground">Bem-vindo de volta</h1>
            <p className="text-sm text-muted-foreground">Acesse seu hub de links</p>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
              <Input
                id="password" type="password" required autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl font-display font-700 btn-glow" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-2" />}
              {submitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
