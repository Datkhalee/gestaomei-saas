import { useAuth } from '../../contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';

export default function MeuPlano() {
  const { user } = useAuth();
  const [mostrarComparacao, setMostrarComparacao] = useState(false);

  // 🎯 EVENTO INITIATE CHECKOUT - Ao acessar página
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq && user) {
      if (user.status_assinatura === 'trial' || user.status_assinatura === 'expired') {
        window.fbq('track', 'InitiateCheckout', {
          content_name: 'Plano Full FinanceMEI',
          content_category: 'Subscription',
          value: 27.00,
          currency: 'BRL'
        });
      }
    }
  }, [user]);

  if (!user) return null;

  const trialExpira = new Date(user.trial_expira_em);
  const diasRestantes = Math.ceil(differenceInDays(trialExpira, new Date()));
  const isTrial = user.status_assinatura === 'trial';
  const isExpirado = user.status_assinatura === 'expirado';
  const isAtivo = user.status_assinatura === 'ativo';
  const isCancelado = user.status_assinatura === 'cancelado';

  const beneficios = [
    { 
      icon: 'ri-money-dollar-circle-line', 
      text: 'Controle ILIMITADO de receitas e despesas',
      destaque: 'Sem limites'
    },
    { 
      icon: 'ri-calendar-check-line', 
      text: 'Nunca mais esqueça um pagamento importante',
      destaque: 'Alertas automáticos'
    },
    { 
      icon: 'ri-bar-chart-line', 
      text: 'Veja exatamente pra onde seu dinheiro está indo',
      destaque: 'Gráficos inteligentes'
    },
    { 
      icon: 'ri-calculator-line', 
      text: 'Saiba se está perto do limite MEI em tempo real',
      destaque: 'DAS automatizado'
    },
    { 
      icon: 'ri-file-pdf-line', 
      text: 'Relatórios prontos para seu contador',
      destaque: 'Export profissional'
    },
    { 
      icon: 'ri-lightbulb-flash-line', 
      text: 'Insights que só quem tem dados organizados consegue',
      destaque: 'Decisões inteligentes'
    },
  ];

  const depoimentos = [
    {
      nome: "Maria Silva",
      negocio: "Consultoria de Marketing",
      foto: "👩‍💼",
      texto: "Antes eu perdia horas no Excel. Agora levo 10 minutos pra fechar o mês!",
      economia: "15h/mês economizadas"
    },
    {
      nome: "João Santos",
      negocio: "Design Gráfico",
      foto: "👨‍💻",
      texto: "Finalmente consigo ver minha lucratividade real. Mudou minha forma de precificar!",
      economia: "+35% de lucro"
    },
    {
      nome: "Ana Costa",
      negocio: "E-commerce de Artesanato",
      foto: "👩‍🎨",
      texto: "Nunca mais atrasou um DAS. Minha vida ficou muito mais tranquila!",
      economia: "Zero multas"
    }
  ];

  const proximaCobranca = user.data_ultima_cobranca 
    ? new Date(new Date(user.data_ultima_cobranca).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;

  // 🎯 EVENTO ADD TO CART - Ao clicar em assinar
  const handleCheckoutClick = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: 'Clique Checkout FinanceMEI',
        content_category: 'Checkout Interest',
        value: 27.00,
        currency: 'BRL'
      });
    }
  };

  const getStatusCard = () => {
    if (isTrial) {
      return (
        <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl shadow-2xl p-8 text-white mb-8 overflow-hidden">
          {/* Efeito de brilho animado */}
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-bounce">
                  <i className="ri-timer-flash-line text-4xl"></i>
                </div>
                <div>
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-bold mb-2">
                    ⚡ TESTE GRÁTIS ATIVO
                  </div>
                  <h2 className="text-3xl font-black">Seu teste acaba em breve!</h2>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-6xl font-black mb-1">{diasRestantes > 0 ? diasRestantes : 0}</div>
                <div className="text-lg font-bold opacity-90">dias restantes</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-alarm-warning-line text-2xl text-orange-600"></i>
                </div>
                <div>
                  <p className="font-bold text-lg mb-2">
                    ⚠️ Não perca o acesso em {format(trialExpira, "dd/MM")}!
                  </p>
                  <p className="text-white/90 leading-relaxed">
                    Garanta agora por <span className="font-black text-yellow-300">apenas R$ 27/mês</span> e 
                    continue organizando suas finanças sem preocupação. Milhares de MEIs já confiam no FinanceMEI!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isExpirado) {
      return (
        <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-3xl shadow-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <i className="ri-error-warning-line text-4xl animate-pulse"></i>
              </div>
              <div>
                <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-bold mb-2">
                  🚫 ACESSO BLOQUEADO
                </div>
                <h2 className="text-3xl font-black">Seus dados estão travados</h2>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30">
            <p className="text-xl font-bold mb-3">
              😰 Você está perdendo dinheiro AGORA!
            </p>
            <ul className="space-y-2 text-white/90">
              <li className="flex items-center gap-2">
                <i className="ri-close-circle-line text-red-300"></i>
                <span>Contas atrasadas gerando multas</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="ri-close-circle-line text-red-300"></i>
                <span>Sem visão das suas finanças</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="ri-close-circle-line text-red-300"></i>
                <span>DAS pode atrasar e te prejudicar</span>
              </li>
            </ul>
            <p className="mt-4 font-bold text-yellow-300 text-lg">
              💰 Reative por R$ 27/mês e recupere o controle HOJE!
            </p>
          </div>
        </div>
      );
    }

    if (isAtivo) {
      return (
        <div className="relative bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-3xl shadow-2xl p-8 text-white mb-8 overflow-hidden">
          {/* Confetes animados */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-10 left-10 text-4xl animate-bounce">🎉</div>
            <div className="absolute top-20 right-10 text-3xl animate-pulse">⭐</div>
            <div className="absolute bottom-10 left-20 text-3xl animate-bounce">💚</div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <i className="ri-vip-crown-fill text-4xl text-yellow-300"></i>
                </div>
                <div>
                  <div className="inline-block bg-yellow-400 px-4 py-1 rounded-full text-sm font-bold mb-2 text-green-900">
                    👑 PREMIUM ATIVO
                  </div>
                  <h2 className="text-3xl font-black">Você é PRO!</h2>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold opacity-90 mb-1">Investindo</div>
                <div className="text-5xl font-black">R$ 27<span className="text-2xl">/mês</span></div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-90 mb-1">Status da assinatura</p>
                  <p className="text-xl font-bold flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></span>
                    Ativa e renovando
                  </p>
                </div>
                {proximaCobranca && (
                  <div>
                    <p className="text-sm opacity-90 mb-1">Próxima cobrança</p>
                    <p className="text-xl font-bold">
                      {format(proximaCobranca, "dd/MM/yyyy")}
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-4 text-center text-sm opacity-90">
                💚 Obrigado por confiar no FinanceMEI! Você está no caminho certo para o sucesso financeiro.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (isCancelado) {
      return (
        <div className="relative bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center">
              <i className="ri-emotion-sad-line text-4xl"></i>
            </div>
            <div>
              <h2 className="text-3xl font-black mb-2">Que pena ver você ir...</h2>
              <p className="text-gray-300">Mas sua porta está sempre aberta aqui! 🚪</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <p className="text-lg mb-4">
              💡 Seus dados estão <strong>seguros e salvos</strong>. Volte quando quiser!
            </p>
            <p className="text-gray-300 text-sm">
              Mais de <strong>2.000 MEIs</strong> estão organizando suas finanças com o FinanceMEI. 
              Não fique de fora dessa transformação!
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  const getActionButton = () => {
    const pulseAnimation = "animate-pulse";
    
    if (isTrial || isExpirado) {
      return (
        <div className="space-y-4">
          <a
            href="https://pay.cakto.com.br/38pmmdm_618893"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCheckoutClick}
            className={`group relative w-full px-8 py-6 text-xl font-black rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 shadow-2xl hover:shadow-3xl transform hover:scale-105 ${
              isExpirado
                ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white'
                : 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-purple-700 hover:to-purple-800 text-white'
            }`}
          >
            {/* Brilho animado */}
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <i className="ri-rocket-line text-3xl relative z-10"></i>
            <span className="relative z-10">
              {isExpirado ? 'REATIVAR AGORA - R$ 27/MÊS' : 'QUERO GARANTIR POR R$ 27/MÊS'}
            </span>
            <i className={`ri-arrow-right-line text-3xl relative z-10 group-hover:translate-x-2 transition-transform`}></i>
          </a>
          
          {/* Prova social */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-xs">👤</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white flex items-center justify-center text-white text-xs">👤</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white flex items-center justify-center text-white text-xs">👤</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white flex items-center justify-center text-white text-xs">👤</div>
            </div>
            <p className="font-semibold">
              <span className="text-green-600">+2.000 MEIs</span> já organizaram suas finanças
            </p>
          </div>
        </div>
      );
    }

    if (isAtivo) {
      return (
        <a
          href="https://pay.cakto.com.br/38pmmdm_618893"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-8 py-5 text-lg font-bold rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white"
        >
          <i className="ri-settings-3-line text-2xl"></i>
          Gerenciar Minha Assinatura
        </a>
      );
    }

    if (isCancelado) {
      return (
        <a
          href="https://pay.cakto.com.br/38pmmdm_618893"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCheckoutClick}
          className="group w-full px-8 py-6 text-xl font-black rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 shadow-2xl hover:shadow-3xl transform hover:scale-105 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white"
        >
          <i className="ri-refresh-line text-3xl group-hover:rotate-180 transition-transform duration-500"></i>
          <span>VOLTAR PARA O SUCESSO - R$ 27/MÊS</span>
        </a>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        
        {getStatusCard()}

        {/* 🎯 SEÇÃO PRINCIPAL - OFERTA */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden mb-8">
          
          {/* Header com gradiente */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-8 lg:p-12 text-white overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold text-sm mb-6 shadow-lg">
                <i className="ri-fire-fill text-orange-600"></i>
                OFERTA ESPECIAL
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-black mb-4 leading-tight">
                Pare de perder dinheiro por <span className="text-yellow-300">desorganização</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-blue-100 mb-6 leading-relaxed">
                Junte-se a mais de <strong className="text-yellow-300">2.000 MEIs</strong> que já 
                transformaram suas finanças e <strong>economizam horas</strong> todo mês
              </p>

              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="text-center">
                  <div className="text-5xl lg:text-7xl font-black">R$ 27</div>
                  <div className="text-blue-200 text-lg">/mês</div>
                </div>
                <div className="text-left">
                  <div className="text-sm text-blue-200 line-through">R$ 47/mês</div>
                  <div className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full font-bold text-sm inline-block">
                    43% OFF
                  </div>
                </div>
              </div>

              <p className="text-blue-100 mb-8">
                Menos de <strong className="text-yellow-300">R$ 1 por dia</strong> para nunca mais ter dor de cabeça com finanças
              </p>

              {/* 🎯 CTA #1 - Principal no Header */}
              <div className="flex justify-center">
                <a
                  href="https://pay.cakto.com.br/38pmmdm_618893"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCheckoutClick}
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-xl font-black rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
                >
                  <i className="ri-rocket-line text-3xl group-hover:animate-bounce"></i>
                  QUERO TRANSFORMAR MINHAS FINANÇAS AGORA
                  <i className="ri-arrow-right-line text-3xl group-hover:translate-x-2 transition-transform"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Corpo do card */}
          <div className="p-8 lg:p-12">
            
            {/* O que você ganha */}
            <div className="mb-12">
              <h3 className="text-3xl font-black text-gray-900 mb-2 text-center">
                ⚡ O que você GANHA ao assinar:
              </h3>
              <p className="text-center text-gray-600 mb-8">
                Tudo que você precisa para ser um MEI profissional e lucrativo
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {beneficios.map((beneficio, index) => (
                  <div 
                    key={index} 
                    className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <i className={`${beneficio.icon} text-white text-2xl`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                          {beneficio.destaque}
                        </div>
                        <p className="text-gray-800 font-semibold leading-relaxed">
                          {beneficio.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🎯 CTA #2 - Após Benefícios */}
            <div className="text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8">
              <p className="text-white text-2xl font-bold mb-6">
                ✨ Pronto para ter controle total das suas finanças?
              </p>
              <a
                href="https://pay.cakto.com.br/38pmmdm_618893"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCheckoutClick}
                className="inline-flex items-center gap-3 px-10 py-5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-xl font-black rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                <i className="ri-flashlight-fill text-2xl"></i>
                SIM! QUERO COMEÇAR AGORA POR R$ 27/MÊS
              </a>
              <p className="text-white/80 text-sm mt-4">
                ⚡ Acesso imediato • Cancele quando quiser
              </p>
            </div>

            {/* CTA Principal (existente) */}
            <div className="mb-12">
              {getActionButton()}
            </div>

            {/* Garantia */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 mb-12">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-shield-check-fill text-4xl text-white"></i>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-2xl font-black text-gray-900 mb-2">
                    🛡️ Garantia de 7 dias
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    Experimente sem risco! Se não gostar nos primeiros 7 dias, 
                    <strong className="text-green-700"> devolvemos 100% do seu dinheiro</strong>. 
                    Sem perguntas, sem burocracia.
                  </p>
                </div>
              </div>
            </div>

            {/* Comparação: Com vs Sem */}
            <div className="mb-12">
              <button
                onClick={() => setMostrarComparacao(!mostrarComparacao)}
                className="w-full bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 rounded-2xl p-6 transition-all duration-300 mb-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-2xl font-black text-gray-900">
                    🤔 Sua vida ANTES vs DEPOIS do FinanceMEI
                  </h4>
                  <i className={`ri-arrow-${mostrarComparacao ? 'up' : 'down'}-s-line text-3xl text-gray-700`}></i>
                </div>
              </button>

              {mostrarComparacao && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SEM FinanceMEI */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                        <i className="ri-emotion-unhappy-line text-2xl text-white"></i>
                      </div>
                      <h5 className="text-xl font-black text-red-900">SEM o FinanceMEI</h5>
                    </div>
                    <ul className="space-y-3 text-red-800">
                      <li className="flex items-start gap-2">
                        <i className="ri-close-circle-fill text-red-600 mt-1"></i>
                        <span>Horas perdidas com planilhas confusas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-close-circle-fill text-red-600 mt-1"></i>
                        <span>Medo de ultrapassar o limite MEI</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-close-circle-fill text-red-600 mt-1"></i>
                        <span>Boletos atrasados e multas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-close-circle-fill text-red-600 mt-1"></i>
                        <span>Sem saber se está lucrando de verdade</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-close-circle-fill text-red-600 mt-1"></i>
                        <span>Estresse e noites mal dormidas</span>
                      </li>
                    </ul>
                  </div>

                  {/* COM FinanceMEI */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border-2 border-green-300 relative overflow-hidden">
                    <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full font-bold text-xs rotate-12">
                      VOCÊ AQUI! ✨
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="ri-emotion-happy-line text-2xl text-white"></i>
                      </div>
                      <h5 className="text-xl font-black text-green-900">COM o FinanceMEI</h5>
                    </div>
                    <ul className="space-y-3 text-green-800">
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-green-600 mt-1"></i>
                        <span><strong>10 minutos</strong> para organizar tudo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-green-600 mt-1"></i>
                        <span>Alerta automático quando estiver <strong>perto do limite</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-green-600 mt-1"></i>
                        <span>Nunca mais esquecer um <strong>pagamento</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-green-600 mt-1"></i>
                        <span>Lucratividade <strong>na palma da mão</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-green-600 mt-1"></i>
                        <span><strong>Tranquilidade</strong> e tempo para crescer</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Depoimentos */}
            <div className="mb-12">
              <h3 className="text-3xl font-black text-gray-900 mb-2 text-center">
                💬 O que outros MEIs estão dizendo:
              </h3>
              <p className="text-center text-gray-600 mb-8">
                Histórias reais de transformação financeira
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {depoimentos.map((depoimento, index) => (
                  <div 
                    key={index}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-4xl">{depoimento.foto}</div>
                      <div>
                        <p className="font-bold text-gray-900">{depoimento.nome}</p>
                        <p className="text-sm text-gray-600">{depoimento.negocio}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="ri-star-fill text-yellow-500"></i>
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-3 leading-relaxed">
                      "{depoimento.texto}"
                    </p>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold inline-block">
                      {depoimento.economia}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🎯 CTA #3 - Após Depoimentos */}
            <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl p-10 text-center text-white mb-12 shadow-2xl">
              <div className="max-w-2xl mx-auto">
                <h4 className="text-3xl font-black mb-3">
                  🎉 Junte-se a +2.000 MEIs de sucesso!
                </h4>
                <p className="text-xl text-white/90 mb-6">
                  Sua história de sucesso financeiro começa <strong className="text-yellow-300">HOJE</strong>
                </p>
                <a
                  href="https://pay.cakto.com.br/38pmmdm_618893"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCheckoutClick}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-white hover:bg-gray-100 text-green-700 text-xl font-black rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                >
                  <i className="ri-check-double-line text-3xl"></i>
                  GARANTIR MINHA VAGA POR R$ 27/MÊS
                  <i className="ri-arrow-right-line text-3xl"></i>
                </a>
                <p className="text-white/80 text-sm mt-4 flex items-center justify-center gap-2">
                  <i className="ri-shield-check-line"></i>
                  Garantia de 7 dias • Pagamento 100% seguro
                </p>
              </div>
            </div>

            {/* Urgência */}
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-8 text-white text-center mb-12">
              <h4 className="text-3xl font-black mb-3">
                ⏰ Cada dia sem organização = Dinheiro perdido
              </h4>
              <p className="text-xl text-white/90 mb-6">
                Quanto tempo você vai deixar suas finanças no caos? 
                <strong className="text-yellow-300"> Comece HOJE</strong> e veja a diferença!
              </p>
              {getActionButton()}
            </div>

            {/* FAQ Rápido */}
            <div className="border-t-2 border-gray-200 pt-12">
              <h3 className="text-3xl font-black text-gray-900 mb-8 text-center">
                ❓ Perguntas Frequentes
              </h3>
              
              <div className="space-y-4 max-w-3xl mx-auto">
                <details className="bg-gray-50 rounded-xl p-6 cursor-pointer hover:bg-gray-100 transition-colors">
                  <summary className="font-bold text-gray-900 text-lg">
                    Posso cancelar quando quiser?
                  </summary>
                  <p className="text-gray-700 mt-3 leading-relaxed">
                    Sim! Sem multas, sem burocracia. Cancele direto na plataforma de pagamento quando quiser.
                  </p>
                </details>

                <details className="bg-gray-50 rounded-xl p-6 cursor-pointer hover:bg-gray-100 transition-colors">
                  <summary className="font-bold text-gray-900 text-lg">
                    É seguro colocar meus dados financeiros?
                  </summary>
                  <p className="text-gray-700 mt-3 leading-relaxed">
                    Totalmente! Usamos criptografia de ponta e seus dados ficam 100% seguros. 
                    Milhares de MEIs já confiam em nós.
                  </p>
                </details>

                <details className="bg-gray-50 rounded-xl p-6 cursor-pointer hover:bg-gray-100 transition-colors">
                  <summary className="font-bold text-gray-900 text-lg">
                    Funciona no celular?
                  </summary>
                  <p className="text-gray-700 mt-3 leading-relaxed">
                    Sim! Acesse de qualquer lugar, celular, tablet ou computador. 
                    Gerencie suas finanças onde você estiver.
                  </p>
                </details>

                <details className="bg-gray-50 rounded-xl p-6 cursor-pointer hover:bg-gray-100 transition-colors">
                  <summary className="font-bold text-gray-900 text-lg">
                    E se eu não souber usar?
                  </summary>
                  <p className="text-gray-700 mt-3 leading-relaxed">
                    Super intuitivo! Em 5 minutos você já está usando. 
                    E nosso suporte está sempre disponível para ajudar.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com segurança e suporte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="ri-shield-check-line text-3xl text-blue-600"></i>
              </div>
              <h4 className="font-black text-gray-900 text-lg">Pagamento 100% Seguro</h4>
            </div>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Processado pela <strong>Cakto</strong>, plataforma confiável usada por milhares de empresas. 
              Seus dados estão protegidos.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-1">
                <i className="ri-lock-fill text-green-600"></i>
                SSL Seguro
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-1">
                <i className="ri-bank-card-line text-blue-600"></i>
                Cartão
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-1">
                <i className="ri-qr-code-line text-green-600"></i>
                PIX
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="ri-customer-service-2-line text-3xl text-green-600"></i>
              </div>
              <h4 className="font-black text-gray-900 text-lg">Suporte Sempre Disponível</h4>
            </div>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Dúvidas? Problemas? Nossa equipe está pronta para te ajudar a ter sucesso com suas finanças.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-1">
                <i className="ri-chat-3-line text-blue-600"></i>
                Chat
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-1">
                <i className="ri-mail-line text-purple-600"></i>
                Email
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-1">
                <i className="ri-whatsapp-line text-green-600"></i>
                WhatsApp
              </span>
            </div>
          </div>
        </div>

        {/* CTA Final Flutuante (Mobile) */}
        {(isTrial || isExpirado) && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-blue-600 p-4 shadow-2xl md:hidden z-50">
            <a
              href="https://pay.cakto.com.br/38pmmdm_618893"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCheckoutClick}
              className="block w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center font-black text-lg rounded-xl shadow-lg"
            >
              🚀 GARANTIR POR R$ 27/MÊS
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
