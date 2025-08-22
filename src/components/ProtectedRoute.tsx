import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthState } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedProfiles?: string[];
}

export default function ProtectedRoute({ children, allowedProfiles }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = () => {
      const authState = getAuthState();
      
      if (!authState.isAuthenticated) {
        navigate('/login');
        return;
      }
      
      if (allowedProfiles && !allowedProfiles.includes(authState.user!.perfil)) {
        // Redirect to appropriate dashboard for their profile
        const dashboardMap: Record<string, string> = {
          'administrador': '/dashboard-admin',
          'ilm': '/dashboard-ilm',
          'secretaria': '/dashboard-secretaria',
          'coordenacao': '/dashboard-coordenacao',
          'professor': '/dashboard-professor',
        };
        
        const redirectUrl = dashboardMap[authState.user!.perfil] || '/dashboard-professor';
        navigate(redirectUrl);
        return;
      }
      
      setIsChecking(false);
    };
    
    checkAuth();
  }, [navigate, allowedProfiles]);
  
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl text-muted-foreground">Verificando autenticação...</h1>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}