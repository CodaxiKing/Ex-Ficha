import type { Pessoa } from "../data/tipos";

/** Pronomes da pessoa que foi embora: [ela, dela, Ela]. */
export function pronomes(p: Pessoa): [string, string, string] {
  if (p === "Ela") return ["ela", "dela", "Ela"];
  if (p === "Ele") return ["ele", "dele", "Ele"];
  return ["essa pessoa", "dessa pessoa", "Essa pessoa"];
}

/** Troca os marcadores {ela} {dela} {Ela} pelos pronomes certos. */
export function frase(texto: string, p: Pessoa): string {
  const [ela, dela, Ela] = pronomes(p);
  return texto.replaceAll("{ela}", ela).replaceAll("{dela}", dela).replaceAll("{Ela}", Ela);
}

/** Banco do canvas, recorte usado no app (descanso, fim de treino, pânico). */
export const DESCANSO = [
  "Descanso. Não é pra abrir o Instagram {dela}. Ninguém lá está pensando em você.",
  "90 segundos. Não dá tempo de stalkear e voltar. Nem tenta.",
  "Bebe água. Hidratação também é amor-próprio.",
  "Esse celular na sua mão não é pra {ela}. É o timer.",
  "A carga não vai se levantar sozinha enquanto você rola o feed.",
  "{Ela} visualizou e não respondeu? A próxima série responde.",
  "Descansa o músculo. Não o propósito.",
];

export const FIM = [
  "Mais peso do que {ela} carregou nessa relação.",
  "Treino pago. Diferente de certas promessas.",
  "Isso aqui ninguém leva embora na mudança.",
];

export const PANICO = [
  "Ninguém responde às 3 da manhã. A barra responde.",
  "Quase sempre a vontade passa na décima.",
  "A mensagem fica no rascunho. O peitoral fica com você.",
];

export const ESTADO_HOME = [
  "O luto passa. O shape também, se você deixar.",
  "Cada dia treinado é um dia que {ela} não decidiu por você.",
  "A ficha não te largou. Não larga ela.",
];

/** Escolhe uma frase estável para o dia (não muda a cada renderização). */
export function doDia<T>(lista: T[], dia: string, deslocamento = 0): T {
  let h = deslocamento;
  for (const c of dia) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return lista[h % lista.length];
}
