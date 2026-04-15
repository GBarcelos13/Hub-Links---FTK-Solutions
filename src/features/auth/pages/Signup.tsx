import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Check, Moon, Sun } from 'lucide-react';
import { z } from 'zod';
import { Logo } from '@/shared/components/Logo';
import { useTheme } from '@/contexts/ThemeContext';

const signupSchema = z.object({
  fullName: z.string().trim().min(2, 'Nome muito curto').max(100),
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(100),
});

const PERKS = [
  'Até 5 links grátis para sempre',
  '1 categoria para organizar',
  'Busca & favoritos inclusos',
  'Sync em tempo real',
];

function AuthSidePanel() {
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

      <div className="relative">
        <Logo className="h-8 text-[hsl(var(--header-fg))]" />
      </div>

      <div className="relative space-y-6">
        <div>
          <h2 className="font-display text-3xl font-800 text-[hsl(var(--header-fg))] leading-tight mb-2">
            Comece a organizar<br />seus links hoje.
          </h2>
          <p className="text-[hsl(var(--header-fg))]/60">Gratuito para sempre no plano Free.</p>
        </div>
        <ul className="space-y-3">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-3 text-sm text-[hsl(var(--header-fg))]/80">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Check className="h-3 w-3" />
              </div>
              {perk}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Signup() {
  const { user, signUp, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate('/dashboard', { replace: true });
  }, [user, authLoading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ fullName, email, password });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    setSubmitting(false);
    if (error) { toast.error(error.message || 'Falha ao criar conta'); return; }
    toast.success('Conta criada! Verifique seu e-mail para confirmar.');
    navigate('/login');
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
            <h1 className="font-display text-2xl font-800 text-foreground">Criar sua conta</h1>
            <p className="text-sm text-muted-foreground">Grátis para sempre · Sem cartão de crédito</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Nome completo</Label>
              <Input
                id="fullName" required
                value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="João da Silva" className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
              <Input
                id="email" type="email" required autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com" className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <Input
                id="password" type="password" required autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres" className="h-11 rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl font-display font-700 btn-glow" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-2" />}
              {submitting ? 'Criando conta...' : 'Criar conta grátis'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Ao criar, você concorda com nossos Termos e Privacidade.
          </p>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
