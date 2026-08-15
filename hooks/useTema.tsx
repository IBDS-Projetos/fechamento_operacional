"use client";

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
  const [escuro, setEscuro] = useState(false);
  const [inicializado, setInicializado] = useState(false);

  useEffect(() => {
    const salvo = window.localStorage.getItem(CHAVE_TEMA);
    const preferencia =
      salvo === "escuro" ||
      (salvo === null &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches);
    // Leitura da preferência salva (localStorage/sistema) no mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEscuro(preferencia);
    setInicializado(true);
  }, []);

  useEffect(() => {
    if (!inicializado) return;
    document.documentElement.classList.toggle("dark", escuro);
    window.localStorage.setItem(CHAVE_TEMA, escuro ? "escuro" : "claro");
  }, [escuro, inicializado]);

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