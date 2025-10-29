import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import FinancialChart from '../../components/dashboard/FinancialChart';
import MEIAlerts from '../../components/dashboard/MEIAlerts';
import QuickActions from '../../components/dashboard/QuickActions';
import SuggestionBox from '../../components/dashboard/SuggestionBox';
import NovaReceitaModal from '../../components/modals/NovaReceitaModal';
import NovaDespesaModal from '../../components/modals/NovaDespesaModal';
import NovaContaPagarModal from '../../components/modals/NovaContaPagarModal';
import NovaContaReceberModal from '../../components/modals/NovaContaReceberModal';

interface DashboardData {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  receitasRecebidas: number;
  receitasPendentes: number;
  despesasPagas: number;
  despesasPendentes: number;
  contasPagar: number;
  contasReceber: number;
}

interface ResumoData {
  receitasMes: number;
  receitasMesAnterior: number;
  despesasMes: number;
  despesasMesAnterior: number;
  lucroMes: number;
  faturamentoAnual: number;
  contasPagarProximas: any[];
  contasReceberProximas: any[];
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNovaReceitaModal, setShowNovaReceitaModal] = useState(false);
  const [showNovaDespesaModal, setShowNovaDespesaModal] = useState(false);
  const [showNovaContaPagarModal, setShowNovaContaPagarModal] = useState(false);
  const [showNovaContaReceberModal, setShowNovaContaReceberModal] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [data, setData] = useState<DashboardData>({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    receitasRecebidas: 0,
    receitasPendentes: 0,
    despesasPagas: 0,
    despesasPendentes: 0,
    contasPagar: 0,
    contasReceber: 0,
  });
  const [resumo, setResumo] = useState<ResumoData>({
    receitasMes: 0,
    receitasMesAnterior: 0,
    despesasMes: 0,
    despesasMesAnterior: 0,
    lucroMes: 0,
    faturamentoAnual: 0,
    contasPagarProximas: [],
    contasReceberProximas: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [faturamentoAnual, setFaturamentoAnual] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const LIMITE_ANUAL_MEI = 81000;

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadFaturamentoAnual();
      loadResumoData();
    }
  }, [user, currentMonth]);

  const loadResumoData = async () => {
    if (!user) return;

    try {
      const hoje = new Date();
      const mesAtual = startOfMonth(hoje);
      const fimMesAtual = endOfMonth(hoje);
      const mesAnterior = startOfMonth(subMonths(hoje, 1));
      const fimMesAnterior = endOfMonth(subMonths(hoje, 1));

      const { data: receitasMesAtual } = await supabase
        .from('receitas')
        .select('valor')
        .eq('user_id', user.id)
        .gte('data', format(mesAtual, 'yyyy-MM-dd'))
        .lte('data', format(fimMesAtual, 'yyyy-MM-dd'));

      const { data: receitasMesAnterior } = await supabase
        .from('receitas')
        .select('valor')
        .eq('user_id', user.id)
        .gte('data', format(mesAnterior, 'yyyy-MM-dd'))
        .lte('data', format(fimMesAnterior, 'yyyy-MM-dd'));

      const { data: despesasMesAtual } = await supabase
        .from('despesas')
        .select('valor')
        .eq('user_id', user.id)
        .gte('data', format(mesAtual, 'yyyy-MM-dd'))
        .lte('data', format(fimMesAtual, 'yyyy-MM-dd'));

      const { data: despesasMesAnterior } = await supabase
        .from('despesas')
        .select('valor')
        .eq('user_id', user.id)
        .gte('data', format(mesAnterior, 'yyyy-MM-dd'))
        .lte('data', format(fimMesAnterior, 'yyyy-MM-dd'));

      const anoAtual = new Date().getFullYear();
      const inicioAno = new Date(anoAtual, 0, 1);
      const fimAno = new Date(anoAtual, 11, 31);

      const { data: receitasAno } = await supabase
        .from('receitas')
        .select('valor')
        .eq('user_id', user.id)
        .gte('data', format(inicioAno, 'yyyy-MM-dd'))
        .lte('data', format(fimAno, 'yyyy-MM-dd'));

      const proximosDias = addMonths(hoje, 1);

      const { data: contasPagar } = await supabase
        .from('contas_pagar')
        .select('*')
        .eq('user_id', user.id)
        .eq('pago', false)
        .gte('vencimento', format(hoje, 'yyyy-MM-dd'))
        .lte('vencimento', format(proximosDias, 'yyyy-MM-dd'))
        .order('vencimento', { ascending: true });

      const { data: contasReceber } = await supabase
        .from('contas_receber')
        .select('*')
        .eq('user_id', user.id)
        .eq('recebido', false)
        .gte('vencimento', format(hoje, 'yyyy-MM-dd'))
        .lte('vencimento', format(proximosDias, 'yyyy-MM-dd'))
        .order('vencimento', { ascending: true });

      const receitasMes = receitasMesAtual?.reduce((acc, item) => acc + item.valor, 0) || 0;
      const receitasMesAnt = receitasMesAnterior?.reduce((acc, item) => acc + item.valor, 0) || 0;
      const despesasMes = despesasMesAtual?.reduce((acc, item) => acc + item.valor, 0) || 0;
      const despesasMesAnt = despesasMesAnterior?.reduce((acc, item) => acc + item.valor, 0) || 0;
      const faturamentoAno = receitasAno?.reduce((acc, item) => acc + item.valor, 0) || 0;

      setResumo({
        receitasMes,
        receitasMesAnterior: receitasMesAnt,
        despesasMes,
        despesasMesAnterior: despesasMesAnt,
        lucroMes: receitasMes - despesasMes,
        faturamentoAnual: faturamentoAno,
        contasPagarProximas: contasPagar || [],
        contasReceberProximas: contasReceber || [],
      });
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  };

  const loadDashboardData = async () => {
    if (!user) return;

    const startDate = startOfMonth(currentMonth);
    const endDate = endOfMonth(currentMonth);

    try {
      const { data: receitas } = await supabase
        .from('receitas')
        .select('*')
        .eq('user_id', user.id)
        .gte('data', format(startDate, 'yyyy-MM-dd'))
        .lte('data', format(endDate, 'yyyy-MM-dd'));

      const { data: despesas } = await supabase
        .from('despesas')
        .select('*')
        .eq('user_id', user.id)
        .gte('data', format(startDate, 'yyyy-MM-dd'))
        .lte('data', format(endDate, 'yyyy-MM-dd'));

      const { data: contasPagar } = await supabase
        .from('contas_pagar')
        .select('*')
        .eq('user_id', user.id)
        .eq('pago', false);

      const { data: contasReceber } = await supabase
        .from('contas_receber')
        .select('*')
        .eq('user_id', user.id)
        .eq('recebido', false);

      const totalReceitas = receitas?.reduce((acc, item) => acc + item.valor, 0) || 0;
      const totalDespesas = despesas?.reduce((acc, item) => acc + item.valor, 0) || 0;
      const receitasRecebidas = receitas?.filter(r => r.recebido).reduce((acc, item) => acc + item.valor, 0) || 0;
      const receitasPendentes = receitas?.filter(r => !r.recebido).reduce((acc, item) => acc + item.valor, 0) || 0;
      const despesasPagas = despesas?.filter(d => d.pago).reduce((acc, item) => acc + item.valor, 0) || 0;
      const despesasPendentes = despesas?.filter(d => !d.pago).reduce((acc, item) => acc + item.valor, 0) || 0;

      setData({
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        receitasRecebidas,
        receitasPendentes,
        despesasPagas,
        despesasPendentes,
        contasPagar: contasPagar?.reduce((acc, item) => acc + item.valor, 0) || 0,
        contasReceber: contasReceber?.reduce((acc, item) => acc + item.valor, 0) || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFaturamentoAnual = async () => {
    if (!user) return;

    const currentYear = new Date().getFullYear();
    const startYear = new Date(currentYear, 0, 1);
    const endYear = new Date(currentYear, 11, 31);

    const { data: receitas } = await supabase
      .from('receitas')
      .select('valor')
      .eq('user_id', user.id)
      .gte('data', format(startYear, 'yyyy-MM-dd'))
      .lte('data', format(endYear, 'yyyy-MM-dd'));

    const total = receitas?.reduce((acc, item) => acc + item.valor, 0) || 0;
    setFaturamentoAnual(total);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calcularVariacao = (atual: number, anterior: number) => {
    if (anterior === 0) return atual > 0 ? 100 : 0;
    return ((atual - anterior) / anterior) * 100;
  };

  const formatarVariacao = (atual: number, anterior: number) => {
    const variacao = calcularVariacao(atual, anterior);
    const diferenca = atual - anterior;
    const sinal = diferenca >= 0 ? '+' : '';
    return {
      porcentagem: `${sinal}${variacao.toFixed(1)}%`,
      valor: `${sinal}${formatCurrency(Math.abs(diferenca))}`,
      positivo: diferenca >= 0,
    };
  };

  const handleModalSuccess = () => {
    loadDashboardData();
    loadResumoData();
    loadFaturamentoAnual();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 lg:pb-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        
        {/* Status Badge Discreto - Topo */}
        <div className="flex justify-end items-center gap-3 mb-2 sm:mb-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
            title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
          >
            {darkMode ? (
              <>
                <i className="ri-sun-line text-yellow-500"></i>
                <span className="hidden sm:inline">Claro</span>
              </>
            ) : (
              <>
                <i className="ri-moon-line text-indigo-600"></i>
                <span className="hidden sm:inline">Escuro</span>
              </>
            )}
          </button>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            user?.status_assinatura === 'trial' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
            user?.status_assinatura === 'ativo' ? 'bg-green-100 text-green-800 border border-green-300' : 
            'bg-red-100 text-red-800 border border-red-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              user?.status_assinatura === 'trial' ? 'bg-yellow-500 animate-pulse' :
              user?.status_assinatura === 'ativo' ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            {user?.status_assinatura === 'trial' ? 'Trial' :
             user?.status_assinatura === 'ativo' ? 'Ativo' : 'Expirado'}
          </div>
        </div>

        {/* Header Compacto e Recolhível */}
        <div 
          className={`bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl text-white mb-4 sm:mb-5 shadow-lg transition-all duration-300 overflow-hidden ${
            headerCollapsed ? 'p-3 sm:p-4' : 'p-4 sm:p-5 lg:p-6'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className={`font-bold mb-1 transition-all duration-300 ${
                headerCollapsed ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl lg:text-3xl'
              }`}>
                Olá, {user?.nome?.split(' ')[0]}! 👋
              </h1>
              {!headerCollapsed && (
                <p className="text-blue-100 text-sm sm:text-base animate-fadeIn">
                  Bem-vindo ao seu painel financeiro
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {!headerCollapsed && (
                <button
                  onClick={() => navigate('/relatorios')}
                  className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200"
                >
                  <i className="ri-file-chart-line"></i>
                  <span>Relatório</span>
                </button>
              )}
              
              <button
                onClick={() => setHeaderCollapsed(!headerCollapsed)}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg flex items-center justify-center transition-all duration-200"
              >
                <i className={`ri-arrow-${headerCollapsed ? 'down' : 'up'}-s-line text-lg transition-transform duration-300`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Alertas MEI */}
        <div className="animate-fadeIn">
          <MEIAlerts />
        </div>

        {/* Botões de Ação 2x2 - Desktop/Tablet */}
        <div className="hidden md:grid grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 mb-5 animate-fadeIn">
          <button
            onClick={() => setShowNovaReceitaModal(true)}
            className="group bg-white hover:bg-green-50 border-2 border-gray-200 hover:border-green-500 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 group-hover:bg-green-500 rounded-xl flex items-center justify-center transition-colors duration-200">
                <i className="ri-add-circle-line text-2xl text-green-600 group-hover:text-white transition-colors duration-200"></i>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">Nova Receita</div>
                <div className="text-xs text-gray-500">Adicionar entrada</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowNovaDespesaModal(true)}
            className="group bg-white hover:bg-red-50 border-2 border-gray-200 hover:border-red-500 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 group-hover:bg-red-500 rounded-xl flex items-center justify-center transition-colors duration-200">
                <i className="ri-subtract-line text-2xl text-red-600 group-hover:text-white transition-colors duration-200"></i>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-200">Nova Despesa</div>
                <div className="text-xs text-gray-500">Adicionar saída</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowNovaContaPagarModal(true)}
            className="group bg-white hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-500 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center transition-colors duration-200">
                <i className="ri-file-list-line text-2xl text-orange-600 group-hover:text-white transition-colors duration-200"></i>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">Conta a Pagar</div>
                <div className="text-xs text-gray-500">Registrar débito</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowNovaContaReceberModal(true)}
            className="group bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-500 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-500 rounded-xl flex items-center justify-center transition-colors duration-200">
                <i className="ri-file-text-line text-2xl text-blue-600 group-hover:text-white transition-colors duration-200"></i>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">Conta a Receber</div>
                <div className="text-xs text-gray-500">Registrar crédito</div>
              </div>
            </div>
          </button>
        </div>

        {/* Cards de Indicadores com Tendências */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5 animate-slideUp">
          {/* Receitas do Mês */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-4 sm:p-5 group hover:scale-105">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <i className="ri-funds-line"></i>
                  Receitas do Mês
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 leading-tight mb-2">
                  {formatCurrency(resumo.receitasMes)}
                </p>
                {(() => {
                  const variacao = formatarVariacao(resumo.receitasMes, resumo.receitasMesAnterior);
                  return (
                    <div className="flex items-center gap-1 text-xs">
                      <span className={`font-semibold ${variacao.positivo ? 'text-green-600' : 'text-red-600'}`}>
                        {variacao.positivo ? '↑' : '↓'} {variacao.porcentagem}
                      </span>
                      <span className="text-gray-500">vs anterior</span>
                    </div>
                  );
                })()}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <i className="ri-arrow-up-line text-2xl text-green-600"></i>
              </div>
            </div>
          </div>

          {/* Despesas do Mês */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-4 sm:p-5 group hover:scale-105">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <i className="ri-money-dollar-circle-line"></i>
                  Despesas do Mês
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600 leading-tight mb-2">
                  {formatCurrency(resumo.despesasMes)}
                </p>
                {(() => {
                  const variacao = formatarVariacao(resumo.despesasMes, resumo.despesasMesAnterior);
                  return (
                    <div className="flex items-center gap-1 text-xs">
                      <span className={`font-semibold ${variacao.positivo ? 'text-red-600' : 'text-green-600'}`}>
                        {variacao.positivo ? '↑' : '↓'} {variacao.porcentagem}
                      </span>
                      <span className="text-gray-500">vs anterior</span>
                    </div>
                  );
                })()}
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <i className="ri-arrow-down-line text-2xl text-red-600"></i>
              </div>
            </div>
          </div>

          {/* Lucro do Mês - DESTAQUE */}
          <div className={`rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-5 group hover:scale-105 border-2 ${
            resumo.lucroMes >= 0 
              ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300' 
              : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-semibold mb-1 flex items-center gap-1.5 text-gray-700">
                  <i className="ri-trophy-line text-base"></i>
                  Lucro do Mês
                </p>
                <p className={`text-2xl sm:text-3xl font-bold leading-tight mb-2 ${
                  resumo.lucroMes >= 0 ? 'text-blue-700' : 'text-orange-700'
                }`}>
                  {formatCurrency(resumo.lucroMes)}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <span className={`font-semibold ${resumo.lucroMes >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    {resumo.lucroMes >= 0 ? '💰 Positivo' : '⚠️ Negativo'}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${
                resumo.lucroMes >= 0 ? 'bg-blue-200' : 'bg-orange-200'
              }`}>
                <i className={`ri-line-chart-line text-2xl ${
                  resumo.lucroMes >= 0 ? 'text-blue-700' : 'text-orange-700'
                }`}></i>
              </div>
            </div>
          </div>

          {/* Faturamento Anual */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-4 sm:p-5 group hover:scale-105">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <i className="ri-bar-chart-box-line"></i>
                  Faturamento Anual
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 leading-tight mb-2">
                  {formatCurrency(resumo.faturamentoAnual)}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-semibold text-purple-600">
                    {((resumo.faturamentoAnual / LIMITE_ANUAL_MEI) * 100).toFixed(1)}%
                  </span>
                  <span className="text-gray-500">do limite MEI</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <i className="ri-bar-chart-line text-2xl text-purple-600"></i>
              </div>
            </div>
            {/* Barra de progresso */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((resumo.faturamentoAnual / LIMITE_ANUAL_MEI) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico Financeiro */}
        <div className="mb-4 sm:mb-5 animate-slideUp" style={{ animationDelay: '100ms' }}>
          <FinancialChart />
        </div>

        {/* Contas Próximas - Apenas 2 itens + Ver todas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5 animate-slideUp" style={{ animationDelay: '200ms' }}>
          {/* Contas a Pagar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="ri-file-list-3-line text-xl text-red-600"></i>
              <span>💳 Contas a Pagar</span>
              {resumo.contasPagarProximas.length > 0 && (
                <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                  {resumo.contasPagarProximas.length}
                </span>
              )}
            </h3>
            
            {resumo.contasPagarProximas.length === 0 ? (
              <div className="text-center py-8">
                <i className="ri-checkbox-circle-line text-4xl text-green-500 mb-3"></i>
                <p className="text-gray-500 text-sm">Nenhuma conta próxima</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resumo.contasPagarProximas.slice(0, 2).map((conta) => {
                  const hoje = new Date();
                  const vencimento = new Date(conta.vencimento);
                  const vencido = vencimento < hoje;
                  
                  return (
                    <div 
                      key={conta.id} 
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 hover:scale-102 ${
                        vencido 
                          ? 'bg-red-100 border-red-300' 
                          : 'bg-red-50 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          vencido ? 'bg-red-200' : 'bg-red-100'
                        }`}>
                          <i className="ri-alert-line text-red-600 text-lg"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{conta.descricao}</p>
                          <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                            <i className="ri-calendar-line"></i>
                            {vencido ? 'Vencido em ' : 'Vence em '}
                            {format(vencimento, 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="font-bold text-red-600 text-sm sm:text-base">
                          {formatCurrency(conta.valor)}
                        </p>
                        {vencido && (
                          <span className="text-xs text-red-600 font-medium">VENCIDO</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {resumo.contasPagarProximas.length > 2 && (
                  <button
                    onClick={() => navigate('/contas-pagar')}
                    className="w-full mt-3 py-2.5 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Ver todas ({resumo.contasPagarProximas.length})</span>
                    <i className="ri-arrow-right-line"></i>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Contas a Receber */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="ri-file-text-line text-xl text-green-600"></i>
              <span>💵 Contas a Receber</span>
              {resumo.contasReceberProximas.length > 0 && (
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  {resumo.contasReceberProximas.length}
                </span>
              )}
            </h3>
            
            {resumo.contasReceberProximas.length === 0 ? (
              <div className="text-center py-8">
                <i className="ri-information-line text-4xl text-blue-500 mb-3"></i>
                <p className="text-gray-500 text-sm">Nenhuma conta próxima</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resumo.contasReceberProximas.slice(0, 2).map((conta) => {
                  const hoje = new Date();
                  const vencimento = new Date(conta.vencimento);
                  const vencido = vencimento < hoje;
                  
                  return (
                    <div 
                      key={conta.id} 
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 hover:scale-102 ${
                        vencido 
                          ? 'bg-yellow-100 border-yellow-300' 
                          : 'bg-green-50 border-green-200 hover:bg-green-100'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          vencido ? 'bg-yellow-200' : 'bg-green-100'
                        }`}>
                          <i className={`text-lg ${vencido ? 'ri-time-line text-yellow-700' : 'ri-check-line text-green-600'}`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{conta.descricao}</p>
                          <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                            <i className="ri-calendar-line"></i>
                            {vencido ? 'Venceu em ' : 'Vence em '}
                            {format(vencimento, 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="font-bold text-green-600 text-sm sm:text-base">
                          {formatCurrency(conta.valor)}
                        </p>
                        {vencido && (
                          <span className="text-xs text-yellow-700 font-medium">ATRASADO</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {resumo.contasReceberProximas.length > 2 && (
                  <button
                    onClick={() => navigate('/contas-receber')}
                    className="w-full mt-3 py-2.5 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Ver todas ({resumo.contasReceberProximas.length})</span>
                    <i className="ri-arrow-right-line"></i>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dica do Dia */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-5 border border-blue-200 animate-slideUp" style={{ animationDelay: '300ms' }}>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-lightbulb-line text-xl sm:text-2xl text-blue-600"></i>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">💡 Dica do Dia</h4>
              <p className="text-blue-800 leading-relaxed text-xs sm:text-sm">
                Mantenha sempre suas receitas e despesas atualizadas para ter uma visão real da saúde 
                financeira do seu MEI. Use a calculadora DAS para planejar seus impostos!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Flutuante Mobile - FIXED BOTTOM */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50 animate-slideUp">
        <div className="grid grid-cols-4 gap-px bg-gray-200">
          <button
            onClick={() => setShowNovaReceitaModal(true)}
            className="bg-white hover:bg-green-50 active:bg-green-100 py-3 px-2 flex flex-col items-center gap-1.5 transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <i className="ri-add-circle-line text-xl text-green-600"></i>
            </div>
            <span className="text-xs font-medium text-gray-700">Receita</span>
          </button>

          <button
            onClick={() => setShowNovaDespesaModal(true)}
            className="bg-white hover:bg-red-50 active:bg-red-100 py-3 px-2 flex flex-col items-center gap-1.5 transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <i className="ri-subtract-line text-xl text-red-600"></i>
            </div>
            <span className="text-xs font-medium text-gray-700">Despesa</span>
          </button>

          <button
            onClick={() => setShowNovaContaPagarModal(true)}
            className="bg-white hover:bg-orange-50 active:bg-orange-100 py-3 px-2 flex flex-col items-center gap-1.5 transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <i className="ri-file-list-line text-xl text-orange-600"></i>
            </div>
            <span className="text-xs font-medium text-gray-700">Pagar</span>
          </button>

          <button
            onClick={() => setShowNovaContaReceberModal(true)}
            className="bg-white hover:bg-blue-50 active:bg-blue-100 py-3 px-2 flex flex-col items-center gap-1.5 transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="ri-file-text-line text-xl text-blue-600"></i>
            </div>
            <span className="text-xs font-medium text-gray-700">Receber</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <NovaReceitaModal
        isOpen={showNovaReceitaModal}
        onClose={() => setShowNovaReceitaModal(false)}
        onSuccess={handleModalSuccess}
      />

      <NovaDespesaModal
        isOpen={showNovaDespesaModal}
        onClose={() => setShowNovaDespesaModal(false)}
        onSuccess={handleModalSuccess}
      />

      <NovaContaPagarModal
        isOpen={showNovaContaPagarModal}
        onClose={() => setShowNovaContaPagarModal(false)}
        onSuccess={handleModalSuccess}
      />

      <NovaContaReceberModal
        isOpen={showNovaContaReceberModal}
        onClose={() => setShowNovaContaReceberModal(false)}
        onSuccess={handleModalSuccess}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }
      `}</style>

      {/* Rodapé */}
      <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} SaaS desenvolvido por{' '}
          <a 
            href="https://viniciusclemente.com.br" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Vinicius Clemente
          </a>
        </p>
      </footer>

      {/* Caixa de Sugestões */}
      <SuggestionBox />
    </div>
  );
}
