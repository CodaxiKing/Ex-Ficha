import { EXERCICIOS } from "./exercicios.gen";
import type { Exercicio } from "./tipos";

export { EXERCICIOS };

const porId = new Map(EXERCICIOS.map((e) => [e.id, e]));

export function exercicio(id: string): Exercicio {
  const e = porId.get(id);
  if (!e) throw new Error(`Exercício desconhecido: ${id}`);
  return e;
}

export const GRUPOS = ["Peito", "Costas", "Ombros", "Braços", "Pernas", "Core"] as const;

/** Exercícios do mesmo grupo, para a troca. */
export function alternativas(id: string, limite = 3): Exercicio[] {
  const e = exercicio(id);
  return EXERCICIOS.filter((x) => x.grupo === e.grupo && x.id !== id).slice(0, limite);
}

/** Exercícios sem carga externa: a carga vira "peso do corpo". */
export function semCarga(id: string): boolean {
  const eq = exercicio(id).equipamento;
  return eq === "peso do corpo" || eq === "corda";
}

/** Carga inicial sugerida pelo equipamento; o usuário ajusta no primeiro treino. */
export function cargaInicial(id: string): number {
  const eq = exercicio(id).equipamento;
  if (semCarga(id)) return 0;
  return ({ barra: 20, halteres: 10, polia: 25, "máquina": 25, "leg press": 60, anilha: 10 } as Record<string, number>)[eq] ?? 10;
}
