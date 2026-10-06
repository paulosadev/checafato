"use client";

// Desliza o conteúdo pra posição final quando ele entra na tela durante a
// rolagem, e volta pra posição de descanso quando sai — repetindo toda
// vez que o usuário rolar de novo até ali.
//
// De propósito, só anima "transform" (nunca "opacity"): testamos uma
// versão que também escurecia o texto fora da tela, mas qualquer
// opacidade reduzida em texto claro sobre o fundo quase preto do site
// cai abaixo do contraste mínimo de acessibilidade (WCAG), e o conteúdo
// também fica "invisível" pra buscadores enquanto está fora da viewport.
// Deslocar a posição não tem nenhum desses dois problemas.
//
// Respeita quem pediu menos movimento no sistema (prefers-reduced-motion)
// via motion-reduce:.

import { useEffect, useRef, useState } from "react";

export default function AoAparecer({ children, atraso = 0, className = "" }) {
  const referencia = useRef(null);
  // Começa sempre na posição de descanso (igual no servidor e no cliente,
  // antes de hidratar) — checar "typeof IntersectionObserver" direto no
  // render quebraria a hidratação, porque no servidor essa API de
  // navegador nunca existe, então o resultado seria diferente do lado do
  // cliente.
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const elemento = referencia.current;
    if (!elemento) return;

    if (typeof IntersectionObserver === "undefined") {
      // navegador muito antigo: mostra o conteúdo na posição final, sem animar
      const temporizador = setTimeout(() => setVisivel(true), 0);
      return () => clearTimeout(temporizador);
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        setVisivel(entrada.isIntersecting);
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={referencia}
      style={{ transitionDelay: visivel ? `${atraso}ms` : "0ms" }}
      className={`transition-transform duration-500 ease-out motion-reduce:transition-none motion-reduce:translate-y-0 ${
        visivel ? "translate-y-0" : "translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
}
