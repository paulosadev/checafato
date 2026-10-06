// Seção de abertura da página: título, explicação rápida do projeto e
// botão que leva até o verificador com IA.

import { ScanSearch } from "lucide-react";

export default function Hero() {
  return (
    <section id="inicio" className="bg-background px-4 pt-16 pb-24 sm:px-6 sm:pt-24">
      <div className="mx-auto flex max-w-[1344px] flex-col items-center text-center">
        <h1 className="max-w-3xl text-[40px] font-bold leading-[1.1] tracking-tight text-white sm:text-heading-lg md:text-display">
          Não deixe a <span className="text-signal-blue">fake news</span>{" "}
          passar por você
        </h1>

        <p className="mt-6 max-w-xl text-subheading text-muted-foreground">
          Recebeu um print duvidoso no grupo da família? Cole aqui o print,
          o link ou o texto, e a gente confere: a IA cruza com outras
          fontes e mostra os sinais de alerta em poucos segundos.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="#verificador"
            className="inline-flex items-center gap-2 rounded-buttons bg-primary px-6 py-3 text-body-sm font-medium text-primary-foreground transition-[filter,transform] duration-150 ease-out hover:brightness-125 active:scale-[0.97]"
          >
            <ScanSearch size={18} />
            Verificar agora
          </a>
          <a
            href="#checklist"
            className="inline-flex items-center gap-2 rounded-buttons border border-silver px-6 py-3 text-body-sm font-medium text-white transition-[border-color,transform] duration-150 ease-out hover:border-white active:scale-[0.97]"
          >
            Ver checklist de fake news
          </a>
        </div>

        {/* painel decorativo — console escaneando o conteúdo analisado */}
        <div className="relative mt-16 w-full overflow-hidden rounded-cards bg-deep-charcoal p-6 shadow-xl sm:p-10">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-10">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-steel">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-blue/20 motion-reduce:animate-none" />
              <ScanSearch className="text-signal-blue" size={26} />
            </div>
            <p className="text-body-sm font-medium text-fog">
              Analisando conteúdo em tempo real
            </p>
            <div className="h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-gunmetal">
              <div className="h-full w-2/3 rounded-full bg-signal-blue" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
