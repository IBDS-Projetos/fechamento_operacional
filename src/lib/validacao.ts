import type { NovoLancamento } from "@/types";

export function validarLancamento(input: NovoLancamento): string | null {
  if (!Number.isFinite(input.quantidade) || input.quantidade <= 0) {
    return "Informe uma quantidade válida.";
  }
  if (!input.data) {
    return "Informe a data do lançamento.";
  }
  if (
    (input.tipo === "sac_oper" || input.tipo === "sac_clie") &&
    !input.motivo?.trim()
  ) {
    return "Selecione o motivo do SAC.";
  }
  return null;
}