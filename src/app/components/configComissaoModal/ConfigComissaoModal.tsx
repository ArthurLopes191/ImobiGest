'use client';

import { useState, useEffect } from 'react';

interface Cargo {
  id: string;
  nome: string;
}

interface ConfigComissao {
  id: string;
  percentual: number;
  cargo?: Cargo; // Tornando opcional para evitar erros
  idCargo?: string; // Caso a API retorne apenas o ID
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

  // Função para encontrar o nome do cargo pelo ID
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/config-comissao?idImobiliaria=${imobiliaria.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar configurações de comissão');
      }

      const data = await response.json();
      
      // Log para debug - vamos ver o que a API está retornando
      console.log('Dados da API config-comissao:', data);
      
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
    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      const token = getCookieValue('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/config-comissao`, {
        method: 'POST',
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
        throw new Error(errorData.message || 'Erro ao criar configuração de comissão');
      }

      setSuccess('Configuração de comissão criada com sucesso!');
      setFormData({
        idImobiliaria: imobiliaria?.id || '',
        idCargo: '',
        percentual: 0
      });
      setShowAddForm(false);
      
      // Recarregar as configurações
      fetchConfigComissoes();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setShowAddForm(false);
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
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {showAddForm ? 'Cancelar' : 'Nova Configuração'}
            </button>
          </div>

          {/* Formulário de adicionar */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
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

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={isCreating || !formData.idCargo || formData.percentual <= 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Criando...' : 'Criar Configuração'}
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
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-600">{config.percentual}%</span>
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