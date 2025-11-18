import { authService } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface DashboardData {
  imobiliaria: {
    id: string;
    nome: string;
    meta: number;
  };
  resumo: {
    metaImobiliaria: number;
    faltaParaMeta: number;
    comissaoGeralTotal: number;
    comissaoGeralEquipe: number;
    comissaoSocios: number;
    comissaoCorretores: number;
  };
  medias: {
    mensalAnoEquipe: number;
    periodoEquipe: number;
    mensalAnoComissao: number;
    periodoComissao: number;
  };
  periodo: {
    ano: number;
    mes: number;
    dataInicio: string;
    dataFim: string;
  };
}

// Interface para os dados que vêm da API
interface ApiDashboardResponse {
  metaImobiliaria: number;
  valorParaMeta: number;
  comissaoGeralTotal: number;
  comissaoGeralEquipe: number | null;
  comissaoSocios: number;
  comissaoCorretores: number;
  mediaMensalAnoComissao: number | null;
  mediaPeriodoComissao: number | null;
  mediaPeriodoEquipe: number | null;
  mediasMensalAnoEquipe: number | null;
}

export const dashboardService = {
  async getDashboardData(imobiliariaId: string, periodo?: string): Promise<DashboardData> {
    try {
      const url = periodo 
        ? `/dashboard/${imobiliariaId}?periodo=${periodo}`
        : `/dashboard/${imobiliariaId}`;
      
      console.log('Fazendo requisição para:', `${API_BASE_URL}${url}`); // Debug log
      
      const response = await authService.authenticatedRequest(url, {
        method: 'GET',
      });


      if (!response.ok) {
        const errorText = await response.text();
        
        // Se o endpoint não existe (404), retornar dados mock
        if (response.status === 404) {
          console.log('Endpoint não encontrado, retornando dados mock');
          return this.getMockDashboardData(imobiliariaId);
        }
        
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const apiData: ApiDashboardResponse = await response.json();
      
      return this.transformApiDataToDashboard(apiData, imobiliariaId);
    } catch (error) {
      
      // Se der erro de rede ou endpoint não existe, usar mock
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log('Erro de rede, retornando dados mock');
        return this.getMockDashboardData(imobiliariaId);
      }
      
      throw new Error(error instanceof Error ? error.message : 'Erro ao buscar dados do dashboard');
    }
  },

  async getDashboardDataByPeriod(imobiliariaId: string, dataInicio: string, dataFim: string): Promise<DashboardData> {
    try {
      const url = `/dashboard/periodo/${imobiliariaId}?dataInicio=${dataInicio}&dataFim=${dataFim}`;
      
      console.log('Fazendo requisição para período:', `${API_BASE_URL}${url}`); // Debug log
      
      const response = await authService.authenticatedRequest(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const apiData: ApiDashboardResponse = await response.json();
      
      return this.transformApiDataToDashboard(apiData, imobiliariaId, dataInicio, dataFim);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao buscar dados do dashboard por período');
    }
  },

  async transformApiDataToDashboard(apiData: ApiDashboardResponse, imobiliariaId: string, dataInicio?: string, dataFim?: string): Promise<DashboardData> {
    // Buscar dados da imobiliária para ter nome completo
    const imobiliarias = await this.getImobiliarias();
    const imobiliaria = imobiliarias.find((imob: any) => imob.id.toString() === imobiliariaId);
    
    const currentDate = new Date();
    
    // Transformar dados da API para a estrutura esperada pelo frontend
    const transformedData: DashboardData = {
      imobiliaria: {
        id: imobiliariaId,
        nome: imobiliaria?.nome || 'Imobiliária',
        meta: apiData.metaImobiliaria
      },
      resumo: {
        metaImobiliaria: apiData.metaImobiliaria,
        faltaParaMeta: apiData.valorParaMeta,
        comissaoGeralTotal: apiData.comissaoGeralTotal,
        comissaoGeralEquipe: apiData.comissaoGeralEquipe || 0,
        comissaoSocios: apiData.comissaoSocios,
        comissaoCorretores: apiData.comissaoCorretores
      },
      medias: {
        mensalAnoEquipe: apiData.mediasMensalAnoEquipe || 0,
        periodoEquipe: apiData.mediaPeriodoEquipe || 0,
        mensalAnoComissao: apiData.mediaMensalAnoComissao || 0,
        periodoComissao: apiData.mediaPeriodoComissao || 0
      },
      periodo: {
        ano: dataInicio ? new Date(dataInicio).getFullYear() : currentDate.getFullYear(),
        mes: dataInicio ? new Date(dataInicio).getMonth() + 1 : currentDate.getMonth() + 1,
        dataInicio: dataInicio || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`,
        dataFim: dataFim || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-30`
      }
    };
    
    return transformedData;
  },

  getMockDashboardData(imobiliariaId: string): DashboardData {
    const currentDate = new Date();
    return {
      imobiliaria: {
        id: imobiliariaId,
        nome: "Imobiliária Teste",
        meta: 150000.00
      },
      resumo: {
        metaImobiliaria: 150000.00,
        faltaParaMeta: 45000.00,
        comissaoGeralTotal: 105000.00,
        comissaoGeralEquipe: 80000.00,
        comissaoSocios: 25000.00,
        comissaoCorretores: 55000.00
      },
      medias: {
        mensalAnoEquipe: 12500.00,
        periodoEquipe: 15200.00,
        mensalAnoComissao: 9800.00,
        periodoComissao: 11400.00
      },
      periodo: {
        ano: currentDate.getFullYear(),
        mes: currentDate.getMonth() + 1,
        dataInicio: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`,
        dataFim: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-30`
      }
    };
  },

  async getImobiliarias() {
    try {
      console.log('Buscando imobiliárias...'); // Debug log
      
      const response = await authService.authenticatedRequest('/imobiliaria', {
        method: 'GET',
      });

      console.log('Imobiliárias response status:', response.status); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Imobiliárias error response:', errorText); // Debug log
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Imobiliárias data:', data); // Debug log
      
      return data;
    } catch (error) {
      console.error('Imobiliárias service error:', error); // Debug log
      throw new Error(error instanceof Error ? error.message : 'Erro ao buscar imobiliárias');
    }
  }
};