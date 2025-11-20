'use client';

import { useState, useEffect } from 'react';
import { dashboardService, DashboardData, ComissaoPorCargo } from '@/app/services/dashboard';

interface Imobiliaria {
  id: string;
  nome: string;
  meta: number;
}

export default function Home() {
  const [imobiliarias, setImobiliarias] = useState<Imobiliaria[]>([]);
  const [selectedImobiliaria, setSelectedImobiliaria] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingImobiliarias, setLoadingImobiliarias] = useState(true);
  const [error, setError] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<string>('2025-01-01');
  const [dataFim, setDataFim] = useState<string>('2025-12-31');

  // Carregar lista de imobiliárias ao inicializar
  useEffect(() => {
    const fetchImobiliarias = async () => {
      try {
        const data = await dashboardService.getImobiliarias();
        setImobiliarias(data);
        
        // Selecionar primeira imobiliária por padrão
        if (data.length > 0) {
          setSelectedImobiliaria(data[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar imobiliárias:', error);
      } finally {
        setLoadingImobiliarias(false);
      }
    };

    fetchImobiliarias();
  }, []);

  // Carregar dados do dashboard quando imobiliária for selecionada ou período mudar
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedImobiliaria) return;

      setLoading(true);
      setError('');
      try {
        const data = await dashboardService.getDashboardDataByPeriod(selectedImobiliaria, dataInicio, dataFim);
        console.log('Dashboard data received:', data); // Debug log
        setDashboardData(data);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedImobiliaria, dataInicio, dataFim]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatValue = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return formatCurrency(value);
  };

  const getValueColor = (value: number | null | undefined, defaultColor: string) => {
    if (value === null || value === undefined) {
      return 'text-gray-400';
    }
    return defaultColor;
  };

  if (loadingImobiliarias) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-lg">Carregando imobiliárias...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-6">
      <div className="mb-6">
        
        {/* Seletor de Imobiliária */}
        <div className="mb-6">
          <label htmlFor="imobiliaria" className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Imobiliária:
          </label>
          <select
            id="imobiliaria"
            value={selectedImobiliaria}
            onChange={(e) => setSelectedImobiliaria(e.target.value)}
            className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecione uma imobiliária</option>
            {imobiliarias.map((imob) => (
              <option key={imob.id} value={imob.id}>
                {imob.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Período */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-300">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Filtrar por Período</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-2">
                  Data Início:
                </label>
                <input
                  type="date"
                  id="dataInicio"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fim:
                </label>
                <input
                  type="date"
                  id="dataFim"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            {/* Botões de período rápido */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const hoje = new Date();
                  const inicioAno = `${hoje.getFullYear()}-01-01`;
                  const fimAno = `${hoje.getFullYear()}-12-31`;
                  setDataInicio(inicioAno);
                  setDataFim(fimAno);
                }}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Este Ano
              </button>
              <button
                onClick={() => {
                  const hoje = new Date();
                  const inicioMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
                  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
                  const fimMesStr = `${fimMes.getFullYear()}-${String(fimMes.getMonth() + 1).padStart(2, '0')}-${String(fimMes.getDate()).padStart(2, '0')}`;
                  setDataInicio(inicioMes);
                  setDataFim(fimMesStr);
                }}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Este Mês
              </button>
              <button
                onClick={() => {
                  const hoje = new Date();
                  const inicioTrimestre = new Date(hoje.getFullYear(), Math.floor(hoje.getMonth() / 3) * 3, 1);
                  const fimTrimestre = new Date(hoje.getFullYear(), Math.floor(hoje.getMonth() / 3) * 3 + 3, 0);
                  const inicioTrimestreStr = `${inicioTrimestre.getFullYear()}-${String(inicioTrimestre.getMonth() + 1).padStart(2, '0')}-01`;
                  const fimTrimestreStr = `${fimTrimestre.getFullYear()}-${String(fimTrimestre.getMonth() + 1).padStart(2, '0')}-${String(fimTrimestre.getDate()).padStart(2, '0')}`;
                  setDataInicio(inicioTrimestreStr);
                  setDataFim(fimTrimestreStr);
                }}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Este Trimestre
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
          {/* <h1 className="text-3xl font-bold text-gray-800">Dashboard - ImobiGest</h1> */}
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            📅 Período: {new Date(dataInicio).toLocaleDateString('pt-BR')} - {new Date(dataFim).toLocaleDateString('pt-BR')}
          </div>
        </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Carregando dados...</div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-red-600">
            Erro: {error}
          </div>
        </div>
      ) : dashboardData && dashboardData.resumo ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Meta da Imobiliária */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Meta da Imobiliária</h3>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(dashboardData.resumo?.metaImobiliaria || 0)}
            </div>
          </div>

          {/* Falta para Meta */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Falta para Meta</h3>
            <div className={`text-2xl font-bold ${getValueColor(dashboardData.resumo?.faltaParaMeta, 'text-red-600')}`}>
              {formatValue(dashboardData.resumo?.faltaParaMeta)}
            </div>
          </div>

          {/* Comissão Geral Total */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Comissão Geral Total</h3>
            <div className={`text-2xl font-bold ${getValueColor(dashboardData.resumo?.comissaoGeralTotal, 'text-green-600')}`}>
              {formatValue(dashboardData.resumo?.comissaoGeralTotal)}
            </div>
          </div>

          {/* Comissões por Cargo - Dinâmicas */}
          {dashboardData.comissoesPorCargo?.map((comissao, index) => {
            const colors = ['text-purple-600', 'text-indigo-600', 'text-orange-600', 'text-pink-600', 'text-cyan-600'];
            const colorClass = colors[index % colors.length];
            
            return (
              <div key={comissao.nomeCargo} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Comissão {comissao.nomeCargo}</h3>
                <div className={`text-2xl font-bold ${getValueColor(comissao.valorComissao, colorClass)}`}>
                  {formatValue(comissao.valorComissao)}
                </div>
              </div>
            );
          })}

          {/* Média Mensal do Período (Comissão) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Média Mensal do Período</h3>
            <p className="text-sm text-gray-500 mb-2">(Comissão Geral)</p>
            <div className={`text-2xl font-bold ${getValueColor(dashboardData.medias?.mensalAnoComissao, 'text-teal-600')}`}>
              {formatValue(dashboardData.medias?.mensalAnoComissao)}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-500">
            {selectedImobiliaria ? 'Nenhum dado encontrado' : 'Selecione uma imobiliária para ver os dados'}
          </div>
        </div>
      )}
    </div>
  );
}