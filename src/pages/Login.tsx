import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import logo from '@/assets/voicemanager-logo.png';
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } else {
      toast.error('Credenciais inválidas');
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="VoiceManager" className="h-20 w-20" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">VoiceManager Hub</h1>
          <p className="text-muted-foreground">Acesse seus links de trabalho</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input id="username" type="text" placeholder="Digite seu usuário" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Digite sua senha" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <Button type="submit" size="lg" className="w-full text-slate-100 bg-zinc-950 hover:bg-zinc-800">
              Entrar
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Credenciais de teste:<br />
              <strong>admin</strong> / admin123 (Administrador)<br />
              <strong>user</strong> / user123 (Usuário)
            </p>
          </div>
        </div>
      </div>
    </div>;
}