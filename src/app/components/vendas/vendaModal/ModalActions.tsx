'use client';

import React from 'react';
import { VendaModalMode } from '@/types/venda';

interface ModalActionsProps {
    mode: VendaModalMode;
    isLoading: boolean;
    isDeleting: boolean;
    onClose: () => void;
    onDelete: () => void;
}

export default function ModalActions({
    mode,
    isLoading,
    isDeleting,
    onClose,
    onDelete
}: ModalActionsProps) {
    const modalTitle = mode === 'create' ? 'Nova Venda' : 'Editar Venda';
    const submitButtonText = mode === 'create' ? 'Criar Venda' : 'Atualizar Venda';
    const loadingText = mode === 'create' ? 'Criando...' : 'Atualizando...';

    return (
        <div className="flex justify-between mt-6">
            {/* Botão de deletar (apenas no modo edição) */}
            {mode === 'edit' && (
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting || isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isDeleting ? 'Deletando...' : 'Deletar Venda'}
                </button>
            )}

            {/* Botões de ação principal */}
            <div className={`flex space-x-3 ${mode === 'create' ? 'w-full justify-end' : ''}`}>
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    {mode === 'edit' ? 'Fechar' : 'Cancelar'}
                </button>
                <button
                    type="submit"
                    disabled={isLoading || isDeleting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? loadingText : submitButtonText}
                </button>
            </div>
        </div>
    );
}