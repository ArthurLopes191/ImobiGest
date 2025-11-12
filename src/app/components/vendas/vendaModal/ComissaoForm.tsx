'use client';

import React from 'react';
import { ComissaoData, ProfissionalComissao, CargoComissao, VendaModalMode } from '@/types/venda';

interface ComissaoFormProps {
    comissaoData: ComissaoData;
    profissionais: ProfissionalComissao[];
    cargosDisponiveis: CargoComissao[];
    isLoadingProfissionais: boolean;
    mode: VendaModalMode;
    onComissaoChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    idImobiliaria: number;
}

export default function ComissaoForm({
    comissaoData,
    profissionais,
    cargosDisponiveis,
    isLoadingProfissionais,
    mode,
    onComissaoChange,
    idImobiliaria
}: ComissaoFormProps) {
    const isDisabled = isLoadingProfissionais || !idImobiliaria;
    return (
        <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Comissão</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="idProfissional" className="block text-sm font-medium text-gray-700 mb-2">
                        Profissional {!idImobiliaria && <span className="text-gray-400">(selecione uma imobiliária primeiro)</span>}
                    </label>
                    <select
                        id="idProfissional"
                        name="idProfissional"
                        value={comissaoData.idProfissional || ''}
                        onChange={onComissaoChange}
                        required={mode === 'create'}
                        disabled={isDisabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                        <option value="">
                            {isLoadingProfissionais 
                                ? 'Carregando...' 
                                : !idImobiliaria 
                                    ? 'Selecione primeiro uma imobiliária'
                                    : profissionais.length === 0
                                        ? 'Nenhum profissional encontrado para esta imobiliária'
                                        : 'Selecione um profissional'
                            }
                        </option>
                        {!isDisabled && profissionais.map((profissional) => (
                            <option key={profissional.id} value={profissional.id}>
                                {profissional.nome}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Mostrar os cargos selecionados automaticamente (apenas visualização) */}
                {cargosDisponiveis && cargosDisponiveis.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cargos do Profissional (selecionados automaticamente)
                        </label>
                        <div className="bg-gray-50 p-3 rounded-md">
                            <div className="flex flex-wrap gap-2">
                                {cargosDisponiveis.map((cargo) => (
                                    <span
                                        key={cargo.id}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                    >
                                        {cargo.nome}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {mode === 'create' 
                                    ? 'Todos os cargos do profissional serão incluídos na comissão automaticamente.'
                                    : 'Alterar o profissional atualizará a comissão existente.'
                                }
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}