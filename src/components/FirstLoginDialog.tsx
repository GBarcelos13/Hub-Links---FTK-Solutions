import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Key, Info } from 'lucide-react';
import { toast } from 'sonner';

export function FirstLoginDialog() {
  const { user } = useSupabaseAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    checkFirstLogin();
  }, [user]);

  const checkFirstLogin = async () => {
    if (!user || isCompleted) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_login')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.first_login === true) {
        setShowDialog(true);
      }
    } catch (error) {
      console.error('Error checking first login:', error);
    }
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
      // Update password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (passwordError) throw passwordError;

      // Mark first login as complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ first_login: false })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      toast.success('Senha alterada com sucesso!');
      setIsCompleted(true);
      setShowDialog(false);
      setShowHint(true);
      
      // Hide hint after 10 seconds
      setTimeout(() => setShowHint(false), 10000);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={showDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Bem-vindo! Altere sua senha
            </DialogTitle>
            <DialogDescription>
              Por segurança, por favor altere sua senha no primeiro acesso
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="first-new-password">Nova Senha</Label>
              <Input
                id="first-new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="first-confirm-password">Confirmar Senha</Label>
              <Input
                id="first-confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Alterando...' : 'Alterar Senha e Continuar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {showHint && (
        <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">Dica!</p>
                <p className="text-sm">
                  Você pode alterar sua senha a qualquer momento clicando no seu e-mail no canto superior direito.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
