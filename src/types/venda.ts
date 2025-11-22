export interface Venda {
  id: string;
  descricaoImovel: string;
  valorTotal: number;
  dataVenda: string;
  formaPagamento: 'A_VISTA' | 'PARCELADO';
  qtdParcelas: number;
  compradorNome: string;
  compradorContato: string;
  idImobiliaria: number;
  imobiliaria?: {
    nome: string;
  };
}

export interface VendaData {
  descricaoImovel: string;
  valorTotal: number;
  dataVenda: string;
  formaPagamento: 'A_VISTA' | 'PARCELADO';
  qtdParcelas: number;
  compradorNome: string;
  compradorContato: string;
  idImobiliaria: number;
}

// Interface para compatibilidade com modal de imobiliária
export interface ImobiliariaVenda {
  id: string;
  nome: string;
}

// Interfaces para comissão relacionada à venda
export interface ComissaoVenda {
  id: string;
  idVenda: number;
  idProfissional: number;
  idsCargos: number[];
  tipoComissao: TipoComissao;
  profissional?: {
    id: number;
    nome: string;
    cargos: CargoComissao[];
  };
}

export interface CargoComissao {
  id: number;
  nome: string;
  comissaoAutomatica: boolean;
}

// Interfaces para parcelas
export interface Parcela {
  id?: number;
  numeroParcela: number;
  valorParcela: number;
  dataVencimento: string;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
  idVenda: number;
}

export interface ParcelaData {
  numeroParcela: number;
  valorParcela: number;
  dataVencimento: string;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
  idVenda: number;
}

export interface ParcelaFormProps {
  vendaId?: string;
  valorTotal: number;
  qtdParcelas: number;
  dataVenda: string;
  formaPagamento: 'A_VISTA' | 'PARCELADO';
  onParcelasChange?: (parcelas: Parcela[]) => void;
}

export interface ProfissionalComissao {
  id: number;
  nome: string;
  cargos: CargoComissao[];
  idImobiliaria?: number; // Para compatibilidade com diferentes estruturas da API
  imobiliaria?: {
    id: number;
    nome: string;
  };
}

export interface ComissaoData {
  profissionais: Array<{
    idProfissional: number;
    idsCargos: number[];
  }>;
}

export interface ComissaoPayload {
  idVenda: number;
  profissionais: Array<{
    idProfissional: number;
    idsCargos: number[];
  }>;
}

// Tipos para formulários de venda
export type FormaPagamento = 'A_VISTA' | 'PARCELADO';

export type TipoComissao = 'AUTOMATICA' | 'MANUAL';

export type VendaModalMode = 'create' | 'edit';

// Interface para props do modal de venda
export interface VendaModalProps {
  showModal: boolean;
  onClose: () => void;
  onSuccess: () => void;
  venda?: Venda | null;
  mode: VendaModalMode;
  imobiliarias: ImobiliariaVenda[];
}

// Interface para props da seção de vendas
export interface VendaSectionProps {
  onVendaClick?: (venda: Venda) => void;
}

// Interface para filtros e busca de vendas
export interface VendaFilters {
  imobiliaria?: number;
  dataInicio?: string;
  dataFim?: string;
  formaPagamento?: FormaPagamento;
  valorMinimo?: number;
  valorMaximo?: number;
}

// Interface para relatórios de vendas
export interface RelatorioVenda {
  totalVendas: number;
  valorTotal: number;
  vendasPorImobiliaria: VendaPorImobiliaria[];
  vendasPorMes: VendaPorMes[];
}

export interface VendaPorImobiliaria {
  imobiliaria: string;
  quantidade: number;
  valorTotal: number;
}

export interface VendaPorMes {
  mes: string;
  quantidade: number;
  valorTotal: number;
}