'use client';

import { useState, useEffect } from 'react';

interface ImobiliariaData {
  nome: string;
  meta: number;
}

interface Imobiliaria {
  id: string;
  nome: string;
  meta: number;
  createdAt: string;
}

interface ImobiliariaModalProps {
  showModal: boolean;
  onClose: () => void;
  onSuccess: () => void;
  imobiliaria?: Imobiliaria | null;
  mode: 'create' | 'edit';
}

export default function ImobiliariaModal({ showModal, onClose, onSuccess, imobiliaria, mode }: ImobiliariaModalProps) {
  const [formData, setFormData] = useState<ImobiliariaData>({
    nome: '',
    meta: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Preenche o formulário quando está editando
  useEffect(() => {
    if (mode === 'edit' && imobiliaria) {
      setFormData({ 
        nome: imobiliaria.nome,
        meta: imobiliaria.meta 
      });
    } else {
      setFormData({ nome: '', meta: 0 });
    }
  }, [mode, imobiliaria, showModal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'meta' ? parseFloat(value) || 0 : value
    }));
  };

  const getCookieValue = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const resetForm = () => {
    setFormData({ nome: '', meta: 0 });
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getCookieValue('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const url = mode === 'create' 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/imobiliaria`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/imobiliaria/${imobiliaria?.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: formData.nome,
          meta: formData.meta
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} imobiliária`);
      }

      const successMessage = mode === 'create' ? 'Imobiliária criada com sucesso!' : 'Imobiliária atualizada com sucesso!';
      setSuccess(successMessage);
      resetForm();
      
      // Chama a função de sucesso do componente pai
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!imobiliaria?.id) return;

    const confirmDelete = window.confirm('Tem certeza que deseja deletar esta imobiliária?');
    if (!confirmDelete) return;

    setIsDeleting(true);
    setError('');
    setSuccess('');

    try {
      const token = getCookieValue('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/imobiliaria/${imobiliaria.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar imobiliária');
      }

      setSuccess('Imobiliária deletada com sucesso!');
      
      // Chama a função de sucesso do componente pai
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!showModal) return null;

  const modalTitle = mode === 'create' ? 'Nova Imobiliária' : 'Editar Imobiliária';
  const submitButtonText = mode === 'create' ? 'Criar Imobiliária' : 'Atualizar Imobiliária';
  const loadingText = mode === 'create' ? 'Criando...' : 'Atualizando...';

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">{modalTitle}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl focus:outline-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Imobiliária
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o nome da imobiliária"
              />
            </div>

            <div>
              <label htmlFor="meta" className="block text-sm font-medium text-gray-700 mb-2">
                Meta Mensal
              </label>
              <input
                type="number"
                id="meta"
                name="meta"
                value={formData.meta || ''}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite a meta da imobiliaria (ex: 160000)"
              />
              {formData.meta > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Valor: {formatCurrency(formData.meta)}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            {/* Botão de deletar (apenas no modo edição) */}
            {mode === 'edit' && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? 'Deletando...' : 'Deletar'}
              </button>
            )}

            {/* Botões de ação principal */}
            <div className={`flex space-x-3 ${mode === 'create' ? 'w-full justify-end' : ''}`}>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || isDeleting || !formData.nome.trim() || formData.meta <= 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? loadingText : submitButtonText}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}