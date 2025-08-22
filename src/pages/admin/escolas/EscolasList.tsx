import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
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

interface Escola {
  id: string;
  nome: string;
  municipio: { nome: string; uf_sigla: string };
  coord_inf: { nome: string } | null;
  coord_fund: { nome: string } | null;
}

export default function EscolasList() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [escolas, setEscolas] = useState<Escola[]>([]);
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

      const filters: any = {};
      if (municipioId) filters.municipio_id = municipioId;

      const result = await fetchWithPagination<Escola>('escola', {
        page,
        filters,
        select: `
          id,
          nome,
          municipio:municipio_id(nome, uf_sigla),
          coord_inf:coord_inf_id(nome),
          coord_fund:coord_fund_id(nome)
        `,
        orderBy: 'nome',
        ascending: true,
      });

      setEscolas(result.data);
      setPagination({
        currentPage: page,
        totalPages: result.totalPages,
        totalCount: result.count,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar escolas',
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
      await deleteRecord('escola', id);
      toast({
        title: 'Escola excluída',
        description: 'A escola foi removida com sucesso.',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir escola',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const columns: Column<Escola>[] = [
    { key: 'nome', label: 'Escola' },
    { key: 'municipio.nome', label: 'Município' },
    { key: 'municipio.uf_sigla', label: 'Estado' },
    { 
      key: 'coord_inf.nome', 
      label: 'Coord. Infantil',
      render: (value) => value || 'Não informado'
    },
    { 
      key: 'coord_fund.nome', 
      label: 'Coord. Fundamental',
      render: (value) => value || 'Não informado'
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, escola) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/escolas/${escola.id}/edit`}>
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
                  Tem certeza de que deseja excluir a escola "{escola.nome}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(escola.id)}>
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
  ];

  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <AdminLayout 
        title="Escolas" 
        breadcrumbItems={[{ label: 'Escolas' }]}
      >
        <DataTable
          title="Gerenciar Escolas"
          data={escolas}
          columns={columns}
          filters={filters}
          pagination={pagination}
          loading={loading}
          onPageChange={loadData}
          onFiltersChange={loadData}
          createUrl="/admin/escolas/new"
          createLabel="Adicionar Escola"
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}