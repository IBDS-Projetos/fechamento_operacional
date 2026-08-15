"use client";

import { DateFilter } from "@/components/dashboard/DateFilter";
import { Icon } from "@/components/ui/Icon";

interface TopbarProps {
  titulo: string;
  legenda: string;
  data: string;
  onDataChange: (data: string) => void;
  onToggleSidebar: () => void;
}

export function Topbar({
  titulo,
  legenda,
  data,
  onDataChange,
  onToggleSidebar,
}: TopbarProps) {
  const botaoClasse =
    "grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white";

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Alternar menu"
          title="Ocultar/exibir menu"
          className={botaoClasse}
        >
          <Icon nome="menu" tamanho={18} />
        </button>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {titulo}
          </h2>
          <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">
            {legenda}
          </p>
        </div>
      </div>

      <DateFilter data={data} onChange={onDataChange} />
    </header>
  );
}
