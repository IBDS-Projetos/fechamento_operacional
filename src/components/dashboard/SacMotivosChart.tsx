import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import "@/lib/charts/registrar";
import type { DadosPorDia } from "@/types";
import { motivosPorDia } from "@/lib/agregacao";
import { useTema } from "@/hooks/useTema";

interface SacMotivosChartProps {
  dados: DadosPorDia;
  iso: string;
}

export function SacMotivosChart({ dados, iso }: SacMotivosChartProps) {
  const { escuro } = useTema();

  const data = useMemo<ChartData<"bar">>(() => {
    const itens = motivosPorDia(dados, iso);
    return {
      labels: itens.map((i) => i.nome),
      datasets: [
        {
          label: "Operacional",
          data: itens.map((i) => i.oper),
          backgroundColor: "#7c3aed",
          borderRadius: 4,
          stack: "sac",
        },
        {
          label: "Cliente",
          data: itens.map((i) => i.clie),
          backgroundColor: "#d97706",
          borderRadius: 4,
          stack: "sac",
        },
      ],
    };
  }, [dados, iso]);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "rectRounded",
          boxWidth: 10,
          padding: 16,
          color: escuro ? "#cbd5e1" : "#64748b",
          font: { size: 11, weight: 600 },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          color: escuro ? "#94a3b8" : "#64748b",
          font: { size: 11 },
          maxRotation: 40,
        },
      },
      y: {
        stacked: true,
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

  return <Bar data={data} options={options} />;
}