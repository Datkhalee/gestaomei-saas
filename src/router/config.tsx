import { RouteObject } from 'react-router-dom';
import { lazy, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Importações diretas para páginas críticas
import NovaReceita from '../pages/receitas/NovaReceita';
import NovaDespesa from '../pages/despesas/NovaDespesa';
import Home from '../pages/home/page';

// Lazy loading dos outros componentes
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Receitas = lazy(() => import('../pages/receitas/Receitas'));
const Despesas = lazy(() => import('../pages/despesas/Despesas'));
const ContasPagar = lazy(() => import('../pages/contas/ContasPagar'));
const ContasReceber = lazy(() => import('../pages/contas/ContasReceber'));
const Relatorios = lazy(() => import('../pages/relatorios/Relatorios'));
const RelatoriosPDF = lazy(() => import('../pages/relatorios/RelatoriosPDF'));
const CalculadoraDAS = lazy(() => import('../pages/calculadora/CalculadoraDAS'));
const MeuPlano = lazy(() => import('../pages/plano/MeuPlano'));
const Configuracoes = lazy(() => import('../pages/configuracoes/Configuracoes'));
const Admin = lazy(() => import('../pages/admin/Admin'));
const Login = lazy(() => import('../pages/auth/Login'));
const Cadastro = lazy(() => import('../pages/auth/Cadastro'));
const RecuperarSenha = lazy(() => import('../pages/auth/RecuperarSenha'));
const Sucesso = lazy(() => import('../pages/Sucesso'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Componente inline para redirecionamento
function RedirecionamentoInteligente() {
  const navigate = useNavigate();

  useEffect(() => {
    const isPrimeiraVisita = !localStorage.getItem('financemei_visited');
    
    if (isPrimeiraVisita) {
      localStorage.setItem('financemei_visited', 'true');
      
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_name: 'Primeira Visita FinanceMEI',
          content_category: 'Landing Page'
        });
      }
      
      navigate('/cadastro');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <RedirecionamentoInteligente />,
  },
  {
    path: '/home',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/cadastro',
    element: <Cadastro />,
  },
  {
    path: '/recuperar-senha',
    element: <RecuperarSenha />,
  },
  {
    path: '/sucesso',
    element: <Sucesso />,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: '/receitas',
    element: <ProtectedRoute><Receitas /></ProtectedRoute>,
  },
  {
    path: '/nova-receita',
    element: <ProtectedRoute><NovaReceita /></ProtectedRoute>,
  },
  {
    path: '/receitas/nova',
    element: <ProtectedRoute><NovaReceita /></ProtectedRoute>,
  },
  {
    path: '/despesas',
    element: <ProtectedRoute><Despesas /></ProtectedRoute>,
  },
  {
    path: '/nova-despesa',
    element: <ProtectedRoute><NovaDespesa /></ProtectedRoute>,
  },
  {
    path: '/despesas/nova',
    element: <ProtectedRoute><NovaDespesa /></ProtectedRoute>,
  },
  {
    path: '/contas-pagar',
    element: <ProtectedRoute><ContasPagar /></ProtectedRoute>,
  },
  {
    path: '/contas-receber',
    element: <ProtectedRoute><ContasReceber /></ProtectedRoute>,
  },
  {
    path: '/relatorios',
    element: <ProtectedRoute><Relatorios /></ProtectedRoute>,
  },
  {
    path: '/relatorios-pdf',
    element: <ProtectedRoute><RelatoriosPDF /></ProtectedRoute>,
  },
  {
    path: '/calculadora-das',
    element: <ProtectedRoute><CalculadoraDAS /></ProtectedRoute>,
  },
  {
    path: '/meu-plano',
    element: <ProtectedRoute><MeuPlano /></ProtectedRoute>,
  },
  {
    path: '/configuracoes',
    element: <ProtectedRoute><Configuracoes /></ProtectedRoute>,
  },
  {
    path: '/admin',
    element: <ProtectedRoute><Admin /></ProtectedRoute>,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
