import type { JSX, SVGProps } from "react";

export type IconeNome =
  | "menu"
  | "fechar"
  | "sol"
  | "lua"
  | "mais"
  | "calendario"
  | "chevron-esq"
  | "chevron-dir"
  | "chevron-baixo"
  | "clipboard"
  | "lista"
  | "alvo"
  | "busca"
  | "baixar"
  | "enviar"
  | "atualizar"
  | "banco"
  | "lixeira"
  | "relogio"
  | "atendimento"
  | "usuario"
  | "falta"
  | "unidades"
  | "nf_faturada"
  | "nf_embarcada"
  | "sac_oper";

const P = (d: string) => <path key={d} d={d} />;
const C = (cx: number, cy: number, r: number) => (
  <circle key={`c-${cx}-${cy}`} cx={cx} cy={cy} r={r} />
);

const CAMINHOS: Record<IconeNome, JSX.Element[]> = {
  menu: [P("M3.5 6h17"), P("M3.5 12h17"), P("M3.5 18h17")],
  fechar: [P("M6 6l12 12"), P("M18 6L6 18")],
  sol: [
    C(12, 12, 4),
    P("M12 3v2"),
    P("M12 19v2"),
    P("M5 5l1.5 1.5"),
    P("M17.5 17.5L19 19"),
    P("M3 12h2"),
    P("M19 12h2"),
    P("M5 19L6.5 17.5"),
    P("M17.5 6.5L19 5"),
  ],
  lua: [P("M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z")],
  mais: [P("M12 5v14"), P("M5 12h14")],
  calendario: [
    P("M8 2v4"),
    P("M16 2v4"),
    P("M3 9h18"),
    P("M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"),
  ],
  "chevron-esq": [P("M15 18l-6-6 6-6")],
  "chevron-dir": [P("M9 18l6-6-6-6")],
  "chevron-baixo": [P("M6 9l6 6 6-6")],
  clipboard: [
    P("M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1z"),
    P("M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"),
  ],
  lista: [
    P("M8 6h13"),
    P("M8 12h13"),
    P("M8 18h13"),
    P("M3.5 6h.01"),
    P("M3.5 12h.01"),
    P("M3.5 18h.01"),
  ],
  alvo: [P("M12 14.5l3.5-3.5"), P("M3.34 19a10 10 0 1 1 17.32 0")],
  busca: [C(11, 11, 8), P("M21 21l-4.35-4.35")],
  baixar: [
    P("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"),
    P("m7 10 5 5 5-5"),
    P("M12 15V3"),
  ],
  enviar: [
    P("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"),
    P("m17 8-5-5-5 5"),
    P("M12 3v12"),
  ],
  atualizar: [
    P("M21 12a9 9 0 1 1-2.64-6.36"),
    P("M21 3v6h-6"),
  ],
  banco: [
    P("M4 6c0-1.66 3.58-3 8-3s8 1.34 8 3-3.58 3-8 3-8-1.34-8-3z"),
    P("M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6"),
    P("M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"),
  ],
  lixeira: [
    P("M3 6h18"),
    P("M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"),
    P("M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"),
    P("M10 11v6"),
    P("M14 11v6"),
  ],
  relogio: [C(12, 12, 9), P("M12 7v5l3 2")],
  atendimento: [
    P("M3 18v-6a9 9 0 0 1 18 0v6"),
    P("M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"),
    P("M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"),
  ],
  usuario: [
    P("M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"),
    C(12, 7, 4),
  ],
  falta: [
    P("M21.73 18l-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"),
    P("M12 9v4"),
    P("M12 17h.01"),
  ],
  unidades: [
    P("M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"),
    P("m3.3 7 8.7 5 8.7-5"),
    P("M12 22V12"),
  ],
  nf_faturada: [
    P("M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"),
    P("M14 2v6h6"),
    P("M16 13H8"),
    P("M16 17H8"),
    P("M10 9H8"),
  ],
  nf_embarcada: [
    P("M10 17h4V5H2v12h3"),
    P("M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"),
    C(7.5, 17.5, 2),
    C(17.5, 17.5, 2),
  ],
  sac_oper: [
    P("M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"),
  ],
};

interface IconProps extends SVGProps<SVGSVGElement> {
  nome: IconeNome;
  tamanho?: number;
}

export function Icon({ nome, tamanho = 18, ...props }: IconProps) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {CAMINHOS[nome]}
    </svg>
  );
}
