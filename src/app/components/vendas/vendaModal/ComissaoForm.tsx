'use client';

import React, { useState } from 'react';
import { ComissaoData, ProfissionalComissao, CargoComissao, VendaModalMode } from '@/types/venda';

interface ComissaoFormProps {
    comissaoData: ComissaoData;
    profissionais: ProfissionalComissao[];
    isLoadingProfissionais: boolean;
    mode: VendaModalMode;
    onProfissionalAdd: (profissionalId: number) => void;
    onProfissionalRemove: (profissionalId: number) => void;
    idImobiliaria: number;
}

export default function ComissaoForm({
    comissaoData,
    profissionais,
    isLoadingProfissionais,
    mode,
    onProfissionalAdd,
    onProfissionalRemove,
    idImobiliaria
}: ComissaoFormProps) {
    const [selectedProfissionalId, setSelectedProfissionalId] = useState<number | ''>('');
    
    const isDisabled = isLoadingProfissionais || !idImobiliaria;

    const handleAddProfissional = () => {
        if (selectedProfissionalId && typeof selectedProfissionalId === 'number') {
            onProfissionalAdd(selectedProfissionalId);
            setSelectedProfissionalId('');
        }
    };

    const getProfissionalNome = (id: number): string => {
        const prof = profissionais.find(p => p.id === id);
        return prof?.nome || 'Profissional não encontrado';
    };

    const getProfissionalCargos = (id: number): CargoComissao[] => {
        const prof = profissionais.find(p => p.id === id);
        return prof?.cargos || [];
    };

    const profissionaisDisponiveis = profissionais.filter(prof => 
        !comissaoData.profissionais.some(selected => selected.idProfissional === prof.id)
    );

    return (
        <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Comissões</h3>
            <div className="space-y-6">
                {/* Adicionar novo profissional */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-700 mb-3">Adicionar Profissional</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select
                            value={selectedProfissionalId}
                            onChange={(e) => setSelectedProfissionalId(e.target.value ? parseInt(e.target.value) : '')}
                            disabled={isDisabled}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        >
                            <option value="">
                                {isLoadingProfissionais 
                                    ? 'Carregando...' 
                                    : !idImobiliaria 
                                        ? 'Selecione primeiro uma imobiliária'
                                        : profissionaisDisponiveis.length === 0
                                            ? 'Todos os profissionais já foram adicionados'
                                            : 'Selecione um profissional'
                                }
                            </option>
                            {!isDisabled && profissionaisDisponiveis.map((profissional) => (
                                <option key={profissional.id} value={profissional.id}>
                                    {profissional.nome}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleAddProfissional}
                            disabled={!selectedProfissionalId || isDisabled}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            Adicionar
                        </button>
                    </div>
                    {!idImobiliaria && (
                        <p className="text-sm text-gray-500 mt-2">
                            Selecione uma imobiliária primeiro para ver os profissionais disponíveis
                        </p>
                    )}
                </div>

                {/* Lista de profissionais selecionados */}
                <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                        Profissionais Selecionados ({comissaoData.profissionais.length})
                    </h4>
                    {comissaoData.profissionais.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <p>Nenhum profissional selecionado</p>
                            <p className="text-sm mt-1">Adicione profissionais para gerar as comissões</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {comissaoData.profissionais.map((profissionalComissao) => (
                                <div key={profissionalComissao.idProfissional} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                                <h5 className="font-medium text-gray-800 truncate">
                                                    {getProfissionalNome(profissionalComissao.idProfissional)}
                                                </h5>
                                                <button
                                                    type="button"
                                                    onClick={() => onProfissionalRemove(profissionalComissao.idProfissional)}
                                                    className="self-start sm:self-auto text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded"
                                                >
                                                    Remover
                                                </button>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm text-gray-600 mb-2">Cargos (selecionados automaticamente):</p>
                                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                                    {getProfissionalCargos(profissionalComissao.idProfissional).map((cargo) => (
                                                        <span
                                                            key={cargo.id}
                                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                                        >
                                                            {cargo.nome}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {mode === 'create' && comissaoData.profissionais.length === 0 && (
                        <p className="text-sm text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                            ⚠️ Pelo menos um profissional deve ser selecionado para criar a venda
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}