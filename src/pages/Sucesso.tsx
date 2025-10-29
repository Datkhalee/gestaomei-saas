import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Sucesso() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const ativarConta = async () => {
    if (!email) {
      setMessage('❌ Digite seu email');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('users_app')
        .update({
          status_assinatura: 'ativo',
          trial_expira_em: '2026-12-31T23:59:59.000Z',
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select();

      if (error || !data || data.length === 0) {
        setMessage('❌ Email não encontrado. Verifique se está correto.');
        setLoading(false);
        return;
      }

      setMessage('✅ Conta ativada! Redirecionando...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setMessage('❌ Erro. Tente novamente.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="ri-check-line text-4xl text-green-600"></i>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🎉 Pagamento Aprovado!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Obrigado por confiar no FinanceMEI!<br/>
          Digite seu email para ativar sua conta:
        </p>

        <div className="mb-4">
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={ativarConta}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Ativando...
            </div>
          ) : (
            '🚀 Ativar Minha Conta'
          )}
        </button>

      </div>
    </div>
  );
}
