export interface Cargo {
  id: number;
  nome: string;
  comissaoAutomatica: boolean;
}

export interface Imobiliaria {
  id: number;
  nome: string;
  meta?: number; // Adicionar meta como opcional
}

export interface Profissional {
  id: number;
  nome: string;
  idImobiliaria: number;
  imobiliaria: Imobiliaria;
  cargos: Cargo[];
}

export interface ProfissionalData {
  nome: string;
  idImobiliaria: number;
}

export interface ProfissionalCargo {
  id: string;
  idProfissional: number;
  idCargo: number;
  cargo?: Cargo;
}

// Interface para compatibilidade com modal (que ainda usa strings para alguns IDs)
export interface ImobiliariaModal {
  id: string;
  nome: string;
  meta: number;
}