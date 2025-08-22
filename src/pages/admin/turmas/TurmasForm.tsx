import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  createRecord, 
  updateRecord, 
  fetchById, 
  fetchMunicipios, 
  fetchEscolasByMunicipio,
  fetchCiclos,
  fetchUsuariosByMunicipioAndPerfil 
} from '@/lib/admin-api';

const turmaSchema = z.object({
  nome: z.string().min(1, 'Nome da turma é obrigatório'),
  municipio_id: z.string().min(1, 'Município é obrigatório'),
  escola_id: z.string().min(1, 'Escola é obrigatória'),
  ciclo_id: z.string().min(1, 'Ciclo é obrigatório'),
  professora_id: z.string().min(1, 'Professora é obrigatória'),
  auxiliar_id: z.string().optional(),
});

type TurmaForm = z.infer<typeof turmaSchema>;

interface Usuario {
  id: string;
  nome: string;
}

export default function TurmasForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [ciclos, setCiclos] = useState<any[]>([]);
  const [professores, setProfessores] = useState<Usuario[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TurmaForm>({
    resolver: zodResolver(turmaSchema),
  });

  const selectedMunicipio = watch('municipio_id');

  const loadData = async () => {
    try {
      const [municipiosData, ciclosData] = await Promise.all([
        fetchMunicipios(),
        fetchCiclos(),
      ]);
      
      setMunicipios(municipiosData);
      setCiclos(ciclosData);

      if (isEditing && id) {
        const turma = await fetchById('turma', id) as any;
        setValue('nome', turma.nome);
        setValue('municipio_id', turma.escola.municipio_id);
        setValue('escola_id', turma.escola_id);
        setValue('ciclo_id', turma.ciclo_id);
        setValue('professora_id', turma.professora_id);
        setValue('auxiliar_id', turma.auxiliar_id || '');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
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

  const loadProfessores = async (municipioId: string) => {
    if (!municipioId) {
      setProfessores([]);
      return;
    }

    try {
      const professoresData = await fetchUsuariosByMunicipioAndPerfil(municipioId, 'professor');
      setProfessores(professoresData as Usuario[]);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar professores',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (selectedMunicipio) {
      loadEscolas(selectedMunicipio);
      loadProfessores(selectedMunicipio);
    }
  }, [selectedMunicipio]);

  const onSubmit = async (data: TurmaForm) => {
    try {
      setLoading(true);
      
      const payload = {
        nome: data.nome,
        escola_id: data.escola_id,
        ciclo_id: data.ciclo_id,
        professora_id: data.professora_id,
        auxiliar_id: data.auxiliar_id || null,
      };

      if (isEditing) {
        await updateRecord('turma', id!, payload);
        toast({
          title: 'Turma atualizada',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        await createRecord('turma', payload);
        toast({
          title: 'Turma criada',
          description: 'A turma foi adicionada com sucesso.',
        });
      }
      
      navigate('/admin/turmas');
    } catch (error: any) {
      toast({
        title: isEditing ? 'Erro ao atualizar turma' : 'Erro ao criar turma',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Turmas', href: '/admin/turmas' },
    { label: isEditing ? 'Editar' : 'Nova' },
  ];

  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <AdminLayout 
        title={isEditing ? 'Editar Turma' : 'Nova Turma'} 
        breadcrumbItems={breadcrumbItems}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <div>
            <Label>Município *</Label>
            <Select onValueChange={(value) => setValue('municipio_id', value)} value={watch('municipio_id')}>
              <SelectTrigger className={errors.municipio_id ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecionar município" />
              </SelectTrigger>
              <SelectContent>
                {municipios.map((municipio) => (
                  <SelectItem key={municipio.id} value={municipio.id}>
                    {municipio.nome} - {municipio.uf_sigla}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.municipio_id && (
              <p className="text-sm text-destructive mt-1">{errors.municipio_id.message}</p>
            )}
          </div>

          <div>
            <Label>Escola *</Label>
            <Select onValueChange={(value) => setValue('escola_id', value)} value={watch('escola_id')}>
              <SelectTrigger className={errors.escola_id ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecionar escola" />
              </SelectTrigger>
              <SelectContent>
                {escolas.map((escola) => (
                  <SelectItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.escola_id && (
              <p className="text-sm text-destructive mt-1">{errors.escola_id.message}</p>
            )}
          </div>

          <div>
            <Label>Ciclo *</Label>
            <Select onValueChange={(value) => setValue('ciclo_id', value)} value={watch('ciclo_id')}>
              <SelectTrigger className={errors.ciclo_id ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecionar ciclo" />
              </SelectTrigger>
              <SelectContent>
                {ciclos.map((ciclo) => (
                  <SelectItem key={ciclo.id} value={ciclo.id}>
                    {ciclo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.ciclo_id && (
              <p className="text-sm text-destructive mt-1">{errors.ciclo_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="nome">Nome da turma *</Label>
            <Input
              id="nome"
              {...register('nome')}
              className={errors.nome ? 'border-destructive' : ''}
            />
            {errors.nome && (
              <p className="text-sm text-destructive mt-1">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <Label>Professora *</Label>
            <Select onValueChange={(value) => setValue('professora_id', value)} value={watch('professora_id')}>
              <SelectTrigger className={errors.professora_id ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecionar professora" />
              </SelectTrigger>
              <SelectContent>
                {professores.map((professor) => (
                  <SelectItem key={professor.id} value={professor.id}>
                    {professor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.professora_id && (
              <p className="text-sm text-destructive mt-1">{errors.professora_id.message}</p>
            )}
          </div>

          <div>
            <Label>Professora Auxiliar</Label>
            <Select onValueChange={(value) => setValue('auxiliar_id', value)} value={watch('auxiliar_id')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar auxiliar (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {professores.map((professor) => (
                  <SelectItem key={professor.id} value={professor.id}>
                    {professor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/turmas')}>
              Cancelar
            </Button>
          </div>
        </form>
      </AdminLayout>
    </ProtectedRoute>
  );
}