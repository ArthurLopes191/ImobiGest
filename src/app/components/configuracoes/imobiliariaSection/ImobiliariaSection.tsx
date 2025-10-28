'use client';

import { useState, useEffect } from 'react';
import ImobiliariaModal from '@/app/components/configuracoes/imobiliariaModal/ImobiliariaModal';

interface Imobiliaria {
  id: string;
  nome: string;
  meta: number;
  createdAt: string;
}

interface ImobiliariaSectionProps {
  onImobiliariaClick?: (imobiliaria: Imobiliaria) => void;
}

export default function ImobiliariaSection({ onImobiliariaClick }: ImobiliariaSectionProps) {
  const [imobiliarias, setImobiliarias] = useState<Imobiliaria[]>([]);
  const [isLoadingImobiliarias, setIsLoadingImobiliarias] = useState(true);
  const [showImobiliariaModal, setShowImobiliariaModal] = useState(false);
  const [selectedImobiliaria, setSelectedImobiliaria] = useState<Imobiliaria | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const getCookieValue = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const fetchImobiliarias = async () => {
    try {
      const token = getCookieValue('token');
      
      if (!token) {
        console.error('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/imobiliaria`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar imobiliárias');
      }

      const data = await response.json();
      setImobiliarias(data);
    } catch (err) {
      console.error('Erro ao buscar imobiliárias:', err);
    } finally {
      setIsLoadingImobiliarias(false);
    }
  };

  useEffect(() => {
    fetchImobiliarias();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleImobiliariaModalSuccess = () => {
    fetchImobiliarias();
  };

  const handleNewImobiliaria = () => {
    setSelectedImobiliaria(null);
    setModalMode('create');
    setShowImobiliariaModal(true);
  };

  const handleEditImobiliaria = (imobiliaria: Imobiliaria) => {
    setSelectedImobiliaria(imobiliaria);
    setModalMode('edit');
    setShowImobiliariaModal(true);
  };

  const handleConfigureClick = (imobiliaria: Imobiliaria) => {
    if (onImobiliariaClick) {
      onImobiliariaClick(imobiliaria);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Configurações das Imobiliárias
          </h1>
          <button
            onClick={handleNewImobiliaria}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Nova Imobiliária
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Imobiliárias Cadastradas:
            {onImobiliariaClick && (
              <span className="text-sm text-gray-500 font-normal ml-2">
                (Use os botões para configurar comissões ou editar/deletar)
              </span>
            )}
            {!onImobiliariaClick && (
              <span className="text-sm text-gray-500 font-normal ml-2">
                (Use o botão "Editar" para modificar ou deletar)
              </span>
            )}
          </h2>
          
          {isLoadingImobiliarias ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Carregando imobiliárias...</p>
            </div>
          ) : imobiliarias.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <p>Nenhuma imobiliária cadastrada</p>
              <p className="text-sm mt-1">Clique em "Nova Imobiliária" para criar a primeira</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {imobiliarias.map((imobiliaria) => (
                <div 
                  key={imobiliaria.id} 
                  className="border border-gray-200 rounded-lg p-4 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 truncate">{imobiliaria.nome}</h3>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div>
                      <span className="text-sm text-gray-500">Meta Mensal:</span>
                      <p className="font-medium text-green-600">{formatCurrency(imobiliaria.meta)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    {onImobiliariaClick && (
                      <button
                        onClick={() => handleConfigureClick(imobiliaria)}
                        className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors"
                      >
                        Configurar
                      </button>
                    )}
                    <button
                      onClick={() => handleEditImobiliaria(imobiliaria)}
                      className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded hover:bg-green-100 transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ImobiliariaModal
        showModal={showImobiliariaModal}
        onClose={() => {
          setShowImobiliariaModal(false);
          setSelectedImobiliaria(null);
        }}
        onSuccess={handleImobiliariaModalSuccess}
        imobiliaria={selectedImobiliaria}
        mode={modalMode}
      />
    </>
  );
}