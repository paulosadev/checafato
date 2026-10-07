import { DM_Sans } from "next/font/google";
import "./globals.css";

// DM Sans substitui a Cera Pro (fonte original do guia de estilo, que é
// paga) — tem a mesma construção geométrica e geral peso 700 denso.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

// título curto só pra aba do navegador; o título mais completo continua
// aparecendo quando o link é compartilhado (WhatsApp, Twitter/X etc.)
const tituloAba = "ChecaFato";
const titulo = "ChecaFato — IA contra Fake News";
const descricao =
  "Projeto de extensão da FACIMP Wyden que usa Inteligência Artificial para ajudar a identificar notícias falsas, imagens fora de contexto e boatos de WhatsApp.";

export const metadata = {
  metadataBase: new URL("https://checafato.vercel.app"),
  title: tituloAba,
  description: descricao,
  // a imagem de pré-visualização (app/opengraph-image.js) e o ícone da
  // aba (app/icon.js) são detectados automaticamente pelo Next.js, não
  // precisam ser listados aqui.
  openGraph: {
    title: titulo,
    description: descricao,
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: titulo,
    description: descricao,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={dmSans.variable}>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <div className="textura-grao" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
