"use client";

import { useEffect, useMemo, useState } from "react";
import type { DadosPorDia, MetasOperacionais } from "@/types";
import {
  calcularEficiencia,
  nivelEficiencia,
  NIVEIS_EFICIENCIA,
  METRICAS_META,
} from "@/lib/eficiencia";
import { Badge } from "@/components/ui/Badge";
import { useTema } from "@/hooks/useTema";

interface EficienciaGaugeProps {
  dados: DadosPorDia;
  metas: MetasOperacionais;
  iso: string;
}

const CX = 110;
const CY = 112;
const RAIO = 88;
const ESPESSURA = 18;

function ponto(f: number, r: number) {
  const t = Math.PI * (1 - f);
  return { x: CX + r * Math.cos(t), y: CY - r * Math.sin(t) };
}

function arco(f1: number, f2: number, r: number): string {
  const p1 = ponto(f1, r);
  const p2 = ponto(f2, r);
  const large = f2 - f1 > 0.5 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
}

const ZONAS: { f1: number; f2: number; cor: string }[] = [
  { f1: 0, f2: 0.4, cor: NIVEIS_EFICIENCIA.ruim.cor },
  { f1: 0.4, f2: 0.65, cor: NIVEIS_EFICIENCIA.baixa.cor },
  { f1: 0.65, f2: 0.85, cor: NIVEIS_EFICIENCIA.boa.cor },
  { f1: 0.85, f2: 1, cor: NIVEIS_EFICIENCIA.excelente.cor },
];

export function EficienciaGauge({ dados, metas, iso }: EficienciaGaugeProps) {
  const { escuro } = useTema();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const valor = useMemo(
    () => {
      void tick;
      return calcularEficiencia(dados, metas, iso);
    },
    // tick força o recálculo a cada minuto para metas por horário
    [dados, metas, iso, tick]
  );
  const nivel = nivelEficiencia(valor);
  const config = NIVEIS_EFICIENCIA[nivel];
  const metasAtivas = METRICAS_META.some(({ tipo }) => metas[tipo].meta > 0);
  const ponteiro = ponto(valor / 100, RAIO - 24);
  const textoCor = escuro ? "#e2e8f0" : "#0f172a";

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Eficiência Operacional
        </h3>
        <Badge>{config.rotulo}</Badge>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <svg viewBox="0 0 220 130" className="w-full max-w-[260px]">
          <path
            d={arco(0, 1, RAIO)}
            stroke={escuro ? "#334155" : "#e2e8f0"}
            strokeWidth={ESPESSURA + 3}
            fill="none"
          />
          {ZONAS.map((z) => (
            <path
              key={z.f1}
              d={arco(z.f1, z.f2, RAIO)}
              stroke={z.cor}
              strokeWidth={ESPESSURA}
              fill="none"
            />
          ))}
          <line
            x1={CX}
            y1={CY}
            x2={ponteiro.x}
            y2={ponteiro.y}
            stroke={textoCor}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={CX} cy={CY} r={5} fill={textoCor} />
          <text
            x={CX}
            y={76}
            textAnchor="middle"
            fill={textoCor}
            fontSize="30"
            fontWeight="700"
          >
            {valor}%
          </text>
          <text
            x={CX}
            y={95}
            textAnchor="middle"
            fill={config.cor}
            fontSize="12"
            fontWeight="600"
          >
            {config.rotulo}
          </text>
        </svg>

        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {Object.values(NIVEIS_EFICIENCIA).map((n) => (
            <span
              key={n.rotulo}
              className="flex items-center gap-1 text-[10.5px] font-medium text-slate-400 dark:text-slate-500"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: n.cor }}
              />
              {n.rotulo}
            </span>
          ))}
        </div>

        {!metasAtivas && (
          <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
            Configure metas no botão Métricas.
          </p>
        )}
      </div>
    </div>
  );
}
