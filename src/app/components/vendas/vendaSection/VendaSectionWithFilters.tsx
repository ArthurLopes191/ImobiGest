'use client';

import { useState, useEffect, useCallback } from 'react';
import VendaModal from '@/app/components/vendas/vendaModal/VendaModal';
import VendaFilters from '@/app/components/vendas/vendaFilters/VendaFilters';
import ParcelaInfo from './ParcelaInfo';
import { useVendaSearch, useVendaSearchData } from '@/app/components/vendas/hooks/useVendaSearch';
import { Venda, VendaSectionProps, ImobiliariaVenda, VendaModalMode } from '@/types/venda';

interface Imobiliaria {
    id: number;
    nome: string;
    meta: number;
}

export default function VendaSection({ onVendaClick }: VendaSectionProps) {
    const [showVendaModal, setShowVendaModal] = useState(false);
    const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);
    const [modalMode, setModalMode] = useState<VendaModalMode>('create');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Dados auxiliares para filtros
    const { imobiliarias, profissionais } = useVendaSearchData();

    // Estado de busca com filtros
    const {
        vendas,
        isLoading: isLoadingVendas,
        error: searchError,
        totalItems,
        totalPages,
        currentPage,
        appliedFilters,
        applyFilters,
        clearFilters,
        setPage,
        refresh
    } = useVendaSearch({ itemsPerPage: 10 });

    // Estados para dados auxiliares (para o modal)
    const [imobiliariasModal, setImobiliariasModal] = useState<Imobiliaria[]>([]);
    const [comissoes, setComissoes] = useState<Array<{ id: number; nome: string; idVenda: number; tipoComissao: string; idProfissional: number }>>([]);
    const [profissionaisModal, setProfissionaisModal] = useState<Array<{ id: number; nome: string }>>([]);

    const getCookieValue = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    };

    // Carregar dados auxiliares para o modal
    const loadAuxiliaryData = useCallback(async () => {
        try {
            const token = getCookieValue('token');
            if (!token) return;

            const [imobiliariasRes, profissionaisRes, comissoesRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/imobiliaria`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/profissional`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/comissao`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (imobiliariasRes.ok) {
                const imobiliariasData = await imobiliariasRes.json();
                setImobiliariasModal(imobiliariasData);
            }

            if (profissionaisRes.ok) {
                const profissionaisData = await profissionaisRes.json();
                setProfissionaisModal(profissionaisData);
            }

            if (comissoesRes.ok) {
                const comissoesData = await comissoesRes.json();
                setComissoes(comissoesData);
            }

        } catch (err) {
            console.error('❌ Erro ao carregar dados auxiliares:', err);
        }
    }, []);

    useEffect(() => {
        loadAuxiliaryData();
    }, [loadAuxiliaryData]);

    const handleVendaModalSuccess = () => {
        refresh(); // Refaz a busca atual com os mesmos filtros
        loadAuxiliaryData(); // Recarrega dados auxiliares
        setRefreshTrigger(prev => prev + 1);
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

    const getImobiliariasParaModal = (): ImobiliariaVenda[] => {
        return imobiliariasModal.map((imobiliaria) => ({
            id: imobiliaria.id.toString(),
            nome: imobiliaria.nome
        }));
    };

    const getImobiliariaNome = (idImobiliaria: number): string => {
        const imobiliaria = imobiliariasModal.find(i => i.id === idImobiliaria);
        return imobiliaria?.nome || 'Imobiliária não encontrada';
    };

    const getVendedores = (venda: Venda): string => {
        const comissoesVenda = comissoes.filter(comissao => 
            comissao.idVenda === parseInt(venda.id) &&
            comissao.tipoComissao === 'MANUAL'
        );

        if (!comissoesVenda || comissoesVenda.length === 0) {
            return 'Sem vendedor';
        }

        const vendedores = comissoesVenda
            .map(comissao => {
                const profissional = profissionaisModal.find(prof => prof.id === comissao.idProfissional);
                return profissional?.nome;
            })
            .filter(nome => nome)
            .filter((nome, index, array) => array.indexOf(nome) === index)
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

    const goToPrevious = () => {
        if (currentPage > 1) {
            setPage(currentPage - 1);
        }
    };

    const goToNext = () => {
        if (currentPage < totalPages) {
            setPage(currentPage + 1);
        }
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
            {/* Filtros */}
            <VendaFilters
                appliedFilters={appliedFilters}
                onApplyFilters={applyFilters}
                imobiliarias={imobiliarias}
                profissionais={profissionais}
                isLoading={isLoadingVendas}
                onClearFilters={clearFilters}
            />

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
                            Vendas Cadastradas
                        </h1>
                        {totalItems > 0 && (
                            <span className="text-sm text-gray-500">
                                ({totalItems} {totalItems === 1 ? 'venda' : 'vendas'})
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleNewVenda}
                        className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap text-sm sm:text-base w-full sm:w-auto"
                    >
                        Nova Venda
                    </button>
                </div>

                {/* Mensagem de erro */}
                {searchError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                        <p className="font-medium">Erro ao buscar vendas:</p>
                        <p className="text-sm">{searchError}</p>
                        <button
                            onClick={refresh}
                            className="mt-2 text-sm underline hover:no-underline"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                <div className="mt-6">
                    {isLoadingVendas ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-500">Buscando vendas...</p>
                        </div>
                    ) : vendas.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                            <p>Nenhuma venda encontrada</p>
                            <p className="text-sm mt-1">
                                {Object.keys(appliedFilters).length > 0 ? 'Tente ajustar os filtros' : 'Clique em "Nova Venda" para criar a primeira'}
                            </p>
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
                                    {Array.isArray(vendas) && vendas.map((venda, index) => (
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
                                {Array.isArray(vendas) && vendas.map((venda) => (
                                    <div
                                        key={venda.id}
                                        onClick={() => handleEditVenda(venda)}
                                        className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                                    >
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="font-medium text-gray-800 text-sm">
                                                    {venda.descricaoImovel}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {getFormaPagamentoLabel(venda.formaPagamento)}
                                                </p>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-green-600">
                                                    {formatCurrency(venda.valorTotal)}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {formatDate(venda.dataVenda)}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Imobiliária:</span>
                                                    <span className="font-medium text-blue-600">
                                                        {getImobiliariaNome(venda.idImobiliaria)}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Vendedores:</span>
                                                    <span className="font-medium">
                                                        {getVendedores(venda)}
                                                    </span>
                                                </div>

                                                {venda.formaPagamento === 'PARCELADO' && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Parcelas:</span>
                                                        <ParcelaInfo
                                                            vendaId={venda.id}
                                                            formaPagamento={venda.formaPagamento}
                                                            refreshTrigger={refreshTrigger}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Paginação */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                                    <div className="text-sm text-gray-600">
                                        Mostrando {vendas.length} de {totalItems} vendas
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={goToPrevious}
                                            disabled={currentPage === 1}
                                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Anterior
                                        </button>

                                        <div className="flex space-x-1">
                                            {getVisiblePages().map((page, index) =>
                                                page === '...' ? (
                                                    <span key={index} className="px-3 py-2 text-sm text-gray-400">
                                                        ...
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        onClick={() => setPage(Number(page))}
                                                        className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === page
                                                                ? 'bg-blue-600 text-white'
                                                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            )}
                                        </div>

                                        <button
                                            onClick={goToNext}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Próximo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal */}
            <VendaModal
                showModal={showVendaModal}
                onClose={() => setShowVendaModal(false)}
                onSuccess={handleVendaModalSuccess}
                venda={selectedVenda}
                mode={modalMode}
                imobiliarias={getImobiliariasParaModal()}
            />
        </>
    );
}