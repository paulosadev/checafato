// Lista de agências de checagem de fatos confiáveis no Brasil.

import { ArrowUpRight } from "lucide-react";
import { agenciasChecagem } from "@/lib/dados";
import AoAparecer from "./AoAparecer";

export default function OndeChecar() {
  return (
    <section id="onde-checar" className="bg-background px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-[1344px]">
        <AoAparecer className="mx-auto max-w-2xl text-center">
          <h2 className="text-heading font-bold text-white sm:text-heading-lg">
            Onde checar
          </h2>
          <p className="mt-3 text-body text-muted-foreground">
            Agências de checagem de fatos confiáveis para confirmar uma
            notícia antes de compartilhar.
          </p>
        </AoAparecer>

        <div className="mt-14 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agenciasChecagem.map((agencia, indice) => (
            <AoAparecer key={agencia.nome} atraso={Math.min(indice * 60, 300)}>
              <a
                href={agencia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-cards border border-border bg-deep-charcoal p-5 transition hover:border-border-strong"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-body font-semibold text-white">
                      {agencia.nome}
                    </h3>
                    <ArrowUpRight
                      size={18}
                      className="text-fog transition group-hover:text-signal-blue"
                    />
                  </div>
                  <p className="mt-1 text-body-sm text-muted-foreground">
                    {agencia.descricao}
                  </p>
                </div>
              </a>
            </AoAparecer>
          ))}
        </div>
      </div>
    </section>
  );
}
