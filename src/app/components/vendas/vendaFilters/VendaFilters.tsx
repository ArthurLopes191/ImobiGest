'use client';

import React, { useState, useEffect } from 'react';
import { ImobiliariaVenda } from '@/types/venda';

export interface VendaFilters {
  descricao?: string;
  valorMin?: number;
  valorMax?: number;
  dataInicio?: string;
  dataFim?: string;
  formaPagamento?: 'A_VISTA' | 'PARCELADO' | '';
  idImobiliaria?: number;
  idProfissional?: number;
  statusParcela?: 'PENDENTE' | 'PAGA' | 'ATRASADA' | '';
}

interface VendaFiltersProps {
  appliedFilters: VendaFilters;
  onApplyFilters: (filters: VendaFilters) => void;
  imobiliarias: ImobiliariaVenda[];
  profissionais: { id: number; nome: string; }[];
  isLoading?: boolean;
  onClearFilters: () => void;
}

export default function VendaFilters({
  appliedFilters,
  onApplyFilters,
  imobiliarias,
  profissionais,
  isLoading = false,
  onClearFilters
}: VendaFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<VendaFilters>(appliedFilters);

  // Sincronizar filtros locais quando os filtros aplicados mudarem (ex: ao limpar)
  useEffect(() => {
    setLocalFilters(appliedFilters);
  }, [appliedFilters]);

  useEffect(() => {
    const activeFilters = Object.values(appliedFilters).some(value => 
      value !== undefined && value !== null && value !== ''
    );
    setHasActiveFilters(activeFilters);
  }, [appliedFilters]);

  const handleInputChange = (field: keyof VendaFilters, value: any) => {
    setLocalFilters({
      ...localFilters,
      [field]: value === '' ? undefined : value
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Header dos Filtros */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              Filtros ativos
            </span>
          )}
          {isLoading && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-500">Buscando...</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleExpanded}
            className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
            disabled={isLoading}
          >
            {isExpanded ? 'Recolher' : 'Expandir'}
          </button>
        </div>
      </div>

      {/* Filtros Expandidos */}
      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          {/* Filtros Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do Imóvel
              </label>
              <input
                type="text"
                value={localFilters.descricao || ''}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Buscar por descrição..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imobiliária
              </label>
              <select
                value={localFilters.idImobiliaria || ''}
                onChange={(e) => handleInputChange('idImobiliaria', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Todas as imobiliárias</option>
                {imobiliarias.map((imobiliaria) => (
                  <option key={imobiliaria.id} value={imobiliaria.id}>
                    {imobiliaria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={localFilters.formaPagamento || ''}
                onChange={(e) => handleInputChange('formaPagamento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Todas</option>
                <option value="A_VISTA">À Vista</option>
                <option value="PARCELADO">Parcelado</option>
              </select>
            </div>
          </div>
          {/* Filtros de Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Mínimo (R$)
              </label>
              <input
                type="number"
                value={localFilters.valorMin || ''}
                onChange={(e) => handleInputChange('valorMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Máximo (R$)
              </label>
              <input
                type="number"
                value={localFilters.valorMax || ''}
                onChange={(e) => handleInputChange('valorMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="999999999.99"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Filtros de Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={localFilters.dataInicio || ''}
                onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={localFilters.dataFim || ''}
                onChange={(e) => handleInputChange('dataFim', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Filtros Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendedor
              </label>
              <select
                value={localFilters.idProfissional || ''}
                onChange={(e) => handleInputChange('idProfissional', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Todos os vendedores</option>
                {profissionais.map((profissional) => (
                  <option key={profissional.id} value={profissional.id}>
                    {profissional.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status das Parcelas
              </label>
              <select
                value={localFilters.statusParcela || ''}
                onChange={(e) => handleInputChange('statusParcela', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Todos os status</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PAGA">Paga</option>
                <option value="ATRASADA">Atrasada</option>
              </select>
            </div> */}
          </div>

          {/* Botão de Aplicar Filtros */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              onClick={handleClearFilters}
              className="text-red-600 hover:text-red-800 font-medium px-6 py-2 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
              disabled={isLoading}
            >
              Limpar
            </button>
            <button
              onClick={handleApplyFilters}
              className="bg-blue-600 text-white font-medium px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}