"use client";

import { useEffect, useState } from "react";
import type { MetasOperacionais, ModoMeta, TipoMeta } from "@/types";
import { Modal } from "@/components/modal/Modal";
import { Botao } from "@/components/ui/Botao";
import { METAS_PADRAO, TIPOS } from "@/lib/constantes";
import { METRICAS_META } from "@/lib/eficiencia";

interface MetricasModalProps {
  aberto: boolean;
  metas: MetasOperacionais;
  onSalvar: (metas: MetasOperacionais) => void;
  onFechar: () => void;
}

export function MetricasModal({
  aberto,
  metas,
  onSalvar,
  onFechar,
}: MetricasModalProps) {
  const [edit, setEdit] = useState<MetasOperacionais>(METAS_PADRAO);

  useEffect(() => {
    if (!aberto) return;
    // Sincroniza o rascunho do formulário com as metas salvas ao abrir
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEdit({
      unidades: { ...metas.unidades },
      nf_faturada: { ...metas.nf_faturada },
      nf_embarcada: { ...metas.nf_embarcada },
    });
  }, [aberto, metas]);

  const alterarModo = (tipo: TipoMeta, modo: ModoMeta) => {
    setEdit((prev) => ({ ...prev, [tipo]: { ...prev[tipo], modo } }));
  };

  const alterarMeta = (tipo: TipoMeta, meta: number) => {
    setEdit((prev) => ({ ...prev, [tipo]: { ...prev[tipo], meta } }));
  };

  const alterarHorario = (tipo: TipoMeta, horario: string) => {
    setEdit((prev) => ({ ...prev, [tipo]: { ...prev[tipo], horario } }));
  };

  const salvar = () => {
    onSalvar(edit);
    onFechar();
  };

  const rotuloCampo = (texto: string) => (
    <span className="mb-1 block text-[11.5px] font-medium text-slate-500 dark:text-slate-400">
      {texto}
    </span>
  );

  const inputClasse =
    "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700/60 [color-scheme:light] dark:[color-scheme:dark]";

  return (
    <Modal
      aberto={aberto}
      titulo="Métricas & Metas"
      onFechar={onFechar}
      rodape={
        <>
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao onClick={salvar}>Salvar metas</Botao>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[12px] leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
          Defina metas por quantidade ou por horário. A eficiência é calculada
          pela média ponderada do progresso de cada meta ativa (meta &gt; 0).
        </p>

        {METRICAS_META.map(({ tipo, rotulo }) => {
          const cfg = edit[tipo];
          const cor = TIPOS[tipo].cor;
          return (
            <div
              key={tipo}
              className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
            >
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: cor }}
                />
                <p className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-100">
                  {rotulo}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  {rotuloCampo("Tipo de meta")}
                  <select
                    value={cfg.modo}
                    onChange={(e) =>
                      alterarModo(tipo, e.target.value as ModoMeta)
                    }
                    className={inputClasse}
                  >
                    <option value="quantidade">Por quantidade</option>
                    <option value="horario">Por horário</option>
                  </select>
                </div>

                <div>
                  {rotuloCampo("Meta (quantidade)")}
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    value={cfg.meta || ""}
                    onChange={(e) =>
                      alterarMeta(tipo, Number(e.target.value))
                    }
                    placeholder="0"
                    className={inputClasse}
                  />
                </div>
              </div>

              {cfg.modo === "horario" && (
                <div className="mt-2.5">
                  {rotuloCampo("Prazo (até às)")}
                  <input
                    type="time"
                    value={cfg.horario}
                    onChange={(e) => alterarHorario(tipo, e.target.value)}
                    className={inputClasse}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}