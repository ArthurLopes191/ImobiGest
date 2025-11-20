'use client';

import { useState, useEffect } from 'react';
import VendaModal from '@/app/components/vendas/vendaModal/VendaModal';
import ParcelaInfo from './ParcelaInfo';
import { Venda, VendaSectionProps, ImobiliariaVenda, VendaModalMode } from '@/types/venda';

interface Imobiliaria {
    id: number;
    nome: string;
    meta: number;
}

export default function VendaSection({ onVendaClick }: VendaSectionProps) {
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [imobiliarias, setImobiliarias] = useState<Imobiliaria[]>([]);
    const [comissoes, setComissoes] = useState<any[]>([]);
    const [profissionais, setProfissionais] = useState<any[]>([]);
    const [isLoadingVendas, setIsLoadingVendas] = useState(true);
    const [showVendaModal, setShowVendaModal] = useState(false);
    const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);
    const [modalMode, setModalMode] = useState<VendaModalMode>('create');

    // Estados para paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const getCookieValue = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    };

    const loadImobiliarias = async () => {
        try {
            const token = getCookieValue('token');
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/imobiliaria`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const imobiliariasData = await response.json();
                setImobiliarias(imobiliariasData);
            }
        } catch (err) {
            console.error('❌ Erro ao carregar imobiliárias:', err);
        }
    };

    const loadProfissionais = async () => {
        try {
            const token = getCookieValue('token');
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/profissional`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const profissionaisData = await response.json();
                setProfissionais(profissionaisData);
            } else {
                console.error('❌ Erro HTTP ao carregar profissionais:', response.status);
            }
        } catch (err) {
            console.error('❌ Erro ao carregar profissionais:', err);
        }
    };

    const loadComissoes = async () => {
        try {
            const token = getCookieValue('token');
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/comissao`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const comissoesData = await response.json();
                setComissoes(comissoesData);
            } else {
                console.error('❌ Erro HTTP ao carregar comissões:', response.status);
            }
        } catch (err) {
            console.error('❌ Erro ao carregar comissões:', err);
        }
    };

    const loadVendas = async () => {
        try {
            const token = getCookieValue('token');
            if (!token) {
                console.error('Token não encontrado');
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/venda`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const vendasData = await response.json();
                setVendas(vendasData);
            } else {
                console.error('Erro ao carregar vendas:', response.status);
            }
        } catch (err) {
            console.error('❌ Erro ao carregar vendas:', err);
        }
    };

    const loadAllData = async () => {
        setIsLoadingVendas(true);

        try {
            await loadImobiliarias();
            await loadProfissionais();
            await loadComissoes();
            await loadVendas();
        } catch (err) {
            console.error('❌ Erro ao carregar dados:', err);
        } finally {
            setIsLoadingVendas(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleVendaModalSuccess = () => {
        loadVendas();
        loadComissoes();
        loadProfissionais();
        setRefreshTrigger(prev => prev + 1); // Força recarregamento das parcelas
    };

    const handleNewVenda = () => {
        setSelectedVenda(null);
        setModalMode('create');
        setShowVendaModal(true);
    };

    const handleEditVenda = (venda: Venda) => {
        setSelectedVenda(venda);
        setModalMode('edit');
        setShowVendaModal(true);
    };

    const handleVendaClick = (venda: Venda) => {
        if (onVendaClick) {
            onVendaClick(venda);
        } else {
            handleEditVenda(venda);
        }
    };

    const getImobiliariasParaModal = (): ImobiliariaVenda[] => {
        return imobiliarias.map((imobiliaria) => ({
            id: imobiliaria.id.toString(),
            nome: imobiliaria.nome
        }));
    };

    const getImobiliariaNome = (idImobiliaria: number): string => {
        const imobiliaria = imobiliarias.find(i => i.id === idImobiliaria);
        return imobiliaria?.nome || 'Imobiliária não encontrada';
    };

    const getVendedores = (venda: Venda): string => {
        const comissoesVenda = comissoes.filter(comissao => 
            comissao.idVenda === parseInt(venda.id)
        );

        if (!comissoesVenda || comissoesVenda.length === 0) {
            return 'Sem vendedor';
        }

        // Busca os nomes dos profissionais usando idProfissional
        const vendedores = comissoesVenda
            .map(comissao => {
                const profissional = profissionais.find(prof => prof.id === comissao.idProfissional);
                return profissional?.nome;
            })
            .filter(nome => nome)
            .filter((nome, index, array) => array.indexOf(nome) === index) // Remove duplicatas
            .join(', ');

        return vendedores || 'Sem vendedor';
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getFormaPagamentoLabel = (formaPagamento: string) => {
        return formaPagamento === 'A_VISTA' ? 'À Vista' : 'Parcelado';
    };

    // Lógica de paginação
    const totalPages = Math.ceil(vendas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentVendas = vendas.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const goToPrevious = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const goToNext = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
                        Vendas Cadastradas
                    </h1>
                    <button
                        onClick={handleNewVenda}
                        className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap text-sm sm:text-base w-full sm:w-auto"
                    >
                        Nova Venda
                    </button>
                </div>

                <div className="mt-6">
                    {isLoadingVendas ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-500">Carregando vendas...</p>
                        </div>
                    ) : vendas.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                            <p>Nenhuma venda cadastrada</p>
                            <p className="text-sm mt-1">Clique em "Nova Venda" para criar a primeira</p>
                        </div>
                    ) : (
                        <>
                            {/* Tabela para desktop */}
                            <div className="hidden md:block">
                                {/* Header da tabela */}
                                <div className="bg-gray-50 rounded-t-lg border border-gray-200">
                                    <div className="grid grid-cols-12 gap-4 p-3 text-sm font-medium text-gray-700">
                                        <div className="col-span-3">Imóvel</div>
                                        <div className="col-span-2">Valor</div>
                                        <div className="col-span-2">Data</div>
                                        <div className="col-span-2">Imobiliária</div>
                                        <div className="col-span-2">Vendedores</div>
                                        <div className="col-span-1">Parcelas</div>
                                    </div>
                                </div>

                                {/* Linhas da tabela */}
                                <div className="border-x border-gray-200">
                                    {currentVendas.map((venda, index) => (
                                        <div
                                            key={venda.id}
                                            onClick={() => handleEditVenda(venda)}
                                            className={`grid grid-cols-12 gap-4 p-3 text-sm border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                                                }`}
                                        >
                                            <div className="col-span-3">
                                                <p className="font-medium text-gray-800 truncate" title={venda.descricaoImovel}>
                                                    {venda.descricaoImovel}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {getFormaPagamentoLabel(venda.formaPagamento)}
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <p className="font-bold text-green-600">
                                                    {formatCurrency(venda.valorTotal)}
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <p className="text-gray-700">
                                                    {formatDate(venda.dataVenda)}
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <p className="font-medium text-blue-600 truncate" title={getImobiliariaNome(venda.idImobiliaria)}>
                                                    {getImobiliariaNome(venda.idImobiliaria)}
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <p className="text-gray-700 truncate" title={getVendedores(venda)}>
                                                    {getVendedores(venda)}
                                                </p>
                                            </div>

                                            <div className="col-span-1">
                                                <ParcelaInfo
                                                    vendaId={venda.id}
                                                    formaPagamento={venda.formaPagamento}
                                                    refreshTrigger={refreshTrigger}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cards para mobile */}
                            <div className="md:hidden space-y-4">
                                {currentVendas.map((venda) => (
                                    <div
                                        key={venda.id}
                                        onClick={() => handleEditVenda(venda)}
                                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                        <div className="space-y-3">
                                            {/* Header do card */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-900 truncate" title={venda.descricaoImovel}>
                                                        {venda.descricaoImovel}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {getImobiliariaNome(venda.idImobiliaria)}
                                                    </p>
                                                </div>
                                                {onVendaClick && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleVendaClick(venda);
                                                        }}
                                                        className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors ml-2 flex-shrink-0"
                                                        title="Selecionar"
                                                    >
                                                        Select
                                                    </button>
                                                )}
                                            </div>

                                            {/* Valor e data */}
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-lg font-bold text-green-600">
                                                        {formatCurrency(venda.valorTotal)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {getFormaPagamentoLabel(venda.formaPagamento)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-700">
                                                        {formatDate(venda.dataVenda)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Comprador e vendedor */}
                                            <div className="pt-2 border-t border-gray-100 space-y-1">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Comprador:</span> {venda.compradorNome}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Vendedor(es):</span> {getVendedores(venda)}
                                                </p>
                                                <div className="pt-1">
                                                    <span className="text-sm font-medium text-gray-600">Parcelas:</span>
                                                    <div className="mt-1">
                                                        <ParcelaInfo
                                                            vendaId={venda.id}
                                                            formaPagamento={venda.formaPagamento}
                                                            refreshTrigger={refreshTrigger}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer com informações de paginação */}
                            <div className="bg-gray-50 rounded-b-lg border border-gray-200 border-t-0 px-4 py-3 md:rounded-b-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="text-sm text-gray-700 text-center sm:text-left">
                                        Mostrando {startIndex + 1} a {Math.min(endIndex, vendas.length)} de {vendas.length} vendas
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-center space-x-1">
                                            <button
                                                onClick={goToPrevious}
                                                disabled={currentPage === 1}
                                                className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Anterior
                                            </button>

                                            <div className="hidden sm:flex items-center space-x-1">
                                                {getVisiblePages().map((page, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => typeof page === 'number' && goToPage(page)}
                                                        disabled={page === '...'}
                                                        className={`px-3 py-1 text-sm border border-gray-300 rounded-md ${page === currentPage
                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                : page === '...'
                                                                    ? 'cursor-default'
                                                                    : 'hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Indicador de página atual para mobile */}
                                            <div className="sm:hidden px-3 py-1 text-xs text-gray-600">
                                                {currentPage} / {totalPages}
                                            </div>

                                            <button
                                                onClick={goToNext}
                                                disabled={currentPage === totalPages}
                                                className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Próximo
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <VendaModal
                showModal={showVendaModal}
                onClose={() => {
                    setShowVendaModal(false);
                    setSelectedVenda(null);
                }}
                onSuccess={handleVendaModalSuccess}
                venda={selectedVenda}
                mode={modalMode}
                imobiliarias={getImobiliariasParaModal()}
            />
        </>
    );
}