'use client';

import { useState, useEffect, useCallback } from 'react';
import { ComissaoData, ProfissionalComissao, CargoComissao, TipoComissao } from '@/types/venda';

interface UseComissaoProps {
    showModal: boolean;
    mode: 'create' | 'edit';
    vendaId?: string;
    idImobiliaria?: number;
}

export function useComissao({ showModal, mode, vendaId, idImobiliaria }: UseComissaoProps) {
    const [comissaoData, setComissaoData] = useState<ComissaoData>({
        profissionais: []
    });
    const [todosProfissionais, setTodosProfissionais] = useState<ProfissionalComissao[]>([]);
    const [profissionaisFiltrados, setProfissionaisFiltrados] = useState<ProfissionalComissao[]>([]);
    const [isLoadingProfissionais, setIsLoadingProfissionais] = useState(false);

    // Log quando comissaoData muda
    useEffect(() => {
        console.log('📊 comissaoData atualizado:', comissaoData);
    }, [comissaoData]);

    const getCookieValue = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    };

    const fetchProfissionais = async () => {
        setIsLoadingProfissionais(true);
        try {
            const token = getCookieValue('token');
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/profissional/completo`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('🔍 Estrutura dos profissionais da API:', data);
                console.log('🔍 Primeiro profissional:', data[0]);
                setTodosProfissionais(data);
            }
        } catch (err) {
            console.error('❌ Erro ao carregar profissionais:', err);
        } finally {
            setIsLoadingProfissionais(false);
        }
    };

    const fetchComissaoExistente = async (idVenda: string) => {
        try {
            const token = getCookieValue('token');
            if (!token) return;

            console.log('🔍 Buscando comissão existente para venda:', idVenda);

            // Primeiro tentar o endpoint específico
            let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/comissao/venda/${idVenda}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            let comissoes = [];

            if (response.ok) {
                comissoes = await response.json();
                console.log('✅ Comissões encontradas via endpoint específico:', comissoes);
                // Filtrar apenas comissões do tipo MANUAL
                comissoes = comissoes.filter((comissao: any) => comissao.tipoComissao === 'MANUAL');
                console.log('✅ Comissões filtradas (apenas MANUAL):', comissoes);
                
                if (comissoes && comissoes.length > 0) {
                    // Transformar comissões em formato de múltiplos profissionais
                    const profissionaisComissao = comissoes.map((comissao: any) => {
                        const profissional = todosProfissionais.find(p => p.id === comissao.idProfissional);
                        return {
                            idProfissional: comissao.idProfissional,
                            idsCargos: profissional?.cargos?.map(cargo => cargo.id) || []
                        };
                    });

                    console.log('✅ Definindo profissionais selecionados:', profissionaisComissao);
                    setComissaoData(prev => ({
                        ...prev,
                        profissionais: profissionaisComissao
                    }));
                } else {
                    console.log('⚠️ Nenhuma comissão manual encontrada para a venda');
                }
            } else {
                console.log('⚠️ Endpoint específico falhou, tentando buscar todas e filtrar...');
                
                // Se falhar, buscar todas as comissões e filtrar
                response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/comissao`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const todasComissoes = await response.json();
                    comissoes = todasComissoes.filter((comissao: any) => 
                        comissao.idVenda === parseInt(idVenda) && 
                        comissao.tipoComissao === 'MANUAL'
                    );
                    console.log('✅ Comissões filtradas de todas (apenas MANUAL):', comissoes);
                    
                    if (comissoes && comissoes.length > 0) {
                        // Transformar comissões em formato de múltiplos profissionais
                        const profissionaisComissao = comissoes.map((comissao: any) => {
                            const profissional = todosProfissionais.find(p => p.id === comissao.idProfissional);
                            return {
                                idProfissional: comissao.idProfissional,
                                idsCargos: profissional?.cargos?.map(cargo => cargo.id) || []
                            };
                        });

                        console.log('✅ Definindo profissionais selecionados (fallback):', profissionaisComissao);
                        setComissaoData(prev => ({
                            ...prev,
                            profissionais: profissionaisComissao
                        }));
                    }
                } else {
                    console.error('❌ Ambos os métodos falharam');
                    return;
                }
            }
        } catch (err) {
            console.error('❌ Erro ao buscar comissão existente:', err);
        }
    };

    const criarComissao = async (idVenda: string) => {
        const token = getCookieValue('token');
        if (!token) throw new Error('Token não encontrado');

        if (!comissaoData.profissionais || comissaoData.profissionais.length === 0) {
            throw new Error('Nenhum profissional selecionado para a comissão');
        }

        // Criar uma comissão para cada profissional
        const promises = comissaoData.profissionais.map(async (profissionalComissao) => {
            if (!profissionalComissao.idsCargos || profissionalComissao.idsCargos.length === 0) {
                throw new Error(`Profissional ${profissionalComissao.idProfissional} não possui cargos válidos`);
            }

            const comissaoPayload = {
                idVenda: parseInt(idVenda),
                idProfissional: profissionalComissao.idProfissional,
                idsCargos: profissionalComissao.idsCargos
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/comissao/com-cargo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(comissaoPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao criar comissão');
            }

            return await response.json();
        });

        return Promise.all(promises);
    };

    const atualizarComissao = async (idVenda: string) => {
        const token = getCookieValue('token');
        if (!token) throw new Error('Token não encontrado');

        if (!comissaoData.profissionais || comissaoData.profissionais.length === 0) return true;

        // Deletar comissões manuais existentes
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/comissao/venda/${idVenda}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Criar novas comissões
        return await criarComissao(idVenda);
    };

    const handleProfissionalAdd = useCallback((idProfissional: number) => {
        const profissional = profissionaisFiltrados.find(p => p.id === idProfissional);
        if (!profissional) return;

        const novoProfissional = {
            idProfissional,
            idsCargos: profissional.cargos?.map(cargo => cargo.id) || []
        };

        setComissaoData(prev => ({
            ...prev,
            profissionais: [...prev.profissionais, novoProfissional]
        }));
    }, [profissionaisFiltrados]);

    const handleProfissionalRemove = useCallback((idProfissional: number) => {
        setComissaoData(prev => ({
            ...prev,
            profissionais: prev.profissionais.filter(p => p.idProfissional !== idProfissional)
        }));
    }, []);

    const resetComissaoData = useCallback(() => {
        setComissaoData({
            profissionais: []
        });
    }, []);

    // Carregar profissionais ao abrir o modal
    useEffect(() => {
        if (showModal) {
            fetchProfissionais();
        }
    }, [showModal]);

    // Buscar comissão existente no modo edição (após profissionais serem carregados)
    useEffect(() => {
        console.log('🔍 useEffect comissão existente:', {
            mode,
            vendaId,
            showModal,
            todosProfissionaisLength: todosProfissionais.length,
            shouldFetch: mode === 'edit' && vendaId && showModal && todosProfissionais.length > 0
        });
        
        if (mode === 'edit' && vendaId && showModal && todosProfissionais.length > 0) {
            console.log('🔍 Todos os profissionais carregados, buscando comissão existente...');
            fetchComissaoExistente(vendaId);
        }
    }, [mode, vendaId, showModal, todosProfissionais.length]);

    // Filtrar profissionais por imobiliária
    useEffect(() => {
        if (idImobiliaria && todosProfissionais.length > 0) {
            // Filtrar profissionais que pertencem à imobiliária selecionada
            const profissionaisDaImobiliaria = todosProfissionais.filter(
                profissional => {
                    // Verificar tanto idImobiliaria quanto imobiliaria.id para compatibilidade
                    return profissional.idImobiliaria === idImobiliaria || 
                           profissional.imobiliaria?.id === idImobiliaria;
                }
            );
            
            setProfissionaisFiltrados(profissionaisDaImobiliaria);
            
            // Reset profissionais selecionados se algum não estiver na lista filtrada
            setComissaoData(prev => {
                const profissionaisValidos = prev.profissionais.filter(
                    profComissao => profissionaisDaImobiliaria.some(p => p.id === profComissao.idProfissional)
                );
                
                if (profissionaisValidos.length !== prev.profissionais.length) {
                    return { ...prev, profissionais: profissionaisValidos };
                }
                return prev;
            });
        } else {
            setProfissionaisFiltrados([]);
            // Reset profissionais quando imobiliária não está selecionada
            setComissaoData(prev => ({ ...prev, profissionais: [] }));
        }
    }, [idImobiliaria, todosProfissionais]);

    return {
        comissaoData,
        profissionais: profissionaisFiltrados,
        isLoadingProfissionais,
        handleProfissionalAdd,
        handleProfissionalRemove,
        resetComissaoData,
        criarComissao,
        atualizarComissao
    };
}