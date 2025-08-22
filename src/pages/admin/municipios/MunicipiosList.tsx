import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { Column, Filter } from '@/components/admin/DataTable';
import { fetchWithPagination, deleteRecord, fetchUFs } from '@/lib/admin-api';
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

interface Municipio {
  id: string;
  nome: string;
  uf_sigla: string;
  ativo: boolean;
}

export default function MunicipiosList() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [ufs, setUfs] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const page = parseInt(searchParams.get('page') || '1');
      const ufSigla = searchParams.get('uf_sigla') || '';

      const filters: any = {};
      if (ufSigla) filters.uf_sigla = ufSigla;

      const result = await fetchWithPagination<Municipio>('municipio', {
        page,
        filters,
        orderBy: 'nome',
        ascending: true,
      });

      setMunicipios(result.data);
      setPagination({
        currentPage: page,
        totalPages: result.totalPages,
        totalCount: result.count,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar municípios',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const ufsData = await fetchUFs();
      setUfs(ufsData);
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
      await deleteRecord('municipio', id);
      toast({
        title: 'Município excluído',
        description: 'O município foi removido com sucesso.',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir município',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const columns: Column<Municipio>[] = [
    { key: 'nome', label: 'Município' },
    { key: 'uf_sigla', label: 'Estado' },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, municipio) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/municipios/${municipio.id}/edit`}>
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
                  Tem certeza de que deseja excluir o município "{municipio.nome}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(municipio.id)}>
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
      key: 'uf_sigla',
      label: 'Estado',
      type: 'select',
      options: ufs.map(uf => ({ value: uf.sigla, label: `${uf.nome} (${uf.sigla})` })),
    },
  ];

  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <AdminLayout 
        title="Municípios" 
        breadcrumbItems={[{ label: 'Municípios' }]}
      >
        <DataTable
          title="Gerenciar Municípios"
          data={municipios}
          columns={columns}
          filters={filters}
          pagination={pagination}
          loading={loading}
          onPageChange={loadData}
          onFiltersChange={loadData}
          createUrl="/admin/municipios/new"
          createLabel="Adicionar Município"
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}