import { useEffect, useRef, useState } from "react";
import type {
  NovoLancamento,
  TipoLancamento,
  TipoSac,
} from "@/types";
import { Modal } from "@/components/modal/Modal";
import { Botao } from "@/components/ui/Botao";
import { MOTIVOS_PADRAO, TIPOS, TIPOS_OPERACIONAIS } from "@/lib/constantes";
import { validarLancamento } from "@/lib/validacao";

interface LancamentoModalProps {
  aberto: boolean;
  tipoFixo: TipoSac | null;
  dataInicial: string;
  onSalvar: (input: NovoLancamento) => void;
  onFechar: () => void;
}

export function LancamentoModal({
  aberto,
  tipoFixo,
  dataInicial,
  onSalvar,
  onFechar,
}: LancamentoModalProps) {
  const [tipo, setTipo] = useState<TipoLancamento>("falta");
  const [motivo, setMotivo] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [data, setData] = useState(dataInicial);
  const [erro, setErro] = useState<string | null>(null);

  const quantidadeRef = useRef<HTMLInputElement>(null);

  const ehSac = tipo === "sac_oper" || tipo === "sac_clie";

  useEffect(() => {
    if (!aberto) return;
    // Reinicia o formulário ao abrir o modal
    setTipo(tipoFixo ?? "falta");
    setMotivo("");
    setQuantidade("");
    setData(dataInicial);
    setErro(null);
    setTimeout(() => quantidadeRef.current?.focus(), 50);
  }, [aberto, tipoFixo, dataInicial]);

  const salvar = () => {
    const qtd = Number(quantidade);
    const input: NovoLancamento = {
      tipo,
      motivo: ehSac ? motivo : null,
      quantidade: qtd,
      data,
    };
    const problema = validarLancamento(input);
    if (problema) {
      setErro(problema);
      return;
    }
    onSalvar(input);
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
      titulo={
        tipoFixo ? `Lançamento: ${TIPOS[tipoFixo].label}` : "Novo Lançamento"
      }
      onFechar={onFechar}
      rodape={
        <>
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao onClick={salvar}>Salvar lançamento</Botao>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {tipoFixo === null && (
          <div>
            {rotuloCampo("Tipo de lançamento")}
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoLancamento)}
              className={inputClasse}
            >
              {TIPOS_OPERACIONAIS.map((t) => (
                <option key={t} value={t}>
                  {TIPOS[t].label}
                </option>
              ))}
            </select>
          </div>
        )}

        {ehSac && (
          <div>
            {rotuloCampo("Motivo do SAC")}
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className={inputClasse}
            >
              <option value="">Selecione o motivo</option>
              {MOTIVOS_PADRAO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          {rotuloCampo("Quantidade")}
          <input
            ref={quantidadeRef}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            placeholder="0"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className={inputClasse}
          />
        </div>

        <div>
          {rotuloCampo("Data do lançamento")}
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className={inputClasse}
          />
        </div>

        {erro && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
            {erro}
          </p>
        )}
      </div>
    </Modal>
  );
}