import type { DadosPorDia, MetasOperacionais } from "@/types";
import { CHAVE_STORAGE, METAS_PADRAO } from "@/lib/constantes";

function temWindow(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function lerJSON<T>(chave: string, fallback: T): T {
  if (!temWindow()) return fallback;
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto === null ? fallback : (JSON.parse(bruto) as T);
  } catch {
    return fallback;
  }
}

export function carregarDados(): DadosPorDia {
  return lerJSON<DadosPorDia>(CHAVE_STORAGE.dados, {});
}

export function salvarDados(dados: DadosPorDia): void {
  if (!temWindow()) return;
  window.localStorage.setItem(CHAVE_STORAGE.dados, JSON.stringify(dados));
}

export function carregarMetas(): MetasOperacionais {
  const salvas = lerJSON<Partial<MetasOperacionais>>(CHAVE_STORAGE.metas, {});
  const metas: MetasOperacionais = {
    unidades: { ...METAS_PADRAO.unidades, ...salvas.unidades },
    nf_faturada: { ...METAS_PADRAO.nf_faturada, ...salvas.nf_faturada },
    nf_embarcada: { ...METAS_PADRAO.nf_embarcada, ...salvas.nf_embarcada },
  };
  return metas;
}

export function salvarMetas(metas: MetasOperacionais): void {
  if (!temWindow()) return;
  window.localStorage.setItem(CHAVE_STORAGE.metas, JSON.stringify(metas));
}