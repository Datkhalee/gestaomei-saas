import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface NovaReceitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  descricao: string;
  valor: string;
  data: string;
  categoria: string;
  data_recebimento: string;
}

const NovaReceitaModal: React.FC<NovaReceitaModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: 'Venda Produtos',
    data_recebimento: new Date().toISOString().split('T')[0] // ✅ Default = hoje
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    if (!formData.descricao.trim()) {
      setError('Descrição é obrigatória');
      return;
    }

    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      setError('Valor deve ser maior que zero');
      return;
    }

    setLoading(true);

    try {
      const insertData = {
        user_id: user.id,
        descricao: formData.descricao.trim(),
        valor: parseFloat(formData.valor),
        data: formData.data,
        categoria: formData.categoria,
        recebido: true, // ✅ SEMPRE TRUE - já recebeu
        data_recebimento: formData.data_recebimento
      };

      const { error: insertError } = await supabase
        .from('receitas')
        .insert([insertData]);

      if (insertError) {
        console.error('❌ Erro ao inserir receita:', insertError);
        throw insertError;
      }

      // Reset form
      setFormData({
        descricao: '',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        categoria: 'Venda Produtos',
        data_recebimento: new Date().toISOString().split('T')[0]
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Erro ao salvar receita:', error);
      setError(error.message || 'Erro ao salvar receita. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">💵 Recebi Dinheiro</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* ✅ INFO BOX */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>📌 Use este formulário apenas para dinheiro que JÁ entrou no seu caixa.</strong>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <input
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: Corte + Escova - Cliente Ana"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$) *
            </label>
            <input
              type="number"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              required
              disabled={loading}
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data do Serviço *
            </label>
            <input
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data que Recebi *
            </label>
            <input
              type="date"
              name="data_recebimento"
              value={formData.data_recebimento}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria *
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Venda Produtos">Venda Produtos</option>
              <option value="Prestação Serviços">Prestação Serviços</option>
              <option value="Outras">Outras</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovaReceitaModal;
