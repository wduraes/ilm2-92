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
import { createRecord, updateRecord, fetchEscolaById, fetchMunicipios, fetchUsuariosByMunicipioAndPerfil } from '@/lib/admin-api';

const escolaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  municipio_id: z.string().min(1, 'Município é obrigatório'),
  coord_inf_id: z.string().optional(),
  coord_fund_id: z.string().optional(),
});

type EscolaForm = z.infer<typeof escolaSchema>;

interface Usuario {
  id: string;
  nome: string;
}

export default function EscolasForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [coordenadores, setCoordenadores] = useState<Usuario[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EscolaForm>({
    resolver: zodResolver(escolaSchema),
  });

  const selectedMunicipio = watch('municipio_id');

  const loadData = async () => {
    try {
      const municipiosData = await fetchMunicipios();
      setMunicipios(municipiosData);

      if (isEditing && id) {
        const escola = await fetchEscolaById(id);
        setValue('nome', escola.nome);
        setValue('municipio_id', escola.municipio_id);
        setValue('coord_inf_id', escola.coord_inf_id || '');
        setValue('coord_fund_id', escola.coord_fund_id || '');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const loadCoordenadores = async (municipioId: string) => {
    if (!municipioId) {
      setCoordenadores([]);
      return;
    }

    try {
      const coordenadoresData = await fetchUsuariosByMunicipioAndPerfil(municipioId, 'coordenacao');
      setCoordenadores(coordenadoresData as Usuario[]);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar coordenadores',
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
      loadCoordenadores(selectedMunicipio);
    }
  }, [selectedMunicipio]);

  const onSubmit = async (data: EscolaForm) => {
    try {
      setLoading(true);
      
      const payload = {
        ...data,
        coord_inf_id: data.coord_inf_id || null,
        coord_fund_id: data.coord_fund_id || null,
      };

      if (isEditing) {
        await updateRecord('escola', id!, payload);
        toast({
          title: 'Escola atualizada',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        await createRecord('escola', payload);
        toast({
          title: 'Escola criada',
          description: 'A escola foi adicionada com sucesso.',
        });
      }
      
      navigate('/admin/escolas');
    } catch (error: any) {
      toast({
        title: isEditing ? 'Erro ao atualizar escola' : 'Erro ao criar escola',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Escolas', href: '/admin/escolas' },
    { label: isEditing ? 'Editar' : 'Nova' },
  ];

  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <AdminLayout 
        title={isEditing ? 'Editar Escola' : 'Nova Escola'} 
        breadcrumbItems={breadcrumbItems}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <div>
            <Label htmlFor="nome">Nome da escola *</Label>
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
            <Label>Coordenadora Infantil</Label>
            <Select onValueChange={(value) => setValue('coord_inf_id', value)} value={watch('coord_inf_id')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar coordenadora (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {coordenadores.map((coord) => (
                  <SelectItem key={coord.id} value={coord.id}>
                    {coord.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Coordenadora Fundamental</Label>
            <Select onValueChange={(value) => setValue('coord_fund_id', value)} value={watch('coord_fund_id')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar coordenadora (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {coordenadores.map((coord) => (
                  <SelectItem key={coord.id} value={coord.id}>
                    {coord.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/escolas')}>
              Cancelar
            </Button>
          </div>
        </form>
      </AdminLayout>
    </ProtectedRoute>
  );
}