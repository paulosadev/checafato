// Informações sobre o projeto de extensão: instituição, disciplina,
// orientador e integrantes do grupo (de dois cursos diferentes).

import { GraduationCap } from "lucide-react";
import { infoProjeto, integrantes } from "@/lib/dados";
import AoAparecer from "./AoAparecer";

const ficha = [
  { rotulo: "Instituição", valor: infoProjeto.instituicao },
  { rotulo: "Curso", valor: infoProjeto.curso },
  { rotulo: "Disciplina", valor: infoProjeto.disciplina },
  { rotulo: "Orientador", valor: infoProjeto.orientador },
];

export default function SobreProjeto() {
  return (
    <section id="sobre" className="bg-deep-charcoal px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <AoAparecer className="text-center">
          <h2 className="flex items-center justify-center gap-3 text-heading font-bold text-white sm:text-heading-lg">
            <GraduationCap className="shrink-0 text-signal-blue" size={28} />
            Sobre o projeto
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-body text-muted-foreground">
            {infoProjeto.titulo}
          </p>
        </AoAparecer>

        {/* duas colunas desiguais: ficha técnica à esquerda, equipe à direita */}
        <AoAparecer
          atraso={100}
          className="mt-12 grid gap-10 border-t border-border pt-10 sm:grid-cols-[1fr_1.3fr]"
        >
          <dl className="space-y-5">
            {ficha.map((item) => (
              <div key={item.rotulo}>
                <dt className="text-body-sm font-medium text-fog">
                  {item.rotulo}
                </dt>
                <dd className="mt-1 text-body font-medium text-white">
                  {item.valor}
                </dd>
              </div>
            ))}
          </dl>

          <div>
            <h3 className="text-body-sm font-medium text-fog">Integrantes</h3>
            <ul className="mt-3 divide-y divide-border">
              {integrantes.map((pessoa) => (
                <li
                  key={pessoa.nome}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <span className="text-body font-medium text-white">
                    {pessoa.nome}
                  </span>
                  <span className="shrink-0 text-body-sm text-ash">
                    {pessoa.curso}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </AoAparecer>
      </div>
    </section>
  );
}
