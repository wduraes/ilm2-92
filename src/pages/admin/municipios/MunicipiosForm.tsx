import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { createRecord, updateRecord, fetchById, fetchUFs } from '@/lib/admin-api';

const municipioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  uf_sigla: z.string().min(2, 'Estado é obrigatório'),
  ativo: z.boolean(),
});

type MunicipioForm = z.infer<typeof municipioSchema>;

export default function MunicipiosForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [ufs, setUfs] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MunicipioForm>({
    resolver: zodResolver(municipioSchema),
    defaultValues: {
      ativo: true,
    },
  });

  const loadData = async () => {
    try {
      const ufsData = await fetchUFs();
      setUfs(ufsData);

      if (isEditing && id) {
        const municipio = await fetchById('municipio', id);
        setValue('nome', municipio.nome);
        setValue('uf_sigla', municipio.uf_sigla);
        setValue('ativo', municipio.ativo);
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

  const onSubmit = async (data: MunicipioForm) => {
    try {
      setLoading(true);
      
      if (isEditing) {
        await updateRecord('municipio', id!, data);
        toast({
          title: 'Município atualizado',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        await createRecord('municipio', data);
        toast({
          title: 'Município criado',
          description: 'O município foi adicionado com sucesso.',
        });
      }
      
      navigate('/admin/municipios');
    } catch (error: any) {
      toast({
        title: isEditing ? 'Erro ao atualizar município' : 'Erro ao criar município',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Municípios', href: '/admin/municipios' },
    { label: isEditing ? 'Editar' : 'Novo' },
  ];

  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <AdminLayout 
        title={isEditing ? 'Editar Município' : 'Novo Município'} 
        breadcrumbItems={breadcrumbItems}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <div>
            <Label htmlFor="nome">Nome do município *</Label>
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
            <Label>Estado (UF) *</Label>
            <Select onValueChange={(value) => setValue('uf_sigla', value)} value={watch('uf_sigla')}>
              <SelectTrigger className={errors.uf_sigla ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecionar estado" />
              </SelectTrigger>
              <SelectContent>
                {ufs.map((uf) => (
                  <SelectItem key={uf.sigla} value={uf.sigla}>
                    {uf.nome} ({uf.sigla})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.uf_sigla && (
              <p className="text-sm text-destructive mt-1">{errors.uf_sigla.message}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={watch('ativo')}
                onCheckedChange={(checked) => setValue('ativo', checked)}
              />
              <Label htmlFor="ativo">Município ativo</Label>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/municipios')}>
              Cancelar
            </Button>
          </div>
        </form>
      </AdminLayout>
    </ProtectedRoute>
  );
}