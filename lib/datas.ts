export function toISO(data: Date): string {
  const y = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, "0");
  const d = String(data.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function hojeISO(): string {
  return toISO(new Date());
}

export function somarDias(iso: string, dias: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const data = new Date(y, m - 1, d + dias);
  return toISO(data);
}

export function formatarData(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function formatarDiaMes(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export function diaDaSemana(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return DIAS[new Date(y, m - 1, d).getDay()];
}

export function ultimosNDias(n: number, fim?: string): string[] {
  const fimISO = fim ?? hojeISO();
  const arr: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    arr.push(somarDias(fimISO, -i));
  }
  return arr;
}

export function formatarNumero(valor: number): string {
  return new Intl.NumberFormat("pt-BR").format(valor);
}

export function horaAtual(): string {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}