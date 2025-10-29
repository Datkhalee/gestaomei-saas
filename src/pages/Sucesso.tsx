import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sucesso() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="ri-check-double-line text-4xl text-green-600"></i>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          🎉 Parabéns! Compra aprovada
        </h1>

        <p className="text-gray-600 mb-4">
          Seu plano <strong>FULL</strong> foi ativado com sucesso.
        </p>

        <p className="text-green-700 text-sm">
          Redirecionando para o dashboard em {countdown}s...
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
        >
          Ir para o Dashboard agora
        </button>
      </div>
    </div>
  );
}
