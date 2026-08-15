"use client";

import { useCallback, useRef, useState } from "react";

export interface ToastState {
  mensagem: string;
  erro: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrar = useCallback(
    (mensagem: string, erro = false) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ mensagem, erro });
      timerRef.current = setTimeout(() => setToast(null), 2600);
    },
    []
  );

  const ocultar = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return { toast, mostrar, ocultar };
}