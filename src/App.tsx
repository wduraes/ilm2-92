import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardILM from "./pages/DashboardILM";
import DashboardSecretaria from "./pages/DashboardSecretaria";
import DashboardCoordenacao from "./pages/DashboardCoordenacao";
import DashboardProfessor from "./pages/DashboardProfessor";
import NotFound from "./pages/NotFound";
// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsuariosList from "./pages/admin/usuarios/UsuariosList";
import UsuariosForm from "./pages/admin/usuarios/UsuariosForm";
import MunicipiosList from "./pages/admin/municipios/MunicipiosList";
import MunicipiosForm from "./pages/admin/municipios/MunicipiosForm";
import EscolasList from "./pages/admin/escolas/EscolasList";
import EscolasForm from "./pages/admin/escolas/EscolasForm";
import TurmasList from "./pages/admin/turmas/TurmasList";
import TurmasForm from "./pages/admin/turmas/TurmasForm";
import AvaliacoesList from "./pages/admin/avaliacoes/AvaliacoesList";
import AvaliacoesForm from "./pages/admin/avaliacoes/AvaliacoesForm";
import AlunosList from "./pages/admin/alunos/AlunosList";
import AlunosForm from "./pages/admin/alunos/AlunosForm";
import AlunosImport from "./pages/admin/alunos/AlunosImport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard-admin" element={<DashboardAdmin />} />
          <Route path="/dashboard-ilm" element={<DashboardILM />} />
          <Route path="/dashboard-secretaria" element={<DashboardSecretaria />} />
          <Route path="/dashboard-coordenacao" element={<DashboardCoordenacao />} />
          <Route path="/dashboard-professor" element={<DashboardProfessor />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/usuarios" element={<UsuariosList />} />
          <Route path="/admin/usuarios/new" element={<UsuariosForm />} />
          <Route path="/admin/usuarios/:id/edit" element={<UsuariosForm />} />
          <Route path="/admin/municipios" element={<MunicipiosList />} />
          <Route path="/admin/municipios/new" element={<MunicipiosForm />} />
          <Route path="/admin/municipios/:id/edit" element={<MunicipiosForm />} />
          <Route path="/admin/escolas" element={<EscolasList />} />
          <Route path="/admin/escolas/new" element={<EscolasForm />} />
          <Route path="/admin/escolas/:id/edit" element={<EscolasForm />} />
          <Route path="/admin/turmas" element={<TurmasList />} />
          <Route path="/admin/turmas/new" element={<TurmasForm />} />
          <Route path="/admin/turmas/:id/edit" element={<TurmasForm />} />
          <Route path="/admin/avaliacoes" element={<AvaliacoesList />} />
          <Route path="/admin/avaliacoes/new" element={<AvaliacoesForm />} />
          <Route path="/admin/avaliacoes/:id/edit" element={<AvaliacoesForm />} />
          <Route path="/admin/alunos" element={<AlunosList />} />
          <Route path="/admin/alunos/new" element={<AlunosForm />} />
          <Route path="/admin/alunos/:id/edit" element={<AlunosForm />} />
          <Route path="/admin/alunos/import" element={<AlunosImport />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
