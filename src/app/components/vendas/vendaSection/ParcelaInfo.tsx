'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Parcela } from '@/types/venda';

interface ParcelaInfoProps {
    vendaId: string;
    formaPagamento: 'A_VISTA' | 'PARCELADO';
    className?: string;
    refreshTrigger?: number;
}

export default function ParcelaInfo({ vendaId, formaPagamento, className = '', refreshTrigger = 0 }: ParcelaInfoProps) {
    const [parcelas, setParcelas] = useState<Parcela[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getCookieValue = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    };

    const loadParcelas = useCallback(async () => {
        if (formaPagamento !== 'PARCELADO') return;

        setIsLoading(true);
        try {
            const token = getCookieValue('token');
            if (!token) return;

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/parcela/venda/${vendaId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.ok) {
                const parcelasData = await response.json();
                setParcelas(parcelasData);
            } else {
                console.error('Erro ao carregar parcelas:', response.status);
                setParcelas([]); // Limpa parcelas em caso de erro
            }
        } catch (error) {
            console.error('Erro ao carregar parcelas:', error);
            setParcelas([]); // Limpa parcelas em caso de erro
        } finally {
            setIsLoading(false);
        }
    }, [vendaId, formaPagamento]);

    // Limpa parcelas quando a forma de pagamento muda para À VISTA
    useEffect(() => {
        if (formaPagamento === 'A_VISTA') {
            setParcelas([]);
        }
    }, [formaPagamento]);

    useEffect(() => {
        loadParcelas();
    }, [loadParcelas, refreshTrigger]);

    if (formaPagamento !== 'PARCELADO') {
        return (
            <span className={`text-sm text-gray-600 ${className}`}>
                Pagamento à vista
            </span>
        );
    }

    if (isLoading) {
        return (
            <span className={`text-sm text-gray-500 ${className}`}>
                Carregando...
            </span>
        );
    }

    if (parcelas.length === 0) {
        return (
            <span className={`text-sm text-gray-500 ${className}`}>
                Sem parcelas
            </span>
        );
    }

    const parcelasPagas = parcelas.filter(p => p.status === 'PAGO').length;
    const parcelasAtrasadas = parcelas.filter(p => p.status === 'ATRASADO').length;
    const parcelasPendentes = parcelas.filter(p => p.status === 'PENDENTE').length;

    const getStatusInfo = () => {
        if (parcelasAtrasadas > 0) {
            return {
                text: `${parcelasAtrasadas} atrasada(s)`,
                color: 'text-red-600'
            };
        }
        if (parcelasPendentes > 0) {
            return {
                text: `${parcelasPendentes} pendente(s)`,
                color: 'text-yellow-600'
            };
        }
        return {
            text: 'Todas pagas',
            color: 'text-green-600'
        };
    };

    const statusInfo = getStatusInfo();

    return (
        <div className={`text-sm ${className}`}>
            <div className="text-gray-700 font-medium">
                {parcelasPagas}/{parcelas.length} parcelas
            </div>
            <div className={`text-xs ${statusInfo.color}`}>
                {statusInfo.text}
            </div>
        </div>
    );
}
