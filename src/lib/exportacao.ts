import type {
  DadosPorDia,
  Lancamento,
  LancamentoImportado,
  TipoLancamento,
} from "@/types";
import { TIPOS } from "@/lib/constantes";
import { formatarData, hojeISO } from "@/lib/datas";

function escaparCSV(valor: string | number): string {
  const texto = String(valor);
  if (/[",;\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

const CABECALHO: (string | number)[] = [
  "Data",
  "Lançamento",
  "Motivo",
  "Quantidade",
  "Hora",
];

function baixarCSV(linhas: (string | number)[][], nomeArquivo: string): void {
  const csv = linhas
    .map((linha) => linha.map(escaparCSV).join(";"))
    .join("\r\n");

  const blob = new Blob(["\ufeff" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function linhaRegistro(iso: string, r: Lancamento): (string | number)[] {
  return [
    formatarData(iso),
    TIPOS[r.tipo].label,
    r.motivo ?? "",
    r.quantidade,
    r.hora,
  ];
}

const MOTIVO_EXEMPLO_FALTA = "Falta";

/** Exporta apenas os lançamentos do dia informado (filtro vigente). */
export function exportarDiaCSV(dados: DadosPorDia, iso: string): number {
  const registros = [...(dados[iso] ?? [])].sort((a, b) => a.id - b.id);
  const linhas: (string | number)[][] = [CABECALHO];
  for (const r of registros) linhas.push(linhaRegistro(iso, r));
  if (registros.length > 0) {
    baixarCSV(linhas, `lancamentos-${iso}.csv`);
  }
  return registros.length;
}

export function exportarHistoricoCSV(dados: DadosPorDia): void {
  const linhas: (string | number)[][] = [CABECALHO];

  Object.keys(dados)
    .sort()
    .forEach((iso) => {
      [...dados[iso]]
        .sort((a, b) => a.id - b.id)
        .forEach((r) => {
          linhas.push(linhaRegistro(iso, r));
        });
    });

  baixarCSV(
    linhas,
    `historico-operacional-${new Date().toISOString().slice(0, 10)}.csv`
  );
}

/** Baixa um modelo preenchível para importação dos lançamentos. */
export function baixarModeloCSV(): void {
  const hoje = formatarData(hojeISO());
  const linhas: (string | number)[][] = [
    CABECALHO,
    [hoje, TIPOS.unidades.label, "", 150, "08:30"],
    [hoje, TIPOS.nf_faturada.label, "", 40, "10:00"],
    [hoje, TIPOS.falta.label, MOTIVO_EXEMPLO_FALTA, 1, "09:15"],
    [hoje, TIPOS.sac_oper.label, "", 2, "14:45"],
  ];
  baixarCSV(linhas, "modelo-importacao-operacional.csv");
}

function dividirLinhaCSV(linha: string): string[] {
  const campos: string[] = [];
  let atual = "";
  let emAspas = false;
  for (let i = 0; i < linha.length; i++) {
    const ch = linha[i];
    if (ch === '"') {
      if (emAspas && linha[i + 1] === '"') {
        atual += '"';
        i++;
      } else {
        emAspas = !emAspas;
      }
    } else if (ch === ";" && !emAspas) {
      campos.push(atual);
      atual = "";
    } else {
      atual += ch;
    }
  }
  campos.push(atual);
  return campos;
}

function dataParaISO(ddmm: string): string {
  const [d, m, a] = ddmm.trim().split("/");
  if (!d || !m || !a) throw new Error("Data inválida no arquivo.");
  return `${a}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export function importarHistoricoCSV(texto: string): LancamentoImportado[] {
  const linhas = texto
    .replace(/^\ufeff/, "")
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");

  if (linhas.length < 2) {
    throw new Error("O arquivo está vazio ou não contém registros.");
  }

  const cabecalho = dividirLinhaCSV(linhas[0]).map((c) => c.trim());
  const idx = {
    data: cabecalho.indexOf("Data"),
    tipo: cabecalho.indexOf("Lançamento"),
    motivo: cabecalho.indexOf("Motivo"),
    quantidade: cabecalho.indexOf("Quantidade"),
    hora: cabecalho.indexOf("Hora"),
  };
  if ([idx.data, idx.tipo, idx.motivo, idx.quantidade, idx.hora].includes(-1)) {
    throw new Error(
      "Formato não reconhecido. Importe um arquivo exportado pelo dashboard."
    );
  }

  const tipoPorLabel: Record<string, TipoLancamento> = Object.fromEntries(
    Object.entries(TIPOS).map(([tipo, cfg]) => [cfg.label, tipo as TipoLancamento])
  );

  const registros: LancamentoImportado[] = [];
  for (let i = 1; i < linhas.length; i++) {
    const campos = dividirLinhaCSV(linhas[i]).map((c) => c.trim());
    const label = campos[idx.tipo];
    const tipo = tipoPorLabel[label];
    if (!tipo) continue;
    const quantidade = Number(String(campos[idx.quantidade]).replace(",", "."));
    if (!Number.isFinite(quantidade)) continue;
    registros.push({
      data: dataParaISO(campos[idx.data]),
      tipo,
      motivo: campos[idx.motivo] || null,
      quantidade,
      hora: campos[idx.hora] || "00:00",
    });
  }

  return registros;
}
