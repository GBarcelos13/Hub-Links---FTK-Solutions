import { useState } from 'react';
import { User, LogOut, Settings, Key } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '@/assets/voicemanager-logo-new.jpeg';
export function Header() {
  const {
    user,
    signOut,
    isAdmin
  } = useSupabaseAuth();
  const navigate = useNavigate();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };
  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Senha alterada com sucesso!');
      setShowPasswordDialog(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };
  return <header className="w-full border-b-2 border-header-border bg-gray-950 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
            <img src={logo} alt="VoiceManager" className="h-16 w-auto" />
            
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleAdminClick} className="gap-2 text-header-fg hover:bg-white/10 hover:text-header-fg">
            <Settings className="h-4 w-4" />
            Gerenciar
          </Button>
          
          <div 
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            onClick={() => setShowPasswordDialog(true)}
          >
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
              <User className="h-5 w-5 text-header-fg" />
            </div>
            <span className="hidden sm:inline font-medium text-header-fg">{user?.email}</span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-header-fg hover:bg-white/10 hover:text-header-fg">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Alterar Senha
            </DialogTitle>
            <DialogDescription>
              Digite sua nova senha abaixo
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </header>;
}