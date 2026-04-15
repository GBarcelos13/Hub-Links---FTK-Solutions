import { Settings, LogOut, CreditCard, User as UserIcon, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Logo } from '@/shared/components/Logo';

export function Header() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useSupabaseAuth();
  const { theme, toggle } = useTheme();

  const initials = (profile?.full_name || profile?.email || user?.email || '?')
    .split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="w-full border-b border-header-border bg-header-bg sticky top-0 z-50">
      <div className="container mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/8 transition-colors"
        >
          <Logo className="h-8 w-auto text-[hsl(var(--header-fg))]" />
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[hsl(var(--header-fg))]/60 hover:bg-white/10 hover:text-[hsl(var(--header-fg))] transition-colors"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="gap-2 text-[hsl(var(--header-fg))]/70 hover:bg-white/10 hover:text-[hsl(var(--header-fg))] rounded-lg h-9"
          >
            <Settings className="h-4 w-4" />
            Gerenciar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/10 h-9 w-9 ml-1"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-display font-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-sm">{profile?.full_name ?? 'Usuário'}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {profile?.email ?? user?.email}
                  </span>
                  <Badge
                    variant="secondary"
                    className="w-fit uppercase text-[10px] font-display font-700 tracking-wide mt-0.5"
                  >
                    {profile?.plan ?? 'free'}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin')}>
                <UserIcon className="h-4 w-4 mr-2" /> Meu hub
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/billing')}>
                <CreditCard className="h-4 w-4 mr-2" /> Plano & cobrança
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
