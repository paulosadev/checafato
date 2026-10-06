// Rota de API que recebe o conteúdo enviado pelo usuário (imagem, link ou
// texto) e pede para a IA da Groq analisar se parece ser fake news.
//
// A chave da API (GROQ_API_KEY) só existe aqui no servidor e nunca é
// enviada para o navegador do usuário.

import { NextResponse } from "next/server";

const URL_GROQ = "https://api.groq.com/openai/v1/chat/completions";

// Modelo com visão, usado para analisar prints/fotos enviados pelo usuário.
const MODELO_IMAGEM = "qwen/qwen3.8-27b";

// Modelo com busca na web integrada, usado para checar links e textos
// cruzando a informação com outras fontes na internet.
const MODELO_COM_BUSCA = "openai/gpt-oss-120b";

const TAMANHO_MAXIMO_IMAGEM = 4 * 1024 * 1024; // 4 MB
const TIPOS_IMAGEM_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO_TEXTO = 8000; // caracteres

const VEREDITOS_VALIDOS = [
  "Provavelmente falso",
  "Enganoso / fora de contexto",
  "Não verificável",
  "Provavelmente verdadeiro",
];

const CONFIANCAS_VALIDAS = ["baixo", "médio", "alto"];

// Regras que a IA deve seguir em toda análise, com o formato de saída fixo.
const INSTRUCOES_BASE = `Você é um verificador de fatos (fact-checker) brasileiro, especializado em identificar fake news, boatos e desinformação.

Avalie o conteúdo enviado observando sinais como: fonte confiável, autoria identificada, data da publicação, título sensacionalista, erros de português, imagens fora de contexto, apelo emocional ou de urgência, pedidos de compartilhamento rápido ("compartilhe antes que apaguem") e se a informação é confirmada por outros veículos jornalísticos.

Responda SEMPRE em português do Brasil e APENAS com um JSON válido, sem nenhum texto antes ou depois, sem markdown, seguindo exatamente este formato:
{"veredito": "...", "confianca": "...", "sinais": ["..."], "explicacao": "...", "fontes": ["..."]}

Regras dos campos:
- "veredito": use exatamente um destes valores: "Provavelmente falso", "Enganoso / fora de contexto", "Não verificável" ou "Provavelmente verdadeiro".
- "confianca": use exatamente um destes valores: "baixo", "médio" ou "alto".
- "sinais": lista curta (até 6 itens) com os sinais de alerta (ou de credibilidade) encontrados.
- "explicacao": um parágrafo curto, direto, com até 3 frases, explicando o veredito.
- "fontes": lista com as fontes externas consultadas para cruzar a informação (nome e link). Use lista vazia [] se nenhuma fonte externa foi consultada.`;

// Monta as mensagens enviadas para a IA, de acordo com o tipo de conteúdo.
function montarMensagens(tipo, dados) {
  if (tipo === "imagem") {
    const instrucaoImagem = `${INSTRUCOES_BASE}

Importante: você está analisando uma imagem (print de rede social, notícia ou mensagem) e NÃO tem acesso à internet nesta análise. Baseie-se apenas no que está visível na imagem (texto, fonte citada, aparência, qualidade, sinais de edição etc). Não invente fontes externas: se não for possível confirmar nada fora da própria imagem, deixe "fontes" como uma lista vazia e use "confianca" baixo ou médio.`;

    return [
      { role: "system", content: instrucaoImagem },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analise esta imagem e diga se ela parece ser uma fake news, um boato ou conteúdo enganoso.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${dados.mimeType};base64,${dados.base64}`,
            },
          },
        ],
      },
    ];
  }

  if (tipo === "link") {
    const instrucaoLink = `${INSTRUCOES_BASE}

Você tem acesso a uma ferramenta de busca na internet. Use-a para abrir o link informado (ou pesquisar sobre o assunto, caso não consiga acessar a página diretamente) e cruzar a informação com outras fontes jornalísticas confiáveis antes de responder.`;

    return [
      { role: "system", content: instrucaoLink },
      {
        role: "user",
        content: `Verifique esta notícia, com base no link: ${dados.url}`,
      },
    ];
  }

  // tipo === "texto"
  const instrucaoTexto = `${INSTRUCOES_BASE}

Você tem acesso a uma ferramenta de busca na internet. Use-a para verificar se as informações do texto abaixo são verdadeiras, cruzando com outras fontes jornalísticas confiáveis antes de responder.`;

  return [
    { role: "system", content: instrucaoTexto },
    {
      role: "user",
      content: `Verifique o seguinte texto (pode ser uma mensagem de WhatsApp ou trecho de notícia):\n\n"""${dados.texto}"""`,
    },
  ];
}

// Faz a chamada para a API da Groq, com um limite de tempo de espera.
async function chamarGroq(mensagens, { comBusca }) {
  const controlador = new AbortController();
  const tempoLimite = setTimeout(() => controlador.abort(), 45000);

  const corpo = {
    model: comBusca ? MODELO_COM_BUSCA : MODELO_IMAGEM,
    messages: mensagens,
    temperature: 0.3,
    max_completion_tokens: 1024,
  };

  if (comBusca) {
    // A busca na web é feita automaticamente pela própria Groq.
    corpo.tools = [{ type: "browser_search" }];
    corpo.tool_choice = "required";
  } else {
    // Sem busca na web, é possível pedir JSON garantido pelo modelo.
    corpo.response_format = { type: "json_object" };
  }

  try {
    const resposta = await fetch(URL_GROQ, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(corpo),
      signal: controlador.signal,
    });

    return resposta;
  } finally {
    clearTimeout(tempoLimite);
  }
}

// Tenta transformar o texto devolvido pela IA em um objeto JSON,
// mesmo que venha com markdown ou algum texto extra ao redor.
function extrairJson(texto) {
  if (!texto) return null;

  try {
    return JSON.parse(texto);
  } catch {
    // tenta pegar só o trecho entre a primeira "{" e a última "}"
    const inicio = texto.indexOf("{");
    const fim = texto.lastIndexOf("}");
    if (inicio === -1 || fim === -1 || fim <= inicio) return null;

    try {
      return JSON.parse(texto.slice(inicio, fim + 1));
    } catch {
      return null;
    }
  }
}

// Garante que o resultado final sempre tenha o formato esperado pelo
// front-end, mesmo que a IA tenha devolvido algo incompleto.
function normalizarResultado(bruto) {
  const veredito = VEREDITOS_VALIDOS.includes(bruto?.veredito)
    ? bruto.veredito
    : "Não verificável";

  const confiancaBruta = String(bruto?.confianca ?? "").toLowerCase();
  const confianca = CONFIANCAS_VALIDAS.includes(confiancaBruta)
    ? confiancaBruta
    : "baixo";

  const sinais = Array.isArray(bruto?.sinais)
    ? bruto.sinais.filter((s) => typeof s === "string" && s.trim() !== "")
    : [];

  const explicacao =
    typeof bruto?.explicacao === "string" && bruto.explicacao.trim() !== ""
      ? bruto.explicacao.trim()
      : "Não foi possível gerar uma explicação detalhada para este conteúdo.";

  const fontes = Array.isArray(bruto?.fontes)
    ? bruto.fontes.filter((f) => typeof f === "string" && f.trim() !== "")
    : [];

  return { veredito, confianca, sinais, explicacao, fontes };
}

// Valida e organiza os dados recebidos no corpo da requisição.
// Retorna { erro } quando algo está errado, ou { tipo, dados } quando ok.
function validarEntrada(corpo) {
  const tipo = corpo?.tipo;

  if (!["imagem", "link", "texto"].includes(tipo)) {
    return { erro: "Tipo de verificação inválido." };
  }

  if (tipo === "imagem") {
    const base64 = corpo?.imagem?.base64;
    const mimeType = corpo?.imagem?.mimeType;

    if (!base64 || !mimeType) {
      return { erro: "Envie uma imagem para analisar." };
    }

    if (!TIPOS_IMAGEM_ACEITOS.includes(mimeType)) {
      return {
        erro: "Formato de imagem não suportado. Envie um arquivo JPG, PNG ou WEBP.",
      };
    }

    // calcula o tamanho real do arquivo a partir do base64
    const tamanhoBytes = Math.ceil((base64.length * 3) / 4);
    if (tamanhoBytes > TAMANHO_MAXIMO_IMAGEM) {
      return { erro: "A imagem enviada passa do limite de 4 MB." };
    }

    return { tipo, dados: { base64, mimeType } };
  }

  if (tipo === "link") {
    const url = corpo?.url?.trim();

    if (!url) {
      return { erro: "Cole o link da notícia para analisar." };
    }

    try {
      const urlValidada = new URL(url);
      if (!["http:", "https:"].includes(urlValidada.protocol)) {
        throw new Error("protocolo inválido");
      }
    } catch {
      return { erro: "URL inválida. Verifique o link e tente novamente." };
    }

    return { tipo, dados: { url } };
  }

  // tipo === "texto"
  const texto = corpo?.texto?.trim();

  if (!texto) {
    return { erro: "Cole algum texto para analisar." };
  }

  if (texto.length > TAMANHO_MAXIMO_TEXTO) {
    return {
      erro: `O texto é muito longo. Envie um trecho de até ${TAMANHO_MAXIMO_TEXTO} caracteres.`,
    };
  }

  return { tipo, dados: { texto } };
}

export async function POST(request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      {
        erro:
          "O serviço de verificação ainda não foi configurado. Defina a variável GROQ_API_KEY no servidor.",
      },
      { status: 500 }
    );
  }

  let corpoRequisicao;
  try {
    corpoRequisicao = await request.json();
  } catch {
    return NextResponse.json(
      { erro: "Não foi possível entender a solicitação enviada." },
      { status: 400 }
    );
  }

  const entrada = validarEntrada(corpoRequisicao);
  if (entrada.erro) {
    return NextResponse.json({ erro: entrada.erro }, { status: 400 });
  }

  const { tipo, dados } = entrada;
  const mensagens = montarMensagens(tipo, dados);
  const comBusca = tipo !== "imagem";

  let respostaGroq;
  try {
    respostaGroq = await chamarGroq(mensagens, { comBusca });
  } catch (erro) {
    const foiTimeout = erro?.name === "AbortError";
    return NextResponse.json(
      {
        erro: foiTimeout
          ? "A análise demorou demais e foi cancelada. Tente novamente."
          : "Não foi possível conectar ao serviço de verificação agora. Tente novamente em alguns instantes.",
      },
      { status: 502 }
    );
  }

  if (!respostaGroq.ok) {
    if (respostaGroq.status === 429) {
      return NextResponse.json(
        {
          erro: "Muitas solicitações no momento. Aguarde um pouco e tente de novo.",
        },
        { status: 429 }
      );
    }

    if (respostaGroq.status === 401 || respostaGroq.status === 403) {
      return NextResponse.json(
        {
          erro:
            "Erro de autenticação com o serviço de IA. Verifique a chave de API configurada no servidor.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        erro: "O serviço de verificação retornou um erro. Tente novamente mais tarde.",
      },
      { status: 502 }
    );
  }

  let dadosResposta;
  try {
    dadosResposta = await respostaGroq.json();
  } catch {
    return NextResponse.json(
      { erro: "A resposta do serviço de IA veio em um formato inesperado." },
      { status: 502 }
    );
  }

  const conteudo = dadosResposta?.choices?.[0]?.message?.content;
  const resultadoBruto = extrairJson(conteudo);

  if (!resultadoBruto) {
    return NextResponse.json(
      {
        erro: "Não foi possível interpretar a resposta da IA. Tente novamente.",
      },
      { status: 502 }
    );
  }

  const resultado = normalizarResultado(resultadoBruto);
  return NextResponse.json(resultado);
}
