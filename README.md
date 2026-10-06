# ChecaFato

Landing page do projeto de extensão **"Inteligência Artificial contra Fake
News: o papel da tecnologia no combate à desinformação"**, do curso de
Sistemas de Informação da **FACIMP Wyden**, desenvolvida na disciplina de
**Gerenciamento de Projetos**.

- **Orientador:** Prof. Me. Ricardo Lemos Oliveira
- **Integrantes:** Paulo Levy Soares e Sá, Davi Neres Fernandes, Leandro
  Victor Silva Araújo e Ana Beatriz Santos da Costa

## Sobre o projeto

O ChecaFato é um site que explica como identificar notícias falsas e conta
com um **verificador com Inteligência Artificial**, onde o usuário pode
enviar um print, um link de notícia ou um texto (como uma mensagem de
WhatsApp) para receber uma análise automática sobre a chance daquele
conteúdo ser desinformação.

A análise é feita por um modelo de IA através da API da [Groq](https://groq.com/)
e não substitui a checagem feita por agências profissionais — por isso o
resultado sempre vem acompanhado de um aviso sobre as limitações da IA.

## Tecnologias usadas

- [Next.js](https://nextjs.org/) (App Router) + React
- [Tailwind CSS](https://tailwindcss.com/) para o visual e o modo claro/escuro
- [lucide-react](https://lucide.dev/) para os ícones
- API da [Groq](https://console.groq.com/docs) para a análise com IA:
  - Para prints/fotos: modelo de visão `qwen/qwen3.8-27b`
  - Para links e textos: modelo `openai/gpt-oss-120b` com busca na web
    integrada (`browser_search`), usado para cruzar a informação com outras
    fontes

> Os modelos usados foram checados na documentação da Groq na época do
> desenvolvimento (outubro de 2026). Como a Groq costuma atualizar e
> descontinuar modelos com o tempo, vale sempre confirmar em
> [console.groq.com/docs/models](https://console.groq.com/docs/models) se
> os nomes acima ainda estão ativos antes de rodar o projeto.

## Como rodar localmente

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- Uma chave de API gratuita da Groq, criada em
  [console.groq.com](https://console.groq.com/)

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar a chave da API

Copie o arquivo de exemplo e cole sua chave da Groq dentro dele:

```bash
cp .env.example .env.local
```

Abra o `.env.local` e preencha:

```
GROQ_API_KEY=sua_chave_aqui
```

Essa chave fica só no servidor (nunca é enviada para o navegador) e o
arquivo `.env.local` já está no `.gitignore`, então ele não é versionado.

### 4. Rodar o projeto

```bash
npm run dev
```

Depois, abra [http://localhost:3000](http://localhost:3000) no navegador.

### 5. Gerar a versão de produção (opcional)

```bash
npm run build
npm start
```

## Como publicar na Vercel

1. Crie um repositório no GitHub com este projeto e envie o código
   (o arquivo `.env.local` não vai subir, já que está no `.gitignore`).
2. Acesse [vercel.com](https://vercel.com/) e faça login (pode usar a conta
   do GitHub).
3. Clique em **Add New → Project** e selecione o repositório do ChecaFato.
4. A Vercel detecta automaticamente que é um projeto Next.js — não é preciso
   mudar nada nas configurações de build.
5. Antes de clicar em **Deploy**, abra a aba **Environment Variables** e
   adicione:
   - **Name:** `GROQ_API_KEY`
   - **Value:** sua chave da Groq
6. Clique em **Deploy** e aguarde o build terminar. Ao final, a Vercel gera
   um link público (algo como `checafato.vercel.app`) para acessar o site.

Se depois for preciso trocar a chave da API, isso pode ser feito em
**Project → Settings → Environment Variables**, seguido de um novo deploy.

## Estrutura do projeto

```
app/
  api/analisar/route.js   -> rota de API que chama a IA da Groq
  layout.js                -> layout raiz (fontes, metadados, script do tema)
  page.js                   -> monta as seções da landing page
  globals.css               -> estilos globais e cores do tema claro/escuro
components/                -> componentes de cada seção da página
lib/dados.js                -> textos e listas usadas nas seções (checklist,
                               agências de checagem, integrantes etc.)
```

## Aviso importante

A verificação feita neste site é automática, feita por Inteligência
Artificial, e **pode errar**. Ela serve como um primeiro apoio para analisar
um conteúdo suspeito, mas não substitui a checagem feita por agências de
fact-checking profissionais, como as listadas na seção "Onde checar" do
próprio site.
