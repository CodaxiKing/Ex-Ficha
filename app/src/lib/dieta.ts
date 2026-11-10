import type { Objetivo } from "../data/tipos";

/**
 * Dieta básica do Ex-Ficha. Não substitui nutricionista: é uma estimativa
 * (Mifflin-St Jeor) com um cardápio simples de comida brasileira, ajustado pelo objetivo.
 */

export type DadosDieta = {
  sexo: "M" | "F"; // só para a conta de gasto calórico
  idade: number;
  altura: number; // cm
  peso: number; // kg
  treinosSemana: number;
};

export type Metas = { kcal: number; prot: number; basal: number };

const ATIVIDADE = (treinos: number) => (treinos >= 6 ? 1.725 : treinos >= 3 ? 1.55 : 1.375);
const AJUSTE: Record<Objetivo, number> = { massa: 1.1, secar: 0.8, forca: 1.05, sobreviver: 1 };
const PROT_KG: Record<Objetivo, number> = { massa: 2, secar: 2.2, forca: 1.8, sobreviver: 1.6 };

export function metas(d: DadosDieta, objetivo: Objetivo): Metas {
  const basal = 10 * d.peso + 6.25 * d.altura - 5 * d.idade + (d.sexo === "M" ? 5 : -161);
  const gasto = basal * ATIVIDADE(d.treinosSemana);
  // Nunca abaixo do basal nem de um piso seguro: déficit grande não é luto, é castigo.
  const piso = Math.max(basal, d.sexo === "M" ? 1500 : 1200);
  const kcal = Math.max(piso, gasto * AJUSTE[objetivo]);
  return { kcal: Math.round(kcal / 10) * 10, prot: Math.round(d.peso * PROT_KG[objetivo]), basal: Math.round(basal) };
}

/** Alimento numa porção (unidade, fatia, ou 10 g para os pesados em gramas). */
type Alimento = { nome: string; un: string; g?: boolean; kcal: number; prot: number; min: number; max: number };

const A = {
  ovo: { nome: "ovos mexidos", un: "un", kcal: 72, prot: 6.3, min: 2, max: 5 },
  pao: { nome: "pão integral", un: "fatia", kcal: 70, prot: 3.6, min: 1, max: 4 },
  tapioca: { nome: "tapioca", un: "g", g: true, kcal: 24, prot: 0, min: 4, max: 10 },
  queijo: { nome: "queijo branco", un: "g", g: true, kcal: 26, prot: 1.7, min: 3, max: 10 },
  arroz: { nome: "arroz", un: "g", g: true, kcal: 12.8, prot: 0.25, min: 8, max: 30 },
  frango: { nome: "frango grelhado", un: "g", g: true, kcal: 15.9, prot: 3.2, min: 10, max: 25 },
  patinho: { nome: "patinho moído", un: "g", g: true, kcal: 21.9, prot: 2.7, min: 10, max: 22 },
  tilapia: { nome: "tilápia", un: "g", g: true, kcal: 12.8, prot: 2.6, min: 12, max: 25 },
  batata: { nome: "batata-doce", un: "g", g: true, kcal: 7.7, prot: 0.06, min: 10, max: 40 },
  macarrao: { nome: "macarrão", un: "g", g: true, kcal: 15.8, prot: 0.58, min: 8, max: 30 },
  banana: { nome: "bananas", un: "un", kcal: 89, prot: 1.1, min: 1, max: 3 },
  pasta: { nome: "pasta de amendoim", un: "colher", kcal: 90, prot: 4, min: 1, max: 2 },
  aveia: { nome: "aveia", un: "g", g: true, kcal: 39, prot: 1.4, min: 2, max: 6 },
  iogurte: { nome: "iogurte natural", un: "pote", kcal: 100, prot: 6, min: 1, max: 2 },
  whey: { nome: "whey", un: "scoop", kcal: 120, prot: 24, min: 1, max: 2 },
} satisfies Record<string, Alimento>;

type Combo = { prot: Alimento; carbo: Alimento; fixo: { nome: string; kcal: number; prot: number }[] };

type Slot = { id: string; hora: string; nome: string; parte: number; combos: Combo[]; nota?: string };

const FEIJAO = { nome: "feijão (1 concha)", kcal: 76, prot: 4.8 };
const SALADA = { nome: "salada à vontade", kcal: 25, prot: 1 };
const LEGUMES = { nome: "legumes", kcal: 35, prot: 1.5 };
const CAFE = { nome: "café preto", kcal: 0, prot: 0 };

const SLOTS: Slot[] = [
  {
    id: "cafe",
    hora: "07:00",
    nome: "Café",
    parte: 0.2,
    combos: [
      { prot: A.ovo, carbo: A.pao, fixo: [CAFE] },
      { prot: A.queijo, carbo: A.tapioca, fixo: [CAFE] },
      { prot: A.whey, carbo: A.aveia, fixo: [{ nome: "banana", kcal: 89, prot: 1.1 }] },
    ],
  },
  {
    id: "almoco",
    hora: "12:30",
    nome: "Almoço",
    parte: 0.3,
    combos: [
      { prot: A.frango, carbo: A.arroz, fixo: [FEIJAO, SALADA] },
      { prot: A.patinho, carbo: A.arroz, fixo: [FEIJAO, SALADA] },
      { prot: A.frango, carbo: A.macarrao, fixo: [SALADA] },
    ],
  },
  {
    id: "pre",
    hora: "17:00",
    nome: "Pré-treino",
    parte: 0.12,
    combos: [
      { prot: A.pasta, carbo: A.banana, fixo: [] },
      { prot: A.iogurte, carbo: A.aveia, fixo: [] },
    ],
  },
  {
    id: "jantar",
    hora: "20:30",
    nome: "Jantar",
    parte: 0.28,
    combos: [
      { prot: A.patinho, carbo: A.batata, fixo: [LEGUMES] },
      { prot: A.tilapia, carbo: A.arroz, fixo: [LEGUMES] },
      { prot: A.frango, carbo: A.batata, fixo: [SALADA] },
    ],
  },
  {
    id: "ceia",
    hora: "23:00",
    nome: "Ceia",
    parte: 0.1,
    nota: "Nada de pote de sorvete às 23h.",
    combos: [
      { prot: A.whey, carbo: A.iogurte, fixo: [] },
      { prot: A.ovo, carbo: A.pao, fixo: [] },
    ],
  },
];

export type Refeicao = { id: string; hora: string; nome: string; itens: string; kcal: number; prot: number; nota?: string };

const SINGULAR: Record<string, string> = { "ovos mexidos": "ovo mexido", bananas: "banana" };

function qtd(a: Alimento, n: number): string {
  if (a.g) return `${a.nome} ${n * 10} g`;
  if (a.un === "un") return `${n} ${n === 1 ? (SINGULAR[a.nome] ?? a.nome) : a.nome}`;
  const unidade = n > 1 ? ({ colher: "colheres", fatia: "fatias", pote: "potes", scoop: "scoops" } as Record<string, string>)[a.un] ?? a.un : a.un;
  return `${a.nome} (${n} ${unidade})`;
}

const clamp = (v: number, a: Alimento) => Math.min(a.max, Math.max(a.min, Math.round(v)));

/** O cardápio do dia. Cada dia gira a combinação de cada refeição, pra não ser sempre o mesmo prato. */
export function cardapio(m: Metas, dia: string): Refeicao[] {
  const semente = Number(dia.replaceAll("-", "")) || 0;
  return SLOTS.map((s, i) => {
    const c = s.combos[(semente + i) % s.combos.length];
    const alvoK = m.kcal * s.parte;
    const alvoP = m.prot * s.parte;
    const fixoK = c.fixo.reduce((a, f) => a + f.kcal, 0);
    const fixoP = c.fixo.reduce((a, f) => a + f.prot, 0);
    const nP = clamp((alvoP - fixoP) / c.prot.prot, c.prot);
    const nC = clamp((alvoK - fixoK - nP * c.prot.kcal) / c.carbo.kcal, c.carbo);
    const kcal = Math.round(fixoK + nP * c.prot.kcal + nC * c.carbo.kcal);
    const prot = Math.round(fixoP + nP * c.prot.prot + nC * c.carbo.prot);
    const itens = [qtd(c.prot, nP), qtd(c.carbo, nC), ...c.fixo.map((f) => f.nome)].join(", ");
    return { id: s.id, hora: s.hora, nome: s.nome, itens: itens[0].toUpperCase() + itens.slice(1), kcal, prot, nota: s.nota };
  });
}
