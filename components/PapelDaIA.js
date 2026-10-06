// Explica, de forma resumida, como a IA ajuda no combate à desinformação
// e quais são os seus limites — para o usuário não confiar 100% nela.

import {
  BrainCircuit,
  Eye,
  EyeOff,
  Gauge,
  Scale,
  ScanEye,
  UserCheck,
} from "lucide-react";
import AoAparecer from "./AoAparecer";

const vantagens = [
  {
    Icone: Gauge,
    titulo: "Análise em escala",
    descricao:
      "A IA consegue analisar milhares de conteúdos por minuto, algo impossível para um grupo de checadores humanos sozinho.",
  },
  {
    Icone: ScanEye,
    titulo: "Detecção de padrões",
    descricao:
      "Reconhece padrões comuns em boatos: linguagem alarmista, formatação suspeita, pedidos de compartilhamento urgente.",
  },
  {
    Icone: Scale,
    titulo: "Checagem cruzada",
    descricao:
      "Pode buscar e comparar a informação com outras fontes jornalísticas na internet antes de dar um veredito.",
  },
];

const limites = [
  {
    Icone: EyeOff,
    titulo: "Alucinações",
    descricao:
      "A IA pode, às vezes, inventar informações ou fontes que não existem de verdade.",
  },
  {
    Icone: Scale,
    titulo: "Vieses",
    descricao:
      "Os modelos aprendem com dados da internet e podem repetir vieses presentes nesses dados.",
  },
  {
    Icone: Eye,
    titulo: "Deepfakes cada vez melhores",
    descricao:
      "Imagens, áudios e vídeos falsos estão cada vez mais realistas e difíceis de detectar automaticamente.",
  },
  {
    Icone: UserCheck,
    titulo: "Checagem humana ainda é essencial",
    descricao:
      "Por isso, o resultado da IA deve ser um ponto de partida — e não a palavra final sobre um fato.",
  },
];

export default function PapelDaIA() {
  return (
    <section id="papel-da-ia" className="bg-background px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-[1344px]">
        <AoAparecer className="mx-auto max-w-2xl text-center">
          <h2 className="flex items-center justify-center gap-3 text-heading font-bold text-white sm:text-heading-lg">
            <BrainCircuit className="shrink-0 text-signal-blue" size={28} />
            O papel da IA
          </h2>
          <p className="mt-3 text-body text-muted-foreground">
            A Inteligência Artificial é uma aliada poderosa contra a
            desinformação, mas também tem limites importantes.
          </p>
        </AoAparecer>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-body-sm font-semibold text-map-green">
              Como a IA ajuda
            </h3>
            <div className="space-y-4">
              {vantagens.map((item, indice) => (
                <AoAparecer
                  key={item.titulo}
                  atraso={indice * 60}
                  className="flex gap-4 rounded-cards border border-border bg-deep-charcoal p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-inputs bg-graphite text-fog">
                    <item.Icone size={19} />
                  </div>
                  <div>
                    <h4 className="text-body font-semibold text-white">
                      {item.titulo}
                    </h4>
                    <p className="mt-1 text-body-sm text-muted-foreground">
                      {item.descricao}
                    </p>
                  </div>
                </AoAparecer>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-body-sm font-semibold text-fog">
              Seus limites
            </h3>
            <div className="space-y-4">
              {limites.map((item, indice) => (
                <AoAparecer
                  key={item.titulo}
                  atraso={indice * 60}
                  className="flex gap-4 rounded-cards border border-border bg-deep-charcoal p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-inputs bg-graphite text-fog">
                    <item.Icone size={19} />
                  </div>
                  <div>
                    <h4 className="text-body font-semibold text-white">
                      {item.titulo}
                    </h4>
                    <p className="mt-1 text-body-sm text-muted-foreground">
                      {item.descricao}
                    </p>
                  </div>
                </AoAparecer>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
