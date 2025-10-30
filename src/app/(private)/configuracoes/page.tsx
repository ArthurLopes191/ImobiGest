'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImobiliariaSection from '@/app/components/configuracoes/imobiliariaSection/ImobiliariaSection';
import CargoSection from '@/app/components/configuracoes/cargoSection/CargoSection';
import ConfigComissaoModal from '@/app/components/configuracoes/configComissaoModal/ConfigComissaoModal';

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
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [showConfigComissaoModal, setShowConfigComissaoModal] = useState(false);
  const [selectedImobiliaria, setSelectedImobiliaria] = useState<{id: string, nome: string} | null>(null);
  const router = useRouter();

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
    }
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  // Função para atualizar cargos quando um novo é criado/editado/deletado
  const handleCargoUpdate = () => {
    fetchCargos();
  };

  const handleImobiliariaClick = (imobiliaria: Imobiliaria) => {
    // Atualiza os cargos antes de abrir o modal
    fetchCargos();
    
    setSelectedImobiliaria({
      id: imobiliaria.id,
      nome: imobiliaria.nome
    });
    setShowConfigComissaoModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Seção de Imobiliárias */}
      <ImobiliariaSection onImobiliariaClick={handleImobiliariaClick} />

      {/* Seção de Cargos - Passa callback para atualizar cargos */}
      <CargoSection onCargoUpdate={handleCargoUpdate} />

      {/* Modal de Configuração de Comissão */}
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