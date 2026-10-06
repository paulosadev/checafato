"use client";

// Seção principal da página: o verificador com IA.
// Tem 3 abas (foto/print, link e texto) e mostra o resultado da análise.

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ImageUp,
  Link2,
  Loader2,
  MessageSquareText,
  TriangleAlert,
  X,
} from "lucide-react";
import ResultadoVerificacao from "./ResultadoVerificacao";
import AoAparecer from "./AoAparecer";

const ABAS = [
  { id: "imagem", nome: "Foto / print", Icone: ImageUp },
  { id: "link", nome: "Link", Icone: Link2 },
  { id: "texto", nome: "Texto", Icone: MessageSquareText },
];

const TIPOS_IMAGEM_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO_IMAGEM = 4 * 1024 * 1024; // 4 MB

// Lê um arquivo de imagem e devolve o base64 (sem o prefixo "data:...;base64,")
function lerImagemComoBase64(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      const resultado = leitor.result;
      const base64 = String(resultado).split(",")[1] ?? "";
      resolve(base64);
    };
    leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    leitor.readAsDataURL(arquivo);
  });
}

export default function Verificador() {
  const [abaAtiva, setAbaAtiva] = useState("imagem");

  const [arquivoImagem, setArquivoImagem] = useState(null);
  const [preVisualizacao, setPreVisualizacao] = useState(null);
  const [link, setLink] = useState("");
  const [texto, setTexto] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);

  const inputArquivoRef = useRef(null);

  function limparResultadoEErro() {
    setErro("");
    setResultado(null);
  }

  function selecionarAba(id) {
    setAbaAtiva(id);
    limparResultadoEErro();
  }

  function removerImagemSelecionada() {
    setArquivoImagem(null);
    setPreVisualizacao(null);
    if (inputArquivoRef.current) inputArquivoRef.current.value = "";
  }

  function tratarSelecaoDeArquivo(evento) {
    const arquivo = evento.target.files?.[0];
    limparResultadoEErro();

    if (!arquivo) return;

    if (!TIPOS_IMAGEM_ACEITOS.includes(arquivo.type)) {
      setErro("Formato não suportado. Envie um arquivo JPG, PNG ou WEBP.");
      removerImagemSelecionada();
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
      setErro("A imagem passa do limite de 4 MB.");
      removerImagemSelecionada();
      return;
    }

    setArquivoImagem(arquivo);
    setPreVisualizacao(URL.createObjectURL(arquivo));
  }

  async function analisarConteudo() {
    limparResultadoEErro();

    // validações antes de chamar a API
    if (abaAtiva === "imagem" && !arquivoImagem) {
      setErro("Selecione uma imagem para analisar.");
      return;
    }
    if (abaAtiva === "link" && !link.trim()) {
      setErro("Cole o link da notícia para analisar.");
      return;
    }
    if (abaAtiva === "texto" && !texto.trim()) {
      setErro("Cole algum texto para analisar.");
      return;
    }

    setCarregando(true);

    try {
      let corpo;

      if (abaAtiva === "imagem") {
        const base64 = await lerImagemComoBase64(arquivoImagem);
        corpo = {
          tipo: "imagem",
          imagem: { base64, mimeType: arquivoImagem.type },
        };
      } else if (abaAtiva === "link") {
        corpo = { tipo: "link", url: link.trim() };
      } else {
        corpo = { tipo: "texto", texto: texto.trim() };
      }

      const resposta = await fetch("/api/analisar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados?.erro || "Não foi possível concluir a análise.");
        return;
      }

      setResultado(dados);
    } catch {
      setErro(
        "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section
      id="verificador"
      className="bg-deep-charcoal px-4 py-24 sm:px-6"
    >
      <div className="mx-auto max-w-3xl">
        <AoAparecer className="text-center">
          <h2 className="text-heading font-bold text-white sm:text-heading-lg">
            Verificador com IA
          </h2>
          <p className="mt-3 text-body text-muted-foreground">
            Envie um print, um link ou um texto suspeito e veja o que a IA
            encontra.
          </p>
        </AoAparecer>

        <div className="mt-10 rounded-cards border border-border bg-gunmetal p-4 sm:p-6">
          {/* abas */}
          <div className="grid grid-cols-3 gap-2 rounded-buttons bg-graphite p-1.5">
            {ABAS.map((aba) => (
              <button
                key={aba.id}
                type="button"
                onClick={() => selecionarAba(aba.id)}
                className={`flex items-center justify-center gap-1.5 rounded-buttons py-2 text-body-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/50 ${
                  abaAtiva === aba.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <aba.Icone size={16} />
                {aba.nome}
              </button>
            ))}
          </div>

          {/* conteúdo da aba */}
          <div className="mt-6">
            {abaAtiva === "imagem" && (
              <div>
                <input
                  ref={inputArquivoRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={tratarSelecaoDeArquivo}
                  className="hidden"
                  id="input-imagem"
                />

                {!preVisualizacao ? (
                  <label
                    htmlFor="input-imagem"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-inputs border-2 border-dashed border-steel px-4 py-10 text-center transition hover:border-signal-blue"
                  >
                    <ImageUp className="text-fog" size={28} />
                    <span className="text-body-sm font-medium text-white">
                      Clique para enviar um print ou foto
                    </span>
                    <span className="text-body-sm text-fog">
                      JPG, PNG ou WEBP · até 4 MB
                    </span>
                  </label>
                ) : (
                  <div className="relative mx-auto h-80 w-full max-w-sm">
                    <Image
                      src={preVisualizacao}
                      alt="Pré-visualização da imagem enviada"
                      fill
                      unoptimized
                      className="rounded-inputs object-contain"
                    />
                    <button
                      type="button"
                      onClick={removerImagemSelecionada}
                      aria-label="Remover imagem"
                      className="absolute -right-2 -top-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-void-black shadow-xl-2"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {abaAtiva === "link" && (
              <div>
                <label
                  htmlFor="input-link"
                  className="mb-2 block text-body-sm font-medium text-white"
                >
                  Link da notícia
                </label>
                <input
                  id="input-link"
                  type="url"
                  inputMode="url"
                  placeholder="https://exemplo.com/noticia"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full rounded-inputs border border-steel bg-graphite px-4 py-3 text-body-sm text-white placeholder-slate outline-none transition-colors focus:border-signal-blue focus-visible:ring-2 focus-visible:ring-signal-blue/40"
                />
              </div>
            )}

            {abaAtiva === "texto" && (
              <div>
                <label
                  htmlFor="input-texto"
                  className="mb-2 block text-body-sm font-medium text-white"
                >
                  Mensagem de WhatsApp ou trecho de notícia
                </label>
                <textarea
                  id="input-texto"
                  rows={6}
                  placeholder="Cole aqui o texto que você quer verificar..."
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  className="w-full resize-none rounded-inputs border border-steel bg-graphite px-4 py-3 text-body-sm text-white placeholder-slate outline-none transition-colors focus:border-signal-blue focus-visible:ring-2 focus-visible:ring-signal-blue/40"
                />
              </div>
            )}
          </div>

          {erro && (
            <div className="mt-4 flex items-start gap-2 rounded-inputs border border-veredito-falso/30 bg-veredito-falso/10 px-4 py-3 text-body-sm text-veredito-falso">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              {erro}
            </div>
          )}

          <button
            type="button"
            onClick={analisarConteudo}
            disabled={carregando}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-buttons bg-primary py-3 text-body-sm font-medium text-primary-foreground transition-[filter,transform] duration-150 ease-out hover:brightness-125 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {carregando ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analisando...
              </>
            ) : (
              "Analisar"
            )}
          </button>

          {resultado && <ResultadoVerificacao resultado={resultado} />}
        </div>
      </div>
    </section>
  );
}
