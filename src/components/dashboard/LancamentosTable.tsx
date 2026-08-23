import type { DadosPorDia } from "@/types";
import { EtiquetaTipo } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { TIPOS } from "@/lib/constantes";
import { formatarNumero } from "@/lib/datas";

interface LancamentosTableProps {
  dados: DadosPorDia;
  iso: string;
  onRemover: (id: number) => void;
  busca?: string;
}

export function LancamentosTable({
  dados,
  iso,
  onRemover,
  busca = "",
}: LancamentosTableProps) {
  const termo = busca.trim().toLowerCase();
  const registros = [...(dados[iso] ?? [])]
    .sort((a, b) => b.id - a.id)
    .filter((r) => {
      if (!termo) return true;
      const config = TIPOS[r.tipo];
      const texto = `${config.label} ${r.motivo ?? ""}`.toLowerCase();
      return texto.includes(termo);
    });

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Lançamentos do dia
        </h3>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          {registros.length} registro{registros.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="max-h-[calc(100dvh-280px)] overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900">
            <tr className="border-b border-slate-200 dark:border-slate-800">
              {["Lançamento", "Detalhe / Motivo", "Quantidade", "Hora", ""].map(
                (col, i) => (
                  <th
                    key={i}
                    className="px-5 py-2.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {registros.map((r) => {
              const config = TIPOS[r.tipo];
              return (
                <tr
                  key={r.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-5 py-3">
                    <EtiquetaTipo cor={config.cor}>
                      {config.label}
                    </EtiquetaTipo>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">
                    {r.tipo.startsWith("sac_") ? (r.motivo ?? "—") : "—"}
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {formatarNumero(r.quantidade)}
                  </td>
                  <td className="px-5 py-3 text-[13px] text-slate-400 tabular-nums">
                    {r.hora}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => onRemover(r.id)}
                      aria-label={`Remover ${config.label}`}
                      title="Remover lançamento"
                      className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                    >
                      <Icon nome="lixeira" tamanho={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {registros.length === 0 && (
          <p className="py-9 text-center text-[13.5px] text-slate-400 dark:text-slate-500">
            {termo
              ? `Nenhum lançamento encontrado para "${busca.trim()}".`
              : "Nenhum lançamento registrado para este dia."}
          </p>
        )}
      </div>
    </section>
  );
}
