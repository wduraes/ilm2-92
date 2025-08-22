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
import { createRecord, updateRecord, fetchById, fetchMunicipios, fetchPerfis } from '@/lib/admin-api';

const usuarioSchema = z.object({
  email: z.string().email('E-mail inválido'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  municipio_id: z.string().optional(),
  perfil_id: z.string().min(1, 'Perfil é obrigatório'),
});

type UsuarioForm = z.infer<typeof usuarioSchema>;

export default function UsuariosForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [perfis, setPerfis] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UsuarioForm>({
    resolver: zodResolver(usuarioSchema),
  });

  const loadData = async () => {
    try {
      const [municipiosData, perfisData] = await Promise.all([
        fetchMunicipios(),
        fetchPerfis(),
      ]);
      
      setMunicipios(municipiosData);
      setPerfis(perfisData);

      if (isEditing && id) {
        const usuario = await fetchById('usuario', id);
        setValue('email', usuario.email);
        setValue('nome', usuario.nome);
        setValue('municipio_id', usuario.municipio_id || '');
        setValue('perfil_id', usuario.perfil_id);
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

  const onSubmit = async (data: UsuarioForm) => {
    try {
      setLoading(true);
      
      const payload = {
        ...data,
        municipio_id: data.municipio_id || null,
      };

      if (isEditing) {
        await updateRecord('usuario', id!, payload);
        toast({
          title: 'Usuário atualizado',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        await createRecord('usuario', payload);
        toast({
          title: 'Usuário criado',
          description: 'O usuário foi adicionado com sucesso.',
        });
      }
      
      navigate('/admin/usuarios');
    } catch (error: any) {
      toast({
        title: isEditing ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Usuários', href: '/admin/usuarios' },
    { label: isEditing ? 'Editar' : 'Novo' },
  ];

  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <AdminLayout 
        title={isEditing ? 'Editar Usuário' : 'Novo Usuário'} 
        breadcrumbItems={breadcrumbItems}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

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
            <Label>Município</Label>
            <Select onValueChange={(value) => setValue('municipio_id', value)} value={watch('municipio_id')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar município (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {municipios.map((municipio) => (
                  <SelectItem key={municipio.id} value={municipio.id}>
                    {municipio.nome} - {municipio.uf_sigla}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Perfil *</Label>
            <Select onValueChange={(value) => setValue('perfil_id', value)} value={watch('perfil_id')}>
              <SelectTrigger className={errors.perfil_id ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecionar perfil" />
              </SelectTrigger>
              <SelectContent>
                {perfis.map((perfil) => (
                  <SelectItem key={perfil.id} value={perfil.id}>
                    {perfil.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.perfil_id && (
              <p className="text-sm text-destructive mt-1">{errors.perfil_id.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/usuarios')}>
              Cancelar
            </Button>
          </div>
        </form>
      </AdminLayout>
    </ProtectedRoute>
  );
}