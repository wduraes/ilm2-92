import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { Column, Filter } from '@/components/admin/DataTable';
import { fetchWithPagination, deleteRecord, fetchMunicipios, fetchPerfis } from '@/lib/admin-api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  perfil: { nome: string };
  municipio: { nome: string } | null;
}

export default function UsuariosList() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [perfis, setPerfis] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const page = parseInt(searchParams.get('page') || '1');
      const municipioId = searchParams.get('municipio_id') || '';
      const perfilId = searchParams.get('perfil_id') || '';

      const filters: any = {};
      if (municipioId) filters.municipio_id = municipioId;
      if (perfilId) filters.perfil_id = perfilId;

      const result = await fetchWithPagination<Usuario>('usuario', {
        page,
        filters,
        select: `
          id,
          email,
          nome,
          perfil:perfil_id(nome),
          municipio:municipio_id(nome)
        `,
        orderBy: 'nome',
        ascending: true,
      });

      setUsuarios(result.data);
      setPagination({
        currentPage: page,
        totalPages: result.totalPages,
        totalCount: result.count,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar usuários',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [municipiosData, perfisData] = await Promise.all([
        fetchMunicipios(),
        fetchPerfis(),
      ]);
      setMunicipios(municipiosData);
      setPerfis(perfisData);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar filtros',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  useEffect(() => {
    loadFilters();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteRecord('usuario', id);
      toast({
        title: 'Usuário excluído',
        description: 'O usuário foi removido com sucesso.',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir usuário',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const columns: Column<Usuario>[] = [
    { key: 'email', label: 'E-mail' },
    { key: 'nome', label: 'Nome' },
    { 
      key: 'municipio.nome', 
      label: 'Município',
      render: (value) => value || 'Não informado'
    },
    { key: 'perfil.nome', label: 'Perfil' },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, usuario) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/usuarios/${usuario.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza de que deseja excluir o usuário "{usuario.nome}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(usuario.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  const filters: Filter[] = [
    {
      key: 'municipio_id',
      label: 'Município',
      type: 'select',
      options: municipios.map(m => ({ value: m.id, label: m.nome })),
    },
    {
      key: 'perfil_id',
      label: 'Perfil',
      type: 'select',
      options: perfis.map(p => ({ value: p.id, label: p.nome })),
    },
  ];

  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <AdminLayout 
        title="Usuários" 
        breadcrumbItems={[{ label: 'Usuários' }]}
      >
        <DataTable
          title="Gerenciar Usuários"
          data={usuarios}
          columns={columns}
          filters={filters}
          pagination={pagination}
          loading={loading}
          onPageChange={loadData}
          onFiltersChange={loadData}
          createUrl="/admin/usuarios/new"
          createLabel="Adicionar Usuário"
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}