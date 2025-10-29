import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import FinancialChart from '../../components/dashboard/FinancialChart';
import MEIAlerts from '../../components/dashboard/MEIAlerts';
import QuickActions from '../../components/dashboard/QuickActions';
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

interface ChartData {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNovaReceitaModal, setShowNovaReceitaModal] = useState(false);
  const [showNovaDespesaModal, setShowNovaDespesaModal] = useState(false);
  const [showNovaContaPagarModal, setShowNovaContaPagarModal] = useState(false);
  const [showNovaContaReceberModal, setShowNovaContaReceberModal] = useState(false);
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
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Controle de limite anual MEI
  const LIMITE_ANUAL_MEI = 81000; // R$ 81.000 em 2024
  const [faturamentoAnual, setFaturamentoAnual] = useState(0);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadChartData();
      loadCategoryData();
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

      // Receitas mês atual
      const { data: receitasMesAtual } = await supabase
        .from('receitas')
        .select('valor')
        .eq('user_id', user.id)
        .gte('data', format(mesAtual, 'yyyy-MM-dd'))
        .lte('data', format(fimMesAtual, 'yyyy-MM-dd'));

      // Receitas mês anterior
      const { data: receitasMesAnterior } = await supabase
        .from('receitas')
        .select('valor')
        .eq('user_id', user.id)
        .gte('data', format(mesAnterior, 'yyyy-MM-dd'))
        .lte('data', format(fimMesAnterior, 'yyyy-MM-dd'));

      // Despesas mês atual
      const { data: despesasMesAtual } = await supabase
        .from('despesas')
        .select('valor')
        .eq('user_id', user.id)
        .gte('data', format(mesAtual, 'yyyy-MM-dd'))
        .lte('data', format(fimMesAtual, 'yyyy-MM-dd'));

      // Despesas mês anterior
      const { data: despesasMesAnterior } = await supabase
        .from('despesas')
        .select('valor')
        .eq('user_id', user.id)
        .gte('data', format(mesAnterior, 'yyyy-MM-dd'))
        .lte('data', format(fimMesAnterior, 'yyyy-MM-dd'));

      // Faturamento anual
      const anoAtual = new Date().getFullYear();
      const inicioAno = new Date(anoAtual, 0, 1);
      const fimAno = new Date(anoAtual, 11, 31);

      const { data: receitasAno } = await supabase
        .from('receitas')
        .select('valor')
        .eq('user_id', user.id)
        .gte('data', format(inicioAno, 'yyyy-MM-dd'))
        .lte('data', format(fimAno, 'yyyy-MM-dd'));

      // Contas próximas do vencimento (próximos 30 dias)
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
      // Receitas do mês
      const { data: receitas } = await supabase
        .from('receitas')
        .select('*')
        .eq('user_id', user.id)
        .gte('data', format(startDate, 'yyyy-MM-dd'))
        .lte('data', format(endDate, 'yyyy-MM-dd'));

      // Despesas do mês
      const { data: despesas } = await supabase
        .from('despesas')
        .select('*')
        .eq('user_id', user.id)
        .gte('data', format(startDate, 'yyyy-MM-dd'))
        .lte('data', format(endDate, 'yyyy-MM-dd'));

      // Contas a pagar
      const { data: contasPagar } = await supabase
        .from('contas_pagar')
        .select('*')
        .eq('user_id', user.id)
        .eq('pago', false);

      // Contas a receber
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

  const loadChartData = async () => {
    if (!user) return;

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(currentMonth, i);
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);

      const { data: receitas } = await supabase
        .from('receitas')
        .select('valor')
        .eq('user_id', user.id)
        .gte('data', format(startDate, 'yyyy-MM-dd'))
        .lte('data', format(endDate, 'yyyy-MM-dd'));

      const { data: despesas } = await supabase
        .from('despesas')
        .select('valor')
        .eq('user_id', user.id)
        .gte('data', format(startDate, 'yyyy-MM-dd'))
        .lte('data', format(endDate, 'yyyy-MM-dd'));

      const totalReceitas = receitas?.reduce((acc, item) => acc + item.valor, 0) || 0;
      const totalDespesas = despesas?.reduce((acc, item) => acc + item.valor, 0) || 0;

      months.push({
        mes: format(date, 'MMM', { locale: ptBR }),
        receitas: totalReceitas,
        despesas: totalDespesas,
        saldo: totalReceitas - totalDespesas,
      });
    }

    setChartData(months);
  };

  const loadCategoryData = async () => {
    if (!user) return;

    const startDate = startOfMonth(currentMonth);
    const endDate = endOfMonth(currentMonth);

    const { data: receitas } = await supabase
      .from('receitas')
      .select('categoria, valor')
      .eq('user_id', user.id)
      .gte('data', format(startDate, 'yyyy-MM-dd'))
      .lte('data', format(endDate, 'yyyy-MM-dd'));

    const categories: { [key: string]: number } = {};
    receitas?.forEach(receita => {
      categories[receita.categoria] = (categories[receita.categoria] || 0) + receita.valor;
    });

    const categoryArray = Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));

    setCategoryData(categoryArray);
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

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleModalSuccess = () => {
    loadDashboardData();
    loadResumoData();
    loadChartData();
    loadCategoryData();
    loadFaturamentoAnual();
  };

  const percentualLimite = (faturamentoAnual / LIMITE_ANUAL_MEI) * 100;
  const isProximoLimite = percentualLimite > 80;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        
        {/* Banner de Boas-vindas - MOBILE FIRST */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-4 sm:p-6 text-white mb-4 sm:mb-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
                Olá, {user?.nome?.split(' ')[0]}! 👋
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Bem-vindo ao seu painel financeiro
              </p>
            </div>
            
            {/* Status Badge - Mobile otimizado */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setShowNovaReceitaModal(true)}
                className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
              >
                <i className="ri-add-line text-lg"></i>
                <span className="hidden sm:inline">Nova Receita</span>
                <span className="sm:hidden">Receita</span>
              </button>
              
              <div className="hidden sm:block text-right bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <div className="text-xs text-blue-200 mb-0.5">Status</div>
                <div className={`text-sm font-semibold ${
                  user?.status_assinatura === 'trial' ? 'text-yellow-200' :
                  user?.status_assinatura === 'ativo' ? 'text-green-200' : 'text-red-200'
                }`}>
                  {user?.status_assinatura === 'trial' ? '🔄 Trial' :
                   user?.status_assinatura === 'ativo' ? '✅ Ativo' : '❌ Expirado'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas MEI */}
        <MEIAlerts />

        {/* Botões de Ação Rápida - MOBILE */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6 lg:hidden">
          <button
            onClick={() => setShowNovaReceitaModal(true)}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-h-[56px]"
          >
            <i className="ri-add-circle-line text-xl"></i>
            <span>Receita</span>
          </button>
          <button
            onClick={() => setShowNovaDespesaModal(true)}
            className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-h-[56px]"
          >
            <i className="ri-subtract-line text-xl"></i>
            <span>Despesa</span>
          </button>
          <button
            onClick={() => setShowNovaContaPagarModal(true)}
            className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-h-[56px]"
          >
            <i className="ri-file-list-line text-xl"></i>
            <span>Pagar</span>
          </button>
          <button
            onClick={() => setShowNovaContaReceberModal(true)}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-h-[56px]"
          >
            <i className="ri-file-text-line text-xl"></i>
            <span>Receber</span>
          </button>
        </div>

        {/* Botões de Ação - DESKTOP/TABLET */}
        <div className="hidden lg:flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowNovaReceitaModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <i className="ri-add-line text-lg"></i>
            Nova Receita
          </button>
          <button
            onClick={() => setShowNovaDespesaModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <i className="ri-add-line text-lg"></i>
            Nova Despesa
          </button>
          <button
            onClick={() => setShowNovaContaPagarModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <i className="ri-add-line text-lg"></i>
            Conta a Pagar
          </button>
          <button
            onClick={() => setShowNovaContaReceberModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <i className="ri-add-line text-lg"></i>
            Conta a Receber
          </button>
        </div>

        {/* Cards de Resumo - RESPONSIVO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          {/* Receitas do Mês */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 p-4 sm:p-5 lg:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Receitas do Mês</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 leading-tight">
                  {loading ? '...' : formatCurrency(resumo.receitasMes)}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-arrow-up-line text-xl sm:text-2xl text-green-600"></i>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <span className="text-gray-500 truncate">
                {resumo.receitasMes > resumo.receitasMesAnterior ? '📈' : '📉'} 
                {resumo.receitasMes > 0 ? 
                  ` ${((resumo.receitasMes - resumo.receitasMesAnterior) / Math.max(resumo.receitasMesAnterior, 1) * 100).toFixed(1)}%` : 
                  ' 0%'} vs anterior
              </span>
            </div>
          </div>

          {/* Despesas do Mês */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 p-4 sm:p-5 lg:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Despesas do Mês</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 leading-tight">
                  {loading ? '...' : formatCurrency(resumo.despesasMes)}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-arrow-down-line text-xl sm:text-2xl text-red-600"></i>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <span className="text-gray-500 truncate">
                {resumo.despesasMes > resumo.despesasMesAnterior ? '📈' : '📉'} 
                {resumo.despesasMes > 0 ? 
                  ` ${((resumo.despesasMes - resumo.despesasMesAnterior) / Math.max(resumo.despesasMesAnterior, 1) * 100).toFixed(1)}%` : 
                  ' 0%'} vs anterior
              </span>
            </div>
          </div>

          {/* Lucro do Mês */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 p-4 sm:p-5 lg:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Lucro do Mês</p>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold leading-tight ${resumo.lucroMes >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {loading ? '...' : formatCurrency(resumo.lucroMes)}
                </p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                resumo.lucroMes >= 0 ? 'bg-blue-100' : 'bg-orange-100'
              }`}>
                <i className={`ri-line-chart-line text-xl sm:text-2xl ${
                  resumo.lucroMes >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}></i>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <span className="text-gray-500 truncate">
                {resumo.lucroMes >= 0 ? '💰 Lucro' : '⚠️ Prejuízo'} este mês
              </span>
            </div>
          </div>

          {/* Faturamento Anual */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 p-4 sm:p-5 lg:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Faturamento Anual</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 leading-tight">
                  {loading ? '...' : formatCurrency(resumo.faturamentoAnual)}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-bar-chart-line text-xl sm:text-2xl text-purple-600"></i>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <span className="text-gray-500 truncate">
                📊 {((resumo.faturamentoAnual / 81000) * 100).toFixed(1)}% do limite MEI
              </span>
            </div>
          </div>
        </div>

        {/* Gráfico e Ações Rápidas */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Gráfico Financeiro */}
          <div className="xl:col-span-2">
            <FinancialChart />
          </div>

          {/* Ações Rápidas - Desktop */}
          <div className="hidden lg:block">
            <QuickActions 
              onNovaReceita={() => setShowNovaReceitaModal(true)}
              onNovaDespesa={() => setShowNovaDespesaModal(true)}
              onNovaContaPagar={() => setShowNovaContaPagarModal(true)}
              onNovaContaReceber={() => setShowNovaContaReceberModal(true)}
            />
          </div>
        </div>

        {/* Contas Próximas do Vencimento - RESPONSIVO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Contas a Pagar */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 lg:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <i className="ri-money-dollar-circle-line mr-2 text-red-600 text-xl"></i>
              <span>Contas a Pagar</span>
              <span className="ml-auto text-xs sm:text-sm font-normal text-gray-500">(Próximas)</span>
            </h3>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : resumo.contasPagarProximas.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <i className="ri-checkbox-circle-line text-3xl sm:text-4xl text-green-500 mb-2 sm:mb-3"></i>
                <p className="text-sm sm:text-base text-gray-500">Nenhuma conta próxima</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {resumo.contasPagarProximas.slice(0, 5).map((conta) => (
                  <div key={conta.id} className="flex items-center justify-between p-3 sm:p-3.5 bg-red-50 rounded-xl border border-red-200 hover:bg-red-100 transition-colors duration-200">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{conta.descricao}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                        {format(new Date(conta.vencimento), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-red-600 text-sm sm:text-base">
                        {formatCurrency(conta.valor)}
                      </p>
                    </div>
                  </div>
                ))}
                {resumo.contasPagarProximas.length > 5 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => navigate('/contas-pagar')}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                      Ver todas ({resumo.contasPagarProximas.length}) →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contas a Receber */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 lg:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <i className="ri-money-dollar-circle-line mr-2 text-green-600 text-xl"></i>
              <span>Contas a Receber</span>
              <span className="ml-auto text-xs sm:text-sm font-normal text-gray-500">(Próximas)</span>
            </h3>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : resumo.contasReceberProximas.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <i className="ri-information-line text-3xl sm:text-4xl text-blue-500 mb-2 sm:mb-3"></i>
                <p className="text-sm sm:text-base text-gray-500">Nenhuma conta próxima</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {resumo.contasReceberProximas.slice(0, 5).map((conta) => (
                  <div key={conta.id} className="flex items-center justify-between p-3 sm:p-3.5 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors duration-200">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{conta.descricao}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                        {format(new Date(conta.vencimento), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-green-600 text-sm sm:text-base">
                        {formatCurrency(conta.valor)}
                      </p>
                    </div>
                  </div>
                ))}
                {resumo.contasReceberProximas.length > 5 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => navigate('/contas-receber')}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                      Ver todas ({resumo.contasReceberProximas.length}) →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dica do Dia - RESPONSIVO */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 border border-blue-200">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-lightbulb-line text-xl sm:text-2xl text-blue-600"></i>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">💡 Dica do Dia</h4>
              <p className="text-blue-800 leading-relaxed text-xs sm:text-sm lg:text-base">
                Mantenha sempre suas receitas e despesas atualizadas para ter uma visão real da saúde 
                financeira do seu MEI. Use a calculadora DAS para planejar seus impostos!
              </p>
            </div>
          </div>
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
    </div>
  );
}
