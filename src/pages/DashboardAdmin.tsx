import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { logout } from '@/lib/auth';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Administrador</h1>
            <p className="text-muted-foreground">Bem-vindo ao sistema ILM2</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuários</CardTitle>
              <CardDescription>Gerenciar usuários do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Municípios</CardTitle>
              <CardDescription>Cadastro de municípios</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Escolas</CardTitle>
              <CardDescription>Cadastro de escolas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Turmas</CardTitle>
              <CardDescription>Gerenciar turmas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avaliações</CardTitle>
              <CardDescription>Configurar avaliações</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alunos</CardTitle>
              <CardDescription>Cadastro e importação</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Em breve
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}