/** Tokens do Ex-Ficha, os mesmos do canvas (canvas/index.html :root). */
export const cor = {
  chao: "#0b0909",
  superficie: "#151112",
  elevado: "#241d1e",
  borda: "#1f191a",
  linha: "#221c1d",
  controle: "#4a3f40",
  texto: "#e6e2e0",
  apagado: "#b3a9a4",
  fraco: "#988e89",
  vermelho: "#d0121a",
  vermelhoHover: "#b30e15",
  vermelhoPress: "#9e0c12",
  panico: "#7f0b10",
  panicoFundo: "#1d0b0e",
  panicoTela: "#0d0607",
  panicoTexto: "#b9918f",
  pilulaFundo: "#2a0e0f",
  pilulaTexto: "#f2585c",
  vazio: "#221b1c",
} as const;

export const fonte = {
  regular: "Inter_400Regular",
  media: "Inter_500Medium",
  semi: "Inter_600SemiBold",
  display: "Anton_400Regular",
  gotica: "UnifrakturCook_700Bold",
} as const;

export const raio = { card: 20, aninhado: 12, pilula: 999 } as const;
export const margem = 20;
