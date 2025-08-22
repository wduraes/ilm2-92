import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function CoordenacaoDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Coordenação</h1>
            <p className="text-muted-foreground">Dados da sua escola</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>Visão geral da escola</CardDescription>
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
              <CardDescription>Turmas da escola</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>Relatórios da escola</CardDescription>
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
  );
}