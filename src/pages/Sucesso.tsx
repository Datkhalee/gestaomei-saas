import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Sucesso() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    verificarToken();
  }, []);

  const verificarToken = async () => {
    const token = searchParams.get('token');
    
    if (!token) {
      setMessage('❌ Acesso negado. Token não encontrado.');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    try {
      // VERIFICAR TOKEN NO BANCO
      const { data, error } = await supabase
        .from('pagamentos_pendentes')
        .select('*')
        .eq('token', token)
        .eq('ativado', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        setMessage('❌ Token inválido ou expirado.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      setTokenValid(true);
      setEmail(data.email); // Pré-preencher email
      setMessage('🔒 Token válido. Ative sua conta abaixo:');

    } catch (error) {
      setMessage('❌ Erro de segurança.');
      setTimeout(() => navigate('/'), 3000);
    }
  };

  const ativarConta = async () => {
    if (!tokenValid) {
      setMessage('❌ Token inválido.');
      return;
    }

    const token = searchParams.get('token');
    setLoading(true);

    try {
      // VERIFICAR NOVAMENTE E ATIVAR
      const { data: pagamento, error: pagamentoError } = await supabase
        .from('pagamentos_pendentes')
        .select('*')
        .eq('token', token)
        .eq('email', email)
        .eq('ativado', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (pagamentoError || !pagamento) {
        setMessage('❌ Token expirado ou já utilizado.');
        setLoading(false);
        return;
      }

      // ATIVAR CONTA DO USUÁRIO
      const { data: user, error: userError } = await supabase
        .from('users_app')
        .update({
          status_assinatura: 'ativo',
          trial_expira_em: '2026-12-31T23:59:59.000Z',
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select();

      if (userError || !user || user.length === 0) {
        setMessage('❌ Usuário não encontrado.');
        setLoading(false);
        return;
      }

      // MARCAR TOKEN COMO USADO
      await supabase
        .from('pagamentos_pendentes')
        .update({
          ativado: true,
          ativado_em: new Date().toISOString()
        })
        .eq('token', token);

      setMessage('✅ Conta ativada com sucesso! Redirecionando...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setMessage('❌ Erro de segurança.');
    }

    setLoading(false);
  };

  if (!tokenValid && !message.includes('Token válido')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-shield-cross-line text-4xl text-red-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🔒 Acesso Restrito</h1>
          <p className="text-red-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="ri-shield-check-line text-4xl text-green-600"></i>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🎉 Pagamento Aprovado!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Seu pagamento foi confirmado com segurança.<br/>
          Clique para ativar sua conta:
        </p>

        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
            disabled={true} // Email fixo por segurança
          />
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('✅') ? 'bg-green-100 text-green-700' :
            message.includes('🔒') ? 'bg-blue-100 text-blue-700' :
            'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={ativarConta}
          disabled={loading || !tokenValid}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Ativando com Segurança...
            </div>
          ) : (
            '🔒 Ativar Conta Segura'
          )}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          🛡️ Protegido por múltiplas camadas de segurança
        </p>

      </div>
    </div>
  );
}
