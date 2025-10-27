'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImobiliariaModal from '@/app/components/imobiliariaModal/ImobiliariaModal';
import CargoModal from '@/app/components/cargoModal/CargoModal';
import ConfigComissaoModal from '@/app/components/configComissaoModal/ConfigComissaoModal';


interface Imobiliaria {
  id: string;
  nome: string;
  meta: number;
  createdAt: string;
}

interface Cargo {
  id: string;
  nome: string;
}

export default function Configuracoes() {
  const [imobiliarias, setImobiliarias] = useState<Imobiliaria[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [isLoadingImobiliarias, setIsLoadingImobiliarias] = useState(true);
  const [isLoadingCargos, setIsLoadingCargos] = useState(true);
  const [showImobiliariaModal, setShowImobiliariaModal] = useState(false);
  const [showCargoModal, setShowCargoModal] = useState(false);
  const [showConfigComissaoModal, setShowConfigComissaoModal] = useState(false);
  const [selectedImobiliaria, setSelectedImobiliaria] = useState<{id: string, nome: string} | null>(null);
  const router = useRouter();

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

  const fetchCargos = async () => {
    try {
      const token = getCookieValue('token');
      
      if (!token) {
        console.error('Token de autenticação não encontrado');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cargo`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar cargos');
      }

      const data = await response.json();
      setCargos(data);
    } catch (err) {
      console.error('Erro ao buscar cargos:', err);
    } finally {
      setIsLoadingCargos(false);
    }
  };

  useEffect(() => {
    fetchImobiliarias();
    fetchCargos();
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

  const handleCargoModalSuccess = () => {
    fetchCargos();
  };

  const handleImobiliariaClick = (imobiliaria: Imobiliaria) => {
    setSelectedImobiliaria({
      id: imobiliaria.id,
      nome: imobiliaria.nome
    });
    setShowConfigComissaoModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Seção de Imobiliárias */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Configurações das Imobiliárias
          </h1>
          <button
            onClick={() => setShowImobiliariaModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Nova Imobiliária
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Imobiliárias Cadastradas:
            <span className="text-sm text-gray-500 font-normal ml-2">
              (Clique em uma imobiliária para configurar comissões)
            </span>
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
                  onClick={() => handleImobiliariaClick(imobiliaria)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 truncate">{imobiliaria.nome}</h3>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Configurar
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Meta Mensal:</span>
                      <p className="font-medium text-green-600">{formatCurrency(imobiliaria.meta)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seção de Cargos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Configurações dos Cargos
          </h1>
          <button
            onClick={() => setShowCargoModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Novo Cargo
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Cargos Cadastrados:</h2>
          
          {isLoadingCargos ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-500">Carregando cargos...</p>
            </div>
          ) : cargos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <p>Nenhum cargo cadastrado</p>
              <p className="text-sm mt-1">Clique em "Novo Cargo" para criar o primeiro</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {cargos.map((cargo) => (
                <div key={cargo.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800">{cargo.nome}</h3>
                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Cargo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ImobiliariaModal
        showModal={showImobiliariaModal}
        onClose={() => setShowImobiliariaModal(false)}
        onSuccess={handleImobiliariaModalSuccess}
      />

      <CargoModal
        showModal={showCargoModal}
        onClose={() => setShowCargoModal(false)}
        onSuccess={handleCargoModalSuccess}
      />

      <ConfigComissaoModal
        showModal={showConfigComissaoModal}
        onClose={() => {
          setShowConfigComissaoModal(false);
          setSelectedImobiliaria(null);
        }}
        imobiliaria={selectedImobiliaria}
        cargos={cargos}
      />
    </div>
  );
}