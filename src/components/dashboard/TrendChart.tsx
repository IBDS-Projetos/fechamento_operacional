import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import "@/lib/charts/registrar";
import type { DadosPorDia, TipoLancamento } from "@/types";
import { JANELA_TREND_DIAS, TIPOS } from "@/lib/constantes";
import { formatarDiaMes, ultimosNDias } from "@/lib/datas";
import { serieTrend } from "@/lib/agregacao";
import { useTema } from "@/hooks/useTema";

interface TrendChartProps {
  dados: DadosPorDia;
}

const TIPOS_TREND: TipoLancamento[] = [
  "falta",
  "unidades",
  "sac_clie",
  "sac_oper",
];

export function TrendChart({ dados }: TrendChartProps) {
  const { escuro } = useTema();
  const dias = useMemo(() => ultimosNDias(JANELA_TREND_DIAS), []);

  const data = useMemo<ChartData<"line">>(
    () => ({
      labels: dias.map(formatarDiaMes),
      datasets: TIPOS_TREND.map((tipo) => ({
        label: TIPOS[tipo].label,
        data: serieTrend(dados, dias, tipo),
        borderColor: TIPOS[tipo].cor,
        backgroundColor: TIPOS[tipo].cor,
        pointBackgroundColor: TIPOS[tipo].cor,
        pointBorderColor: escuro ? "#0f172a" : "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5,
        tension: 0.35,
        fill: false,
      })),
    }),
    [dados, dias, escuro]
  );

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
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