import { hojeISO, somarDias } from "@/lib/datas";

export interface SupabaseConfig {
  url: string;
  chave: string;
  /** 0 = todos os dados; N = apenas os últimos N dias de histórico */
  periodo?: number;
}

export interface OpcoesCarregamento {
  /** Timestamp ISO: busca apenas registros criados depois dele (sincronização incremental) */
  desde?: string;
  /** Restringe a leitura aos últimos N dias operacionais (filtro de período) */
  ultimosDias?: number;
}

export interface LinhaLancamento {
  id: number;
  data: string;
  tipo: string;
  motivo: string | null;
  quantidade: number;
  hora: string;
}

export interface LinhaMeta {
  tipo: string;
  horario: string;
}

export const SQL_CRIAR_TABELAS = `-- Tabela de lançamentos operacionais
create table if not exists public.lancamentos (
  id bigint generated always as identity primary key,
  data text not null,
  tipo text not null,
  motivo text,
  quantidade numeric not null default 0,
  hora text not null,
  criado_em timestamptz not null default now()
);

-- Permite leitura/escrita via API (projeto pessoal)
alter table public.lancamentos enable row level security;

drop policy if exists "acesso_publico_lancamentos" on public.lancamentos;

create policy "acesso_publico_lancamentos"
  on public.lancamentos
  for all
  using (true)
  with check (true);

create index if not exists lancamentos_data_idx on public.lancamentos (data);

-- Tabela de metas operacionais (prazos por métrica do velocímetro)
create table if not exists public.metas (
  tipo text primary key,
  horario text not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.metas enable row level security;

drop policy if exists "acesso_publico_metas" on public.metas;

create policy "acesso_publico_metas"
  on public.metas
  for all
  using (true)
  with check (true);`;

export function normalizarUrl(url: string): string {
  return url.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
}

function endpoint(config: SupabaseConfig, caminho: string): string {
  return `${normalizarUrl(config.url)}/rest/v1${caminho}`;
}

async function requisicao(
  config: SupabaseConfig,
  caminho: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(endpoint(config, caminho), {
    ...init,
    headers: {
      apikey: config.chave,
      Authorization: `Bearer ${config.chave}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export async function testarConexaoSupabase(
  config: SupabaseConfig
): Promise<string | null> {
  try {
    const res = await requisicao(config, "/lancamentos?select=id&limit=1");
    if (res.status === 401 || res.status === 403) {
      return "Credenciais inválidas. Confira a URL do projeto e a chave (anon/service_role).";
    }
    if (res.status === 404) {
      return "Tabela 'lancamentos' não encontrada. Execute o SQL abaixo no SQL Editor do Supabase antes de conectar.";
    }
    if (!res.ok) {
      return `Falha na conexão (HTTP ${res.status}).`;
    }
    return null;
  } catch {
    return "Não foi possível conectar. Verifique a URL do projeto e a conexão de rede.";
  }
}

export async function carregarLancamentosSupabase(
  config: SupabaseConfig,
  opcoes: OpcoesCarregamento = {}
): Promise<LinhaLancamento[]> {
  const filtros: string[] = [];
  if (opcoes.desde) {
    filtros.push(`criado_em=gt.${encodeURIComponent(opcoes.desde)}`);
  }
  if (opcoes.ultimosDias && opcoes.ultimosDias > 0) {
    const inicio = somarDias(hojeISO(), -(opcoes.ultimosDias - 1));
    filtros.push(`data=gte.${inicio}`);
  }
  const parametros = [
    "select=id,data,tipo,motivo,quantidade,hora",
    ...filtros,
    "order=data.asc,id.asc",
  ].join("&");
  const res = await requisicao(config, `/lancamentos?${parametros}`);
  if (!res.ok) {
    throw new Error(`Falha ao carregar do banco (HTTP ${res.status}).`);
  }
  return (await res.json()) as LinhaLancamento[];
}

export async function carregarMetasSupabase(
  config: SupabaseConfig
): Promise<LinhaMeta[]> {
  const res = await requisicao(config, "/metas?select=tipo,horario");
  if (!res.ok) {
    throw new Error(`Falha ao carregar metas do banco (HTTP ${res.status}).`);
  }
  return (await res.json()) as LinhaMeta[];
}

export async function salvarMetasSupabase(
  config: SupabaseConfig,
  linhas: LinhaMeta[]
): Promise<void> {
  if (linhas.length === 0) return;
  const res = await requisicao(config, "/metas", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(linhas),
  });
  if (!res.ok) {
    throw new Error(`Falha ao salvar metas no banco (HTTP ${res.status}).`);
  }
}

export async function inserirLancamentoSupabase(
  config: SupabaseConfig,
  linha: Omit<LinhaLancamento, "id">
): Promise<LinhaLancamento> {
  const res = await requisicao(config, "/lancamentos", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify([linha]),
  });
  if (!res.ok) {
    throw new Error(`Falha ao salvar no banco (HTTP ${res.status}).`);
  }
  const [registro] = (await res.json()) as LinhaLancamento[];
  return registro;
}

export async function inserirVariosSupabase(
  config: SupabaseConfig,
  linhas: Omit<LinhaLancamento, "id">[]
): Promise<LinhaLancamento[]> {
  if (linhas.length === 0) return [];
  const res = await requisicao(config, "/lancamentos", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(linhas),
  });
  if (!res.ok) {
    throw new Error(`Falha ao importar no banco (HTTP ${res.status}).`);
  }
  return (await res.json()) as LinhaLancamento[];
}

export async function removerLancamentoSupabase(
  config: SupabaseConfig,
  id: number
): Promise<void> {
  const res = await requisicao(config, `/lancamentos?id=eq.${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Falha ao remover do banco (HTTP ${res.status}).`);
  }
}

export async function removerDiaSupabase(
  config: SupabaseConfig,
  data: string
): Promise<void> {
  const res = await requisicao(config, `/lancamentos?data=eq.${encodeURIComponent(data)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Falha ao limpar dia no banco (HTTP ${res.status}).`);
  }
}