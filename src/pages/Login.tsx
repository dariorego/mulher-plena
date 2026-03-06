import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import bgLogin from '@/assets/bg-login.png';
import logoSNI from '@/assets/logoSNI.png';
import { supabase } from '@/integrations/supabase/client';
import { logActivityDirect } from '@/hooks/useActivityLogger';
import { useSettings } from '@/contexts/SettingsContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { loginBackgroundUrl } = useSettings();
  const backgroundImage = loginBackgroundUrl || bgLogin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await login(email, password);
    
    if (!error) {
      // Log login action
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        logActivityDirect(session.user.id, 'login', 'platform');
      }
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } else {
      if (error.includes('Invalid login credentials')) {
        toast.error('Email ou senha inválidos');
      } else if (error.includes('Email not confirmed')) {
        toast.error('Por favor, confirme seu email antes de fazer login');
      } else {
        toast.error(error);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {/* Burgundy Overlay */}
      <div className="absolute inset-0 bg-primary/80" />
      
      <div className="w-full max-w-md relative z-10">
        <Card>
          <div className="flex justify-center pt-6">
            <img src={logoSNI} alt="Mulher Plena" className="h-20 object-contain" />
          </div>
          <CardHeader className="space-y-1 pt-4">
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link to="/recuperar-senha" className="text-xs text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Não tem uma conta?{' '}
                <Link to="/registro" className="text-primary hover:underline">
                  Cadastre-se
                </Link>
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/">Página Inicial</Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
