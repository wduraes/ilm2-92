import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { Column, Filter } from '@/components/admin/DataTable';
import { fetchWithPagination, deleteRecord, fetchMunicipios, fetchTiposAvaliacao } from '@/lib/admin-api';
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

interface Avaliacao {
  id: string;
  data_inicio: string;
  data_termino: string;
  municipio: { nome: string };
  tipo: { nome: string };
}

export default function AvaliacoesList() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const page = parseInt(searchParams.get('page') || '1');
      const municipioId = searchParams.get('municipio_id') || '';
      const tipoId = searchParams.get('tipo_id') || '';

      const filters: any = {};
      if (municipioId) filters.municipio_id = municipioId;
      if (tipoId) filters.tipo_id = tipoId;

      const result = await fetchWithPagination<Avaliacao>('avaliacao', {
        page,
        filters,
        select: `
          id,
          data_inicio,
          data_termino,
          municipio:municipio_id(nome),
          tipo:tipo_id(nome)
        `,
        orderBy: 'data_inicio',
        ascending: false,
      });

      setAvaliacoes(result.data);
      setPagination({
        currentPage: page,
        totalPages: result.totalPages,
        totalCount: result.count,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar avaliações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [municipiosData, tiposData] = await Promise.all([
        fetchMunicipios(),
        fetchTiposAvaliacao(),
      ]);
      setMunicipios(municipiosData);
      setTipos(tiposData);
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
      await deleteRecord('avaliacao', id);
      toast({
        title: 'Avaliação excluída',
        description: 'A avaliação foi removida com sucesso.',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir avaliação',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const columns: Column<Avaliacao>[] = [
    { key: 'tipo.nome', label: 'Tipo' },
    { key: 'municipio.nome', label: 'Município' },
    { 
      key: 'data_inicio', 
      label: 'Data de Início',
      render: (value) => new Date(value).toLocaleDateString('pt-BR')
    },
    { 
      key: 'data_termino', 
      label: 'Data de Término',
      render: (value) => new Date(value).toLocaleDateString('pt-BR')
    },
    { 
      key: 'conclusao', 
      label: '% Conclusão',
      render: () => '0%' // Placeholder - será calculado na Part 3
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, avaliacao) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/avaliacoes/${avaliacao.id}/edit`}>
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
                  Tem certeza de que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(avaliacao.id)}>
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
      key: 'tipo_id',
      label: 'Tipo',
      type: 'select',
      options: tipos.map(t => ({ value: t.id, label: t.nome })),
    },
  ];

  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <AdminLayout 
        title="Avaliações" 
        breadcrumbItems={[{ label: 'Avaliações' }]}
      >
        <DataTable
          title="Gerenciar Avaliações"
          data={avaliacoes}
          columns={columns}
          filters={filters}
          pagination={pagination}
          loading={loading}
          onPageChange={loadData}
          onFiltersChange={loadData}
          createUrl="/admin/avaliacoes/new"
          createLabel="Adicionar Avaliação"
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}