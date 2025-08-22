'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { requestOTPCode, verifyOTPCode, setAuthState } from '@/lib/auth';

interface LoginState {
  step: 'email' | 'code';
  email: string;
  code: string;
  isLoading: boolean;
  message: string;
  error: string;
  cooldownSeconds: number;
}

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [state, setState] = useState<LoginState>({
    step: 'email',
    email: '',
    code: '',
    isLoading: false,
    message: '',
    error: '',
    cooldownSeconds: 0,
  });

  // Cooldown timer effect
  useEffect(() => {
    if (state.cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, cooldownSeconds: prev.cooldownSeconds - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.cooldownSeconds]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.email.trim()) {
      setState(prev => ({ ...prev, error: 'Por favor, insira um e-mail' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: '', message: '' }));

    try {
      const data = await requestOTPCode(state.email);

      setState(prev => ({
        ...prev,
        isLoading: false,
        step: 'code',
        message: data.message,
        cooldownSeconds: 30,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao enviar código. Tente novamente.',
      }));
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (state.code.length !== 6) {
      setState(prev => ({ ...prev, error: 'Por favor, insira o código de 6 dígitos' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: '', message: '' }));

    try {
      const data = await verifyOTPCode(state.email, state.code);

      if (data.success) {
        setAuthState(data.user, data.token);
        // Redirect based on user profile
        const dashboardMap: Record<string, string> = {
          'administrador': '/dashboard-admin',
          'ilm': '/dashboard-ilm',
          'secretaria': '/dashboard-secretaria',
          'coordenacao': '/dashboard-coordenacao',
          'professor': '/dashboard-professor',
        };
        
        const redirectUrl = dashboardMap[data.user.perfil] || '/dashboard-professor';
        navigate(redirectUrl);
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Erro ao verificar código',
        }));
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao verificar código. Tente novamente.',
      }));
    }
  };

  const handleResendCode = () => {
    setState(prev => ({
      ...prev,
      step: 'email',
      code: '',
      message: '',
      error: '',
      cooldownSeconds: 0,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Instituto Ler Mais</CardTitle>
          <CardDescription>
            {state.step === 'email' 
              ? 'Entre com seu e-mail para receber um código de acesso'
              : 'Digite o código de 6 dígitos enviado para seu e-mail'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {state.message && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state.step === 'email' ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={state.email}
                  onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                  disabled={state.isLoading}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={state.isLoading}
              >
                {state.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Receber código'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <InputOTP
                  maxLength={6}
                  value={state.code}
                  onChange={(value) => setState(prev => ({ ...prev, code: value }))}
                  disabled={state.isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={state.isLoading || state.code.length !== 6}
              >
                {state.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar código'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendCode}
                disabled={state.cooldownSeconds > 0}
              >
                {state.cooldownSeconds > 0 
                  ? `Reenviar em ${state.cooldownSeconds}s`
                  : 'Enviar novo código'
                }
              </Button>
            </form>
          )}

          <div className="pt-4 border-t space-y-2">
            <Button variant="link" className="w-full text-sm text-muted-foreground">
              Esqueci meu e-mail
            </Button>
            <Button variant="link" className="w-full text-sm text-muted-foreground">
              Quero trocar meu e-mail
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}