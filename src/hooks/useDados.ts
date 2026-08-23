import { useCallback, useEffect, useState } from "react";
import type {
  DadosPorDia,
  Lancamento,
  LancamentoImportado,
  MetasOperacionais,
  NovoLancamento,
  TipoLancamento,
} from "@/types";
import {
  carregarDados,
  carregarMetas,
  salvarDados,
  salvarMetas,
} from "@/lib/storage";
import { horaAtual } from "@/lib/datas";
import type { TipoMeta } from "@/types";
import {
  carregarLancamentosSupabase,
  carregarMetasSupabase,
  inserirLancamentoSupabase,
  inserirVariosSupabase,
  normalizarUrl,
  removerDiaSupabase,
  removerLancamentoSupabase,
  salvarMetasSupabase,
  type LinhaLancamento,
  type LinhaMeta,
  type SupabaseConfig,
} from "@/lib/supabase";

export type Origem = "local" | "supabase";

const CHAVE_ORIGEM = "fechOperacional:origem";
const CHAVE_SUPABASE = "fechOperacional:supabase";
const CHAVE_CACHE_SUPABASE = "fechOperacional:cacheSupabase";
const CHAVE_ULTIMA_SINCRONIZACAO = "fechOperacional:ultimaSincronizacao";
/** Força uma sincronização completa periodicamente para capturar alterações externas */
const TTL_SINCRONIZACAO_MS = 24 * 60 * 60 * 1000;

function lerOrigem(): Origem {
  if (typeof window === "undefined") return "local";
  return window.localStorage.getItem(CHAVE_ORIGEM) === "supabase"
    ? "supabase"
    : "local";
}

function lerConfigSupabase(): SupabaseConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.localStorage.getItem(CHAVE_SUPABASE);
    return bruto ? (JSON.parse(bruto) as SupabaseConfig) : null;
  } catch {
    return null;
  }
}

function lerCacheSupabase(): DadosPorDia {
  if (typeof window === "undefined") return {};
  try {
    const bruto = window.localStorage.getItem(CHAVE_CACHE_SUPABASE);
    return bruto ? (JSON.parse(bruto) as DadosPorDia) : {};
  } catch {
    return {};
  }
}

function salvarCacheSupabase(dados: DadosPorDia) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE_CACHE_SUPABASE, JSON.stringify(dados));
}

function lerUltimaSincronizacao(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CHAVE_ULTIMA_SINCRONIZACAO);
}

function salvarUltimaSincronizacao(iso: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE_ULTIMA_SINCRONIZACAO, iso);
}

function agruparPorDia(linhas: {
  id: number;
  data: string;
  tipo: string;
  motivo: string | null;
  quantidade: number;
  hora: string;
}[]): DadosPorDia {
  const mapa: DadosPorDia = {};
  for (const l of linhas) {
    const chave = l.data;
    if (!mapa[chave]) mapa[chave] = [];
    mapa[chave].push({
      id: l.id,
      tipo: l.tipo as TipoLancamento,
      motivo: l.motivo,
      quantidade: Number(l.quantidade),
      hora: l.hora,
    });
  }
  return mapa;
}

function novoId(): number {
  return Date.now() + Math.floor(Math.random() * 999999);
}

function aplicarMetasNuvem(
  base: MetasOperacionais,
  linhas: LinhaMeta[]
): MetasOperacionais {
  const novas: MetasOperacionais = {
    unidades: { ...base.unidades },
    nf_faturada: { ...base.nf_faturada },
    nf_embarcada: { ...base.nf_embarcada },
  };
  for (const linha of linhas) {
    const tipo = linha.tipo as TipoMeta;
    if (tipo in novas && linha.horario) novas[tipo].horario = linha.horario;
  }
  return novas;
}

export function useDados() {
  // SPA (Vite): sem SSR, podemos ler o localStorage direto no estado inicial
  const [dados, setDados] = useState<DadosPorDia>(() =>
    lerOrigem() === "supabase" ? lerCacheSupabase() : carregarDados()
  );
  const [metas, setMetas] = useState<MetasOperacionais>(carregarMetas);
  const [origem, setOrigem] = useState<Origem>(lerOrigem);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig | null>(
    lerConfigSupabase
  );
  const [ultimaSincronizacao, setUltimaSincronizacao] = useState<string | null>(
    lerUltimaSincronizacao
  );
  const [forcarSincronizacao, setForcarSincronizacao] = useState(false);

  // Sincroniza as metas (prazos) com o banco na nuvem quando conectado
  useEffect(() => {
    if (origem !== "supabase" || !supabaseConfig) return;
    let ativo = true;
    carregarMetasSupabase(supabaseConfig)
      .then((linhas) => {
        if (!ativo || linhas.length === 0) return;
        setMetas((prev) => {
          const novas = aplicarMetasNuvem(prev, linhas);
          salvarMetas(novas);
          return novas;
        });
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [origem, supabaseConfig]);

  useEffect(() => {
    if (origem !== "supabase" || !supabaseConfig) {
      if (origem === "local") {
        // Carrega os dados locais ao entrar no modo local        setDados(carregarDados());
      }
      return;
    }
    let ativo = true;
    const sincronizar = async () => {
      try {
        const cache = lerCacheSupabase();
        const cacheVazio = Object.keys(cache).length === 0;
        const ultima = lerUltimaSincronizacao();
        const expirada =
          !ultima ||
          Date.now() - new Date(ultima).getTime() > TTL_SINCRONIZACAO_MS;
        const completa = forcarSincronizacao || cacheVazio || expirada;

        const linhas = await carregarLancamentosSupabase(supabaseConfig, {
          desde: completa ? undefined : (ultima ?? undefined),
          ultimosDias:
            completa && supabaseConfig.periodo ? supabaseConfig.periodo : undefined,
        });

        const agora = new Date().toISOString();
        if (!ativo) return;
        if (completa) {
          setDados(() => {
            const novos = agruparPorDia(linhas);
            salvarCacheSupabase(novos);
            return novos;
          });
        } else {
          setDados((prev) => {
            const mapa = new Map<number, LinhaLancamento>();
            for (const lista of Object.values(prev)) {
              for (const r of lista) mapa.set(r.id, r as LinhaLancamento);
            }
            for (const l of linhas) mapa.set(l.id, l);
            const novos = agruparPorDia([...mapa.values()]);
            salvarCacheSupabase(novos);
            return novos;
          });
        }
        salvarUltimaSincronizacao(agora);
        setUltimaSincronizacao(agora);
        setForcarSincronizacao(false);
      } catch {
        if (ativo) setDados((prev) => prev);
      }
    };
    void sincronizar();
    return () => {
      ativo = false;
    };
  }, [origem, supabaseConfig, forcarSincronizacao]);

  const adicionarLancamento = useCallback(
    (input: NovoLancamento) => {
      const lancamento: Lancamento = {
        id: novoId(),
        tipo: input.tipo,
        motivo: input.motivo,
        quantidade: input.quantidade,
        hora: horaAtual(),
      };

      if (origem === "supabase" && supabaseConfig) {
        void inserirLancamentoSupabase(supabaseConfig, {
          data: input.data,
          tipo: input.tipo,
          motivo: input.motivo,
          quantidade: input.quantidade,
          hora: lancamento.hora,
        })
          .then((registro) => {
            setDados((prev) => {
              const novos = {
                ...prev,
                [input.data]: [
                  ...(prev[input.data] ?? []),
                  { ...lancamento, id: registro.id },
                ],
              };
              salvarCacheSupabase(novos);
              return novos;
            });
          })
          .catch(() => {});
      } else {
        setDados((prev) => {
          const novos = {
            ...prev,
            [input.data]: [...(prev[input.data] ?? []), lancamento],
          };
          salvarDados(novos);
          return novos;
        });
      }
    },
    [origem, supabaseConfig]
  );

  const removerLancamento = useCallback(
    (iso: string, id: number) => {
      if (origem === "supabase" && supabaseConfig) {
        void removerLancamentoSupabase(supabaseConfig, id)
          .then(() => {
            setDados((prev) => {
              const restantes = (prev[iso] ?? []).filter((r) => r.id !== id);
              const novos = { ...prev };
              if (restantes.length === 0) delete novos[iso];
              else novos[iso] = restantes;
              salvarCacheSupabase(novos);
              return novos;
            });
          })
          .catch(() => {});
      } else {
        setDados((prev) => {
          const restantes = (prev[iso] ?? []).filter((r) => r.id !== id);
          const novos = { ...prev };
          if (restantes.length === 0) delete novos[iso];
          else novos[iso] = restantes;
          salvarDados(novos);
          return novos;
        });
      }
    },
    [origem, supabaseConfig]
  );

  const limparDia = useCallback(
    (iso: string) => {
      if (origem === "supabase" && supabaseConfig) {
        void removerDiaSupabase(supabaseConfig, iso)
          .then(() => {
            setDados((prev) => {
              const novos = { ...prev };
              delete novos[iso];
              salvarCacheSupabase(novos);
              return novos;
            });
          })
          .catch(() => {});
      } else {
        setDados((prev) => {
          const novos = { ...prev };
          delete novos[iso];
          salvarDados(novos);
          return novos;
        });
      }
    },
    [origem, supabaseConfig]
  );

  const atualizarMetas = useCallback(
    (novas: MetasOperacionais) => {
      setMetas(novas);
      salvarMetas(novas);
      if (origem === "supabase" && supabaseConfig) {
        const linhas: LinhaMeta[] = Object.entries(novas).map(
          ([tipo, cfg]) => ({ tipo, horario: cfg.horario })
        );
        void salvarMetasSupabase(supabaseConfig, linhas).catch(() => {});
      }
    },
    [origem, supabaseConfig]
  );

  const conectarSupabase = useCallback((config: SupabaseConfig) => {
    const configuracao = { ...config, url: normalizarUrl(config.url) };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CHAVE_SUPABASE, JSON.stringify(configuracao));
      window.localStorage.setItem(CHAVE_ORIGEM, "supabase");
    }
    // Os dados locais são apagados ao migrar para o banco na nuvem
    salvarDados({});
    salvarCacheSupabase({});
    salvarUltimaSincronizacao("");
    setSupabaseConfig(configuracao);
    setOrigem("supabase");
    setUltimaSincronizacao(null);
    setForcarSincronizacao(false);
  }, []);

  const desconectarSupabase = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CHAVE_ORIGEM, "local");
    }
    salvarCacheSupabase({});
    setOrigem("local");
  }, []);

  const sincronizarAgora = useCallback(() => {
    setForcarSincronizacao(true);
  }, []);

  const atualizarPeriodoSincronizacao = useCallback((periodo: number) => {
    setSupabaseConfig((prev) => {
      if (!prev) return prev;
      const config = { ...prev, periodo };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(CHAVE_SUPABASE, JSON.stringify(config));
      }
      return config;
    });
    setForcarSincronizacao(true);
  }, []);

  const importarHistorico = useCallback(
    (entradas: LancamentoImportado[]): number => {
      const duplicadas = (dados: DadosPorDia, e: LancamentoImportado) =>
        (dados[e.data] ?? []).some(
          (r) =>
            r.tipo === e.tipo &&
            (r.motivo ?? null) === (e.motivo ?? null) &&
            r.quantidade === e.quantidade &&
            r.hora === e.hora
        );

      const novas = entradas.filter((e) => !duplicadas(dados, e));
      if (novas.length === 0) return 0;

      if (origem === "supabase" && supabaseConfig) {
        void inserirVariosSupabase(
          supabaseConfig,
          novas.map((e) => ({
            data: e.data,
            tipo: e.tipo,
            motivo: e.motivo,
            quantidade: e.quantidade,
            hora: e.hora,
          }))
        )
          .then((registros) => {
            setDados((prev) => {
              const novos = { ...prev };
              for (const r of registros) {
                const chave = r.data;
                novos[chave] = [
                  ...(novos[chave] ?? []),
                  {
                    id: r.id,
                    tipo: r.tipo as TipoLancamento,
                    motivo: r.motivo,
                    quantidade: Number(r.quantidade),
                    hora: r.hora,
                  },
                ];
              }
              salvarCacheSupabase(novos);
              return novos;
            });
          })
          .catch(() => {});
      } else {
        setDados((prev) => {
          const novos = { ...prev };
          for (const e of novas) {
            novos[e.data] = [
              ...(novos[e.data] ?? []),
              {
                id: novoId(),
                tipo: e.tipo,
                motivo: e.motivo,
                quantidade: e.quantidade,
                hora: e.hora,
              },
            ];
          }
          salvarDados(novos);
          return novos;
        });
      }

      return novas.length;
    },
    [dados, origem, supabaseConfig]
  );

  return {
    dados,
    metas,
    origem,
    supabaseConfig,
    ultimaSincronizacao,
    adicionarLancamento,
    removerLancamento,
    limparDia,
    atualizarMetas,
    conectarSupabase,
    desconectarSupabase,
    sincronizarAgora,
    atualizarPeriodoSincronizacao,
    importarHistorico,
  };
}