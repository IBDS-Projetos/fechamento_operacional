import type { TipoLancamento } from "@/types";
import { Icon, type IconeNome } from "@/components/ui/Icon";

interface KpiCardProps {
  tipo: TipoLancamento;
  icone: IconeNome;
  titulo: string;
  valor: number;
  sub: string;
  cor: string;
}

export function KpiCard({
  icone,
  titulo,
  valor,
  sub,
  cor,
}: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: `${cor}1a`, color: cor }}
        >
          <Icon nome={icone} tamanho={16} />
        </span>
        <span className="text-[12px] font-semibold leading-tight text-slate-500 dark:text-slate-400">
          {titulo}
        </span>
      </div>
      <p className="mt-3 text-[26px] font-semibold tracking-tight text-slate-900 tabular-nums dark:text-slate-100">
        {valor}
      </p>
      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{sub}</p>
    </div>
  );
}
