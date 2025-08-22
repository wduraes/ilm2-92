import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { Column, Filter } from '@/components/admin/DataTable';
import { fetchWithPagination, deleteRecord, fetchMunicipios, fetchCiclos, fetchEscolasByMunicipio } from '@/lib/admin-api';
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

interface Turma {
  id: string;
  nome: string;
  escola: { nome: string; municipio: { nome: string } };
  ciclo: { nome: string };
  professora: { nome: string };
  auxiliar: { nome: string } | null;
}

export default function TurmasList() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [ciclos, setCiclos] = useState<any[]>([]);

  const selectedMunicipio = searchParams.get('municipio_id') || '';

  const loadData = async () => {
    try {
      setLoading(true);
      const page = parseInt(searchParams.get('page') || '1');
      const municipioId = searchParams.get('municipio_id') || '';
      const escolaId = searchParams.get('escola_id') || '';
      const cicloId = searchParams.get('ciclo_id') || '';

      const filters: any = {};
      if (escolaId) filters.escola_id = escolaId;
      if (cicloId) filters.ciclo_id = cicloId;

      const result = await fetchWithPagination<Turma>('turma', {
        page,
        filters,
        select: `
          id,
          nome,
          escola:escola_id(nome, municipio:municipio_id(nome)),
          ciclo:ciclo_id(nome),
          professora:professora_id(nome),
          auxiliar:auxiliar_id(nome)
        `,
        orderBy: 'nome',
        ascending: true,
      });

      // Filter by municipio if selected (since we can't filter directly in the query due to nested relation)
      let filteredData = result.data;
      if (municipioId) {
        filteredData = result.data.filter(turma => 
          turma.escola?.municipio?.nome && 
          municipios.find(m => m.id === municipioId)?.nome === turma.escola.municipio.nome
        );
      }

      setTurmas(filteredData);
      setPagination({
        currentPage: page,
        totalPages: result.totalPages,
        totalCount: filteredData.length,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar turmas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [municipiosData, ciclosData] = await Promise.all([
        fetchMunicipios(),
        fetchCiclos(),
      ]);
      setMunicipios(municipiosData);
      setCiclos(ciclosData);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar filtros',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const loadEscolas = async (municipioId: string) => {
    if (!municipioId) {
      setEscolas([]);
      return;
    }

    try {
      const escolasData = await fetchEscolasByMunicipio(municipioId);
      setEscolas(escolasData);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar escolas',
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

  useEffect(() => {
    if (selectedMunicipio) {
      loadEscolas(selectedMunicipio);
    }
  }, [selectedMunicipio]);

  const handleDelete = async (id: string) => {
    try {
      await deleteRecord('turma', id);
      toast({
        title: 'Turma excluída',
        description: 'A turma foi removida com sucesso.',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir turma',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const columns: Column<Turma>[] = [
    { key: 'nome', label: 'Turma' },
    { key: 'escola.municipio.nome', label: 'Município' },
    { key: 'escola.nome', label: 'Escola' },
    { key: 'ciclo.nome', label: 'Ciclo' },
    { key: 'professora.nome', label: 'Professora' },
    { 
      key: 'auxiliar.nome', 
      label: 'Auxiliar',
      render: (value) => value || 'Não informado'
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, turma) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/turmas/${turma.id}/edit`}>
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
                  Tem certeza de que deseja excluir a turma "{turma.nome}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(turma.id)}>
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
      key: 'escola_id',
      label: 'Escola',
      type: 'select',
      options: escolas.map(e => ({ value: e.id, label: e.nome })),
    },
    {
      key: 'ciclo_id',
      label: 'Ciclo',
      type: 'select',
      options: ciclos.map(c => ({ value: c.id, label: c.nome })),
    },
  ];

  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <AdminLayout 
        title="Turmas" 
        breadcrumbItems={[{ label: 'Turmas' }]}
      >
        <DataTable
          title="Gerenciar Turmas"
          data={turmas}
          columns={columns}
          filters={filters}
          pagination={pagination}
          loading={loading}
          onPageChange={loadData}
          onFiltersChange={loadData}
          createUrl="/admin/turmas/new"
          createLabel="Adicionar Turma"
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}