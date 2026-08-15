"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Modal } from "@/components/modal/Modal";
import { Botao } from "@/components/ui/Botao";
import { Icon } from "@/components/ui/Icon";
import { SQL_CRIAR_TABELAS, testarConexaoSupabase, type SupabaseConfig } from "@/lib/supabase";
import type { Origem } from "@/hooks/useDados";

interface BancoDeDadosModalProps {
  aberto: boolean;
  onFechar: () => void;
  origem: Origem;
  temDadosLocais: boolean;
  periodo: number;
  ultimaSincronizacao: string | null;
  onBaixarHistorico: () => void;
  onConectar: (config: SupabaseConfig) => void;
  onDesconectar: () => void;
  onSincronizarAgora: () => void;
  onAtualizarPeriodo: (periodo: number) => void;
}

type Etapa = "form" | "confirmar";

const OPCOES_PERIODO = [
  { valor: 0, rotulo: "Todos os dados" },
  { valor: 90, rotulo: "Últimos 90 dias" },
  { valor: 30, rotulo: "Últimos 30 dias" },
];

function formatarUltimaSincronizacao(iso: string | null): string {
  if (!iso) return "nunca";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const rotuloCampo = (texto: string) => (
  <span className="mb-1 block text-[11.5px] font-medium text-slate-500 dark:text-slate-400">
    {texto}
  </span>
);

const inputClasse =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700/60";

export function BancoDeDadosModal({
  aberto,
  onFechar,
  origem,
  temDadosLocais,
  periodo,
  ultimaSincronizacao,
  onBaixarHistorico,
  onConectar,
  onDesconectar,
  onSincronizarAgora,
  onAtualizarPeriodo,
}: BancoDeDadosModalProps) {
  const [url, setUrl] = useState("");
  const [chave, setChave] = useState("");
  const [periodoSelecionado, setPeriodoSelecionado] = useState(periodo);
  const [etapa, setEtapa] = useState<Etapa>("form");
  const [testando, setTestando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    // Reinicia o formulário ao abrir o modal
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl("");
    setChave("");
    setEtapa("form");
    setErro(null);
    setCopiado(false);
    setPeriodoSelecionado(periodo);
  }, [aberto, periodo]);

  const conectar = async () => {
    if (!url.trim() || !chave.trim()) {
      setErro("Preencha a URL do projeto e a chave.");
      return;
    }
    setTestando(true);
    setErro(null);
    const problema = await testarConexaoSupabase({
      url: url.trim(),
      chave: chave.trim(),
    });
    setTestando(false);
    if (problema) {
      setErro(problema);
      return;
    }
    if (temDadosLocais) {
      setEtapa("confirmar");
    } else {
      onConectar({
        url: url.trim(),
        chave: chave.trim(),
        periodo: periodoSelecionado,
      });
      onFechar();
    }
  };

  const copiarSQL = async () => {
    try {
      await navigator.clipboard.writeText(SQL_CRIAR_TABELAS);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  let rodape: ReactNode;
  if (origem === "supabase") {
    rodape = <Botao onClick={onFechar}>Fechar</Botao>;
  } else if (etapa === "form") {
    rodape = (
      <>
        <Botao variante="secundario" onClick={onFechar}>
          Cancelar
        </Botao>
        <Botao onClick={() => void conectar()} disabled={testando}>
          {testando ? "Testando..." : "Conectar"}
        </Botao>
      </>
    );
  } else {
    rodape = (
      <>
        <Botao variante="secundario" onClick={() => setEtapa("form")}>
          Voltar
        </Botao>
        <Botao
          variante="secundario"
          onClick={() => {
            onBaixarHistorico();
            setEtapa("form");
          }}
        >
          Baixar histórico
        </Botao>
        <Botao
          onClick={() => {
            onConectar({
              url: url.trim(),
              chave: chave.trim(),
              periodo: periodoSelecionado,
            });
            onFechar();
          }}
        >
          Alterar para banco
        </Botao>
      </>
    );
  }

  return (
    <Modal aberto={aberto} titulo="Banco de Dados" onFechar={onFechar} rodape={rodape}>
      {origem === "supabase" ? (
        <div className="flex flex-col gap-4">
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            Conectado ao Supabase. O histórico é salvo na nuvem.
          </p>

          <div>
            {rotuloCampo("Histórico a carregar")}
            <select
              value={periodoSelecionado}
              onChange={(e) => setPeriodoSelecionado(Number(e.target.value))}
              className={inputClasse}
            >
              {OPCOES_PERIODO.map((op) => (
                <option key={op.valor} value={op.valor}>
                  {op.rotulo}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
              Menores períodos fazem uma sincronização mais leve.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-950">
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Última sincronização
              </span>
              <p className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-200">
                {formatarUltimaSincronizacao(ultimaSincronizacao)}
              </p>
            </div>
            <Botao variante="secundario" onClick={onSincronizarAgora}>
              <Icon nome="atualizar" tamanho={15} />
              Sincronizar agora
            </Botao>
          </div>

          <Botao
            variante="secundario"
            onClick={() => onAtualizarPeriodo(periodoSelecionado)}
          >
            Aplicar período e sincronizar
          </Botao>

          <Botao
            variante="secundario"
            onClick={() => {
              onDesconectar();
              onFechar();
            }}
          >
            <Icon nome="banco" tamanho={16} />
            Usar armazenamento local
          </Botao>
        </div>
      ) : etapa === "form" ? (
        <div className="flex flex-col gap-4">
          <div>
            {rotuloCampo("URL do projeto")}
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xxxx.supabase.co"
              autoComplete="off"
              className={inputClasse}
            />
          </div>
          <div>
            {rotuloCampo("Chave (anon / service_role)")}
            <input
              type="password"
              value={chave}
              onChange={(e) => setChave(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIs..."
              autoComplete="off"
              className={inputClasse}
            />
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
              A chave fica salva apenas no navegador. Use o SQL abaixo para
              criar a tabela antes de conectar.
            </p>
          </div>

          <div>
            {rotuloCampo("Histórico a carregar")}
            <select
              value={periodoSelecionado}
              onChange={(e) => setPeriodoSelecionado(Number(e.target.value))}
              className={inputClasse}
            >
              {OPCOES_PERIODO.map((op) => (
                <option key={op.valor} value={op.valor}>
                  {op.rotulo}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
              Limitar o período reduz o tráfego de dados na conexão.
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11.5px] font-medium text-slate-500 dark:text-slate-400">
                SQL para criar as tabelas
              </span>
              <button
                onClick={() => void copiarSQL()}
                className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {copiado ? "Copiado!" : "Copiar SQL"}
              </button>
            </div>
            <pre className="max-h-56 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              {SQL_CRIAR_TABELAS}
            </pre>
          </div>

          {erro && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
              {erro}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            Você está alterando o armazenamento para o <strong>Banco de Dados</strong>.
          </p>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12.5px] font-medium leading-relaxed text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
            Os dados salvos localmente neste navegador serão apagados e o
            histórico passará a ser lido e salvo na nuvem.
          </p>
          <p className="text-[12.5px] leading-relaxed text-slate-500 dark:text-slate-400">
            Dica: baixe o histórico atual antes de continuar para não perder os
            dados.
          </p>
        </div>
      )}
    </Modal>
  );
}