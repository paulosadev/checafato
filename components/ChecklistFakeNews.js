// Seção com um checklist visual de sinais que ajudam a identificar fake news.

import {
  AlertTriangle,
  CalendarDays,
  Image as ImageIcon,
  Newspaper,
  PenLine,
  Share2,
  Siren,
  SearchCheck,
  UserRound,
} from "lucide-react";
import { itensChecklist } from "@/lib/dados";
import AoAparecer from "./AoAparecer";

// Um ícone para cada item da lista, na mesma ordem de lib/dados.js
const icones = [
  Newspaper,
  UserRound,
  CalendarDays,
  AlertTriangle,
  PenLine,
  ImageIcon,
  Siren,
  Share2,
  SearchCheck,
];

export default function ChecklistFakeNews() {
  return (
    <section id="checklist" className="bg-background px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-[1344px]">
        <AoAparecer className="mx-auto max-w-2xl text-center">
          <h2 className="text-heading font-bold text-white sm:text-heading-lg">
            Como identificar uma fake news
          </h2>
          <p className="mt-3 text-body text-muted-foreground">
            Antes de acreditar ou compartilhar, passe o conteúdo por este
            checklist rápido.
          </p>
        </AoAparecer>

        <div className="mt-14 grid grid-cols-1 border-t border-border sm:grid-cols-2">
          {itensChecklist.map((item, indice) => {
            const Icone = icones[indice] ?? AlertTriangle;
            return (
              <AoAparecer
                key={item.titulo}
                atraso={Math.min(indice * 50, 300)}
                className="flex gap-4 border-b border-border py-6 sm:odd:pr-8 sm:even:pl-8"
              >
                <span className="text-heading-sm font-bold text-steel tabular-nums">
                  {String(indice + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="flex items-center gap-2 text-body font-semibold text-white">
                    <Icone size={16} className="shrink-0 text-fog" />
                    {item.titulo}
                  </h3>
                  <p className="mt-2 text-body-sm text-muted-foreground">
                    {item.descricao}
                  </p>
                </div>
              </AoAparecer>
            );
          })}
        </div>
      </div>
    </section>
  );
}
