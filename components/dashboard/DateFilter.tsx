"use client";

import { hojeISO, somarDias } from "@/lib/datas";
import { Icon } from "@/components/ui/Icon";
import { useTema } from "@/hooks/useTema";

interface DateFilterProps {
  data: string;
  onChange: (data: string) => void;
}

export function DateFilter({ data, onChange }: DateFilterProps) {
  const { escuro, alternar } = useTema();

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Filtrar por dia
        </span>
        <div className="flex items-center overflow-hidden rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
          <button
            onClick={() => onChange(somarDias(data, -1))}
            aria-label="Dia anterior"
            className="grid h-10 w-9 place-items-center text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Icon nome="chevron-esq" tamanho={16} />
          </button>
          <input
            type="date"
            value={data}
            onChange={(e) => e.target.value && onChange(e.target.value)}
            className="h-10 border-x border-slate-200 px-2 text-sm font-medium text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 [color-scheme:light] dark:[color-scheme:dark]"
          />
          <button
            onClick={() => onChange(somarDias(data, 1))}
            aria-label="Próximo dia"
            className="grid h-10 w-9 place-items-center text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Icon nome="chevron-dir" tamanho={16} />
          </button>
        </div>
      </label>
      <button
        onClick={() => onChange(hojeISO())}
        className="h-10 rounded-lg border border-slate-300 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Hoje
      </button>
      <button
        onClick={alternar}
        aria-label={escuro ? "Ativar modo claro" : "Ativar modo noturno"}
        title={escuro ? "Modo claro" : "Modo noturno"}
        className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <Icon nome={escuro ? "sol" : "lua"} tamanho={17} />
      </button>
    </div>
  );
}
