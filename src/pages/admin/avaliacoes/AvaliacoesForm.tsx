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
import { createRecord, updateRecord, fetchAvaliacaoById, fetchMunicipios, fetchTiposAvaliacao } from '@/lib/admin-api';

const avaliacaoSchema = z.object({
  municipio_id: z.string().min(1, 'Município é obrigatório'),
  tipo_id: z.string().min(1, 'Tipo da avaliação é obrigatório'),
  data_inicio: z.string().min(1, 'Data de início é obrigatória'),
  data_termino: z.string().min(1, 'Data de término é obrigatória'),
}).refine((data) => {
  return new Date(data.data_termino) >= new Date(data.data_inicio);
}, {
  message: "Data de término deve ser posterior à data de início",
  path: ["data_termino"],
});

type AvaliacaoForm = z.infer<typeof avaliacaoSchema>;

export default function AvaliacoesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AvaliacaoForm>({
    resolver: zodResolver(avaliacaoSchema),
  });

  const loadData = async () => {
    try {
      const [municipiosData, tiposData] = await Promise.all([
        fetchMunicipios(),
        fetchTiposAvaliacao(),
      ]);
      
      setMunicipios(municipiosData);
      setTipos(tiposData);

      if (isEditing && id) {
        const avaliacao = await fetchAvaliacaoById(id);
        setValue('municipio_id', avaliacao.municipio_id);
        setValue('tipo_id', avaliacao.tipo_id);
        setValue('data_inicio', avaliacao.data_inicio);
        setValue('data_termino', avaliacao.data_termino);
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const onSubmit = async (data: AvaliacaoForm) => {
    try {
      setLoading(true);
      
      if (isEditing) {
        await updateRecord('avaliacao', id!, data);
        toast({
          title: 'Avaliação atualizada',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        await createRecord('avaliacao', data);
        toast({
          title: 'Avaliação criada',
          description: 'A avaliação foi adicionada com sucesso.',
        });
      }
      
      navigate('/admin/avaliacoes');
    } catch (error: any) {
      toast({
        title: isEditing ? 'Erro ao atualizar avaliação' : 'Erro ao criar avaliação',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Avaliações', href: '/admin/avaliacoes' },
    { label: isEditing ? 'Editar' : 'Nova' },
  ];

  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <AdminLayout 
        title={isEditing ? 'Editar Avaliação' : 'Nova Avaliação'} 
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
            <Label>Tipo da Avaliação *</Label>
            <Select onValueChange={(value) => setValue('tipo_id', value)} value={watch('tipo_id')}>
              <SelectTrigger className={errors.tipo_id ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {tipos.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipo_id && (
              <p className="text-sm text-destructive mt-1">{errors.tipo_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="data_inicio">Data de Início *</Label>
            <Input
              id="data_inicio"
              type="date"
              {...register('data_inicio')}
              className={errors.data_inicio ? 'border-destructive' : ''}
            />
            {errors.data_inicio && (
              <p className="text-sm text-destructive mt-1">{errors.data_inicio.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="data_termino">Data de Término *</Label>
            <Input
              id="data_termino"
              type="date"
              {...register('data_termino')}
              className={errors.data_termino ? 'border-destructive' : ''}
            />
            {errors.data_termino && (
              <p className="text-sm text-destructive mt-1">{errors.data_termino.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/avaliacoes')}>
              Cancelar
            </Button>
          </div>
        </form>
      </AdminLayout>
    </ProtectedRoute>
  );
}