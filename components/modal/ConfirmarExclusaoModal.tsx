"use client";

import { Modal } from "@/components/modal/Modal";
import { Botao } from "@/components/ui/Botao";

interface ConfirmarExclusaoModalProps {
  aberto: boolean;
  titulo: string;
  descricao: string;
  detalhes?: string;
  onConfirmar: () => void;
  onFechar: () => void;
}

export function ConfirmarExclusaoModal({
  aberto,
  titulo,
  descricao,
  detalhes,
  onConfirmar,
  onFechar,
}: ConfirmarExclusaoModalProps) {
  return (
    <Modal
      aberto={aberto}
      titulo={titulo}
      onFechar={onFechar}
      rodape={
        <>
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao variante="perigo" onClick={onConfirmar}>
            Excluir
          </Botao>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {descricao}
      </p>
      {detalhes && (
        <p className="mt-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[12.5px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
          {detalhes}
        </p>
      )}
    </Modal>
  );
}