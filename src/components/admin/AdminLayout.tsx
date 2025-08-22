import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logout } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminBreadcrumb from './AdminBreadcrumb';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
}

export default function AdminLayout({ children, title, breadcrumbItems }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao sair do sistema.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="text-xl font-bold text-primary">
                ILM2 Admin
              </Link>
              {breadcrumbItems && <AdminBreadcrumb items={breadcrumbItems} />}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}