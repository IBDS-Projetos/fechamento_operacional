import type { DadosPorDia, TipoLancamento } from "@/types";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TIPOS, TIPOS_OPERACIONAIS } from "@/lib/constantes";
import { formatarNumero } from "@/lib/datas";
import { somarPorDia, somarTotal } from "@/lib/agregacao";

interface KpiGridProps {
  dados: DadosPorDia;
  iso: string;
}

export function KpiGrid({ dados, iso }: KpiGridProps) {
  const tipos: TipoLancamento[] = [
    ...TIPOS_OPERACIONAIS,
    "sac_oper",
    "sac_clie",
  ];

  return (
    <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {tipos.map((tipo) => {
        const config = TIPOS[tipo];
        const valor = somarPorDia(dados, iso, tipo);
        const totalGeral = somarTotal(dados, tipo);
        return (
          <KpiCard
            key={tipo}
            tipo={tipo}
            icone={config.icone}
            titulo={config.label}
            valor={valor}
            sub={`${formatarNumero(totalGeral)} no total`}
            cor={config.cor}
          />
        );
      })}
    </section>
  );
}