import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format, startOfYear, endOfYear } from 'date-fns';

interface CalculoResult {
  valorDAS: number;
  aliquota: number;
  faturamentoBase: number;
  categoria: string;
  observacoes: string[];
}

export default function CalculadoraDAS() {
  const { user } = useAuth();
  const [faturamentoAnual, setFaturamentoAnual] = useState(0);
  const [faturamentoInformado, setFaturamentoInformado] = useState('');
  const [categoria, setCategoria] = useState('comercio');
  const [resultado, setResultado] = useState<CalculoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [usarFaturamentoReal, setUsarFaturamentoReal] = useState(true);
  const [lembreteAtivo, setLembreteAtivo] = useState(false);

  const LIMITE_MEI_2024 = 81000;
  const DAS_VALORES = {
    comercio: 71.60,
    servicos: 75.60, // ✅ CORRIGIDO: era 71.60, agora é 75.60
    comercio_servicos: 76.60
  };

  const TABELA_DAS_2024 = {
    comercio: {
      faixas: [
        { min: 0, max: 180000, aliquota: 4.0, valorFixo: 0 },
        { min: 180000.01, max: 360000, aliquota: 7.3, valorFixo: 5940 },
        { min: 360000.01, max: 720000, aliquota: 9.5, valorFixo: 13860 },
        { min: 720000.01, max: 1800000, aliquota: 10.7, valorFixo: 22500 },
        { min: 1800000.01, max: 3600000, aliquota: 14.3, valorFixo: 87300 },
        { min: 3600000.01, max: 4800000, aliquota: 19.0, valorFixo: 378000 }
      ]
    },
    industria: {
      faixas: [
        { min: 0, max: 180000, aliquota: 4.5, valorFixo: 0 },
        { min: 180000.01, max: 360000, aliquota: 7.8, valorFixo: 5940 },
        { min: 360000.01, max: 720000, aliquota: 10.0, valorFixo: 13860 },
        { min: 720000.01, max: 1800000, aliquota: 11.2, valorFixo: 22500 },
        { min: 1800000.01, max: 3600000, aliquota: 14.7, valorFixo: 85500 },
        { min: 3600000.01, max: 4800000, aliquota: 30.0, valorFixo: 720000 }
      ]
    },
    servicos: {
      faixas: [
        { min: 0, max: 180000, aliquota: 6.0, valorFixo: 0 },
        { min: 180000.01, max: 360000, aliquota: 11.2, valorFixo: 9360 },
        { min: 360000.01, max: 720000, aliquota: 13.5, valorFixo: 17640 },
        { min: 720000.01, max: 1800000, aliquota: 16.0, valorFixo: 35640 },
        { min: 1800000.01, max: 3600000, aliquota: 21.0, valorFixo: 125640 },
        { min: 3600000.01, max: 4800000, aliquota: 33.0, valorFixo: 648000 }
      ]
    }
  };

  useEffect(() => {
    if (user && usarFaturamentoReal) {
      loadFaturamentoAnual();
    }
  }, [user, usarFaturamentoReal]);

  const loadFaturamentoAnual = async () => {
    if (!user) return;

    setLoading(true);
    
    const currentYear = new Date().getFullYear();
    const startYear = startOfYear(new Date());
    const endYear = endOfYear(new Date());

    try {
      const { data: receitas } = await supabase
        .from('receitas')
        .select('valor')
        .eq('user_id', user.id)
        .gte('data', format(startYear, 'yyyy-MM-dd'))
        .lte('data', format(endYear, 'yyyy-MM-dd'));

      const total = receitas?.reduce((acc, item) => acc + item.valor, 0) || 0;
      setFaturamentoAnual(total);
    } catch (error) {
      console.error('Erro ao carregar faturamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularDAS = () => {
    const faturamento = usarFaturamentoReal ? faturamentoAnual : parseFloat(faturamentoInformado) || 0;
    
    if (faturamento < 0) {
      alert('Informe um faturamento válido');
      return;
    }

    const valorMensal = DAS_VALORES[categoria as keyof typeof DAS_VALORES];
    const valorAnual = valorMensal * 12;

    setResultado({
      valorDAS: valorAnual,
      aliquota: (valorAnual / Math.max(faturamento, 1)) * 100,
      faturamentoBase: faturamento,
      categoria: categoria === 'comercio' ? 'Comércio' : categoria === 'servicos' ? 'Serviços' : 'Comércio e Serviços',
      observacoes: []
    });
  };

  const getStatusFaturamento = (faturamento: number) => {
    const percentual = (faturamento / LIMITE_MEI_2024) * 100;
    
    if (percentual <= 80) {
      return { status: 'dentro', cor: 'blue', icone: '🔵', texto: 'Dentro do limite' };
    } else if (percentual <= 100) {
      return { status: 'proximo', cor: 'orange', icone: '🟠', texto: 'Próximo do limite' };
    } else {
      return { status: 'ultrapassou', cor: 'red', icone: '🔴', texto: 'Ultrapassou o limite' };
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return value.toFixed(2) + '%';
  };

  const compartilharWhatsApp = () => {
    if (!resultado) return;
    
    const valorMensal = DAS_VALORES[categoria as keyof typeof DAS_VALORES];
    const texto = `🧮 *Calculadora DAS MEI (Estimativa)*\n\n` +
      `📊 Categoria: ${resultado.categoria}\n` +
      `💰 DAS Mensal (Ref. 2024): ${formatCurrency(valorMensal)}\n` +
      `📅 DAS Anual (Estimativa): ${formatCurrency(resultado.valorDAS)}\n` +
      `📈 Faturamento: ${formatCurrency(resultado.faturamentoBase)}\n\n` +
      `⚠️ Valores de referência. Consulte o Portal do Simples Nacional para valores oficiais.\n\n` +
      `💡 Mantenha o DAS em dia e garanta seus direitos previdenciários!`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const ativarLembrete = async () => {
    setLembreteAtivo(!lembreteAtivo);
    alert(lembreteAtivo ? 'Lembrete desativado!' : 'Lembrete ativado! Você receberá notificações antes do vencimento.');
  };

  const faturamentoAtual = usarFaturamentoReal ? faturamentoAnual : parseFloat(faturamentoInformado) || 0;
  const statusFaturamento = getStatusFaturamento(faturamentoAtual);
  const valorMensalDAS = DAS_VALORES[categoria as keyof typeof DAS_VALORES];

  return (
    <div className="space-y-6">
      {/* ⚠️ DISCLAIMER CRÍTICO */}
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <i className="ri-error-warning-line text-3xl text-red-600"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 mb-2">⚠️ ATENÇÃO: ESTIMATIVA EDUCATIVA</h3>
            <div className="text-red-800 space-y-2 text-sm">
              <p className="font-medium">
                Esta calculadora fornece apenas uma ESTIMATIVA baseada em valores de referência de 2024.
              </p>
              <p>
                <strong>O FinanceMEI NÃO substitui consulta contábil oficial e NÃO se responsabiliza por valores incorretos.</strong>
              </p>
              <div className="bg-white rounded-lg p-3 mt-3 border border-red-200">
                <p className="font-semibold text-red-900 mb-2">📍 Para o valor OFICIAL do seu DAS:</p>
                <div className="space-y-1">
                  <p>• Acesse: <a href="https://www8.receita.fazenda.gov.br/SimplesNacional/" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-600 font-medium">Portal do Simples Nacional</a></p>
                  <p>• Ou baixe o App MEI (iOS e Android)</p>
                  <p>• Ou consulte seu contador</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <i className="ri-calculator-line text-3xl"></i>
          <h1 className="text-2xl font-bold">Calculadora DAS MEI (Estimativa)</h1>
        </div>
        <p className="text-blue-100">
          Estimativa educativa do DAS mensal. Valores oficiais devem ser consultados no Portal do Simples Nacional.
        </p>
      </div>

      {/* 🆕 SEÇÃO EXPLICATIVA - DAS vs TAXAS MUNICIPAIS */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-300 p-6">
        <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
          <i className="ri-question-line mr-2 text-2xl"></i>
          💡 Entenda a diferença: DAS MEI vs Taxas Municipais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DAS MEI */}
          <div className="bg-white rounded-lg p-5 border-2 border-blue-300">
            <div className="flex items-start space-x-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-calendar-line text-2xl text-blue-600"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-blue-900 text-lg mb-1">DAS MEI (Mensal)</h4>
                <p className="text-sm text-blue-600 font-medium">Pagamento Obrigatório Todo Mês</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <p className="text-gray-700"><strong>O que é:</strong> Imposto mensal fixo do MEI</p>
              </div>
              <div className="flex items-start space-x-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <p className="text-gray-700"><strong>Valor:</strong> R$ 71,60 a R$ 76,60/mês</p>
              </div>
              <div className="flex items-start space-x-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <p className="text-gray-700"><strong>Vencimento:</strong> Todo dia 20 do mês</p>
              </div>
              <div className="flex items-start space-x-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <p className="text-gray-700"><strong>Obrigatório:</strong> SIM, mesmo sem faturar</p>
              </div>
              <div className="flex items-start space-x-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <p className="text-gray-700"><strong>Para que serve:</strong> INSS (aposentadoria, auxílios) + impostos</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 font-medium">
                📌 Este valor é calculado nesta página
              </p>
            </div>
          </div>

          {/* Taxas Municipais */}
          <div className="bg-white rounded-lg p-5 border-2 border-orange-300">
            <div className="flex items-start space-x-3 mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-file-text-line text-2xl text-orange-600"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-orange-900 text-lg mb-1">Taxas para Nota Fiscal</h4>
                <p className="text-sm text-orange-600 font-medium">Pagamento Único ou Anual</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <i className="ri-arrow-right-line text-orange-600 mt-1"></i>
                <p className="text-gray-700"><strong>O que é:</strong> Taxa da prefeitura para emitir nota</p>
              </div>
              <div className="flex items-start space-x-2">
                <i className="ri-arrow-right-line text-orange-600 mt-1"></i>
                <p className="text-gray-700"><strong>Valor:</strong> Varia por cidade (R$ 0 até R$ 500+)</p>
              </div>
              <div className="flex items-start space-x-2">
                <i className="ri-arrow-right-line text-orange-600 mt-1"></i>
                <p className="text-gray-700"><strong>Frequência:</strong> Única, anual ou isenta (depende da cidade)</p>
              </div>
              <div className="flex items-start space-x-2">
                <i className="ri-arrow-right-line text-orange-600 mt-1"></i>
                <p className="text-gray-700"><strong>Obrigatório:</strong> Apenas se for emitir nota fiscal</p>
              </div>
              <div className="flex items-start space-x-2">
                <i className="ri-arrow-right-line text-orange-600 mt-1"></i>
                <p className="text-gray-700"><strong>Para que serve:</strong> Liberar sistema de nota fiscal eletrônica</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-xs text-orange-800 font-medium">
                📌 Consulte a prefeitura da sua cidade
              </p>
            </div>
          </div>
        </div>

        {/* Exemplo Prático */}
        <div className="mt-6 bg-white rounded-lg p-5 border-2 border-green-300">
          <h4 className="font-bold text-green-900 mb-3 flex items-center">
            <i className="ri-lightbulb-line mr-2 text-green-600"></i>
            Exemplo Prático: Quanto o MEI paga?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-gray-900">📅 Todo Mês:</p>
              <p className="text-2xl font-bold text-blue-600">R$ 71,60 - R$ 76,60</p>
              <p className="text-xs text-gray-600">DAS MEI (obrigatório)</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">📄 Para Nota Fiscal:</p>
              <p className="text-2xl font-bold text-orange-600">R$ 0 - R$ 500+</p>
              <p className="text-xs text-gray-600">Taxa municipal (varia por cidade)</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">💰 Total Ano (sem nota):</p>
              <p className="text-2xl font-bold text-purple-600">R$ 859 - R$ 919</p>
              <p className="text-xs text-gray-600">Apenas DAS x 12 meses</p>
            </div>
          </div>
        </div>

        {/* Alerta Importante */}
        <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-300">
          <div className="flex items-start space-x-3">
            <i className="ri-error-warning-line text-yellow-600 text-xl mt-1"></i>
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">⚠️ Importante:</p>
              <p>O <strong>DAS MEI é SEMPRE obrigatório</strong>, mesmo que você não emita nota fiscal. Já a <strong>taxa municipal é opcional</strong> e só precisa ser paga se você for emitir nota fiscal eletrônica.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <i className="ri-settings-3-line mr-2 text-blue-600"></i>
              Configuração do Cálculo
            </h3>
            
            <div className="space-y-6">
              {/* Tipo de Atividade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <i className="ri-store-line mr-2"></i>
                  Tipo de Atividade
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setCategoria('comercio')}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer whitespace-nowrap ${
                      categoria === 'comercio'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <i className="ri-shopping-bag-line text-2xl mb-2 block"></i>
                      <div className="font-medium">Comércio</div>
                      <div className="text-sm text-gray-500">R$ 71,60/mês*</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setCategoria('servicos')}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer whitespace-nowrap ${
                      categoria === 'servicos'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <i className="ri-tools-line text-2xl mb-2 block"></i>
                      <div className="font-medium">Serviços</div>
                      <div className="text-sm text-gray-500">R$ 75,60/mês*</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setCategoria('comercio_servicos')}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer whitespace-nowrap ${
                      categoria === 'comercio_servicos'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <i className="ri-briefcase-line text-2xl mb-2 block"></i>
                      <div className="font-medium">Comércio e Serviços</div>
                      <div className="text-sm text-gray-500">R$ 76,60/mês*</div>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">* Valores de referência 2024</p>
              </div>

              {/* Faturamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <i className="ri-money-dollar-circle-line mr-2"></i>
                  Faturamento Anual (Opcional)
                </label>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={usarFaturamentoReal}
                      onChange={() => setUsarFaturamentoReal(true)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Usar faturamento do sistema ({formatCurrency(faturamentoAnual)})
                    </span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={!usarFaturamentoReal}
                      onChange={() => setUsarFaturamentoReal(false)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Informar faturamento estimado</span>
                  </label>
                  
                  {!usarFaturamentoReal && (
                    <div className="ml-7">
                      <input
                        type="number"
                        value={faturamentoInformado}
                        onChange={(e) => setFaturamentoInformado(e.target.value)}
                        placeholder="Ex: 50000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Status do Faturamento */}
                {faturamentoAtual > 0 && (
                  <div className={`mt-4 p-4 rounded-lg border-2 border-${statusFaturamento.cor}-200 bg-${statusFaturamento.cor}-50`}>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{statusFaturamento.icone}</span>
                      <span className={`font-medium text-${statusFaturamento.cor}-800`}>
                        {statusFaturamento.texto}
                      </span>
                    </div>
                    <div className={`text-sm text-${statusFaturamento.cor}-600 mt-1`}>
                      {((faturamentoAtual / LIMITE_MEI_2024) * 100).toFixed(1)}% do limite MEI utilizado
                    </div>
                    <div className={`w-full bg-${statusFaturamento.cor}-200 rounded-full h-2 mt-2`}>
                      <div 
                        className={`bg-${statusFaturamento.cor}-500 h-2 rounded-full transition-all`}
                        style={{ width: `${Math.min((faturamentoAtual / LIMITE_MEI_2024) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botão Calcular */}
              <button
                onClick={calcularDAS}
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center justify-center space-x-2"
              >
                <i className="ri-calculator-line"></i>
                <span>{loading ? 'Calculando...' : 'Calcular Estimativa'}</span>
              </button>
            </div>
          </div>

          {/* Resultado */}
          {resultado && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <i className="ri-file-text-line mr-2 text-green-600"></i>
                Estimativa de DAS
              </h3>
              <p className="text-xs text-red-600 mb-4 font-medium">
                ⚠️ Valores aproximados de 2024. Consulte a Receita Federal para valores oficiais atualizados.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <div className="text-center">
                    <i className="ri-money-dollar-circle-line text-3xl text-green-600 mb-2"></i>
                    <p className="text-sm text-green-700 mb-1">DAS Mensal (Estimativa)</p>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(valorMensalDAS)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Referência 2024</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="text-center">
                    <i className="ri-calendar-line text-3xl text-blue-600 mb-2"></i>
                    <p className="text-sm text-blue-700 mb-1">DAS Anual (Estimativa)</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {formatCurrency(resultado.valorDAS)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">12 meses</p>
                  </div>
                </div>
              </div>

              {/* Informações Importantes */}
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mb-6">
                <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                  <i className="ri-information-line mr-2"></i>
                  Informações Importantes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
                  <div>• <strong>Limite MEI 2024:</strong> {formatCurrency(LIMITE_MEI_2024)}</div>
                  <div>• <strong>Vencimento:</strong> Todo dia 20</div>
                  <div>• <strong>Onde pagar:</strong> App MEI, Gov.br, bancos ou Pix</div>
                  <div>• <strong>Atraso:</strong> Multa 2% + juros 0,33% ao dia</div>
                </div>
              </div>

              {/* Botão para site oficial */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <i className="ri-government-line mr-2"></i>
                  Calcular Valor Oficial
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Para obter o valor EXATO e ATUALIZADO do seu DAS, acesse o Portal do Simples Nacional:
                </p>
                <a
                  href="https://www8.receita.fazenda.gov.br/SimplesNacional/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="ri-external-link-line"></i>
                  <span>Acessar Portal Oficial</span>
                </a>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={calcularDAS}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-refresh-line"></i>
                  <span>Recalcular Estimativa</span>
                </button>
                
                <button
                  onClick={compartilharWhatsApp}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-whatsapp-line"></i>
                  <span>Compartilhar</span>
                </button>
                
                <button
                  onClick={ativarLembrete}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    lembreteAtivo 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  <i className={lembreteAtivo ? 'ri-notification-off-line' : 'ri-notification-line'}></i>
                  <span>{lembreteAtivo ? 'Desativar Lembrete' : 'Ativar Lembrete'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Painel Lateral */}
        <div className="space-y-6">
          {/* Projeção Anual */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <i className="ri-bar-chart-line mr-2 text-purple-600"></i>
              📊 Projeção Anual
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">DAS Total/Ano:</span>
                <span className="font-medium">{formatCurrency(valorMensalDAS * 12)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Limite MEI:</span>
                <span className="font-medium">{formatCurrency(LIMITE_MEI_2024)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">% sobre limite:</span>
                <span className="font-medium">
                  {((valorMensalDAS * 12 / LIMITE_MEI_2024) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Contribuição Previdenciária */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <i className="ri-shield-check-line mr-2 text-green-600"></i>
              🪙 Contribuição Previdenciária
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              O DAS cobre sua contribuição ao INSS e garante direitos como aposentadoria, 
              auxílio-doença, salário-maternidade e outros benefícios previdenciários.
            </p>
          </div>

          {/* Simulação de Crescimento */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <i className="ri-line-chart-line mr-2 text-blue-600"></i>
              🧾 MEI vs Microempresa
            </h4>
            <div className="space-y-3 text-sm">
              <div className="border-b pb-2">
                <div className="font-medium text-gray-900">MEI</div>
                <div className="text-gray-600">Até R$ 81.000/ano</div>
                <div className="text-green-600">DAS: R$ {valorMensalDAS}/mês*</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Microempresa</div>
                <div className="text-gray-600">Até R$ 360.000/ano</div>
                <div className="text-orange-600">Impostos: 4% a 17,42%</div>
              </div>
            </div>
          </div>

          {/* Lembrete */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
              <i className="ri-calendar-check-line mr-2"></i>
              📅 Lembrete Automático
            </h4>
            <p className="text-sm text-purple-700 mb-4">
              Receba notificações antes do vencimento e nunca mais perca o prazo do DAS.
            </p>
            <button
              onClick={ativarLembrete}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                lembreteAtivo
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {lembreteAtivo ? 'Lembrete Ativo ✓' : 'Ativar Lembrete'}
            </button>
          </div>
        </div>
      </div>

      {/* Rodapé Educativo com Aviso Legal */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border-2 border-red-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-alert-line text-2xl text-red-600"></i>
          </div>
          <div>
            <h4 className="font-semibold text-red-900 mb-2">⚖️ Aviso Legal Importante</h4>
            <p className="text-red-800 leading-relaxed text-sm">
              Esta calculadora é uma ferramenta EDUCATIVA que fornece ESTIMATIVAS baseadas em valores de referência. 
              <strong> O FinanceMEI NÃO se responsabiliza por valores incorretos, multas ou problemas fiscais.</strong> 
              Sempre consulte o Portal do Simples Nacional (receita.fazenda.gov.br) ou seu contador para obter 
              valores oficiais e atualizados. Os valores do DAS podem sofrer alterações anuais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
