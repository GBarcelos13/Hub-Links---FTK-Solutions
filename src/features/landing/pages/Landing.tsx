import { Link, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, ExternalLink, Star, Layers, Tag, Zap, Lock, Search, Sparkles } from 'lucide-react';
import { Logo } from '@/shared/components/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

/* ── Mini app preview shown in hero ──────────────────────────────── */
function AppPreview() {
  const MOCK_CATS = ['📁 Todos', '⭐ Favoritos', '🤖 IA', '🎨 Design', '⚡ Produtiv.'];
  const MOCK_LINKS = ['CHATGPT', 'FIGMA', 'NOTION', 'GITHUB', 'SUPABASE', 'LINEAR'];
  return (
    <div className="relative select-none">
      {/* Glow behind */}
      <div className="absolute -inset-6 rounded-3xl bg-primary/20 blur-3xl -z-10 opacity-60" />
      <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-float">
        {/* Mini topbar */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </div>
          <div className="flex-1 mx-3 rounded bg-border/60 h-5" />
        </div>
        {/* Mini app layout */}
        <div className="flex" style={{ minHeight: 260 }}>
          {/* Sidebar */}
          <div className="w-32 border-r border-border bg-muted/30 p-3 space-y-1 shrink-0">
            {MOCK_CATS.map((cat, i) => (
              <div
                key={cat}
                className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                  i === 0
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </div>
            ))}
          </div>
          {/* Grid */}
          <div className="flex-1 p-4 grid grid-cols-2 gap-2.5 content-start">
            {MOCK_LINKS.map((name, i) => (
              <div
                key={name}
                className="rounded-xl border border-link-button-border bg-link-button px-3 py-3 text-[11px] font-bold tracking-wider text-link-button-text flex items-center gap-1.5 animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Feature card ─────────────────────────────────────────────────── */
function FeatureCard({
  icon: Icon, title, desc, delay = 0,
}: {
  icon: React.ElementType; title: string; desc: string; delay?: number;
}) {
  return (
    <div
      className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1 animate-fade-up overflow-hidden"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Subtle amber glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 transition-all duration-500 group-hover:from-primary/5 group-hover:to-transparent rounded-2xl pointer-events-none" />
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-all duration-300 group-hover:bg-primary/25 group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 font-display text-base font-800 text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

/* ── Pricing plan card ─────────────────────────────────────────────── */
function PlanCard({
  name, price, period, features, cta, highlight, delay = 0,
}: {
  name: string; price: string; period: string;
  features: string[]; cta: string; highlight?: boolean; delay?: number;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-7 transition-all duration-300 animate-fade-up ${
        highlight
          ? 'border-2 border-primary bg-card shadow-2xl shadow-primary/20 scale-[1.04]'
          : 'border border-border/60 bg-card/60 hover:border-border hover:bg-card'
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      {highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-4 py-1 text-xs font-display font-800 text-primary-foreground uppercase tracking-widest shadow-lg">
            Mais popular
          </span>
        </div>
      )}
      <div className="mb-6">
        <p className="mb-3 text-xs font-display font-700 text-muted-foreground uppercase tracking-widest">{name}</p>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className={`font-display font-800 leading-none ${highlight ? 'text-4xl text-primary' : 'text-3xl text-foreground'}`}>
            {price}
          </span>
          <span className="text-muted-foreground text-sm">{period}</span>
        </div>
      </div>
      <ul className="mb-8 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${highlight ? 'bg-primary/20' : 'bg-border'}`}>
              <Check className={`h-2.5 w-2.5 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <span className="text-muted-foreground">{f}</span>
          </li>
        ))}
      </ul>
      <Button
        asChild
        className={`w-full rounded-xl h-11 font-display font-700 tracking-wide ${highlight ? 'btn-glow shadow-lg shadow-primary/20' : ''}`}
        variant={highlight ? 'default' : 'outline'}
        size="lg"
      >
        <Link to="/signup">{cta}</Link>
      </Button>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */
export default function Landing() {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const FEATURES = [
    { icon: Layers,   title: 'Tudo num só lugar',   desc: 'Ferramentas, IAs, docs, apps internos — qualquer link que você usa no trabalho, centralizado.' },
    { icon: Search,   title: 'Busca instantânea',   desc: 'Ache qualquer link em segundos pelo nome, URL ou descrição. Sem scrollar eternamente.' },
    { icon: Star,     title: 'Favoritos no topo',   desc: 'Marque o que você mais usa e deixe sempre à mão, com um clique.' },
    { icon: Tag,      title: 'Categorias com cor',  desc: 'Crie sua própria taxonomia — "IA", "Design", "Produtividade" — com emojis e cores.' },
    { icon: Zap,      title: 'Sync em tempo real',  desc: 'Abriu numa aba? Aparece em todas. Mudanças sincronizam instantaneamente.' },
    { icon: Lock,     title: '100% privado',        desc: 'Seu hub é só seu. Nada de link-in-bio, nada de página pública. Seus links, suas regras.' },
  ];

  const PLANS = [
    {
      name: 'Free', price: 'Grátis', period: 'para sempre',
      features: ['Até 5 links', '1 categoria', 'Busca & favoritos', 'Sync em tempo real'],
      cta: 'Começar grátis', highlight: false,
    },
    {
      name: 'Pro', price: 'R$ 4,99', period: '/mês',
      features: ['Até 30 links', '5 categorias', 'Tudo do Free', 'Suporte prioritário'],
      cta: 'Assinar Pro agora', highlight: true,
    },
    {
      name: 'Elite', price: 'R$ 9,99', period: '/mês',
      features: ['Até 100 links', 'Categorias ilimitadas', 'Tudo do Pro', 'Suporte dedicado'],
      cta: 'Assinar Elite', highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-header-border bg-header-bg/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Logo className="h-8 text-[hsl(var(--header-fg))]" />

          <nav className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-header-fg/70 hover:bg-white/10 hover:text-header-fg transition-colors"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {user ? (
              <Button onClick={() => navigate('/dashboard')} className="rounded-lg btn-glow">
                Abrir meu hub <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="text-header-fg/80 hover:bg-white/10 hover:text-header-fg rounded-lg" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button className="rounded-lg btn-glow" asChild>
                  <Link to="/signup">Começar grátis</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-header-bg">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />

        <div className="container relative mx-auto grid min-h-[88vh] grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-2">
          {/* Left: copy */}
          <div className="space-y-8">
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <div className="hub-dot" />
              <span className="font-medium">Produtividade · Privado · Rápido</span>
            </div>

            <div className="animate-fade-up animate-delay-100 space-y-4">
              <h1 className="font-display text-5xl font-800 leading-[1.05] text-[hsl(var(--header-fg))] md:text-6xl lg:text-[64px]">
                Sua central de<br />
                <span className="text-amber-gradient">links de trabalho.</span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-[hsl(var(--header-fg))]/60">
                Ferramentas de produtividade, IAs, documentações, apps internos —
                tudo num hub só seu. Privado, rápido e organizado do seu jeito.
              </p>
            </div>

            <div className="animate-fade-up animate-delay-200 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="h-13 rounded-xl px-8 font-display font-700 text-base btn-glow shadow-lg shadow-primary/25"
                asChild
              >
                <Link to="/signup">
                  Começar grátis <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-13 rounded-xl px-8 font-display font-700 text-base border-white/20 text-[hsl(var(--header-fg))]/80 hover:bg-white/10 hover:text-[hsl(var(--header-fg))] bg-transparent"
                asChild
              >
                <Link to="#pricing">Ver planos</Link>
              </Button>
            </div>

            <p className="animate-fade-up animate-delay-300 text-sm text-[hsl(var(--header-fg))]/40">
              Sem cartão de crédito · Grátis para sempre no plano Free
            </p>
          </div>

          {/* Right: app preview */}
          <div className="animate-fade-up animate-delay-400 hidden lg:block">
            <AppPreview />
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="relative py-24 bg-header-bg">
        {/* Subtle divider from hero */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">Funcionalidades</p>
          <h2 className="font-display text-4xl font-800 text-foreground">
            Um hub pra tudo que você usa
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Pare de perder links em abas, bookmarks e mensagens. Centralize tudo num só lugar, organizado como você preferir.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon, title, desc }, i) => (
            <FeatureCard key={title} icon={icon} title={title} desc={desc} delay={i * 0.07} />
          ))}
        </div>
      </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <section id="pricing" className="relative bg-background py-24">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">Preços</p>
            <h2 className="font-display text-4xl font-800 text-foreground">
              Planos simples, sem surpresas
            </h2>
            <p className="mt-4 text-muted-foreground">
              Comece grátis. Faça upgrade quando o hub crescer.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3 items-center">
            {PLANS.map((p, i) => (
              <PlanCard key={p.name} {...p} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────── */}
      <section className="bg-header-bg py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-fade-up mx-auto max-w-2xl space-y-6">
            <h2 className="font-display text-4xl font-800 text-[hsl(var(--header-fg))]">
              Pronto para organizar seu trabalho?
            </h2>
            <p className="text-lg text-[hsl(var(--header-fg))]/60">
              Leva 30 segundos para criar sua conta. Sem cartão de crédito.
            </p>
            <Button
              size="lg"
              className="h-14 px-10 text-base font-display font-700 rounded-xl btn-glow shadow-xl shadow-primary/30"
              asChild
            >
              <Link to="/signup">
                <Sparkles className="mr-2 h-5 w-5" />
                Criar conta grátis agora
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-footer-border bg-footer-bg">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Logo className="h-7 text-[hsl(var(--footer-fg))]" />
            <p className="text-sm text-footer-fg/50">
              &copy; {new Date().getFullYear()} HUB Links. Todos os direitos reservados.
            </p>
            <div className="flex gap-4 text-sm text-footer-fg/50">
              <Link to="/login" className="hover:text-footer-fg transition-colors">Entrar</Link>
              <Link to="/signup" className="hover:text-footer-fg transition-colors">Criar conta</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
