import type { DadosPorDia, MotivoSac, TipoLancamento } from "@/types";

export function registrosDoDia(dados: DadosPorDia, iso: string) {
  return dados[iso] ?? [];
}

export function somarPorDia(
  dados: DadosPorDia,
  iso: string,
  tipo: TipoLancamento
): number {
  return registrosDoDia(dados, iso)
    .filter((r) => r.tipo === tipo)
    .reduce((soma, r) => soma + r.quantidade, 0);
}

export function somarTotal(dados: DadosPorDia, tipo: TipoLancamento): number {
  return Object.values(dados)
    .flat()
    .filter((r) => r.tipo === tipo)
    .reduce((soma, r) => soma + r.quantidade, 0);
}

export function totalRegistros(dados: DadosPorDia, iso: string): number {
  return registrosDoDia(dados, iso).length;
}

export function serieTrend(
  dados: DadosPorDia,
  dias: string[],
  tipo: TipoLancamento
): number[] {
  return dias.map((iso) => somarPorDia(dados, iso, tipo));
}

export function motivosPorDia(
  dados: DadosPorDia,
  iso: string
): MotivoSac[] {
  const mapa = new Map<string, MotivoSac>();
  for (const r of registrosDoDia(dados, iso)) {
    if (r.tipo !== "sac_oper" && r.tipo !== "sac_clie") continue;
    const nome = r.motivo ?? "Sem motivo";
    const atual = mapa.get(nome) ?? { nome, oper: 0, clie: 0 };
    if (r.tipo === "sac_oper") atual.oper += r.quantidade;
    else atual.clie += r.quantidade;
    mapa.set(nome, atual);
  }
  return [...mapa.values()].sort(
    (a, b) => b.oper + b.clie - (a.oper + a.clie)
  );
}