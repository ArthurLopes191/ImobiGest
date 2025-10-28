'use client';

import { useState, useEffect } from 'react';

interface Cargo {
  id: string;
  nome: string;
}

interface ConfigComissao {
  id: string;
  percentual: number;
  cargo?: Cargo; 
  idCargo?: string; 
}

interface ConfigComissaoData {
  idImobiliaria: string;
  idCargo: string;
  percentual: number;
}

interface ConfigComissaoModalProps {
  showModal: boolean;
  onClose: () => void;
  imobiliaria: {
    id: string;
    nome: string;
  } | null;
  cargos: Cargo[];
}

export default function ConfigComissaoModal({ showModal, onClose, imobiliaria, cargos }: ConfigComissaoModalProps) {
  const [configComissoes, setConfigComissoes] = useState<ConfigComissao[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfigComissao | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<ConfigComissaoData>({
    idImobiliaria: '',
    idCargo: '',
    percentual: 0
  });

  const getCookieValue = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const getCargoNome = (config: ConfigComissao): string => {
    if (config.cargo?.nome) {
      return config.cargo.nome;
    }
    
    if (config.idCargo) {
      const cargo = cargos.find(c => c.id === config.idCargo);
      return cargo?.nome || 'Cargo não encontrado';
    }
    
    return 'Cargo não informado';
  };

  const fetchConfigComissoes = async () => {
    if (!imobiliaria) return;
    
    setIsLoadingConfigs(true);
    try {
      const token = getCookieValue('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/config-comissao/imobiliaria/${imobiliaria.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar configurações de comissão');
      }

      const data = await response.json();
      
      setConfigComissoes(data);
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
      setError('Erro ao carregar configurações de comissão');
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  useEffect(() => {
    if (showModal && imobiliaria) {
      fetchConfigComissoes();
      setFormData({
        idImobiliaria: imobiliaria.id,
        idCargo: '',
        percentual: 0
      });
    }
  }, [showModal, imobiliaria]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'percentual' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingConfig) {
      // Atualizar configuração existente
      setIsUpdating(true);
    } else {
      // Criar nova configuração
      setIsCreating(true);
    }
    
    setError('');
    setSuccess('');

    try {
      const token = getCookieValue('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const url = editingConfig 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/config-comissao/${editingConfig.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/config-comissao`;
      
      const method = editingConfig ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idImobiliaria: parseInt(formData.idImobiliaria),
          idCargo: parseInt(formData.idCargo),
          percentual: formData.percentual
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao ${editingConfig ? 'atualizar' : 'criar'} configuração de comissão`);
      }

      setSuccess(`Configuração de comissão ${editingConfig ? 'atualizada' : 'criada'} com sucesso!`);
      setFormData({
        idImobiliaria: imobiliaria?.id || '',
        idCargo: '',
        percentual: 0
      });
      setShowAddForm(false);
      setEditingConfig(null);
      
      fetchConfigComissoes();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsCreating(false);
      setIsUpdating(false);
    }
  };

  const handleEdit = (config: ConfigComissao) => {
    setEditingConfig(config);
    setFormData({
      idImobiliaria: imobiliaria?.id || '',
      idCargo: config.idCargo || '',
      percentual: config.percentual
    });
    setShowAddForm(true);
  };

  const handleDelete = async (configId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração de comissão?')) {
      return;
    }

    setIsDeleting(configId);
    setError('');
    setSuccess('');

    try {
      const token = getCookieValue('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/config-comissao/${configId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir configuração de comissão');
      }

      setSuccess('Configuração de comissão excluída com sucesso!');
      fetchConfigComissoes();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingConfig(null);
    setShowAddForm(false);
    setFormData({
      idImobiliaria: imobiliaria?.id || '',
      idCargo: '',
      percentual: 0
    });
  };

  const handleClose = () => {
    setShowAddForm(false);
    setEditingConfig(null);
    setError('');
    setSuccess('');
    setConfigComissoes([]);
    onClose();
  };

  if (!showModal || !imobiliaria) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(200,200,200,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Configurações de Comissão - {imobiliaria.nome}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl focus:outline-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Botão para adicionar nova configuração */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Configurações Atuais</h3>
            <button
              onClick={() => {
                if (showAddForm && editingConfig) {
                  handleCancelEdit();
                } else {
                  setShowAddForm(!showAddForm);
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {showAddForm ? 'Cancelar' : 'Nova Configuração'}
            </button>
          </div>

          {/* Formulário de adicionar/editar */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">
                {editingConfig ? 'Editar Configuração' : 'Nova Configuração'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="idCargo" className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo
                  </label>
                  <select
                    id="idCargo"
                    name="idCargo"
                    value={formData.idCargo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um cargo</option>
                    {cargos.map((cargo) => (
                      <option key={cargo.id} value={cargo.id}>
                        {cargo.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="percentual" className="block text-sm font-medium text-gray-700 mb-2">
                    Percentual (%)
                  </label>
                  <input
                    type="number"
                    id="percentual"
                    name="percentual"
                    value={formData.percentual || ''}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 5.5"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={(isCreating || isUpdating) || !formData.idCargo || formData.percentual <= 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating || isUpdating ? 
                    (editingConfig ? 'Atualizando...' : 'Criando...') : 
                    (editingConfig ? 'Atualizar Configuração' : 'Criar Configuração')
                  }
                </button>
              </div>
            </form>
          )}

          {/* Mensagens de erro e sucesso */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Lista de configurações */}
          {isLoadingConfigs ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Carregando configurações...</p>
            </div>
          ) : configComissoes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <p>Nenhuma configuração de comissão encontrada</p>
              <p className="text-sm mt-1">Clique em "Nova Configuração" para criar a primeira</p>
            </div>
          ) : (
            <div className="space-y-3">
              {configComissoes.map((config) => (
                <div key={config.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">{getCargoNome(config)}</h4>
                      <p className="text-sm text-gray-600">Percentual de comissão</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-blue-600">{config.percentual}%</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(config)}
                          disabled={showAddForm}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Editar configuração"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(config.id)}
                          disabled={isDeleting === config.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Excluir configuração"
                        >
                          {isDeleting === config.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}