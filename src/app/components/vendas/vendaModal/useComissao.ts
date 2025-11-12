'use client';

import { useState, useEffect } from 'react';
import { ComissaoData, ProfissionalComissao, CargoComissao } from '@/types/venda';

interface UseComissaoProps {
    showModal: boolean;
    mode: 'create' | 'edit';
    vendaId?: string;
    idImobiliaria?: number;
}

export function useComissao({ showModal, mode, vendaId, idImobiliaria }: UseComissaoProps) {
    const [comissaoData, setComissaoData] = useState<ComissaoData>({
        idProfissional: 0,
        idsCargos: []
    });
    const [todosProfissionais, setTodosProfissionais] = useState<ProfissionalComissao[]>([]);
    const [profissionaisFiltrados, setProfissionaisFiltrados] = useState<ProfissionalComissao[]>([]);
    const [cargosDisponiveis, setCargosDisponiveis] = useState<CargoComissao[]>([]);
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
            } else {
                console.log('⚠️ Endpoint específico falhou, tentando buscar todas e filtrar...');
                
                // Se falhar, buscar todas as comissões e filtrar
                response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/comissao`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const todasComissoes = await response.json();
                    comissoes = todasComissoes.filter((comissao: any) => 
                        comissao.idVenda === parseInt(idVenda)
                    );
                    console.log('✅ Comissões filtradas de todas:', comissoes);
                } else {
                    console.error('❌ Ambos os métodos falharam');
                    return;
                }
            }
                
            if (comissoes && comissoes.length > 0) {
                const primeiraComissao = comissoes[0];
                console.log('👤 Primeira comissão:', primeiraComissao);
                
                // Usar idProfissional diretamente, não profissional.id
                if (primeiraComissao.idProfissional) {
                    console.log('✅ Definindo profissional selecionado:', primeiraComissao.idProfissional);
                    setComissaoData(prev => ({
                        ...prev,
                        idProfissional: primeiraComissao.idProfissional
                    }));
                } else {
                    console.log('❌ idProfissional não encontrado na comissão');
                }
            } else {
                console.log('⚠️ Nenhuma comissão encontrada para a venda');
            }
        } catch (err) {
            console.error('❌ Erro ao buscar comissão existente:', err);
        }
    };

    const criarComissao = async (idVenda: string) => {
        const token = getCookieValue('token');
        if (!token) throw new Error('Token não encontrado');

        if (!comissaoData.idsCargos || comissaoData.idsCargos.length === 0) {
            throw new Error('Nenhum cargo selecionado para a comissão');
        }

        const comissaoPayload = {
            idVenda: parseInt(idVenda),
            idProfissional: comissaoData.idProfissional,
            idsCargos: comissaoData.idsCargos
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
    };

    const atualizarComissao = async (idVenda: string) => {
        const token = getCookieValue('token');
        if (!token) throw new Error('Token não encontrado');

        if (!comissaoData.idProfissional) return true;
        if (!comissaoData.idsCargos || comissaoData.idsCargos.length === 0) return true;

        // Deletar comissões existentes
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/comissao/venda/${idVenda}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Criar nova comissão
        return await criarComissao(idVenda);
    };

    const handleComissaoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'idProfissional') {
            setComissaoData(prev => ({
                ...prev,
                idProfissional: parseInt(value) || 0
            }));
        }
    };

    const resetComissaoData = () => {
        setComissaoData({
            idProfissional: 0,
            idsCargos: []
        });
        setCargosDisponiveis([]);
    };

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
        console.log('🔍 Filtragem - idImobiliaria:', idImobiliaria);
        console.log('🔍 Filtragem - todosProfissionais:', todosProfissionais);
        
        if (idImobiliaria && todosProfissionais.length > 0) {
            console.log('🔍 Tentando filtrar profissionais para imobiliária ID:', idImobiliaria);
            
            // Log da estrutura do primeiro profissional para debug
            if (todosProfissionais[0]) {
                console.log('🔍 Estrutura do primeiro profissional:', todosProfissionais[0]);
                console.log('🔍 Imobiliária do primeiro profissional:', todosProfissionais[0].imobiliaria);
                console.log('🔍 idImobiliaria do primeiro profissional:', todosProfissionais[0].idImobiliaria);
            }
            
            // Tentar diferentes estruturas possíveis
            let profissionaisDaImobiliaria = todosProfissionais.filter(
                profissional => {
                    console.log(`🔍 Verificando profissional ${profissional.nome}:`, {
                        imobiliaria: profissional.imobiliaria,
                        idImobiliaria: profissional.idImobiliaria
                    });
                    
                    // Tenta primeira estrutura: profissional.imobiliaria.id
                    if (profissional.imobiliaria?.id === idImobiliaria) {
                        console.log('✅ Match por imobiliaria.id');
                        return true;
                    }
                    // Tenta segunda estrutura: profissional.idImobiliaria
                    if (profissional.idImobiliaria === idImobiliaria) {
                        console.log('✅ Match por idImobiliaria');
                        return true;
                    }
                    console.log('❌ Sem match');
                    return false;
                }
            );
            
            console.log('🔍 Profissionais filtrados:', profissionaisDaImobiliaria);
            
            // TEMPORÁRIO: Se não encontrar nenhum, mostrar todos para debug
            if (profissionaisDaImobiliaria.length === 0) {
                console.log('⚠️ Nenhum profissional filtrado, usando todos para debug');
                profissionaisDaImobiliaria = todosProfissionais;
            }
            
            setProfissionaisFiltrados(profissionaisDaImobiliaria);
        } else {
            setProfissionaisFiltrados([]);
            // Reset profissional selecionado quando imobiliária muda
            setComissaoData(prev => ({ ...prev, idProfissional: 0, idsCargos: [] }));
            setCargosDisponiveis([]);
        }
    }, [idImobiliaria, todosProfissionais]);

    // Atualizar cargos quando profissional é selecionado
    useEffect(() => {
        if (comissaoData.idProfissional) {
            const profissionalSelecionado = profissionaisFiltrados.find(p => p.id === comissaoData.idProfissional);
            if (profissionalSelecionado && profissionalSelecionado.cargos && profissionalSelecionado.cargos.length > 0) {
                setCargosDisponiveis(profissionalSelecionado.cargos);
                const idsDosCargos = profissionalSelecionado.cargos.map(cargo => cargo.id);
                setComissaoData(prev => ({ ...prev, idsCargos: idsDosCargos }));
            } else {
                setCargosDisponiveis([]);
                setComissaoData(prev => ({ ...prev, idsCargos: [] }));
            }
        } else {
            setCargosDisponiveis([]);
            setComissaoData(prev => ({ ...prev, idsCargos: [] }));
        }
    }, [comissaoData.idProfissional, profissionaisFiltrados]);

    return {
        comissaoData,
        profissionais: profissionaisFiltrados,
        cargosDisponiveis,
        isLoadingProfissionais,
        handleComissaoChange,
        resetComissaoData,
        criarComissao,
        atualizarComissao
    };
}