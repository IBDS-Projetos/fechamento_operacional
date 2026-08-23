import { useState } from "react";
import type { TipoSac } from "@/types";
import { Icon } from "@/components/ui/Icon";
import { Botao } from "@/components/ui/Botao";

export type Visao = "diario" | "historico";

interface SidebarProps {
  aberto: boolean;
  onFechar: () => void;
  visao: Visao;
  onNavegar: (visao: Visao) => void;
  onNovoLancamento: () => void;
  onSacTipo: (tipo: TipoSac) => void;
  onAbrirMetricas: () => void;
  onAbrirBancoDeDados: () => void;
}

export function Sidebar({
  aberto,
  onFechar,
  visao,
  onNavegar,
  onNovoLancamento,
  onSacTipo,
  onAbrirMetricas,
  onAbrirBancoDeDados,
}: SidebarProps) {
  const [sacAberto, setSacAberto] = useState(false);

  const opcoesSac: { tipo: TipoSac; rotulo: string; cor: string }[] = [
    { tipo: "sac_oper", rotulo: "SAC (Operacional)", cor: "#7c3aed" },
    { tipo: "sac_clie", rotulo: "SAC (Cliente)", cor: "#d97706" },
  ];

  const itemClasse = (ativo: boolean) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition ${
      ativo
        ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
    }`;

  return (
    <>
      {aberto && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40"
          onClick={onFechar}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-center gap-3 border-b border-slate-200 px-1 pb-5 dark:border-slate-800">
          <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            <Icon nome="clipboard" tamanho={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
              Fechamento
            </p>
            <p className="text-[10.5px] font-medium tracking-[.18em] text-slate-400 uppercase dark:text-slate-500">
              Operacional
            </p>
          </div>
          <button
            onClick={onFechar}
            aria-label="Fechar menu"
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Icon nome="fechar" tamanho={16} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
          <button
            onClick={() => {
              onNavegar("diario");
              onFechar();
            }}
            className={itemClasse(visao === "diario")}
          >
            <Icon nome="clipboard" tamanho={17} />
            Diário
          </button>

          <Botao onClick={onNovoLancamento} className="mt-1 w-full justify-start">
            <Icon nome="mais" tamanho={17} />
            Novo Lançamento
          </Botao>

          <div className="mt-1">
            <button
              onClick={() => setSacAberto((v) => !v)}
              aria-expanded={sacAberto}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
            >
              <Icon nome="atendimento" tamanho={17} />
              SAC
              <Icon
                nome="chevron-baixo"
                tamanho={15}
                className={`ml-auto transition-transform duration-200 ${
                  sacAberto ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid overflow-hidden transition-all duration-200 ${
                sacAberto ? "mt-1 grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0">
                {opcoesSac.map((opcao) => (
                  <button
                    key={opcao.tipo}
                    onClick={() => {
                      setSacAberto(false);
                      onSacTipo(opcao.tipo);
                    }}
                    className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
                  >
                    <span
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: opcao.cor }}
                    />
                    {opcao.rotulo}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onNavegar("historico");
              onFechar();
            }}
            className={itemClasse(visao === "historico")}
          >
            <Icon nome="lista" tamanho={17} />
            Histórico
          </button>

          <button onClick={onAbrirMetricas} className={itemClasse(false)}>
            <Icon nome="alvo" tamanho={17} />
            Métricas
          </button>

          <button onClick={onAbrirBancoDeDados} className={itemClasse(false)}>
            <Icon nome="banco" tamanho={17} />
            Banco de Dados
          </button>
        </nav>

        <div className="flex items-center gap-2 border-t border-slate-200 px-1 pt-4 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Salvamento automático
        </div>
      </aside>
    </>
  );
}
