// Rodapé simples da página.

import { ShieldCheck } from "lucide-react";
import { infoProjeto } from "@/lib/dados";

export default function Footer() {
  return (
    <footer className="bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-[1344px] flex-col items-center justify-between gap-3 text-body-sm text-muted-foreground sm:flex-row">
        <span className="flex items-center gap-2 font-medium text-white">
          <ShieldCheck size={16} className="text-signal-blue" />
          ChecaFato
        </span>
        <p className="text-center sm:text-right">
          Projeto de Extensão · {infoProjeto.curso} · {infoProjeto.instituicao} · 2026
        </p>
      </div>
    </footer>
  );
}
