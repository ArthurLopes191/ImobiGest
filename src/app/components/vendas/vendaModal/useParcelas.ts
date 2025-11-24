'use client';

import { useState, useEffect, useCallback } from 'react';
import { Parcela, ParcelaData } from '@/types/venda';

interface UseParcelasProps {
    vendaId?: string;
    valorTotal: number;
    qtdParcelas: number;
    dataVenda: string;
    formaPagamento: 'A_VISTA' | 'PARCELADO';
    mode: 'create' | 'edit';
}

export const useParcelas = ({
    vendaId,
    valorTotal,
    qtdParcelas,
    dataVenda,
    formaPagamento,
    mode
}: UseParcelasProps) => {
    const [parcelas, setParcelas] = useState<Parcela[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const getCookieValue = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    };

    // Gera parcelas automaticamente baseado nos dados da venda
    const gerarParcelasAutomaticas = useCallback(() => {
        if (formaPagamento !== 'PARCELADO' || qtdParcelas <= 0 || valorTotal <= 0) {
            setParcelas([]);
            return;
        }

        const valorParcela = Math.round((valorTotal / qtdParcelas) * 100) / 100;
        const dataBase = new Date(dataVenda);
        const novasParcelas: Parcela[] = [];

        for (let i = 1; i <= qtdParcelas; i++) {
            const dataVencimento = new Date(dataBase);
            dataVencimento.setMonth(dataBase.getMonth() + i);
            
            // Ajusta o valor da última parcela para compensar arredondamentos
            const valor = i === qtdParcelas 
                ? valorTotal - (valorParcela * (qtdParcelas - 1))
                : valorParcela;

            novasParcelas.push({
                numeroParcela: i,
                valorParcela: valor,
                dataVencimento: dataVencimento.toISOString(),
                status: 'PENDENTE',
                idVenda: vendaId ? parseInt(vendaId) : 0
            });
        }

        setParcelas(novasParcelas);
    }, [valorTotal, qtdParcelas, dataVenda, formaPagamento, vendaId]);

    // Carrega parcelas existentes (modo edição)
    const carregarParcelas = useCallback(async () => {
        if (mode !== 'edit' || !vendaId) return;

        setIsLoading(true);
        setError('');
        
        try {
            const token = getCookieValue('token');
            if (!token) {
                setError('Token de autenticação não encontrado');
                return;
            }

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
                // Se não há parcelas, gera automaticamente
                gerarParcelasAutomaticas();
            }
        } catch (error) {
            console.error('Erro ao carregar parcelas:', error);
            setError('Erro ao carregar parcelas');
            // Se erro, gera automaticamente
            gerarParcelasAutomaticas();
        } finally {
            setIsLoading(false);
        }
    }, [mode, vendaId, gerarParcelasAutomaticas]);

    // Cria as parcelas no backend
    const criarParcelas = async (vendaIdParam: number) => {
        if (formaPagamento !== 'PARCELADO' || parcelas.length === 0) return;

        try {
            const token = getCookieValue('token');
            if (!token) throw new Error('Token não encontrado');

            for (const parcela of parcelas) {
                const parcelaData = {
                    ...parcela,
                    idVenda: vendaIdParam
                };

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/parcela`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(parcelaData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro ao criar parcela');
                }
            }
        } catch (error) {
            console.error('Erro ao criar parcelas:', error);
            throw error;
        }
    };

    // Atualiza uma parcela específica
    const atualizarParcela = async (parcela: Parcela) => {
        if (!parcela.id) return;

        try {
            const token = getCookieValue('token');
            if (!token) throw new Error('Token não encontrado');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/parcela/${parcela.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(parcela)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao atualizar parcela');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar parcela:', error);
            throw error;
        }
    };

    // Deleta uma parcela
    const deletarParcela = async (parcelaId: number) => {
        try {
            const token = getCookieValue('token');
            if (!token) throw new Error('Token não encontrado');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/parcela/${parcelaId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao deletar parcela');
            }
        } catch (error) {
            console.error('Erro ao deletar parcela:', error);
            throw error;
        }
    };

    // Atualiza todas as parcelas (modo edição)
    const atualizarTodasParcelas = async () => {
        if (mode !== 'edit' || !vendaId) return;

        try {
            // Carrega parcelas existentes
            const token = getCookieValue('token');
            if (!token) throw new Error('Token não encontrado');

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/parcela/venda/${vendaId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.ok) {
                const parcelasExistentes = await response.json();
                
                // Deleta parcelas existentes
                for (const parcela of parcelasExistentes) {
                    if (parcela.id) {
                        await deletarParcela(parcela.id);
                    }
                }
            }

            // Cria novas parcelas
            await criarParcelas(parseInt(vendaId));
        } catch (error) {
            console.error('Erro ao atualizar parcelas:', error);
            throw error;
        }
    };

    // Atualiza dados de uma parcela específica no estado
    const atualizarParcelaLocal = (index: number, campo: keyof Parcela, valor: any) => {
        setParcelas(prev => prev.map((parcela, i) => 
            i === index ? { ...parcela, [campo]: valor } : parcela
        ));
    };

    // Reset das parcelas
    const resetParcelas = () => {
        setParcelas([]);
        setError('');
    };

    // Efeito para gerar parcelas quando os dados mudarem
    useEffect(() => {
        if (mode === 'create') {
            gerarParcelasAutomaticas();
        } else if (mode === 'edit' && vendaId) {
            carregarParcelas();
        }
    }, [mode, vendaId, gerarParcelasAutomaticas, carregarParcelas]);

    return {
        parcelas,
        isLoading,
        error,
        criarParcelas,
        atualizarParcela,
        atualizarTodasParcelas,
        deletarParcela,
        atualizarParcelaLocal,
        resetParcelas,
        gerarParcelasAutomaticas
    };
};
