export type TipoLancamento =
  | "falta"
  | "unidades"
  | "nf_faturada"
  | "nf_embarcada"
  | "sac_oper"
  | "sac_clie";

export type TipoSac = Extract<TipoLancamento, "sac_oper" | "sac_clie">;

export interface Lancamento {
  id: number;
  tipo: TipoLancamento;
  motivo: string | null;
  quantidade: number;
  hora: string;
}

export type DadosPorDia = Record<string, Lancamento[]>;

export interface NovoLancamento {
  tipo: TipoLancamento;
  motivo: string | null;
  quantidade: number;
  data: string;
}

export interface LancamentoImportado {
  data: string;
  tipo: TipoLancamento;
  motivo: string | null;
  quantidade: number;
  hora: string;
}

export interface MotivoSac {
  nome: string;
  oper: number;
  clie: number;
}

export type TipoMeta = "unidades" | "nf_faturada" | "nf_embarcada";

export interface MetaConfig {
  horario: string;
}

export type MetasOperacionais = Record<TipoMeta, MetaConfig>;