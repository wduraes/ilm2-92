import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, School, BookOpen, ClipboardCheck, GraduationCap } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';

const adminTiles = [
  {
    title: 'Usuários',
    description: 'Gerenciar usuários do sistema',
    icon: Users,
    href: '/admin/usuarios',
    color: 'text-blue-600',
  },
  {
    title: 'Municípios',
    description: 'Gerenciar municípios cadastrados',
    icon: MapPin,
    href: '/admin/municipios',
    color: 'text-green-600',
  },
  {
    title: 'Escolas',
    description: 'Gerenciar escolas e coordenadores',
    icon: School,
    href: '/admin/escolas',
    color: 'text-purple-600',
  },
  {
    title: 'Turmas',
    description: 'Gerenciar turmas e professores',
    icon: BookOpen,
    href: '/admin/turmas',
    color: 'text-orange-600',
  },
  {
    title: 'Avaliações',
    description: 'Gerenciar ciclos de avaliação',
    icon: ClipboardCheck,
    href: '/admin/avaliacoes',
    color: 'text-red-600',
  },
  {
    title: 'Alunos',
    description: 'Gerenciar alunos e importações',
    icon: GraduationCap,
    href: '/admin/alunos',
    color: 'text-indigo-600',
  },
];

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <AdminLayout title="Painel Administrativo">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link key={tile.href} to={tile.href}>
                <Card className="h-full transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-muted ${tile.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{tile.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {tile.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}