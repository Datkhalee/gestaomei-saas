import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format, startOfYear, endOfYear } from 'date-fns';

export default function CalculadoraDAS() {
  const { user } = useAuth();
  const [faturamentoAnual, setFaturamentoAnual] = useState(0);
  const [categoria, setCategoria] = useState<'comercio' | 'servicos' | 'ambos'>('comercio');
  const [loading, setLoading] = useState(true);

  const LIMITE_MEI_2025 = 81000;
  
  const VALORES_DAS = {
    comercio: { mensal: 71.60, anual: 859.20, nome: 'Comércio', icone: '🏪' },
    servicos: { mensal: 75.60, anual: 907.20, nome: 'Serviços', icone: '💼' },
    ambos: { mensal: 76.60, anual: 919.20, nome: 'Comércio e Serviços', icone: '⚙️' }
  };

  useEffect(() => {
    if (user) {
      loadFaturamentoAnual();
    }
  }, [user]);

  const loadFaturamentoAnual = async () => {
    if (!user) return;

    setLoading(true);
    
    const currentYear = new Date().getFullYear();
    const startYear = startOfYear(new Date());
    const endYear = endOfYear(new Date());

    try {
      // ✅ FILTRAR APENAS RECEITAS RECEBIDAS
      const { data: receitas } = await supabase
        .from('receitas')
        .select('valor')
        .eq('user_id', user.id)
        .eq('recebido', true) // 👈 NOVA LINHA
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusFaturamento = () => {
    const percentual = (faturamentoAnual / LIMITE_MEI_2025) * 100;
    
    if (percentual <= 80) {
      return { 
        cor: 'green', 
        icone: '✅', 
        texto: 'Dentro do limite',
        corBg: 'bg-green-50',
        corBorda: 'border-green-300',
        corTexto: 'text-green-800'
      };
    } else if (percentual <= 100) {
      return { 
        cor: 'orange', 
        icone: '⚠️', 
        texto: 'Próximo do limite',
        corBg: 'bg-orange-50',
        corBorda: 'border-orange-300',
        corTexto: 'text-orange-800'
      };
    } else {
      return { 
        cor: 'red', 
        icone: '🔴', 
        texto: 'Ultrapassou o limite',
        corBg: 'bg-red-50',
        corBorda: 'border-red-300',
        corTexto: 'text-red-800'
      };
    }
  };

  const status = getStatusFaturamento();
  const percentualUsado = ((faturamentoAnual / LIMITE_MEI_2025) * 100).toFixed(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 📘 Cabeçalho Educativo */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-information-line text-2xl text-blue-700"></i>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-900 mb-2">🧾 Calculadora DAS MEI – 2025</h1>
            <p className="text-blue-800 leading-relaxed">
              O DAS é o boleto mensal obrigatório do MEI. Ele inclui INSS e tributos, e 
              <strong> o valor não muda conforme o faturamento.</strong>
            </p>
            <p className="text-sm text-blue-700 mt-2">
              💡 Os valores abaixo são referências de 2025. Para confirmar, acesse o 
              <a 
                href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-medium hover:text-blue-900 ml-1"
              >
                Portal do Empreendedor
              </a>.
            </p>
          </div>
        </div>
      </div>

      {/* 🎴 Cards de Valores */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Selecione seu tipo de atividade:
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(VALORES_DAS).map(([key, valor]) => (
            <button
              key={key}
              onClick={() => setCategoria(key as any)}
              className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                categoria === key
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{valor.icone}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{valor.nome}</h3>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Valor Mensal</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(valor.mensal)}
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Total Anual</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {formatCurrency(valor.anual)}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            📅 O DAS vence todo dia <strong>20 de cada mês</strong>
          </p>
        </div>
      </div>

      {/* 💰 Faturamento Atual */}
      <div className={`rounded-xl p-6 border-2 ${status.corBorda} ${status.corBg}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Seu Faturamento Anual ({new Date().getFullYear()})
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">💵 Faturamento atual:</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(faturamentoAnual)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-700">📈 Limite MEI 2025:</span>
            <span className="text-lg font-semibold text-gray-800">
              {formatCurrency(LIMITE_MEI_2025)}
            </span>
          </div>

          <div className="pt-3 border-t border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">📊 Você usou:</span>
              <span className={`text-lg font-bold ${status.corTexto}`}>
                {percentualUsado}% do limite anual
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`bg-${status.cor}-500 h-3 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(parseFloat(percentualUsado), 100)}%` }}
              ></div>
            </div>
            
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-2xl">{status.icone}</span>
              <span className={`font-semibold ${status.corTexto}`}>
                {status.texto}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 Resumo da Categoria Selecionada */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">
          💼 Resumo da sua categoria: {VALORES_DAS[categoria].nome}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">DAS Mensal</p>
            <p className="text-3xl font-bold text-purple-600">
              {formatCurrency(VALORES_DAS[categoria].mensal)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">DAS Anual (12 meses)</p>
            <p className="text-3xl font-bold text-purple-600">
              {formatCurrency(VALORES_DAS[categoria].anual)}
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800">
            💡 <strong>Lembre-se:</strong> Este valor é fixo e não muda conforme seu faturamento. 
            Você só precisa se preocupar em não ultrapassar o limite de R$ 81.000/ano para continuar como MEI.
          </p>
        </div>
      </div>

      {/* ℹ️ Informações Importantes */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="ri-information-line text-blue-600 mr-2"></i>
          ℹ️ Informações importantes sobre o DAS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <i className="ri-check-line text-green-600 mt-0.5"></i>
            <span>O DAS é um <strong>valor fixo mensal</strong>, pago pelo MEI</span>
          </div>
          
          <div className="flex items-start space-x-2">
            <i className="ri-check-line text-green-600 mt-0.5"></i>
            <span>Ele <strong>não varia com o faturamento</strong></span>
          </div>
          
          <div className="flex items-start space-x-2">
            <i className="ri-check-line text-green-600 mt-0.5"></i>
            <span>O pagamento <strong>vence todo dia 20</strong></span>
          </div>
          
          <div className="flex items-start space-x-2">
            <i className="ri-check-line text-green-600 mt-0.5"></i>
            <span>Inclui <strong>INSS e tributos</strong> (ICMS e/ou ISS)</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <i className="ri-government-line mr-2"></i>
            🔗 Emitir DAS Oficial
          </h4>
          <p className="text-sm text-blue-800 mb-3">
            Para gerar e pagar seu DAS com os valores oficiais atualizados:
          </p>
          <div className="flex flex-wrap gap-3">
            
              href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="ri-external-link-line"></i>
              <span>Portal do Simples Nacional</span>
            </a>
            
            
              href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <i className="ri-external-link-line"></i>
              <span>Portal do Empreendedor</span>
            </a>
          </div>
        </div>
      </div>

      {/* ⚠️ Aviso Legal (discreto) */}
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <p className="text-xs text-yellow-800 leading-relaxed">
          <strong>⚖️ Aviso:</strong> Esta calculadora é uma ferramenta educativa com valores de referência. 
          O FinanceMEI não se responsabiliza por valores incorretos. Sempre consulte o Portal do Simples Nacional 
          ou seu contador para valores oficiais.
        </p>
      </div>
    </div>
  );
}
