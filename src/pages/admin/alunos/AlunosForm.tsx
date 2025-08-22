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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { createRecord, updateRecord, fetchAlunoById, fetchMunicipios, fetchEscolasByMunicipio, fetchTurmasByEscola } from '@/lib/admin-api';

const alunoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  municipio_id: z.string().min(1, 'Município é obrigatório'),
  escola_id: z.string().optional(),
  turma_id: z.string().min(1, 'Turma é obrigatória'),
  is_inclusao: z.boolean(),
});

type AlunoForm = z.infer<typeof alunoSchema>;

export default function AlunosForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AlunoForm>({
    resolver: zodResolver(alunoSchema),
    defaultValues: {
      is_inclusao: false,
    },
  });

  const selectedMunicipio = watch('municipio_id');
  const selectedEscola = watch('escola_id');

  const loadData = async () => {
    try {
      const municipiosData = await fetchMunicipios();
      setMunicipios(municipiosData);

      if (isEditing && id) {
        const aluno = await fetchAlunoById(id);
        setValue('nome', aluno.nome);
        setValue('municipio_id', aluno.municipio_id);
        setValue('escola_id', aluno.escola_id || '');
        setValue('turma_id', aluno.turma_id);
        setValue('is_inclusao', aluno.is_inclusao);
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

  const loadTurmas = async (escolaId: string) => {
    if (!escolaId) {
      setTurmas([]);
      return;
    }

    try {
      const turmasData = await fetchTurmasByEscola(escolaId);
      setTurmas(turmasData);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar turmas',
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
    }
  }, [selectedMunicipio]);

  useEffect(() => {
    if (selectedEscola) {
      loadTurmas(selectedEscola);
    }
  }, [selectedEscola]);

  const onSubmit = async (data: AlunoForm) => {
    try {
      setLoading(true);
      
      const payload = {
        ...data,
        escola_id: data.escola_id || null,
      };

      if (isEditing) {
        await updateRecord('aluno', id!, payload);
        toast({
          title: 'Aluno atualizado',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        await createRecord('aluno', payload);
        toast({
          title: 'Aluno criado',
          description: 'O aluno foi adicionado com sucesso.',
        });
      }
      
      navigate('/admin/alunos');
    } catch (error: any) {
      toast({
        title: isEditing ? 'Erro ao atualizar aluno' : 'Erro ao criar aluno',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Alunos', href: '/admin/alunos' },
    { label: isEditing ? 'Editar' : 'Novo' },
  ];

  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <AdminLayout 
        title={isEditing ? 'Editar Aluno' : 'Novo Aluno'} 
        breadcrumbItems={breadcrumbItems}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <div>
            <Label htmlFor="nome">Nome completo *</Label>
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
            <Label>Escola</Label>
            <Select onValueChange={(value) => setValue('escola_id', value)} value={watch('escola_id')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar escola (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {escolas.map((escola) => (
                  <SelectItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Turma *</Label>
            <Select onValueChange={(value) => setValue('turma_id', value)} value={watch('turma_id')}>
              <SelectTrigger className={errors.turma_id ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecionar turma" />
              </SelectTrigger>
              <SelectContent>
                {turmas.map((turma) => (
                  <SelectItem key={turma.id} value={turma.id}>
                    {turma.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.turma_id && (
              <p className="text-sm text-destructive mt-1">{errors.turma_id.message}</p>
            )}
          </div>

          <div>
            <Label>É aluno de inclusão?</Label>
            <RadioGroup
              value={watch('is_inclusao') ? 'sim' : 'nao'}
              onValueChange={(value) => setValue('is_inclusao', value === 'sim')}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nao" id="nao" />
                <Label htmlFor="nao">Não</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sim" id="sim" />
                <Label htmlFor="sim">Sim</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/alunos')}>
              Cancelar
            </Button>
          </div>
        </form>
      </AdminLayout>
    </ProtectedRoute>
  );
}