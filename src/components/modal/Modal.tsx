import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

interface ModalProps {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
  rodape?: ReactNode;
}

export function Modal({ aberto, titulo, onFechar, children, rodape }: ModalProps) {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div
      className="modal-anim fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 p-4"
      onClick={onFechar}
    >
      <div className="grid min-h-full place-items-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={titulo}
          className="w-full max-w-[460px] rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
            <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              {titulo}
            </h3>
            <button
              onClick={onFechar}
              aria-label="Fechar"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Icon nome="fechar" tamanho={16} />
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
          {rodape && (
            <div className="flex justify-end gap-2.5 border-t border-slate-200 px-5 py-3.5 dark:border-slate-800">
              {rodape}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
