import { useRef, useState, type ChangeEvent } from "react";
import type { Lancamento, NovoLancamento, TipoSac } from "@/types";
import { useDados } from "@/hooks/useDados";
import { useToast } from "@/hooks/useToast";
import { TemaProvider } from "@/hooks/useTema";
import { Sidebar, type Visao } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { LancamentosTable } from "@/components/dashboard/LancamentosTable";
import { SacMotivosChart } from "@/components/dashboard/SacMotivosChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { SerieChart, type SerieChartSerie } from "@/components/dashboard/SerieChart";
import { EficienciaGauge } from "@/components/dashboard/EficienciaGauge";
import { LancamentoModal } from "@/components/modal/LancamentoModal";
import { MetricasModal } from "@/components/modal/MetricasModal";
import { ConfirmarExclusaoModal } from "@/components/modal/ConfirmarExclusaoModal";
import { BancoDeDadosModal } from "@/components/modal/BancoDeDadosModal";
import { Toast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { DadosMenu } from "@/components/ui/DadosMenu";
import { TIPOS, JANELA_TREND_DIAS } from "@/lib/constantes";
import { formatarData, formatarNumero, hojeISO } from "@/lib/datas";
import { totalRegistros } from "@/lib/agregacao";
import {
  baixarModeloCSV,
  exportarDiaCSV,
  exportarHistoricoCSV,
  importarHistoricoCSV,
} from "@/lib/exportacao";
import type { SupabaseConfig } from "@/lib/supabase";

const SERIE_FALTAS: SerieChartSerie[] = [
  { label: TIPOS.falta.label, cor: TIPOS.falta.cor, tipos: ["falta"] },
];

const SERIE_UNIDADES: SerieChartSerie[] = [
  { label: TIPOS.unidades.label, cor: TIPOS.unidades.cor, tipos: ["unidades"] },
];

const SERIE_SAC: SerieChartSerie[] = [
  { label: "SAC", cor: TIPOS.sac_oper.cor, tipos: ["sac_oper", "sac_clie"] },
];

export function Dashboard() {
  const {
    dados,
    metas,
    origem,
    supabaseConfig,
    ultimaSincronizacao,
    adicionarLancamento,
    removerLancamento,
    atualizarMetas,
    conectarSupabase,
    desconectarSupabase,
    sincronizarAgora,
    atualizarPeriodoSincronizacao,
    importarHistorico,
    garantirDia,
  } = useDados();

  const { toast, mostrar } = useToast();

  const [dataFiltro, setDataFiltro] = useState(hojeISO());
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoFixo, setTipoFixo] = useState<TipoSac | null>(null);
  const [sidebarAberto, setSidebarAberto] = useState(false);
  const [visao, setVisao] = useState<Visao>("diario");
  const [busca, setBusca] = useState("");
  const [metricasAberto, setMetricasAberto] = useState(false);
  const [excluir, setExcluir] = useState<Lancamento | null>(null);
  const [bancoAberto, setBancoAberto] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const abrirModal = (tipo: TipoSac | null) => {
    setTipoFixo(tipo);
    setModalAberto(true);
  };

  const aoTrocarData = (nova: string) => {
    setDataFiltro(nova);
    // Otimização de egress: se o dia não está no cache, busca só ele
    void garantirDia(nova);
  };

  const aoSalvar = (input: NovoLancamento) => {
    adicionarLancamento(input);
    setDataFiltro(input.data);
    mostrar(
      `${TIPOS[input.tipo].label}: +${formatarNumero(input.quantidade)} registrado em ${formatarData(input.data)}.`
    );
  };

  const aoSolicitarRemocao = (id: number) => {
    const registro = (dados[dataFiltro] ?? []).find((r) => r.id === id);
    setExcluir(registro ?? null);
  };

  const aoConfirmarRemocao = () => {
    if (!excluir) return;
    removerLancamento(dataFiltro, excluir.id);
    setExcluir(null);
    mostrar("Lançamento removido.");
  };

  const aoConectarBanco = (config: SupabaseConfig) => {
    conectarSupabase(config);
    mostrar("Conectado ao banco de dados. Histórico salvo na nuvem.");
  };

  const aoDesconectarBanco = () => {
    desconectarSupabase();
    mostrar("Armazenamento local restaurado.");
  };

  const aoImportar = async (e: ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    try {
      const texto = await arquivo.text();
      const entradas = importarHistoricoCSV(texto);
      if (entradas.length === 0) {
        mostrar("Nenhum registro válido encontrado no arquivo.", true);
        return;
      }
      const importadas = importarHistorico(entradas);
      if (importadas === 0) {
        mostrar("Todos os registros do arquivo já existem no histórico.");
        return;
      }
      const duplicadas = entradas.length - importadas;
      mostrar(
        `Importados ${importadas} lançamento${importadas === 1 ? "" : "s"}` +
          (duplicadas > 0
            ? `, ${duplicadas} duplicado${duplicadas === 1 ? "" : "s"} ignorado${duplicadas === 1 ? "" : "s"}`
            : "") +
          "."
      );
    } catch (err) {
      mostrar(
        err instanceof Error
          ? err.message
          : "Não foi possível importar o arquivo.",
        true
      );
    } finally {
      e.target.value = "";
    }
  };

  const aoExportarDia = () => {
    const total = exportarDiaCSV(dados, dataFiltro);
    if (total === 0) {
      mostrar(
        `Nenhum lançamento no dia ${formatarData(dataFiltro)} para exportar.`,
        true
      );
    }
  };

  const titulo = visao === "diario" ? "Diário Operacional" : "Histórico";
  const legenda =
    visao === "diario"
      ? `Lançamentos do dia ${formatarData(dataFiltro)}`
      : "Pesquise e filtre os lançamentos registrados.";

  return (
    <TemaProvider>
      <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Sidebar
          aberto={sidebarAberto}
          onFechar={() => setSidebarAberto(false)}
          visao={visao}
          onNavegar={setVisao}
          onNovoLancamento={() => abrirModal(null)}
          onSacTipo={(tipo) => abrirModal(tipo)}
          onAbrirMetricas={() => setMetricasAberto(true)}
          onAbrirBancoDeDados={() => setBancoAberto(true)}
        />

      <main className="mx-auto w-full max-w-[1280px] px-5 py-6 sm:px-7">
        <Topbar
          titulo={titulo}
          legenda={legenda}
          data={dataFiltro}
          onDataChange={aoTrocarData}
          onToggleSidebar={() => setSidebarAberto((v) => !v)}
          acoes={
            <DadosMenu
              onExportarDia={aoExportarDia}
              onBaixarModelo={baixarModeloCSV}
              onImportar={() => importRef.current?.click()}
            />
          }
        />

        {visao === "diario" ? (
          <>
            <KpiGrid dados={dados} iso={dataFiltro} />

            <section className="mb-6 grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr]">
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Evolução dos lançamentos
                  </h3>
                  <Badge>últimos {14} dias</Badge>
                </div>
                <div className="relative h-[320px]">
                  <TrendChart dados={dados} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    SAC — Motivos
                  </h3>
                  <Badge>{formatarData(dataFiltro)}</Badge>
                </div>
                <div className="relative h-[230px]">
                  <SacMotivosChart dados={dados} iso={dataFiltro} />
                </div>
              </div>

              <EficienciaGauge dados={dados} metas={metas} iso={dataFiltro} />
            </section>

            <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Faltas do colaborador
                  </h3>
                  <Badge>últimos {JANELA_TREND_DIAS} dias</Badge>
                </div>
                <div className="relative h-[230px]">
                  <SerieChart dados={dados} series={SERIE_FALTAS} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Unidades Separadas
                  </h3>
                  <Badge>últimos {JANELA_TREND_DIAS} dias</Badge>
                </div>
                <div className="relative h-[230px]">
                  <SerieChart dados={dados} series={SERIE_UNIDADES} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    SAC — Quantidade
                  </h3>
                  <Badge>últimos {JANELA_TREND_DIAS} dias</Badge>
                </div>
                <div className="relative h-[230px]">
                  <SerieChart dados={dados} series={SERIE_SAC} />
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="mb-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por tipo ou motivo..."
                  className="h-10 w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700/60"
                />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {totalRegistros(dados, dataFiltro)} registro
                  {totalRegistros(dados, dataFiltro) === 1 ? "" : "s"} no dia
                </span>
              </div>
            </div>

            <LancamentosTable
              dados={dados}
              iso={dataFiltro}
              onRemover={aoSolicitarRemocao}
              busca={busca}
            />
          </section>
        )}
      </main>

      <LancamentoModal
        aberto={modalAberto}
        tipoFixo={tipoFixo}
        dataInicial={dataFiltro}
        onSalvar={aoSalvar}
        onFechar={() => setModalAberto(false)}
      />

      <MetricasModal
        aberto={metricasAberto}
        metas={metas}
        onSalvar={atualizarMetas}
        onFechar={() => setMetricasAberto(false)}
      />

      <ConfirmarExclusaoModal
        aberto={excluir !== null}
        titulo="Excluir lançamento?"
        descricao={`Deseja realmente excluir este lançamento do dia ${formatarData(dataFiltro)}?`}
        detalhes={
          excluir
            ? `${TIPOS[excluir.tipo].label} · ${formatarNumero(excluir.quantidade)} · ${excluir.hora}${excluir.motivo ? ` · ${excluir.motivo}` : ""}`
            : undefined
        }
        onConfirmar={aoConfirmarRemocao}
        onFechar={() => setExcluir(null)}
      />

      <BancoDeDadosModal
        aberto={bancoAberto}
        onFechar={() => setBancoAberto(false)}
        origem={origem}
        temDadosLocais={Object.keys(dados).length > 0}
        periodo={supabaseConfig?.periodo ?? 0}
        ultimaSincronizacao={ultimaSincronizacao}
        onBaixarHistorico={() => exportarHistoricoCSV(dados)}
        onConectar={aoConectarBanco}
        onDesconectar={aoDesconectarBanco}
        onSincronizarAgora={sincronizarAgora}
        onAtualizarPeriodo={atualizarPeriodoSincronizacao}
      />

      <input
        ref={importRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => void aoImportar(e)}
      />

      {toast && <Toast estado={toast} />}
      </div>
    </TemaProvider>
  );
}