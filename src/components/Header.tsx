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
    <header className="w-full border-b border-border bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="VoiceManager" className="h-10 w-10" />
          <h1 className="text-xl font-semibold text-foreground">VoiceManager</h1>
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
          
          <div className="flex items-center gap-2 text-sm text-foreground">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden sm:inline">{user?.username}</span>
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
