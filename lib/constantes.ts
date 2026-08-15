import type { MetasOperacionais, TipoLancamento } from "@/types";
import type { IconeNome } from "@/components/ui/Icon";

export const TIPOS = {
  falta: { label: "Falta de Colaborador", cor: "#dc2626", icone: "falta" },
  unidades: { label: "Unidades Separadas", cor: "#2563eb", icone: "unidades" },
  nf_faturada: { label: "NFs Faturadas", cor: "#059669", icone: "nf_faturada" },
  nf_embarcada: { label: "NFs Embarcadas", cor: "#0d9488", icone: "nf_embarcada" },
  sac_oper: { label: "SAC (Operacional)", cor: "#7c3aed", icone: "sac_oper" },
  sac_clie: { label: "SAC (Cliente)", cor: "#d97706", icone: "atendimento" },
} as const satisfies Record<
  TipoLancamento,
  { label: string; cor: string; icone: IconeNome }
>;

export const TIPOS_OPERACIONAIS: TipoLancamento[] = [
  "falta",
  "unidades",
  "nf_faturada",
  "nf_embarcada",
];

export const TIPOS_SAC: TipoLancamento[] = ["sac_oper", "sac_clie"];

export const CHAVE_STORAGE = {
  dados: "fechOperacional:dados",
  motivos: "fechOperacional:motivos",
  metas: "fechOperacional:metas",
} as const;

export const MOTIVOS_PADRAO = ["Falta", "Sobra", "Avaria"] as const;

export const JANELA_TREND_DIAS = 14;

export const METAS_PADRAO = {
  unidades: { modo: "quantidade", meta: 0, horario: "18:00" },
  nf_faturada: { modo: "quantidade", meta: 0, horario: "18:00" },
  nf_embarcada: { modo: "quantidade", meta: 0, horario: "18:00" },
} as const satisfies MetasOperacionais;