import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import "@/lib/charts/registrar";
import type { DadosPorDia, TipoLancamento } from "@/types";
import { JANELA_TREND_DIAS } from "@/lib/constantes";
import { formatarDiaMes, ultimosNDias } from "@/lib/datas";
import { somarPorDia } from "@/lib/agregacao";
import { useTema } from "@/hooks/useTema";

export interface SerieChartSerie {
  label: string;
  cor: string;
  tipos: TipoLancamento[];
}

interface SerieChartProps {
  dados: DadosPorDia;
  series: SerieChartSerie[];
}

export function SerieChart({ dados, series }: SerieChartProps) {
  const { escuro } = useTema();
  const dias = useMemo(() => ultimosNDias(JANELA_TREND_DIAS), []);

  const data = useMemo<ChartData<"line">>(() => {
    const valores = (tipos: TipoLancamento[]) =>
      dias.map((iso) =>
        tipos.reduce((soma, t) => soma + somarPorDia(dados, iso, t), 0)
      );
    return {
      labels: dias.map(formatarDiaMes),
      datasets: series.map((s) => ({
        label: s.label,
        data: valores(s.tipos),
        borderColor: s.cor,
        backgroundColor: s.cor,
        pointBackgroundColor: s.cor,
        pointBorderColor: escuro ? "#0f172a" : "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5,
        tension: 0.35,
        fill: false,
      })),
    };
  }, [dados, dias, escuro, series]);

  const unico = series.length === 1;
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: !unico,
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          padding: 16,
          color: escuro ? "#cbd5e1" : "#64748b",
          font: { size: 11, weight: 600 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: escuro ? "#94a3b8" : "#64748b", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        border: { dash: [4, 4] },
        grid: { color: escuro ? "rgba(148,163,184,0.18)" : "#eef2f7" },
        ticks: {
          color: escuro ? "#94a3b8" : "#64748b",
          font: { size: 11 },
          precision: 0,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
