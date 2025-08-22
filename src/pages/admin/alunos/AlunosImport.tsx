import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';

export default function AlunosImport() {
  const breadcrumbItems = [
    { label: 'Alunos', href: '/admin/alunos' },
    { label: 'Importar' },
  ];

  return (
    <ProtectedRoute allowedProfiles={['administrador']}>
      <AdminLayout 
        title="Importar Alunos" 
        breadcrumbItems={breadcrumbItems}
      >
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Importação em Lote
              </CardTitle>
              <CardDescription>
                Funcionalidade de importação será implementada na Parte 3 do projeto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Esta funcionalidade permitirá a importação de múltiplos alunos através de arquivos CSV ou Excel, 
                com validação automática e relatórios de importação.
              </p>
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Recursos planejados:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Upload de arquivos CSV/Excel</li>
                  <li>• Validação de dados em tempo real</li>
                  <li>• Mapeamento automático de colunas</li>
                  <li>• Relatório detalhado de importação</li>
                  <li>• Tratamento de duplicatas</li>
                </ul>
              </div>

              <Button asChild>
                <Link to="/admin/alunos">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Lista de Alunos
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}