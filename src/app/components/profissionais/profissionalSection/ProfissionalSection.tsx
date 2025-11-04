'use client';

import { useState, useEffect } from 'react';
import ProfissionalModal from '@/app/components/profissionais/profissionalModal/ProfissionalModal';
import { Profissional, ImobiliariaModal } from '@/types/profissional';

interface ProfissionalSectionProps {
    onProfissionalClick?: (profissional: Profissional) => void;
}

export default function ProfissionalSection({ onProfissionalClick }: ProfissionalSectionProps) {
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);
    const [isLoadingProfissionais, setIsLoadingProfissionais] = useState(true);
    const [showProfissionalModal, setShowProfissionalModal] = useState(false);
    const [selectedProfissional, setSelectedProfissional] = useState<Profissional | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

    const getCookieValue = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    };

    const loadAllData = async () => {
        setIsLoadingProfissionais(true);
        
        try {
            const token = getCookieValue('token');
            if (!token) {
                console.error('Token não encontrado');
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/profissional/completo`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const profissionaisData = await response.json();
                console.log('✅ Profissionais completos carregados:', profissionaisData);
                setProfissionais(profissionaisData);
            } else {
                console.error('Erro ao carregar profissionais:', response.status);
            }

        } catch (err) {
            console.error('❌ Erro ao carregar dados:', err);
        } finally {
            setIsLoadingProfissionais(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleProfissionalModalSuccess = () => {
        console.log('🔄 Recarregando após sucesso no modal...');
        loadAllData();
    };

    const handleNewProfissional = () => {
        setSelectedProfissional(null);
        setModalMode('create');
        setShowProfissionalModal(true);
    };

    const handleEditProfissional = (profissional: Profissional) => {
        setSelectedProfissional(profissional);
        setModalMode('edit');
        setShowProfissionalModal(true);
    };

    const handleProfissionalClick = (profissional: Profissional) => {
        if (onProfissionalClick) {
            onProfissionalClick(profissional);
        } else {
            handleEditProfissional(profissional);
        }
    };

    // Converter imobiliárias para o formato que o modal espera
    const getImobiliariasParaModal = (): ImobiliariaModal[] => {
        const imobiliariasUnicas = Array.from(
            new Map(profissionais.map(p => [p.idImobiliaria, p.imobiliaria])).entries()
        );
        
        return imobiliariasUnicas.map(([id, imobiliaria]) => ({
            id: id.toString(),
            nome: imobiliaria.nome,
            meta: 0
        }));
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
                        Profissionais Cadastrados
                    </h1>
                    <button
                        onClick={handleNewProfissional}
                        className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap text-sm sm:text-base w-full sm:w-auto"
                    >
                        Novo Profissional
                    </button>
                </div>

                <div className="mt-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Lista de Profissionais:
                        {!onProfissionalClick && (
                            <span className="text-sm text-gray-500 font-normal ml-2">
                                (Use o botão "Editar" para modificar ou deletar)
                            </span>
                        )}
                    </h2>

                    {isLoadingProfissionais ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-500">Carregando profissionais...</p>
                        </div>
                    ) : profissionais.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                            <p>Nenhum profissional cadastrado</p>
                            <p className="text-sm mt-1">Clique em "Novo Profissional" para criar o primeiro</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {profissionais.map((profissional) => (
                                <div
                                    key={profissional.id}
                                    className="border border-gray-200 rounded-lg p-3 sm:p-4 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-gray-800 truncate text-sm sm:text-base">
                                            {profissional.nome}
                                        </h3>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                        <div>
                                            <span className="text-xs sm:text-sm text-gray-500">Imobiliária:</span>
                                            <p className="font-medium text-blue-600 text-sm sm:text-base">
                                                {profissional.imobiliaria?.nome || 'Imobiliária não encontrada'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs sm:text-sm text-gray-500">Cargos:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {profissional.cargos && profissional.cargos.length > 0 ? (
                                                    profissional.cargos.map((cargo) => (
                                                        <span
                                                            key={cargo.id}
                                                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                                        >
                                                            {cargo.nome}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                        Nenhum cargo atribuído
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 justify-end">
                                        {onProfissionalClick && (
                                            <button
                                                onClick={() => handleProfissionalClick(profissional)}
                                                className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors cursor-pointer w-full sm:w-auto"
                                            >
                                                Selecionar
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEditProfissional(profissional)}
                                            className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded hover:bg-green-100 transition-colors cursor-pointer w-full sm:w-auto"
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

            <ProfissionalModal
                showModal={showProfissionalModal}
                onClose={() => {
                    setShowProfissionalModal(false);
                    setSelectedProfissional(null);
                }}
                onSuccess={handleProfissionalModalSuccess}
                profissional={selectedProfissional}
                mode={modalMode}
                imobiliarias={getImobiliariasParaModal()}
            />
        </>
    );
}