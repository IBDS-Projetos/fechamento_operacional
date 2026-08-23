import type { DadosPorDia, MetasOperacionais, TipoMeta } from "@/types";
import { hojeISO } from "@/lib/datas";

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

/**
 * Penalidade (%) individual de um lançamento em relação ao prazo da meta.
 * - Lançado até o prazo: sem queda (0%).
 * - Lançado após o prazo: queda proporcional ao atraso sobre o tempo
 *   restante do dia — quanto mais tarde, maior a queda causada.
 */
function penalidadeLancamento(hora: string, prazoMinutos: number): number {
  const minuto = minutosDe(hora ?? "");
  if (!Number.isFinite(minuto) || minuto <= prazoMinutos) return 0;

  const atraso = minuto - prazoMinutos;
  const restanteDia = 24 * 60 - prazoMinutos;
  if (restanteDia <= 0) return 100;
  return Math.min(100, (atraso / restanteDia) * 100);
}

export function calcularEficiencia(
  dados: DadosPorDia,
  metas: MetasOperacionais,
  iso: string
): number {
  const registros = dados[iso] ?? [];

  // Sem dados no dia selecionado: velocímetro cheio (100%)
  if (registros.length === 0) return 100;

  const hoje = hojeISO();
  const agoraMinutos = horaAtualMinutos();
  const valores: number[] = [];

  // Cada meta é individual: avaliada pelo seu próprio prazo.
  // No dia vigente, uma meta cujo prazo ainda não chegou não entra no cálculo
  // (não pode ser julgada antes da hora), evitando mascarar as metas atrasadas.
  for (const { tipo } of METRICAS_META) {
    const cfg = metas[tipo];
    if (!cfg?.horario) continue;

    // Prazo 00:00 é tratado como meia-noite (fim do dia)
    const prazo = Math.min(minutosDe(cfg.horario) || 24 * 60, 24 * 60);
    if (iso === hoje && agoraMinutos < prazo) continue;

    const doTipo = registros.filter((r) => r.tipo === tipo);

    // Métrica sem lançamentos no dia: não penaliza (100%)
    if (doTipo.length === 0) {
      valores.push(100);
      continue;
    }

    // Cada lançamento após o prazo acumula uma queda no ponteiro desta
    // métrica: quanto mais tarde do horário marcado, mais ele cai.
    // Lançamentos no prazo não alteram. Mínimo de 0%.
    const queda = doTipo.reduce(
      (soma, l) => soma + penalidadeLancamento(l.hora, prazo),
      0
    );
    valores.push(Math.max(0, 100 - queda));
  }

  if (valores.length === 0) return 100;

  return Math.round(valores.reduce((s, v) => s + v, 0) / valores.length);
}
