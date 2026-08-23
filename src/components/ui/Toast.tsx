import type { ToastState } from "@/hooks/useToast";

export function Toast({ estado }: { estado: ToastState }) {
  return (
    <div
      role="status"
      className={`toast-in fixed right-6 bottom-6 z-[100] rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg ${
        estado.erro ? "bg-rose-600" : "bg-slate-900"
      }`}
    >
      {estado.mensagem}
    </div>
  );
}
