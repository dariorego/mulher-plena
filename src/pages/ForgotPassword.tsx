import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import bgLogin from '@/assets/bg-login.png';
import logoSNI from '@/assets/logoSNI.png';
import { useSettings } from '@/contexts/SettingsContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { loginBackgroundUrl } = useSettings();
  const backgroundImage = loginBackgroundUrl || bgLogin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Por favor, informe seu email');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'https://sni.plataformaativa.com.br/redefinir-senha',
    });
    setIsLoading(false);

    if (error) {
      toast.error('Erro ao enviar email de recuperação. Tente novamente.');
    } else {
      setSent(true);
      toast.success('Email de recuperação enviado!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-primary/80" />

      <div className="w-full max-w-md relative z-10">
        <Card>
          <div className="flex justify-center pt-6">
            <img src={logoSNI} alt="Mulher Plena" className="h-20 object-contain" />
          </div>
          <CardHeader className="space-y-1 pt-4">
            <CardTitle className="text-2xl">Recuperar senha</CardTitle>
            <CardDescription>
            {sent
                ? 'Verifique sua caixa de entrada e clique no link enviado para redefinir sua senha. Caso não encontre, verifique também a pasta de lixeira ou spam.'
                : 'Informe seu email para receber o link de recuperação de senha.'}
            </CardDescription>
          </CardHeader>

          {!sent ? (
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
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar link de recuperação
                </Button>
                <Link to="/login" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" /> Voltar ao login
                </Link>
              </CardFooter>
            </form>
          ) : (
            <CardFooter className="flex flex-col gap-4">
              <div className="flex items-center justify-center text-muted-foreground">
                <Mail className="h-10 w-10" />
              </div>
              <Link to="/login" className="text-sm text-primary hover:underline flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Voltar ao login
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
