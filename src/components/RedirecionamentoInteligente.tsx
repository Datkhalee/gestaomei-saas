import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RedirecionamentoInteligente() {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se é primeira visita
    const isPrimeiraVisita = !localStorage.getItem('financemei_visited');
    
    if (isPrimeiraVisita) {
      // Marcar como visitado
      localStorage.setItem('financemei_visited', 'true');
      
      // 🎯 EVENTO FACEBOOK PIXEL - NOVA VISITA
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_name: 'Primeira Visita FinanceMEI',
          content_category: 'Landing Page'
        });
      }
      
      // Redirecionar para cadastro (novos usuários)
      navigate('/cadastro');
    } else {
      // Redirecionar para login (usuários que já visitaram)
      navigate('/login');
    }
  }, [navigate]);

  // Loading enquanto redireciona
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}
