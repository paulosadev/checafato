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

// Pede pro modelo de visão descrever a imagem de forma objetiva — sem dar
// veredito ainda. Essa descrição depois é usada numa segunda chamada,
// com busca na web, pra checar se essa cena/foto já foi desmentida (é
// assim que pegamos casos como fotos geradas por IA que viralizaram).
function montarMensagensDescricaoImagem(dados) {
  const instrucao = `Você é um assistente que descreve imagens de forma objetiva e detalhada para ajudar numa verificação de fatos. Não dê veredito sobre a imagem ser verdadeira, falsa ou gerada por IA — apenas descreva.

Descreva em português, em um parágrafo curto: quem ou o que aparece na imagem, roupas, cenário, qualquer texto visível, e também sinais visuais que podem indicar edição digital ou geração por Inteligência Artificial (pele, tecido ou objetos com textura "perfeita demais", mãos ou dedos deformados, iluminação ou sombras inconsistentes, bordas borradas ou "derretidas", detalhes repetidos de forma estranha).`;

  return [
    { role: "system", content: instrucao },
    {
      role: "user",
      content: [
        { type: "text", text: "Descreva esta imagem em detalhes." },
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

// Monta as mensagens da verificação final, sempre com busca na web — serve
// pra link, texto, e também pra imagem (usando a descrição do passo 1).
function montarMensagensComBusca(tipo, conteudo) {
  const instrucaoComum = `${INSTRUCOES_BASE}

Você tem acesso a uma ferramenta de busca na internet. Use-a para cruzar a informação com outras fontes jornalísticas e agências de checagem de fatos confiáveis antes de responder.`;

  let textoUsuario;
  if (tipo === "link") {
    textoUsuario = `Verifique esta notícia, com base no link: ${conteudo}`;
  } else if (tipo === "texto") {
    textoUsuario = `Verifique o seguinte texto (pode ser uma mensagem de WhatsApp ou trecho de notícia):\n\n"""${conteudo}"""`;
  } else {
    // tipo === "imagem": "conteudo" é a descrição gerada no passo 1
    textoUsuario = `O usuário enviou uma imagem (print, foto ou montagem). Ela foi descrita objetivamente da seguinte forma:\n\n"""${conteudo}"""\n\nPesquise na internet se essa cena, pessoa, evento ou objeto descrito já foi identificado como falso, gerado por Inteligência Artificial, editado, fora de contexto ou desmentido por alguma agência de checagem de fatos. Combine essa busca com os sinais visuais da descrição para dar o veredito final.`;
  }

  return [
    { role: "system", content: instrucaoComum },
    { role: "user", content: textoUsuario },
  ];
}

// Faz a chamada para a API da Groq, com um limite de tempo de espera.
async function chamarGroq(mensagens, { modelo, comBusca = false, maxTokens = 1024 }) {
  const controlador = new AbortController();
  const tempoLimite = setTimeout(() => controlador.abort(), 45000);

  const corpo = {
    model: modelo,
    messages: mensagens,
    temperature: 0.3,
    max_completion_tokens: maxTokens,
  };

  if (comBusca) {
    // A busca na web é feita automaticamente pela própria Groq. Essa
    // ferramenta é incompatível com o modo de "JSON garantido" da Groq,
    // por isso pedimos o formato só por instrução no prompt mesmo
    // (ver extrairJson, que lida com texto solto ao redor do JSON).
    corpo.tools = [{ type: "browser_search" }];
    corpo.tool_choice = "required";
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

// Chama a Groq e já devolve o texto de resposta pronto, tratando erros de
// rede, limite de requisições e formato inesperado com mensagens
// amigáveis. Usado tanto no passo único (link/texto) quanto nos dois
// passos da verificação de imagem.
async function pedirAoGroq(mensagens, opcoes) {
  let resposta;
  try {
    resposta = await chamarGroq(mensagens, opcoes);
  } catch (erro) {
    const foiTimeout = erro?.name === "AbortError";
    return {
      erro: foiTimeout
        ? "A análise demorou demais e foi cancelada. Tente novamente."
        : "Não foi possível conectar ao serviço de verificação agora. Tente novamente em alguns instantes.",
      status: 502,
    };
  }

  if (!resposta.ok) {
    if (resposta.status === 429) {
      return {
        erro: "Muitas solicitações no momento. Aguarde um pouco e tente de novo.",
        status: 429,
      };
    }

    if (resposta.status === 401 || resposta.status === 403) {
      return {
        erro:
          "Erro de autenticação com o serviço de IA. Verifique a chave de API configurada no servidor.",
        status: 500,
      };
    }

    return {
      erro: "O serviço de verificação retornou um erro. Tente novamente mais tarde.",
      status: 502,
    };
  }

  let dadosResposta;
  try {
    dadosResposta = await resposta.json();
  } catch {
    return {
      erro: "A resposta do serviço de IA veio em um formato inesperado.",
      status: 502,
    };
  }

  const conteudo = dadosResposta?.choices?.[0]?.message?.content;
  if (!conteudo) {
    return {
      erro: "A IA não retornou uma resposta válida. Tente novamente.",
      status: 502,
    };
  }

  return { conteudo };
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

  // Conteúdo que vai pra verificação final com busca na web: pra link e
  // texto é o próprio dado enviado; pra imagem, é a descrição gerada no
  // passo 1 (feito aqui embaixo).
  let conteudoParaVerificar = tipo === "link" ? dados.url : dados.texto;

  if (tipo === "imagem") {
    const mensagensDescricao = montarMensagensDescricaoImagem(dados);
    const resultadoDescricao = await pedirAoGroq(mensagensDescricao, {
      modelo: MODELO_IMAGEM,
      maxTokens: 400,
    });

    if (resultadoDescricao.erro) {
      return NextResponse.json(
        { erro: resultadoDescricao.erro },
        { status: resultadoDescricao.status }
      );
    }

    conteudoParaVerificar = resultadoDescricao.conteudo;
  }

  // Verificação final: sempre com busca na web, cruzando a informação
  // (ou a descrição da imagem) com fontes jornalísticas e de checagem.
  const mensagensFinais = montarMensagensComBusca(tipo, conteudoParaVerificar);
  const resultadoFinal = await pedirAoGroq(mensagensFinais, {
    modelo: MODELO_COM_BUSCA,
    comBusca: true,
  });

  if (resultadoFinal.erro) {
    return NextResponse.json(
      { erro: resultadoFinal.erro },
      { status: resultadoFinal.status }
    );
  }

  const resultadoBruto = extrairJson(resultadoFinal.conteudo);

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
