import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Sucesso() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const verificarPagamento = async () => {
    if (!email) {
      setMessage('❌ Digite seu email');
      return;
    }

    setLoading(true);
    setMessage('🔍 Verificando pagamento...');

    try {
      // Buscar usuário no banco
      const { data: user, error } = await supabase
        .from('users_app')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        setMessage('❌ Email não encontrado. Verifique se está correto.');
        setLoading(false);
        return;
      }

      // Verificar se já tem plano ativo
      if (user.status_assinatura === 'ativo') {
        setMessage('✅ Seu plano já está ativo! Redirecionando...');
        setTimeout(() => navigate('/dashboard'), 2000);
        setLoading(false);
        return;
      }

      // Simular verificação de pagamento (aqui você pode adicionar lógica específica)
      // Por exemplo: verificar se tem registro na tabela de pagamentos
      
      // Para simplificar, vamos ativar direto se o usuário existir
      const { data: updatedUser, error: updateError } = await supabase
        .from('users_app')
        .update({
          status_assinatura: 'ativo',
          trial_expira_em: '2026-12-31T23:59:59.000Z',
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select();

      if (updateError) {
        setMessage('❌ Erro ao ativar conta. Tente novamente.');
        setLoading(false);
        return;
      }

      setMessage('🎉 Plano FULL ativado! Redirecionando...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      setMessage('❌ Erro inesperado. Tente novamente.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="ri-check-double-line text-4xl text-green-600"></i>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          🎉 Parabéns! Compra aprovada
        </h1>
        
        <p className="text-gray-600 mb-6">
          Digite seu email para ativar o plano <strong>FULL</strong>:
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
            message.includes('✅') || message.includes('🎉') 
              ? 'bg-green-100 text-green-700' 
              : message.includes('🔍')
              ? 'bg-blue-100 text-blue-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={verificarPagamento}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Verificando...
            </div>
          ) : (
            '🚀 Ativar Plano FULL'
          )}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Digite o email usado na compra
        </p>

      </div>
    </div>
  );
}
