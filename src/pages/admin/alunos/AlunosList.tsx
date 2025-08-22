import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Users, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { Column, Filter } from '@/components/admin/DataTable';
import { fetchWithPagination, deleteRecord, fetchMunicipios } from '@/lib/admin-api';
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

interface Aluno {
  id: string;
  nome: string;
  is_inclusao: boolean;
  municipio: { nome: string };
  escola: { nome: string } | null;
  turma: { nome: string };
}

export default function AlunosList() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [municipios, setMunicipios] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const page = parseInt(searchParams.get('page') || '1');
      const municipioId = searchParams.get('municipio_id') || '';
      const inclusao = searchParams.get('inclusao') || '';

      const filters: any = {};
      if (municipioId) filters.municipio_id = municipioId;
      if (inclusao === 'sim') filters.is_inclusao = true;
      if (inclusao === 'nao') filters.is_inclusao = false;

      const result = await fetchWithPagination<Aluno>('aluno', {
        page,
        filters,
        select: `
          id,
          nome,
          is_inclusao,
          municipio:municipio_id(nome),
          escola:escola_id(nome),
          turma:turma_id(nome)
        `,
        orderBy: 'nome',
        ascending: true,
      });

      setAlunos(result.data);
      setPagination({
        currentPage: page,
        totalPages: result.totalPages,
        totalCount: result.count,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar alunos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const municipiosData = await fetchMunicipios();
      setMunicipios(municipiosData);
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
      await deleteRecord('aluno', id);
      toast({
        title: 'Aluno excluído',
        description: 'O aluno foi removido com sucesso.',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir aluno',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const columns: Column<Aluno>[] = [
    { 
      key: 'nome', 
      label: 'Nome do Aluno',
      render: (value, aluno) => (
        <div className="flex items-center gap-2">
          {aluno.is_inclusao && <UserCheck className="h-4 w-4 text-blue-600" />}
          <span>{value}</span>
        </div>
      )
    },
    { key: 'municipio.nome', label: 'Município' },
    { 
      key: 'escola.nome', 
      label: 'Escola', 
      render: (value) => value || 'Não informada'
    },
    { key: 'turma.nome', label: 'Turma' },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, aluno) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/alunos/${aluno.id}/edit`}>
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
                  Tem certeza de que deseja excluir o aluno "{aluno.nome}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(aluno.id)}>
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
      options: municipios.map(m => ({ value: m.id, label: `${m.nome} - ${m.uf_sigla}` })),
    },
    {
      key: 'inclusao',
      label: 'Inclusão',
      type: 'select',
      options: [
        { value: 'sim', label: 'Sim' },
        { value: 'nao', label: 'Não' },
      ],
    },
  ];

  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <AdminLayout 
        title="Alunos" 
        breadcrumbItems={[{ label: 'Alunos' }]}
      >
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button asChild>
              <Link to="/admin/alunos/new">
                <Users className="h-4 w-4 mr-2" />
                Adicionar Aluno
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/alunos/import">
                Importar Alunos
              </Link>
            </Button>
          </div>
          
          <DataTable
            title="Gerenciar Alunos"
            data={alunos}
            columns={columns}
            filters={filters}
            pagination={pagination}
            loading={loading}
            onPageChange={loadData}
            onFiltersChange={loadData}
          />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}