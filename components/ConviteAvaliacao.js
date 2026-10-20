// Card discreto exibido depois do resultado da análise,
// convidando o usuário a avaliar o ChecaFato no formulário.

import { MessageSquare } from "lucide-react";
import { LINK_FORMULARIO_AVALIACAO } from "@/lib/config";

export default function ConviteAvaliacao() {
  return (
    <div className="mt-6 flex flex-col items-start gap-3 rounded-inputs border border-border bg-graphite/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2 text-body-sm text-muted-foreground">
        <MessageSquare size={16} className="mt-0.5 shrink-0" />
        Essa análise te ajudou? Conta pra gente em menos de 1 minuto.
      </p>
      <a
        href={LINK_FORMULARIO_AVALIACAO}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-buttons border border-border-strong px-4 py-2 text-body-sm font-medium text-foreground transition-colors duration-150 ease-out hover:border-signal-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/50"
      >
        Avaliar o ChecaFato
      </a>
    </div>
  );
}
