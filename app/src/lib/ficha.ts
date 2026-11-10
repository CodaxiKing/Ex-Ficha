import { cargaInicial } from "../data/exercicios";
import type { Ficha, ItemFicha, Objetivo, Plano, TreinoFeito } from "../data/tipos";

/** Uma ficha vale quatro semanas. Depois, ficha nova. */
export const DIAS_DA_FICHA = 28;

const BASE: Record<Plano["letra"], { nome: string; ids: string[] }> = {
  A: {
    nome: "Peito, ombros e tríceps",
    ids: [
      "Barbell_Bench_Press_-_Medium_Grip",
      "Barbell_Incline_Bench_Press_-_Medium_Grip",
      "Dumbbell_Flyes",
      "Dumbbell_Shoulder_Press",
      "Side_Lateral_Raise",
      "Triceps_Pushdown_-_Rope_Attachment",
    ],
  },
  B: {
    nome: "Costas e bíceps",
    ids: [
      "Wide-Grip_Lat_Pulldown",
      "Bent_Over_Barbell_Row",
      "One-Arm_Dumbbell_Row",
      "Rope_Straight-Arm_Pulldown",
      "Barbell_Curl",
      "Hammer_Curls",
    ],
  },
  C: {
    nome: "Pernas e core",
    ids: [
      "Barbell_Squat",
      "Leg_Press",
      "Romanian_Deadlift",
      "Leg_Extensions",
      "Lying_Leg_Curls",
      "Standing_Calf_Raises",
      "Plank",
    ],
  },
};

const VOLUME: Record<Objetivo, { series: number; reps: number; descanso: number }> = {
  massa: { series: 4, reps: 10, descanso: 90 },
  secar: { series: 3, reps: 15, descanso: 45 },
  forca: { series: 5, reps: 5, descanso: 150 },
  sobreviver: { series: 3, reps: 10, descanso: 75 },
};

export const OBJETIVOS: { id: Objetivo; rotulo: string }[] = [
  { id: "massa", rotulo: "Ganhar massa" },
  { id: "secar", rotulo: "Secar e definir" },
  { id: "forca", rotulo: "Ficar mais forte" },
  { id: "sobreviver", rotulo: "Só sobreviver ao término" },
];

export function novoItem(id: string, objetivo: Objetivo): ItemFicha {
  const v = VOLUME[objetivo];
  // Prancha conta segundos, não repetições.
  const reps = id === "Plank" ? 30 : v.reps;
  return { id, series: v.series, reps, kg: cargaInicial(id), descanso: v.descanso };
}

export function montarFicha(objetivo: Objetivo, hoje = new Date()): Ficha {
  const planos = (Object.keys(BASE) as Plano["letra"][]).map((letra) => ({
    letra,
    nome: BASE[letra].nome,
    itens: BASE[letra].ids.map((id) => novoItem(id, objetivo)),
  }));
  return { criadaEm: hoje.toISOString(), objetivo, planos };
}

/** O próximo treino da rotação A → B → C, depois do último feito com esta ficha. */
export function proximoPlano(ficha: Ficha, historico: TreinoFeito[]): Plano {
  const desta = historico.filter((t) => t.data >= ficha.criadaEm);
  const ultimo = desta.at(-1);
  if (!ultimo) return ficha.planos[0];
  const i = ficha.planos.findIndex((p) => p.letra === ultimo.letra);
  return ficha.planos[(i + 1) % ficha.planos.length];
}

export function minutosEstimados(p: Plano): number {
  const seg = p.itens.reduce((s, it) => s + it.series * (40 + it.descanso), 0);
  return Math.round(seg / 60);
}

export function volume(t: TreinoFeito): number {
  return t.series.reduce((s, ex) => s + ex.feitas.reduce((a, f) => a + f.reps * f.kg, 0), 0);
}

export function totalSeries(t: TreinoFeito): number {
  return t.series.reduce((s, ex) => s + ex.feitas.length, 0);
}
