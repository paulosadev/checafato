"use client";

// Cabeçalho fixo no topo, com navegação para as seções da página
// e um menu simples para telas pequenas.

import { useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";

const linksNavegacao = [
  { href: "#checklist", texto: "Como identificar" },
  { href: "#verificador", texto: "Verificador" },
  { href: "#papel-da-ia", texto: "O papel da IA" },
  { href: "#onde-checar", texto: "Onde checar" },
  { href: "#sobre", texto: "Sobre o projeto" },
];

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-[62px] bg-background">
      <div className="mx-auto flex h-full max-w-[1344px] items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href="#inicio"
          className="flex items-center gap-2 text-body font-bold text-foreground"
        >
          <ShieldCheck className="text-primary" size={22} />
          ChecaFato
        </a>

        {/* navegação para telas médias/grandes */}
        <nav className="hidden items-center gap-7 text-body-sm font-medium md:flex">
          {linksNavegacao.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition hover:text-foreground"
            >
              {link.texto}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#verificador"
            className="hidden rounded-buttons bg-primary px-5 py-2.5 text-body-sm font-medium text-primary-foreground transition-[filter,transform] duration-150 ease-out hover:brightness-125 active:scale-[0.97] sm:inline-flex"
          >
            Verificar agora
          </a>

          {/* botão do menu em telas pequenas */}
          <button
            type="button"
            onClick={() => setMenuAberto((aberto) => !aberto)}
            aria-label="Abrir menu de navegação"
            aria-expanded={menuAberto}
            className="inline-flex h-11 w-11 items-center justify-center rounded-inputs border border-pewter text-foreground md:hidden"
          >
            {menuAberto ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* menu mobile */}
      {menuAberto && (
        <nav className="flex flex-col gap-1 bg-background px-4 pb-4 shadow-xl-2 md:hidden">
          {linksNavegacao.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuAberto(false)}
              className="rounded-inputs px-2 py-2 text-body-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {link.texto}
            </a>
          ))}
          <a
            href="#verificador"
            onClick={() => setMenuAberto(false)}
            className="mt-2 rounded-buttons bg-primary px-5 py-2.5 text-center text-body-sm font-medium text-primary-foreground transition-transform active:scale-[0.97]"
          >
            Verificar agora
          </a>
        </nav>
      )}
    </header>
  );
}
