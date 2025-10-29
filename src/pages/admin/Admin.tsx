import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface UserData {
  id: string;
  nome: string;
  email: string;
  status_assinatura: string;
  trial_inicio: string;
  trial_expira_em: string;
  created_at: string;
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'trial' | 'ativo' | 'expirado'>('todos');
  const [busca, setBusca] = useState('');

  // Verificar se é admin
  useEffect(() => {
    if (!user || user.email !== 'contato@viniciusclemente.com.br') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users_app')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const days = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const usersFiltrados = users.filter(u => {
    const matchFiltro = filtro === 'todos' || u.status_assinatura === filtro;
    const matchBusca = u.nome.toLowerCase().includes(busca.toLowerCase()) || 
                       u.email.toLowerCase().includes(busca.toLowerCase());
    return matchFiltro && matchBusca;
  });

  const stats = {
    total: users.length,
    trial: users.filter(u => u.status_assinatura === 'trial').length,
    ativo: users.filter(u => u.status_assinatura === 'ativo').length,
    expirado: users.filter(u => {
      const dias = getDaysRemaining(u.trial_expira_em);
      return u.status_assinatura === 'trial' && dias === 0;
    }).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Painel Admin</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          Voltar
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Usuários</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Em Trial</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.trial}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Ativos</h3>
          <p className="text-3xl font-bold text-green-600">{stats.ativo}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Expirados</h3>
          <p className="text-3xl font-bold text-red-600">{stats.expirado}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltro('todos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'todos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltro('trial')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'trial'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Trial
            </button>
            <button
              onClick={() => setFiltro('ativo')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === 'ativo'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ativos
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Dias Restantes</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usersFiltrados.length > 0 ? (
                usersFiltrados.map((user) => {
                  const dias = getDaysRemaining(user.trial_expira_em);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{user.nome}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          user.status_assinatura === 'ativo'
                            ? 'bg-green-100 text-green-700'
                            : user.status_assinatura === 'trial'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status_assinatura === 'ativo' ? 'Ativo' : 
                           user.status_assinatura === 'trial' ? 'Trial' : 'Expirado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.status_assinatura === 'ativo' ? (
                          <span className="text-green-600 font-medium">∞</span>
                        ) : (
                          <span className={dias > 0 ? 'text-gray-900' : 'text-red-600 font-medium'}>
                            {dias} dia{dias !== 1 ? 's' : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
</div>
    </div>
  );
}

// Updated
