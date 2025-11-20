'use client';

import React from 'react';
import { Parcela } from '@/types/venda';

interface ParcelaManagerProps {
    parcelas: Parcela[];
    formaPagamento: 'A_VISTA' | 'PARCELADO';
    isLoading: boolean;
    mode: 'create' | 'edit';
    onParcelaChange: (index: number, campo: keyof Parcela, valor: any) => void;
    onRegenerarParcelas: () => void;
}

export default function ParcelaManager({
    parcelas,
    formaPagamento,
    isLoading,
    mode,
    onParcelaChange,
    onRegenerarParcelas
}: ParcelaManagerProps) {
    if (formaPagamento !== 'PARCELADO') {
        return null;
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAGO':
                return 'bg-green-100 text-green-800';
            case 'ATRASADO':
                return 'bg-red-100 text-red-800';
            case 'PENDENTE':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PAGO':
                return 'Pago';
            case 'ATRASADO':
                return 'Atrasado';
            case 'PENDENTE':
            default:
                return 'Pendente';
        }
    };

    const valorTotalParcelas = parcelas.reduce((sum, p) => sum + p.valorParcela, 0);

    return (
        <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Parcelas do Pagamento</h3>
                <button
                    type="button"
                    onClick={onRegenerarParcelas}
                    className="text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none"
                    title="Regenerar parcelas com base nos dados atuais da venda"
                >
                    Regenerar Parcelas
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-500">Carregando parcelas...</p>
                </div>
            ) : parcelas.length === 0 ? (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                    <p>Nenhuma parcela definida</p>
                    <p className="text-sm mt-1">Configure a forma de pagamento como "Parcelado" para gerar as parcelas</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Desktop: Tabela */}
                    <div className="hidden md:block">
                        <div className="bg-gray-50 rounded-t-lg border border-gray-200">
                            <div className="grid grid-cols-5 gap-4 p-3 text-sm font-medium text-gray-700">
                                <div>Parcela</div>
                                <div>Valor (R$)</div>
                                <div>Vencimento</div>
                                <div>Status</div>
                                <div>Ações</div>
                            </div>
                        </div>
                        <div className="border border-gray-200 rounded-b-lg">
                            {parcelas.map((parcela, index) => (
                                <div
                                    key={index}
                                    className={`grid grid-cols-5 gap-4 p-3 text-sm border-b border-gray-200 last:border-b-0 ${
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <span className="font-medium">{parcela.numeroParcela}ª</span>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            value={parcela.valorParcela}
                                            onChange={(e) => onParcelaChange(index, 'valorParcela', parseFloat(e.target.value) || 0)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="date"
                                            value={formatDateForInput(parcela.dataVencimento)}
                                            onChange={(e) => onParcelaChange(index, 'dataVencimento', new Date(e.target.value).toISOString())}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <select
                                            value={parcela.status}
                                            onChange={(e) => onParcelaChange(index, 'status', e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="PENDENTE">Pendente</option>
                                            <option value="PAGO">Pago</option>
                                            <option value="ATRASADO">Atrasado</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(parcela.status)}`}>
                                            {getStatusLabel(parcela.status)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile: Cards */}
                    <div className="md:hidden space-y-3">
                        {parcelas.map((parcela, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium text-gray-800">
                                        {parcela.numeroParcela}ª Parcela
                                    </h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(parcela.status)}`}>
                                        {getStatusLabel(parcela.status)}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Valor (R$)
                                        </label>
                                        <input
                                            type="number"
                                            value={parcela.valorParcela}
                                            onChange={(e) => onParcelaChange(index, 'valorParcela', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Data de Vencimento
                                        </label>
                                        <input
                                            type="date"
                                            value={formatDateForInput(parcela.dataVencimento)}
                                            onChange={(e) => onParcelaChange(index, 'dataVencimento', new Date(e.target.value).toISOString())}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={parcela.status}
                                            onChange={(e) => onParcelaChange(index, 'status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="PENDENTE">Pendente</option>
                                            <option value="PAGO">Pago</option>
                                            <option value="ATRASADO">Atrasado</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Resumo das parcelas */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="text-center md:text-left">
                                <span className="text-blue-700 font-medium">Total de Parcelas:</span>
                                <span className="ml-1 text-blue-900 font-bold">{parcelas.length}</span>
                            </div>
                            <div className="text-center">
                                <span className="text-blue-700 font-medium">Valor Total:</span>
                                <span className="ml-1 text-blue-900 font-bold">{formatCurrency(valorTotalParcelas)}</span>
                            </div>
                            <div className="text-center md:text-right">
                                <span className="text-blue-700 font-medium">Pagas:</span>
                                <span className="ml-1 text-green-700 font-bold">
                                    {parcelas.filter(p => p.status === 'PAGO').length}
                                </span>
                                <span className="mx-1 text-blue-700">/</span>
                                <span className="text-yellow-700 font-bold">
                                    {parcelas.filter(p => p.status === 'PENDENTE').length} pend.
                                </span>
                                {parcelas.filter(p => p.status === 'ATRASADO').length > 0 && (
                                    <>
                                        <span className="mx-1 text-blue-700">/</span>
                                        <span className="text-red-700 font-bold">
                                            {parcelas.filter(p => p.status === 'ATRASADO').length} atraso
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}