'use client';

import { useState, useEffect } from 'react';
import { Profissional, ProfissionalData, ProfissionalCargo, Cargo, ImobiliariaModal } from '@/types/profissional';

interface ProfissionalModalProps {
  showModal: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profissional?: Profissional | null;
  mode: 'create' | 'edit';
  imobiliarias: ImobiliariaModal[];
}

export default function ProfissionalModal({
  showModal,
  onClose,
  onSuccess,
  profissional,
  mode,
  imobiliarias
}: ProfissionalModalProps) {
  const [formData, setFormData] = useState<ProfissionalData>({
    nome: '',
    idImobiliaria: 0
  });
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [profissionalCargos, setProfissionalCargos] = useState<ProfissionalCargo[]>([]);
  const [selectedCargoId, setSelectedCargoId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingCargos, setIsLoadingCargos] = useState(false);
  const [isAddingCargo, setIsAddingCargo] = useState(false);
  const [isRemovingCargo, setIsRemovingCargo] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCargoSection, setShowCargoSection] = useState(false);

  const getCookieValue = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const fetchCargos = async () => {
    try {
      const token = getCookieValue('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cargo`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCargos(data);
      }
    } catch (err) {
      console.error('Erro ao buscar cargos:', err);
    }
  };

  const fetchProfissionalCargos = async () => {
    if (!profissional?.id || mode === 'create') return;
    
    setIsLoadingCargos(true);
    try {
      const token = getCookieValue('token');
      if (!token) return;

      // ✅ CORRIGIDO: Buscar as relações profissional-cargo com IDs corretos
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/profissional-cargo/profissional/${profissional.id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const relacoesProfissionalCargo = await response.json();
        
        // ✅ Agora usando o ID real da relação profissional-cargo
        const cargosFormatados = relacoesProfissionalCargo.map((relacao: any) => ({
          id: relacao.id.toString(), // <- ID da tabela profissional-cargo
          idProfissional: relacao.idProfissional,
          idCargo: relacao.idCargo,
          cargo: relacao.cargo // Se a API retorna o cargo populado
        }));
        setProfissionalCargos(cargosFormatados);
      }
    } catch (err) {
      console.error('Erro ao buscar cargos do profissional:', err);
    } finally {
      setIsLoadingCargos(false);
    }
  };

  useEffect(() => {
    if (mode === 'edit' && profissional) {
      setFormData({
        nome: profissional.nome,
        idImobiliaria: profissional.idImobiliaria
      });
      setShowCargoSection(true);
      fetchProfissionalCargos();
    } else {
      setFormData({ nome: '', idImobiliaria: 0 });
      setShowCargoSection(false);
      setProfissionalCargos([]);
    }
  }, [mode, profissional, showModal]);

  useEffect(() => {
    if (showModal) {
      fetchCargos();
    }
  }, [showModal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idImobiliaria' ? parseInt(value) || 0 : value
    }));
  };

  const resetForm = () => {
    setFormData({ nome: '', idImobiliaria: 0 });
    setProfissionalCargos([]);
    setSelectedCargoId('');
    setShowCargoSection(false);
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
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/profissional`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/profissional/${profissional?.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: formData.nome,
          idImobiliaria: formData.idImobiliaria
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} profissional`);
      }

      const successMessage = mode === 'create' ? 'Profissional criado com sucesso!' : 'Profissional atualizado com sucesso!';
      setSuccess(successMessage);

      if (mode === 'create') {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCargo = async () => {
    if (!selectedCargoId || !profissional?.id) return;

    const cargoJaAdicionado = profissionalCargos.some(pc => pc.idCargo === parseInt(selectedCargoId));
    if (cargoJaAdicionado) {
      setError('Este cargo já foi adicionado ao profissional');
      return;
    }

    setIsAddingCargo(true);
    setError('');
    setSuccess('');

    try {
      const token = getCookieValue('token');
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/profissional-cargo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idProfissional: profissional.id,
          idCargo: parseInt(selectedCargoId)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar cargo');
      }

      setSuccess('Cargo adicionado com sucesso!');
      setSelectedCargoId('');
      await fetchProfissionalCargos();
      
      // ✅ ADICIONADO: Chama onSuccess para atualizar a lista principal
      onSuccess();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsAddingCargo(false);
    }
  };

  const handleRemoveCargo = async (profissionalCargoId: string) => {
    const confirmRemove = window.confirm('Tem certeza que deseja remover este cargo do profissional?');
    if (!confirmRemove) return;

    setIsRemovingCargo(profissionalCargoId);
    setError('');
    setSuccess('');

    try {
      const token = getCookieValue('token');
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/profissional-cargo/${profissionalCargoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao remover cargo');
      }

      setSuccess('Cargo removido com sucesso!');
      await fetchProfissionalCargos();
      
      // ✅ ADICIONADO: Chama onSuccess para atualizar a lista principal
      onSuccess();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsRemovingCargo(null);
    }
  };

  const handleDelete = async () => {
    if (!profissional?.id) return;

    const confirmDelete = window.confirm('Tem certeza que deseja deletar este profissional? Todos os cargos associados também serão removidos.');
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/profissional/${profissional.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar profissional');
      }

      setSuccess('Profissional deletado com sucesso!');

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

  const getCargoNome = (profissionalCargo: ProfissionalCargo): string => {
    if (profissionalCargo.cargo?.nome) {
      return profissionalCargo.cargo.nome;
    }
    
    const cargo = cargos.find(c => c.id === profissionalCargo.idCargo);
    return cargo?.nome || `Cargo não encontrado (ID: ${profissionalCargo.idCargo})`;
  };

  const getCargosDisponiveis = () => {
    const cargosJaAdicionados = profissionalCargos.map(pc => pc.idCargo);
    return cargos.filter(cargo => !cargosJaAdicionados.includes(cargo.id));
  };

  if (!showModal) return null;

  const modalTitle = mode === 'create' ? 'Novo Profissional' : 'Editar Profissional';
  const submitButtonText = mode === 'create' ? 'Criar Profissional' : 'Atualizar Profissional';
  const loadingText = mode === 'create' ? 'Criando...' : 'Atualizando...';

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">{modalTitle}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl focus:outline-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Formulário do Profissional */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Profissional
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o nome do profissional"
                />
              </div>

              <div>
                <label htmlFor="idImobiliaria" className="block text-sm font-medium text-gray-700 mb-2">
                  Imobiliária
                </label>
                <select
                  id="idImobiliaria"
                  name="idImobiliaria"
                  value={formData.idImobiliaria || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma imobiliária</option>
                  {imobiliarias.map((imobiliaria) => (
                    <option key={imobiliaria.id} value={imobiliaria.id}>
                      {imobiliaria.nome}
                    </option>
                  ))}
                </select>
              </div>
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
                  {isDeleting ? 'Deletando...' : 'Deletar Profissional'}
                </button>
              )}

              {/* Botões de ação principal */}
              <div className={`flex space-x-3 ${mode === 'create' ? 'w-full justify-end' : ''}`}>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  {mode === 'edit' ? 'Fechar' : 'Cancelar'}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isDeleting || !formData.nome.trim() || !formData.idImobiliaria}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? loadingText : submitButtonText}
                </button>
              </div>
            </div>
          </form>

          {/* Seção de Cargos */}
          {showCargoSection && profissional && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cargos do Profissional</h3>

              {/* Adicionar Cargo */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">Adicionar Novo Cargo</h4>
                <div className="flex gap-3">
                  <select
                    value={selectedCargoId}
                    onChange={(e) => setSelectedCargoId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um cargo</option>
                    {getCargosDisponiveis().map((cargo) => (
                      <option key={cargo.id} value={cargo.id}>
                        {cargo.nome}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCargo}
                    disabled={!selectedCargoId || isAddingCargo}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAddingCargo ? 'Adicionando...' : 'Adicionar'}
                  </button>
                </div>
              </div>

              {/* Lista de Cargos */}
              {isLoadingCargos ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-500 text-sm">Carregando cargos...</p>
                </div>
              ) : profissionalCargos.length === 0 ? (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                  <p>Nenhum cargo atribuído</p>
                  <p className="text-sm mt-1">Selecione um cargo acima para adicionar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profissionalCargos.map((profissionalCargo) => (
                    <div key={profissionalCargo.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                      <span className="font-medium text-gray-800">
                        {getCargoNome(profissionalCargo)}
                      </span>
                      <button
                        onClick={() => handleRemoveCargo(profissionalCargo.id)}
                        disabled={isRemovingCargo === profissionalCargo.id}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        {isRemovingCargo === profissionalCargo.id ? 'Removendo...' : 'Remover'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mensagens de erro e sucesso */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-4">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}