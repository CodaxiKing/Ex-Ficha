/** Tokens do Ex-Ficha, os mesmos do canvas (canvas/index.html :root). */
const ESCURO = {
  chao: "#0b0909",
  superficie: "#151112",
  elevado: "#241d1e",
  hover: "#2e2526",
  borda: "#1f191a",
  bordaCampo: "#3a3132",
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
};

export type Paleta = typeof ESCURO;

/**
 * Modo superou: o visual acompanha a pessoa.
 * Até o dia 29, o mais escuro. Do 30 ao 89, o preto esquenta. Do 90 ao 364, cinza quente
 * e a gótica sai da marca. A partir de um ano, claro. O vermelho fica nos dados e no botão.
 */
export type Fase = 0 | 30 | 90 | 365;

const FASES: Record<Fase, Partial<Paleta>> = {
  0: {},
  30: { chao: "#161312", superficie: "#201b1a", elevado: "#2d2625", hover: "#382f2d", borda: "#2a2322", linha: "#2a2322", vazio: "#2a2322" },
  90: {
    chao: "#2a2422",
    superficie: "#382f2d",
    elevado: "#4a3f3d",
    hover: "#554845",
    borda: "#3d3432",
    bordaCampo: "#5a4e4c",
    linha: "#443a38",
    apagado: "#d0c8c4",
    fraco: "#b8aeaa",
    vazio: "#443a38",
    panicoFundo: "#3a1d1f",
    pilulaFundo: "#4a1a1c",
  },
  365: {
    chao: "#ececec",
    superficie: "#ffffff",
    elevado: "#e2ddd9",
    hover: "#d8d2ce",
    borda: "#dcd6d2",
    bordaCampo: "#cfc8c4",
    linha: "#e2ddd9",
    controle: "#bfb7b3",
    texto: "#161111",
    apagado: "#4f4745",
    fraco: "#6a6260",
    panicoFundo: "#f6e3e3",
    panicoTexto: "#7a4b49",
    pilulaFundo: "#f8dcdc",
    pilulaTexto: "#9e0c12",
    vazio: "#dcd6d2",
  },
};

/** As cores em uso. Mudam de fase em aplicarFase(); a árvore é remontada em seguida. */
export const cor: Paleta = { ...ESCURO };
export let faseAtual: Fase = 0;

export function faseDe(dias: number): Fase {
  if (dias >= 365) return 365;
  if (dias >= 90) return 90;
  if (dias >= 30) return 30;
  return 0;
}

export function aplicarFase(f: Fase) {
  Object.assign(cor, ESCURO, FASES[f]);
  faseAtual = f;
}

export const claro = () => faseAtual === 365;

export const fonte = {
  regular: "Inter_400Regular",
  media: "Inter_500Medium",
  semi: "Inter_600SemiBold",
  display: "Anton_400Regular",
  gotica: "UnifrakturCook_700Bold",
} as const;

export const raio = { card: 20, aninhado: 12, pilula: 999 } as const;
export const margem = 20;
