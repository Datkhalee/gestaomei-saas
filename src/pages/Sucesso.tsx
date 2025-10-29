import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Sucesso() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const confirmarPagamento = async () => {
    if (!email) return setMessage('Digite seu e-mail');

    setLoading(true);

    // 1️⃣ Verifica pagamento pendente aprovado
    const { data: pagamento, error } = await supabase
      .from('pagamentos_pendentes')
      .select('*')
      .eq('email', email)
      .eq('ativado', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !pagamento) {
      setMessage('❌ Pagamento não encontrado ou já ativado');
      setLoading(false);
      return;
    }

    // 2️⃣ Atualiza usuário para plano FULL
    const { error: userError } = await supabase
      .from('users_app')
      .update({ status_assinatura: 'ativo' })
      .eq('email', email);

    if (userError) {
      setMessage('❌ Erro ao liberar o plano');
      setLoading(false);
      return;
    }

    // 3️⃣ Marca pagamento como ativado
    await supabase
      .from('pagamentos_pendentes')
      .update({ ativado: true, ativado_em: new Date().toISOString() })
      .eq('email', email);

    setMessage('✅ Pagamento confirmado! Redirecionando...');
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
      <div className="bg-white rounded-xl p-8 shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">🎉 Confirme seu e-mail</h1>
        <p className="text-gray-600 mb-4">
          Digite o e-mail que você usou na compra para liberar seu plano FULL.
        </p>
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        />
        <button
          onClick={confirmarPagamento}
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
        >
          {loading ? 'Verificando...' : 'Confirmar e liberar plano'}
        </button>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </div>
  );
}
