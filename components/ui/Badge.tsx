import type { ReactNode } from "react";

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 ${className}`}
    >
      {children}
    </span>
  );
}

export function EtiquetaTipo({
  cor,
  children,
}: {
  cor: string;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold">
      <span
        className="h-2 w-2 flex-shrink-0 rounded-full"
        style={{ backgroundColor: cor }}
      />
      {children}
    </span>
  );
}
