import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/voicemanager-logo.png';

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <header className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
            <img src={logo} alt="VoiceManager" className="h-12 w-12" />
            <div>
              <h1 className="text-xl font-bold text-foreground">VoiceManager</h1>
              <p className="text-xs text-muted-foreground">Hub de Links</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAdminClick}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Gerenciar
            </Button>
          )}
          
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
              <User className="h-5 w-5 text-primary" />
            </div>
            <span className="hidden sm:inline font-medium text-foreground">{user?.username}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
