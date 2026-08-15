import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fechamento Operacional",
  description:
    "Dashboard de lançamento de dados operacionais: faltas, unidades, NFs e SAC.",
};

const TEMA_INICIAL = `try{var t=localStorage.getItem("fechOperacional:tema");if(t==="escuro"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-slate-100 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <div
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html: `<script>${TEMA_INICIAL}</script>`,
          }}
        />
        {children}
      </body>
    </html>
  );
}