'use client';

import { useState, useEffect } from 'react';
import CargoModal from '@/app/components/configuracoes/cargoModal/CargoModal';

interface Cargo {
  id: string;
  nome: string;
}

interface CargoSectionProps {
  onCargoClick?: (cargo: Cargo) => void;
  onCargoUpdate?: () => void; 
}

export default function CargoSection({ onCargoClick, onCargoUpdate }: CargoSectionProps) {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [isLoadingCargos, setIsLoadingCargos] = useState(true);
  const [showCargoModal, setShowCargoModal] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const getCookieValue = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
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
    fetchCargos();
  }, []);

  const handleCargoModalSuccess = () => {
    fetchCargos();
    if (onCargoUpdate) {
      onCargoUpdate();
    }
  };

  const handleNewCargo = () => {
    setSelectedCargo(null);
    setModalMode('create');
    setShowCargoModal(true);
  };

  const handleEditCargo = (cargo: Cargo) => {
    setSelectedCargo(cargo);
    setModalMode('edit');
    setShowCargoModal(true);
  };

  const handleCargoClick = (cargo: Cargo) => {
    if (onCargoClick) {
      onCargoClick(cargo);
    } else {
      handleEditCargo(cargo);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Configurações dos Cargos
          </h1>
          <button
            onClick={handleNewCargo}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors whitespace-nowrap text-sm sm:text-base w-full sm:w-auto cursor-pointer"
          >
            Novo Cargo
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Cargos Cadastrados:
            {!onCargoClick && (
              <span className="text-sm text-gray-500 font-normal ml-2">
                (Clique em um cargo para editar)
              </span>
            )}
          </h2>

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
                <div
                  key={cargo.id}
                  onClick={() => handleCargoClick(cargo)}
                  className={`border border-gray-200 rounded-lg p-4 transition-all ${onCargoClick
                      ? 'cursor-pointer hover:shadow-md hover:border-green-300'
                      : 'cursor-pointer hover:shadow-md hover:border-green-300'
                    }`}
                >
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800">{cargo.nome}</h3>
                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {onCargoClick ? 'Selecionar' : 'Editar'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <CargoModal
        showModal={showCargoModal}
        onClose={() => {
          setShowCargoModal(false);
          setSelectedCargo(null);
        }}
        onSuccess={handleCargoModalSuccess}
        cargo={selectedCargo}
        mode={modalMode}
      />
    </>
  );
}