import type { Ficha, TreinoFeito } from "../data/tipos";
import { diasDesdeOFim, type EntradaDiario, type Foto, type Perfil } from "../store";
import { diaLocal, diasEntre, somarDias } from "./datas";
import { volume } from "./ficha";

export type Conquista = {
  id: string;
  nome: string;
  /** Frase curta que aparece quando desbloqueia. */
  frase: string;
  /** Progresso atual e alvo. Conquistada quando atual >= alvo. */
  atual: number;
  alvo: number;
  unidade?: string;
};

type Base = {
  perfil: Perfil;
  ficha: Ficha | null;
  historico: TreinoFeito[];
  panico: { crises: number; enviadas: number; flexoes: number };
  diario: EntradaDiario[];
  fotos: Foto[];
  hoje?: string;
};

/** Quantas vezes alguma carga passou do máximo anterior daquele exercício. */
function recordes(historico: TreinoFeito[]): number {
  const max = new Map<string, number>();
  let n = 0;
  for (const t of historico)
    for (const ex of t.series) {
      const top = Math.max(0, ...ex.feitas.map((f) => f.kg));
      const antes = max.get(ex.id);
      if (antes !== undefined && top > antes) n++;
      if (antes === undefined || top > antes) max.set(ex.id, top);
    }
  return n;
}

function maiorSequencia(dias: Set<string>): number {
  let melhor = 0;
  for (const d of dias) {
    if (dias.has(somarDias(d, -1))) continue;
    let n = 1;
    while (dias.has(somarDias(d, n))) n++;
    melhor = Math.max(melhor, n);
  }
  return melhor;
}

/** Semana (segunda a domingo) com mais treinos. */
function melhorSemana(dias: Set<string>): number {
  const porSemana = new Map<string, number>();
  for (const d of dias) {
    const [a, m, dd] = d.split("-").map(Number);
    const dow = (new Date(a, m - 1, dd).getDay() + 6) % 7;
    const seg = somarDias(d, -dow);
    porSemana.set(seg, (porSemana.get(seg) ?? 0) + 1);
  }
  return Math.max(0, ...porSemana.values());
}

export function conquistas(b: Base): Conquista[] {
  const hoje = b.hoje ?? diaLocal(new Date());
  const desde = diasDesdeOFim(b.perfil, hoje);
  const doFim = b.historico.filter((t) => diaLocal(t.data) >= b.perfil.fim);
  const dias = new Set(doFim.map((t) => diaLocal(t.data)));
  const toneladas = doFim.reduce((s, t) => s + volume(t), 0) / 1000;
  const vencidas = b.panico.crises - b.panico.enviadas;
  // Passou um sábado e um domingo desde o fim?
  const passouSabado = Array.from({ length: Math.min(desde, 8) }, (_, i) => somarDias(b.perfil.fim, i + 1)).some((d) => {
    const [a, m, dd] = d.split("-").map(Number);
    return new Date(a, m - 1, dd).getDay() === 0 && d < hoje;
  });
  const fichaTrocada = b.ficha && b.perfil.inicio ? diaLocal(b.ficha.criadaEm) > b.perfil.inicio : false;
  const fotoDia30 = b.fotos.some((f) => diasEntre(b.perfil.fim, f.dia) >= 30);

  return [
    { id: "primeiro-treino", nome: "Primeiro treino pós-término", frase: "O primeiro é o mais difícil. Já foi.", atual: Math.min(1, doFim.length), alvo: 1 },
    { id: "primeira-crise", nome: "Primeira crise vencida", frase: "Rascunho apagado. Dignidade mantida.", atual: Math.min(1, vencidas), alvo: 1 },
    { id: "primeiro-recorde", nome: "Primeiro recorde pós-término", frase: "Carga nova. Isso ninguém leva.", atual: Math.min(1, recordes(doFim)), alvo: 1 },
    { id: "primeiro-sabado", nome: "Sobreviveu ao primeiro fim de semana", frase: "O primeiro sábado sem ninguém. Passou.", atual: passouSabado ? 1 : 0, alvo: 1 },
    { id: "semana-cheia", nome: "Semana com 3 treinos", frase: "Três na mesma semana. Ritmo de gente nova.", atual: Math.min(3, melhorSemana(dias)), alvo: 3 },
    { id: "sequencia-5", nome: "5 dias seguidos", frase: "Cinco seguidos. Nem no namoro você era tão constante.", atual: Math.min(5, maiorSequencia(dias)), alvo: 5 },
    { id: "diario-7", nome: "7 linhas no diário", frase: "Uma semana falando a verdade. Pelo menos pra você.", atual: Math.min(7, b.diario.length), alvo: 7 },
    { id: "treinos-10", nome: "10 treinos", frase: "Dez treinos. Já é rotina, não é fase.", atual: Math.min(10, doFim.length), alvo: 10 },
    { id: "crises-10", nome: "10 crises vencidas", frase: "Dez vezes quase. Zero vezes mandou.", atual: Math.min(10, vencidas), alvo: 10 },
    { id: "dias-30", nome: "30 dias sem olhar pra trás", frase: "Um mês inteiro escolhendo você.", atual: Math.min(30, desde), alvo: 30 },
    { id: "ficha-trocada", nome: "Primeira ficha trocada", frase: "Trocou de vida. Trocou de ficha.", atual: fichaTrocada ? 1 : 0, alvo: 1 },
    { id: "foto-30", nome: "Foto do dia 30", frase: "Agora compara com a do dia 1.", atual: fotoDia30 ? 1 : 0, alvo: 1 },
    { id: "toneladas-50", nome: "50 toneladas levantadas", frase: "Cinquenta toneladas. Mais do que a bagagem emocional.", atual: Math.min(50, Math.floor(toneladas)), alvo: 50, unidade: " t" },
    { id: "treinos-50", nome: "50 treinos", frase: "Cinquenta. Você virou outra pessoa.", atual: Math.min(50, doFim.length), alvo: 50 },
    { id: "dias-90", nome: "90 dias", frase: "Virou passado. O shape virou presente.", atual: Math.min(90, desde), alvo: 90 },
    { id: "dias-365", nome: "Superou. De verdade.", frase: "Um ano. Isso aqui não é mais sobre ninguém.", atual: Math.min(365, desde), alvo: 365 },
  ];
}

export const ganhou = (c: Conquista) => c.atual >= c.alvo;

/** Conquistas que passaram a valer entre dois estados (ex.: antes e depois de um treino). */
export function novas(antes: Conquista[], depois: Conquista[]): Conquista[] {
  const tinha = new Set(antes.filter(ganhou).map((c) => c.id));
  return depois.filter((c) => ganhou(c) && !tinha.has(c.id));
}
