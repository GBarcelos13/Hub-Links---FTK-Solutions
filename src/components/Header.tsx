import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/voicemanager-logo.webp';
export function Header() {
  const {
    user,
    logout,
    isAdmin
  } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const handleAdminClick = () => {
    navigate('/admin');
  };
  return <header className="w-full border-b-2 border-header-border bg-header-bg sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between bg-gray-950">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
            <img src={logo} alt="VoiceManager" className="h-12 w-12" />
            <div>
              <h1 className="text-xl font-bold text-header-fg">VoiceManager</h1>
              <p className="text-xs text-header-fg/80">Hub de Links</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && <Button variant="ghost" size="sm" onClick={handleAdminClick} className="gap-2 text-header-fg hover:bg-white/10 hover:text-header-fg">
              <Settings className="h-4 w-4" />
              Gerenciar
            </Button>}
          
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
              <User className="h-5 w-5 text-header-fg" />
            </div>
            <span className="hidden sm:inline font-medium text-header-fg">{user?.username}</span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-header-fg hover:bg-white/10 hover:text-header-fg">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>;
}