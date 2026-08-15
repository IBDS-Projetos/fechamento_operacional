import type { DadosPorDia, MetaConfig, MetasOperacionais, TipoMeta } from "@/types";
import { somarPorDia } from "@/lib/agregacao";

export type NivelEficiencia = "ruim" | "baixa" | "boa" | "excelente";

export const NIVEIS_EFICIENCIA: Record<
  NivelEficiencia,
  { rotulo: string; cor: string; faixa: string }
> = {
  ruim: { rotulo: "Ruim", cor: "#dc2626", faixa: "0% a 40%" },
  baixa: { rotulo: "Baixa", cor: "#f97316", faixa: "40% a 65%" },
  boa: { rotulo: "Boa", cor: "#ca8a04", faixa: "65% a 85%" },
  excelente: { rotulo: "Excelente", cor: "#059669", faixa: "85% a 100%" },
};

export const METRICAS_META: { tipo: TipoMeta; rotulo: string }[] = [
  { tipo: "unidades", rotulo: "Unidades Separadas" },
  { tipo: "nf_faturada", rotulo: "NFs Faturadas" },
  { tipo: "nf_embarcada", rotulo: "NFs Embarcadas" },
];

export function nivelEficiencia(valor: number): NivelEficiencia {
  if (valor >= 85) return "excelente";
  if (valor >= 65) return "boa";
  if (valor >= 40) return "baixa";
  return "ruim";
}

function minutosDe(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function horaAtualMinutos(): number {
  const agora = new Date();
  return agora.getHours() * 60 + agora.getMinutes();
}

function eficienciaMetrica(atual: number, cfg: MetaConfig): number {
  if (cfg.meta <= 0) return 0;

  const progresso = Math.min(100, (atual / cfg.meta) * 100);

  if (cfg.modo === "quantidade") {
    return progresso;
  }

  const agora = horaAtualMinutos();
  const prazo = minutosDe(cfg.horario);
  if (prazo <= 0) return progresso;

  // Antes do prazo: o esperado cresce linearmente até a meta no horário limite.
  if (agora < prazo) {
    const esperado = Math.max(cfg.meta * (agora / prazo), 0.0001);
    return Math.min(100, Math.max(0, (atual / esperado) * 100));
  }

  // Passou do prazo: reduz a eficiência conforme o atraso, mesmo que a meta
  // já tenha sido atingida, derrubando o velocímetro em tempo real.
  const atrasoHoras = (agora - prazo) / 60;
  const penalidade = Math.min(0.85, atrasoHoras * 0.5);
  return Math.max(0, progresso * (1 - penalidade));
}

export function calcularEficiencia(
  dados: DadosPorDia,
  metas: MetasOperacionais,
  iso: string
): number {
  const pesos: number[] = [];
  const valores: number[] = [];

  for (const { tipo } of METRICAS_META) {
    const cfg = metas[tipo];
    if (cfg.meta <= 0) continue;
    const atual = somarPorDia(dados, iso, tipo);
    const eff = eficienciaMetrica(atual, cfg);
    pesos.push(cfg.meta);
    valores.push(eff);
  }

  if (pesos.length === 0) return 0;

  const somaPesos = pesos.reduce((s, v) => s + v, 0);
  const soma = valores.reduce((s, v, i) => s + v * pesos[i], 0);
  return Math.round(soma / somaPesos);
}