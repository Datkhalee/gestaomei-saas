import { useNavigate } from 'react-router-dom';
import { useTrialStatus } from '../../hooks/useTrialStatus';

export default function TrialBlocker() {
  const navigate = useNavigate();
  const { isExpired } = useTrialStatus();

  if (!isExpired) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-time-line text-4xl text-orange-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Seu período de teste expirou
          </h2>
          <p className="text-gray-600">
            Para continuar aproveitando todos os recursos do FinanceMEI, escolha um plano.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/meu-plano')}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="ri-vip-crown-line mr-2"></i>
            Ver Planos
          </button>
          
          <button
            onClick={() => {
              window.location.href = '/login';
            }}
            className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sair
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            <i className="ri-shield-check-line mr-1"></i>
            Cancele quando quiser • Sem multas
          </p>
        </div>
      </div>
    </div>
  );
}
