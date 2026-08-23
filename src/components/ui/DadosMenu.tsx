import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface DadosMenuProps {
  onExportarDia: () => void;
  onBaixarModelo: () => void;
  onImportar: () => void;
}

const itemClasse =
  "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800";

export function DadosMenu({
  onExportarDia,
  onBaixarModelo,
  onImportar,
}: DadosMenuProps) {
  const [aberto, setAberto] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const aoClicarFora = (e: PointerEvent) => {
      if (!raizRef.current?.contains(e.target as Node)) setAberto(false);
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("pointerdown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("pointerdown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  const selecionar = (acao: () => void) => {
    setAberto(false);
    acao();
  };

  return (
    <div ref={raizRef} className="relative">
      <button
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label="Exportar, modelo e importação de dados"
        title="Exportar dia vigente, baixar modelo ou importar dados"
        className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <Icon
          nome="chevron-baixo"
          tamanho={17}
          className={`transition-transform ${aberto ? "rotate-180" : ""}`}
        />
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <button
            role="menuitem"
            onClick={() => selecionar(onExportarDia)}
            className={itemClasse}
          >
            <Icon nome="baixar" tamanho={15} />
            <span>
              Exportar dia vigente
              <span className="block text-[11px] font-normal text-slate-400 dark:text-slate-500">
                CSV do filtro atual
              </span>
            </span>
          </button>
          <button
            role="menuitem"
            onClick={() => selecionar(onBaixarModelo)}
            className={itemClasse}
          >
            <Icon nome="baixar" tamanho={15} />
            <span>
              Baixar modelo
              <span className="block text-[11px] font-normal text-slate-400 dark:text-slate-500">
                Planilha para preenchimento
              </span>
            </span>
          </button>
          <button
            role="menuitem"
            onClick={() => selecionar(onImportar)}
            className={`${itemClasse} border-t border-slate-100 dark:border-slate-800`}
          >
            <Icon nome="enviar" tamanho={15} />
            <span>
              Importar dados
              <span className="block text-[11px] font-normal text-slate-400 dark:text-slate-500">
                Enviar arquivo CSV
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
