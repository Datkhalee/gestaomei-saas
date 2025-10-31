import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Despesa } from '../../lib/supabase';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import TrialBanner from '../../components/layout/TrialBanner';

export default function Despesas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    dataInicio: startOfMonth(new Date()).toISOString().split('T')[0],
    dataFim: endOfMonth(new Date()).toISOString().split('T')[0],
    categoria: 'todas',
  });

  useEffect(() => {
    if (user) {
      loadDespesas();
    }
  }, [user]);

  const loadDespesas = async () => {
    if (!user) return;

    // ✅ FILTRAR APENAS DESPESAS PAGAS
    const { data, error } = await supabase
      .from('despesas')
      .select('*')
      .eq('user_id', user.id)
      .eq('pago', true) // 👈 NOVA LINHA
      .order('data', { ascending: false });

    if (!error && data) {
      setDespesas(data);
    }
    setLoading(false);
  };

  const despesasFiltradas = despesas.filter(d => {
    const data = new Date(d.data);
    const inicio = new Date(filtros.dataInicio);
    const fim = new Date(filtros.dataFim);

    const dentroData = isWithinInterval(data, { start: inicio, end: fim });
    const categoriaMatch = filtros.categoria === 'todas' || d.categoria === filtros.categoria;

    return dentroData && categoriaMatch;
  });

  const totalDespesas = despesasFiltradas.reduce((sum, d) => sum + Number(d.valor), 0);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;

    const { error } = await supabase.from('despesas').delete().eq('id', id);
    if (!error) {
      loadDespesas();
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-screen">
          <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <TrialBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl lg:text-3xl font-bold text-gray-900">💸 Dinheiro que Saiu</h1>
        <button
          onClick={() => navigate('/nova-despesa')}
          className="px-4 lg:px-6 py-2 lg:py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
        >
          <i className="ri-add-line text-lg lg:text-xl"></i>
          <span className="hidden sm:inline">Paguei Conta</span>
          <span className="sm:hidden">Paguei</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-xs lg:text-sm font-medium text-gray-600 mb-2">Total Pago</h3>
          <p className="text-lg lg:text-2xl font-bold text-red-600">
            R$ {totalDespesas.toFixed(2).replace('.', ',')}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h3 className="text-xs lg:text-sm font-medium text-gray-600 mb-2">Total de Registros</h3>
          <p className="text-lg lg:text-2xl font-bold text-blue-600">
            {despesasFiltradas.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Data Início</label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs lg:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Data Fim</label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs lg:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
              className="w-full px-3 lg:px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-xs lg:text-sm"
            >
              <option value="todas">Todas</option>
              <option value="Matéria Prima">Matéria Prima</option>
              <option value="Produtos/Estoque">Produtos/Estoque</option>
              <option value="Equipamentos">Equipamentos</option>
              <option value="Marketing">Marketing</option>
              <option value="Transporte">Transporte</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Combustível">Combustível</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Contas Fixas">Contas Fixas</option>
              <option value="Impostos">Impostos</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Data</th>
                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase min-w-32">Descrição</th>
                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Categoria</th>
                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Pago em</th>
                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {despesasFiltradas.length > 0 ? (
                despesasFiltradas.map((despesa) => (
                  <tr key={despesa.id} className="hover:bg-gray-50">
                    <td className="px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-900 whitespace-nowrap">
                      {format(new Date(despesa.data), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-900">
                      <div className="max-w-32 lg:max-w-none truncate">{despesa.descricao}</div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-600 whitespace-nowrap">{despesa.categoria}</td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-semibold text-red-600 whitespace-nowrap">
                      R$ {Number(despesa.valor).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-600 whitespace-nowrap">
                      {despesa.data_pagamento ? format(new Date(despesa.data_pagamento), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <div className="flex items-center gap-1 lg:gap-2">
                        <button
                          onClick={() => handleDelete(despesa.id)}
                          className="p-1.5 lg:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <i className="ri-delete-bin-line text-sm lg:text-lg w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="text-xs lg:text-sm">Nenhuma despesa encontrada</div>
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
