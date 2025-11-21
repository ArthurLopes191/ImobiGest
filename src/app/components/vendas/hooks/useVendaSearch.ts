'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { VendaFilters } from '../vendaFilters/VendaFilters';
import { Venda } from '@/types/venda';

interface UseVendaSearchResult {
  vendas: Venda[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  appliedFilters: VendaFilters;
  applyFilters: (filters: VendaFilters) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  refresh: () => void;
}

interface UseVendaSearchOptions {
  itemsPerPage?: number;
  initialFilters?: VendaFilters;
}

export function useVendaSearch(options: UseVendaSearchOptions = {}): UseVendaSearchResult {
  const { itemsPerPage = 10, initialFilters = {} } = options;
  
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState<VendaFilters>(initialFilters);

  const getCookieValue = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Função para filtrar localmente quando o endpoint de busca não existir
  const applyLocalFilters = useCallback((vendas: Venda[], searchFilters: VendaFilters): Venda[] => {
    return vendas.filter(venda => {
      // Filtro por descrição
      if (searchFilters.descricao && 
          !venda.descricaoImovel.toLowerCase().includes(searchFilters.descricao.toLowerCase())) {
        return false;
      }

      // Filtro por valor mínimo
      if (searchFilters.valorMin && venda.valorTotal < searchFilters.valorMin) {
        return false;
      }

      // Filtro por valor máximo
      if (searchFilters.valorMax && venda.valorTotal > searchFilters.valorMax) {
        return false;
      }

      // Filtro por data inicial
      if (searchFilters.dataInicio) {
        const vendaDate = new Date(venda.dataVenda).toISOString().split('T')[0];
        if (vendaDate < searchFilters.dataInicio) {
          return false;
        }
      }

      // Filtro por data final
      if (searchFilters.dataFim) {
        const vendaDate = new Date(venda.dataVenda).toISOString().split('T')[0];
        if (vendaDate > searchFilters.dataFim) {
          return false;
        }
      }

      // Filtro por forma de pagamento
      if (searchFilters.formaPagamento && venda.formaPagamento !== searchFilters.formaPagamento) {
        return false;
      }

      // Filtro por imobiliária
      if (searchFilters.idImobiliaria && venda.idImobiliaria !== searchFilters.idImobiliaria) {
        return false;
      }

      // NOTA: Os filtros por profissional e status de parcela precisam ser implementados
      // no backend, pois requerem joins com as tabelas de comissões e parcelas
      // Por enquanto, retornamos todas as vendas para esses filtros em modo local

      return true;
    });
  }, []);

  const buildQueryString = useCallback((searchFilters: VendaFilters, page: number): string => {
    const params = new URLSearchParams();
    
    // Adicionar filtros (apenas se tiverem valor válido)
    if (searchFilters.descricao && searchFilters.descricao.trim() !== '') {
      params.append('descricao', searchFilters.descricao.trim());
    }
    
    if (searchFilters.valorMin !== undefined && searchFilters.valorMin > 0) {
      params.append('valorMin', searchFilters.valorMin.toString());
    }
    
    if (searchFilters.valorMax !== undefined && searchFilters.valorMax > 0) {
      params.append('valorMax', searchFilters.valorMax.toString());
    }
    
    if (searchFilters.dataInicio && searchFilters.dataInicio !== '') {
      params.append('dataInicio', searchFilters.dataInicio);
    }
    
    if (searchFilters.dataFim && searchFilters.dataFim !== '') {
      params.append('dataFim', searchFilters.dataFim);
    }
    
    if (searchFilters.formaPagamento) {
      params.append('formaPagamento', searchFilters.formaPagamento);
    }
    
    if (searchFilters.idImobiliaria !== undefined && searchFilters.idImobiliaria > 0) {
      params.append('idImobiliaria', searchFilters.idImobiliaria.toString());
    }
    
    if (searchFilters.idProfissional !== undefined && searchFilters.idProfissional > 0) {
      params.append('idProfissional', searchFilters.idProfissional.toString());
    }
    
    if (searchFilters.statusParcela) {
      params.append('statusParcela', searchFilters.statusParcela);
    }
    
    // Adicionar paginação (Spring Boot usa page baseado em 0)
    params.append('page', (page - 1).toString());
    params.append('limit', itemsPerPage.toString());
    
    // Ordenação padrão
    params.append('sortBy', 'valorTotal');
    params.append('sortOrder', 'DESC');
    
    return params.toString();
  }, [itemsPerPage]);

  const searchVendas = useCallback(async (searchFilters: VendaFilters, page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getCookieValue('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Primeiro, tentar o endpoint de busca com filtros
      const queryString = buildQueryString(searchFilters, page);
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/venda/search?${queryString}`;

      console.log('🔍 Buscando vendas com filtros:', url);
      console.log('📊 Filtros aplicados:', searchFilters);

      let response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Se o endpoint de busca não existir (404) ou não for autorizado (403), usar o endpoint padrão
      if (response.status === 404 || response.status === 403) {
        console.log(`⚠️ Endpoint /venda/search não disponível (${response.status}), usando /venda com filtros locais`);
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/venda`;
        response = await fetch(url, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (!response.ok) {
        throw new Error(`Erro ao buscar vendas: Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 Resposta da API:', data);
      
      // Se estamos usando o endpoint de busca (/venda/search)
      if (response.url.includes('/search')) {
        // Estrutura Spring Boot: { content: [], pageable: {pageNumber, pageSize}, totalElements, totalPages }
        const vendasArray = Array.isArray(data.content) ? data.content : [];
        
        setVendas(vendasArray);
        setTotalItems(data.totalElements || 0);
        setCurrentPage((data.pageable?.pageNumber || 0) + 1); // Converter de 0-based para 1-based
      } else {
        // Endpoint padrão (/venda) - aplicar filtros localmente
        let vendasArray = Array.isArray(data.vendas) ? data.vendas : 
                         Array.isArray(data.data) ? data.data : 
                         Array.isArray(data) ? data : [];
        
        vendasArray = applyLocalFilters(vendasArray, searchFilters);
        const startIndex = (page - 1) * itemsPerPage;
        const totalFiltered = vendasArray.length;
        vendasArray = vendasArray.slice(startIndex, startIndex + itemsPerPage);
        
        setVendas(vendasArray);
        setTotalItems(totalFiltered);
        setCurrentPage(page);
      }
      
    } catch (err) {
      console.error('❌ Erro ao buscar vendas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao buscar vendas');
      setVendas([]); // Garantir que seja sempre um array
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryString]);

  // Buscar vendas quando filtros aplicados ou página mudarem
  useEffect(() => {
    searchVendas(appliedFilters, currentPage);
  }, [appliedFilters, currentPage, searchVendas]);

  // Função para aplicar filtros (reseta para página 1)
  const applyFilters = useCallback((newFilters: VendaFilters) => {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  }, []);

  // Função para limpar filtros
  const clearFilters = useCallback(() => {
    setAppliedFilters({});
    setCurrentPage(1);
  }, []);

  // Função para mudar página
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Função para refazer a busca
  const refresh = useCallback(() => {
    searchVendas(appliedFilters, currentPage);
  }, [searchVendas, appliedFilters, currentPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    vendas,
    isLoading,
    error,
    totalItems,
    totalPages,
    currentPage,
    appliedFilters,
    applyFilters,
    clearFilters,
    setPage,
    refresh
  };
}

// Hook para carregar dados auxiliares (imobiliárias e profissionais)
export function useVendaSearchData() {
  const [imobiliarias, setImobiliarias] = useState<Array<{id: string; nome: string}>>([]);
  const [profissionais, setProfissionais] = useState<Array<{id: number; nome: string}>>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const getCookieValue = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getCookieValue('token');
        if (!token) return;

        const [imobiliariasRes, profissionaisRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/imobiliaria`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/profissional`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (imobiliariasRes.ok) {
          const imobiliariasData = await imobiliariasRes.json();
          setImobiliarias(imobiliariasData.map((i: any) => ({
            id: i.id.toString(),
            nome: i.nome
          })));
        }

        if (profissionaisRes.ok) {
          const profissionaisData = await profissionaisRes.json();
          setProfissionais(profissionaisData.map((p: any) => ({
            id: p.id,
            nome: p.nome
          })));
        }

      } catch (err) {
        console.error('❌ Erro ao carregar dados auxiliares:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  return { imobiliarias, profissionais, isLoadingData };
}