// Gera a imagem de pré-visualização usada quando o link do site é
// compartilhado no WhatsApp, Twitter/X, etc.

import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImagemCompartilhamento() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e1012",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg
            width="88"
            height="88"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#007afc"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <div style={{ display: "flex", fontSize: 88, fontWeight: 700, color: "#ffffff" }}>
            Checa<span style={{ color: "#007afc" }}>Fato</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "#a0aaba" }}>
          Verificador de fake news com Inteligência Artificial
        </div>
      </div>
    ),
    { ...size }
  );
}
