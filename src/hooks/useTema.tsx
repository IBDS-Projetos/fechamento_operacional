import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Tema = "claro" | "escuro";

interface TemaContexto {
  escuro: boolean;
  alternar: () => void;
}

const TemaContext = createContext<TemaContexto>({
  escuro: false,
  alternar: () => {},
});

const CHAVE_TEMA = "fechOperacional:tema";

export function TemaProvider({ children }: { children: ReactNode }) {
  // SPA (Vite): sem SSR, lemos a preferência direto no estado inicial.
  // O script inline no index.html evita o "flash" de tema errado.
  const [escuro, setEscuro] = useState<boolean>(() => {
    const salvo = window.localStorage.getItem(CHAVE_TEMA);
    if (salvo === "escuro" || salvo === "claro") return salvo === "escuro";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", escuro);
    window.localStorage.setItem(CHAVE_TEMA, escuro ? "escuro" : "claro");
  }, [escuro]);

  const alternar = useCallback(() => setEscuro((v) => !v), []);

  return (
    <TemaContext.Provider value={{ escuro, alternar }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}