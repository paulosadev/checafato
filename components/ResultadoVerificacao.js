"use client";

// Mostra o resultado devolvido pela IA: selo do veredito, confiança,
// sinais encontrados, explicação e fontes consultadas.

import {
  CircleHelp,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

// Configuração visual de cada veredito possível.
const ESTILO_VEREDITO = {
  "Provavelmente falso": {
    Icone: ShieldX,
    classe: "bg-veredito-falso/15 text-veredito-falso border-veredito-falso/40",
  },
  "Enganoso / fora de contexto": {
    Icone: ShieldAlert,
    classe:
      "bg-veredito-enganoso/15 text-veredito-enganoso border-veredito-enganoso/40",
  },
  "Não verificável": {
    Icone: CircleHelp,
    classe: "bg-steel/30 text-fog border-steel",
  },
  "Provavelmente verdadeiro": {
    Icone: ShieldCheck,
    classe:
      "bg-veredito-verdadeiro/15 text-veredito-verdadeiro border-veredito-verdadeiro/40",
  },
};

const TEXTO_CONFIANCA = {
  baixo: "Confiança baixa",
  médio: "Confiança média",
  alto: "Confiança alta",
};

// Tenta transformar um item de fonte (string) em algo clicável,
// caso contenha uma URL dentro do texto.
function extrairLinkDaFonte(fonte) {
  const casamento = fonte.match(/https?:\/\/[^\s)]+/);
  return casamento ? casamento[0] : null;
}

export default function ResultadoVerificacao({ resultado }) {
  const estilo =
    ESTILO_VEREDITO[resultado.veredito] ?? ESTILO_VEREDITO["Não verificável"];
  const { Icone } = estilo;

  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-buttons border px-4 py-1.5 text-body-sm font-medium ${estilo.classe}`}
        >
          <Icone size={16} />
          {resultado.veredito}
        </span>

        <span className="inline-flex items-center rounded-badges border border-pewter px-3 py-1 text-body-sm font-medium text-fog">
          {TEXTO_CONFIANCA[resultado.confianca] ?? "Confiança baixa"}
        </span>
      </div>

      {resultado.sinais.length > 0 && (
        <div className="mt-5">
          <h3 className="text-body-sm font-semibold text-fog">
            Sinais encontrados
          </h3>
          <ul className="mt-3 space-y-1.5">
            {resultado.sinais.map((sinal, indice) => (
              <li
                key={indice}
                className="flex items-start gap-2 text-body-sm text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ash" />
                {sinal}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5">
        <h3 className="text-body-sm font-semibold text-fog">
          Explicação
        </h3>
        <p className="mt-3 text-body-sm text-muted-foreground">
          {resultado.explicacao}
        </p>
      </div>

      {resultado.fontes.length > 0 && (
        <div className="mt-5">
          <h3 className="text-body-sm font-semibold text-fog">
            Fontes consultadas
          </h3>
          <ul className="mt-3 space-y-1.5">
            {resultado.fontes.map((fonte, indice) => {
              const link = extrairLinkDaFonte(fonte);
              return (
                <li key={indice} className="text-body-sm">
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-signal-blue hover:underline"
                    >
                      {fonte}
                      <ExternalLink size={13} />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{fonte}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="mt-6 border-t border-border pt-4 text-body-sm text-fog">
        A análise é feita por IA e pode errar. Sempre confirme em agências de
        checagem.
      </p>
    </div>
  );
}
