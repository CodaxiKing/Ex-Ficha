import type { Pessoa } from "../data/tipos";
import { BANCO, CALMO, type Frase, MARCOS, type Nivel, type Situacao } from "./banco";

/** Pronomes da pessoa que foi embora: [ela, dela, Ela, nela]. */
export function pronomes(p: Pessoa): [string, string, string, string] {
  if (p === "Ela") return ["ela", "dela", "Ela", "nela"];
  if (p === "Ele") return ["ele", "dele", "Ele", "nele"];
  return ["essa pessoa", "dessa pessoa", "Essa pessoa", "nessa pessoa"];
}

export type Variaveis = Partial<Record<"treino" | "faltam" | "dias" | "nome", string | number>>;

/** Troca os marcadores {ela} {dela} {Ela} {nela} e as variáveis {treino} {faltam} {dias} {nome}. */
export function frase(texto: string, p: Pessoa, vars: Variaveis = {}): string {
  const [ela, dela, Ela, nela] = pronomes(p);
  let t = texto.replaceAll("{ela}", ela).replaceAll("{dela}", dela).replaceAll("{Ela}", Ela).replaceAll("{nela}", nela);
  for (const [k, v] of Object.entries(vars)) t = t.replaceAll(`{${k}}`, String(v));
  return t;
}

const ORDEM: Record<Nivel, number> = { L: 0, M: 1, S: 2 };

/** As frases de uma situação até o nível escolhido. Sem variável faltando. */
export function candidatas(sit: Situacao, nivel: Nivel, vars: Variaveis = {}): Frase[] {
  const ok = BANCO[sit].filter(([n, t]) => {
    if (ORDEM[n] > ORDEM[nivel]) return false;
    const precisa = [...t.matchAll(/\{(treino|faltam|dias|nome)\}/g)].map((m) => m[1]);
    return precisa.every((k) => vars[k as keyof Variaveis] !== undefined);
  });
  return ok.length ? ok : BANCO[sit].filter(([n]) => n === "L");
}

/**
 * Sorteia uma frase evitando as vistas recentemente.
 * `recentes` é a memória por situação; devolve a frase e a memória nova.
 * A memória guarda até metade do total, então nunca trava e nunca repete em sequência.
 */
export function sortearCom(
  sit: Situacao,
  nivel: Nivel,
  recentes: string[],
  vars: Variaveis = {},
  aleatorio: () => number = Math.random
): { texto: string; recentes: string[] } {
  const lista = candidatas(sit, nivel, vars).map(([, t]) => t);
  const livres = lista.filter((t) => !recentes.includes(t));
  const pool = livres.length ? livres : lista;
  const texto = pool[Math.floor(aleatorio() * pool.length)];
  const limite = Math.max(1, Math.floor(lista.length / 2));
  return { texto, recentes: [texto, ...recentes.filter((t) => t !== texto)].slice(0, limite) };
}

/** Frase de marco (dia 7, 30, 90…) se hoje for um. */
export function marco(dias: number, nivel: Nivel): string | null {
  const l = MARCOS[dias]?.filter(([n]) => ORDEM[n] <= ORDEM[nivel]);
  if (!l?.length) return null;
  return l[dias % l.length][1];
}

export function calmo(dia: string): string {
  return doDia(CALMO, dia);
}

/** Escolhe uma frase estável para o dia. */
export function doDia<T>(lista: T[], dia: string, deslocamento = 0): T {
  let h = deslocamento;
  for (const c of dia) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return lista[h % lista.length];
}
