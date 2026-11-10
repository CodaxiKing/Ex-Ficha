import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Ficha, ItemFicha, Objetivo, Pessoa, Plano, Sessao, SerieFeita, TreinoFeito } from "./data/tipos";
import type { Nivel, Situacao } from "./lib/banco";
import { diaLocal, diasEntre, somarDias } from "./lib/datas";
import { montarFicha, novoItem, renovarFicha as renovar } from "./lib/ficha";
import type { DadosDieta } from "./lib/dieta";
import { calmo, frase, sortearCom, type Variaveis } from "./lib/frases";

type Perfil = {
  pessoa: Pessoa;
  fim: string; // AAAA-MM-DD, o dia em que acabou
  objetivo: Objetivo;
  sofrencia: number; // 1 a 10
  inicio: string; // AAAA-MM-DD, o dia em que começou a usar o app
  apelido?: string;
  zoeira: Nivel; // L leve, M médio, S sem dó
  avisos: { ativos: boolean; hora: number }; // hora do lembrete da manhã
  pausadoEm?: string; // AAAA-MM-DD; voltou com a pessoa: o contador para aqui
  visualFixo?: boolean; // true: não clareia com o tempo (modo superou desligado)
};

type Panico = { crises: number; enviadas: number; flexoes: number };

export type Humor = "Morto" | "Mal" | "Indo" | "Bem" | "Bruto";
export const HUMORES: Humor[] = ["Morto", "Mal", "Indo", "Bem", "Bruto"];
export type EntradaDiario = { dia: string; humor: Humor; texto: string };

export type Medida = { dia: string; peso?: number; cintura?: number; peito?: number; braco?: number; coxa?: number };
export type Foto = { dia: string; uri: string };

export type Premium = { ativo: boolean; origem: "loja" | "teste"; desde: string };
export type Extra = { nome: string; kcal: number; prot: number };
export type DiaDieta = { feitas: string[]; extras: Extra[] };

/** Nível de zoeira valendo: "Sem dó" é do premium. */
export function nivelEfetivo(perfil: { zoeira: Nivel } | null, premium: Premium | null): Nivel {
  const n = perfil?.zoeira ?? "M";
  return n === "S" && !premium?.ativo ? "M" : n;
}

/** Fotos no plano grátis. */
export const FOTOS_GRATIS = 4;

/** Dias que o modo calmo dura depois de três "Morto" seguidos. */
export const DIAS_CALMO = 7;

type Estado = {
  perfil: Perfil | null;
  ficha: Ficha | null;
  historico: TreinoFeito[];
  panico: Panico;
  sessao: Sessao | null;
  diario: EntradaDiario[];
  calmoAte: string | null; // AAAA-MM-DD; até esse dia a zoeira fica pausada
  recentes: Partial<Record<Situacao, string[]>>;
  medidas: Medida[];
  fotos: Foto[];
  ultimoBackup: string | null;
  premium: Premium | null;
  dieta: DadosDieta | null;
  refeicoes: Record<string, DiaDieta>;

  concluirOnboarding: (p: Pick<Perfil, "pessoa" | "fim" | "objetivo" | "sofrencia">) => void;
  atualizarPerfil: (p: Partial<Perfil>) => void;
  novaFicha: (objetivo?: Objetivo) => void;
  /** Premium: ficha nova com exercícios trocados e as cargas que você já usa. */
  renovarFicha: () => void;
  ajustarItem: (letra: Plano["letra"], id: string, mudanca: Partial<ItemFicha>) => void;
  trocarItem: (letra: Plano["letra"], deId: string, paraId: string) => void;
  adicionarItem: (letra: Plano["letra"], id: string) => void;
  removerItem: (letra: Plano["letra"], id: string) => void;
  /** Sobe (-1) ou desce (+1) um exercício no treino. */
  moverItem: (letra: Plano["letra"], id: string, passo: -1 | 1) => void;
  desfazerRemocao: (letra: Plano["letra"], item: ItemFicha, posicao: number, feitas?: SerieFeita[]) => void;

  iniciarTreino: (letra: Plano["letra"]) => void;
  concluirSerie: (serie: SerieFeita) => void;
  pularDescanso: () => void;
  maisDescanso: (seg: number) => void;
  irParaExercicio: (i: number) => void;
  finalizarTreino: () => TreinoFeito | null;
  abandonarTreino: () => void;

  registrarCrise: (flexoes: number, enviou: boolean) => void;
  apagarTudo: () => void;

  /** Registra o humor do dia. Devolve true se entrou no modo calmo agora. */
  registrarHumor: (humor: Humor, texto: string) => boolean;
  sairDoCalmo: () => void;
  /** Recaída: pausa o contador (os dias ficam guardados). */
  pausarContador: () => void;
  /** Acabou de novo: retoma de onde parou, sem perder os dias guardados. */
  retomarContador: () => void;
  /** Começa a contar do zero hoje. */
  zerarContador: () => void;
  /** Sorteia uma frase sem repetir as recentes, já com os pronomes trocados. */
  sortear: (sit: Situacao, vars?: Variaveis) => string;
  salvarMedida: (m: Medida) => void;
  adicionarFoto: (f: Foto) => void;
  removerFoto: (uri: string) => void;
  marcarBackup: () => void;
  definirPremium: (p: Premium | null) => void;
  salvarDadosDieta: (d: DadosDieta) => void;
  alternarRefeicao: (dia: string, id: string) => void;
  registrarExtra: (dia: string, e: Extra) => void;
  removerExtra: (dia: string, i: number) => void;
  restaurar: (dados: Dados) => void;
};

/** A parte do estado que é salva (no aparelho e no backup). */
export type Dados = Pick<
  Estado,
  | "perfil"
  | "ficha"
  | "historico"
  | "panico"
  | "sessao"
  | "diario"
  | "calmoAte"
  | "recentes"
  | "medidas"
  | "fotos"
  | "ultimoBackup"
  | "premium"
  | "dieta"
  | "refeicoes"
>;

const CAMPOS: (keyof Dados)[] = [
  "perfil",
  "ficha",
  "historico",
  "panico",
  "sessao",
  "diario",
  "calmoAte",
  "recentes",
  "medidas",
  "fotos",
  "ultimoBackup",
  "premium",
  "dieta",
  "refeicoes",
];

/** O modo calmo está ativo hoje? */
export function emCalmo(calmoAte: string | null, hoje = diaLocal(new Date())): boolean {
  return !!calmoAte && hoje <= calmoAte;
}

const PANICO_ZERO: Panico = { crises: 0, enviadas: 0, flexoes: 0 };

/** Mantém o treino em andamento coerente quando a ficha daquele treino muda. */
function ajustarSessao(
  sessao: Sessao | null,
  letra: Plano["letra"],
  feitas: (f: SerieFeita[][]) => SerieFeita[][],
  atual: (a: number) => number = (a) => a
): Sessao | null {
  if (!sessao || sessao.letra !== letra) return sessao;
  return { ...sessao, feitas: feitas(sessao.feitas), atual: Math.max(0, atual(sessao.atual)) };
}

function mapaPlano(ficha: Ficha, letra: Plano["letra"], f: (p: Plano) => Plano): Ficha {
  return { ...ficha, planos: ficha.planos.map((p) => (p.letra === letra ? f(p) : p)) };
}

export const useApp = create<Estado>()(
  persist(
    (set, get) => ({
      perfil: null,
      ficha: null,
      historico: [],
      panico: PANICO_ZERO,
      sessao: null,
      diario: [],
      calmoAte: null,
      recentes: {},
      medidas: [],
      fotos: [],
      ultimoBackup: null,
      premium: null,
      dieta: null,
      refeicoes: {},

      concluirOnboarding: (p) =>
        set({
          perfil: { ...p, inicio: diaLocal(new Date()), zoeira: "M", avisos: { ativos: false, hora: 7 } },
          ficha: montarFicha(p.objetivo),
        }),
      atualizarPerfil: (p) => {
        const atual = get().perfil;
        if (atual) set({ perfil: { ...atual, ...p } });
      },
      novaFicha: (objetivo) => {
        const obj = objetivo ?? get().perfil?.objetivo ?? "massa";
        set({ ficha: montarFicha(obj) });
        get().atualizarPerfil({ objetivo: obj });
      },
      renovarFicha: () => {
        const ficha = get().ficha;
        if (ficha) set({ ficha: renovar(ficha, get().historico) });
      },
      ajustarItem: (letra, id, mudanca) => {
        const ficha = get().ficha;
        if (!ficha) return;
        set({
          ficha: mapaPlano(ficha, letra, (p) => ({
            ...p,
            itens: p.itens.map((it) => (it.id === id ? { ...it, ...mudanca } : it)),
          })),
        });
      },
      trocarItem: (letra, deId, paraId) => {
        const ficha = get().ficha;
        const plano = ficha?.planos.find((p) => p.letra === letra);
        if (!ficha || !plano) return;
        const i = plano.itens.findIndex((it) => it.id === deId);
        if (i < 0 || plano.itens.some((it) => it.id === paraId)) return;
        set({
          ficha: mapaPlano(ficha, letra, (p) => ({
            ...p,
            itens: p.itens.map((it) => (it.id === deId ? { ...novoItem(paraId, ficha.objetivo), series: it.series } : it)),
          })),
          // No treino em andamento, as séries do exercício trocado recomeçam.
          sessao: ajustarSessao(get().sessao, letra, (f) => f.map((x, k) => (k === i ? [] : x))),
        });
      },
      adicionarItem: (letra, id) => {
        const ficha = get().ficha;
        const plano = ficha?.planos.find((p) => p.letra === letra);
        if (!ficha || !plano || plano.itens.some((it) => it.id === id)) return;
        set({
          ficha: mapaPlano(ficha, letra, (p) => ({ ...p, itens: [...p.itens, novoItem(id, ficha.objetivo)] })),
          sessao: ajustarSessao(get().sessao, letra, (f) => [...f, []]),
        });
      },
      removerItem: (letra, id) => {
        const ficha = get().ficha;
        const plano = ficha?.planos.find((p) => p.letra === letra);
        if (!ficha || !plano) return;
        const i = plano.itens.findIndex((it) => it.id === id);
        if (i < 0 || plano.itens.length <= 1) return; // um treino precisa de pelo menos um exercício
        set({
          ficha: mapaPlano(ficha, letra, (p) => ({ ...p, itens: p.itens.filter((it) => it.id !== id) })),
          sessao: ajustarSessao(get().sessao, letra, (f) => f.filter((_, k) => k !== i), (a) => (a > i ? a - 1 : Math.min(a, plano.itens.length - 2))),
        });
      },
      moverItem: (letra, id, passo) => {
        const ficha = get().ficha;
        const plano = ficha?.planos.find((p) => p.letra === letra);
        if (!ficha || !plano) return;
        const i = plano.itens.findIndex((it) => it.id === id);
        const j = i + passo;
        if (i < 0 || j < 0 || j >= plano.itens.length) return;
        const troca = <T,>(l: T[]) => {
          const c = [...l];
          [c[i], c[j]] = [c[j], c[i]];
          return c;
        };
        set({
          ficha: mapaPlano(ficha, letra, (p) => ({ ...p, itens: troca(p.itens) })),
          sessao: ajustarSessao(get().sessao, letra, troca, (a) => (a === i ? j : a === j ? i : a)),
        });
      },
      desfazerRemocao: (letra, item, posicao, feitasDele = []) => {
        const ficha = get().ficha;
        const plano = ficha?.planos.find((p) => p.letra === letra);
        if (!ficha || !plano || plano.itens.some((it) => it.id === item.id)) return;
        const pos = Math.min(posicao, plano.itens.length);
        set({
          ficha: mapaPlano(ficha, letra, (p) => ({ ...p, itens: [...p.itens.slice(0, pos), item, ...p.itens.slice(pos)] })),
          sessao: ajustarSessao(get().sessao, letra, (f) => [...f.slice(0, pos), feitasDele, ...f.slice(pos)], (a) => (a >= pos ? a + 1 : a)),
        });
      },

      iniciarTreino: (letra) => {
        const atual = get().sessao;
        if (atual && atual.letra === letra) return; // retoma o treino em andamento
        const plano = get().ficha?.planos.find((p) => p.letra === letra);
        if (!plano) return;
        set({
          sessao: { letra, inicio: new Date().toISOString(), atual: 0, feitas: plano.itens.map(() => []), descansoAte: null },
        });
      },
      concluirSerie: (serie) => {
        const { sessao, ficha } = get();
        const plano = ficha?.planos.find((p) => p.letra === sessao?.letra);
        if (!sessao || !plano) return;
        const item = plano.itens[sessao.atual];
        const feitas = sessao.feitas.map((f, i) => (i === sessao.atual ? [...f, serie] : f));
        const completou = feitas[sessao.atual].length >= item.series;
        // Próximo exercício: o primeiro, a partir do atual, que ainda tem série por fazer.
        let atual = sessao.atual;
        if (completou) {
          const ordem = plano.itens.map((_, i) => (sessao.atual + i) % plano.itens.length);
          const prox = ordem.find((i) => feitas[i].length < plano.itens[i].series);
          atual = prox ?? sessao.atual;
        }
        const acabou = feitas.every((f, i) => f.length >= plano.itens[i].series);
        // A última carga usada vira a carga da ficha: o próximo treino começa de onde este parou.
        if (serie.kg !== item.kg) get().ajustarItem(plano.letra, item.id, { kg: serie.kg });
        set({
          sessao: {
            ...sessao,
            feitas,
            atual,
            descansoAte: acabou ? null : new Date(Date.now() + item.descanso * 1000).toISOString(),
          },
        });
      },
      pularDescanso: () => {
        const s = get().sessao;
        if (s) set({ sessao: { ...s, descansoAte: null } });
      },
      maisDescanso: (seg) => {
        const s = get().sessao;
        if (!s) return;
        const base = s.descansoAte ? Math.max(Date.now(), new Date(s.descansoAte).getTime()) : Date.now();
        set({ sessao: { ...s, descansoAte: new Date(base + seg * 1000).toISOString() } });
      },
      irParaExercicio: (i) => {
        const s = get().sessao;
        if (s) set({ sessao: { ...s, atual: i } });
      },
      finalizarTreino: () => {
        const { sessao, ficha, historico } = get();
        const plano = ficha?.planos.find((p) => p.letra === sessao?.letra);
        if (!sessao || !plano) return null;
        const series = plano.itens
          .map((it, i) => ({ id: it.id, feitas: sessao.feitas[i] ?? [] }))
          .filter((s) => s.feitas.length > 0);
        if (series.length === 0) {
          set({ sessao: null });
          return null;
        }
        const treino: TreinoFeito = {
          data: new Date().toISOString(),
          letra: plano.letra,
          nome: plano.nome,
          minutos: Math.max(1, Math.round((Date.now() - new Date(sessao.inicio).getTime()) / 60000)),
          series,
        };
        set({ historico: [...historico, treino], sessao: null });
        return treino;
      },
      abandonarTreino: () => set({ sessao: null }),

      registrarCrise: (flexoes, enviou) => {
        const p = get().panico;
        set({ panico: { crises: p.crises + 1, enviadas: p.enviadas + (enviou ? 1 : 0), flexoes: p.flexoes + flexoes } });
      },
      apagarTudo: () =>
        set({
          perfil: null,
          ficha: null,
          historico: [],
          panico: PANICO_ZERO,
          sessao: null,
          diario: [],
          calmoAte: null,
          recentes: {},
          medidas: [],
          fotos: [],
          ultimoBackup: null,
          dieta: null,
          refeicoes: {},
        }),

      registrarHumor: (humor, texto) => {
        const hoje = diaLocal(new Date());
        const diario = [...get().diario.filter((e) => e.dia !== hoje), { dia: hoje, humor, texto: texto.trim() }].sort((a, b) =>
          a.dia.localeCompare(b.dia)
        );
        // Três dias seguidos marcando "Morto" pausam a zoeira.
        const tres = [0, 1, 2].map((i) => diario.find((e) => e.dia === somarDias(hoje, -i)));
        const entrou = tres.every((e) => e?.humor === "Morto") && !emCalmo(get().calmoAte, hoje);
        set({ diario, ...(entrou ? { calmoAte: somarDias(hoje, DIAS_CALMO) } : {}) });
        return entrou;
      },
      sairDoCalmo: () => set({ calmoAte: null }),
      pausarContador: () => {
        const p = get().perfil;
        if (p && !p.pausadoEm) set({ perfil: { ...p, pausadoEm: diaLocal(new Date()) } });
      },
      retomarContador: () => {
        const p = get().perfil;
        if (!p?.pausadoEm) return;
        const parado = diasEntre(p.pausadoEm, diaLocal(new Date()));
        set({ perfil: { ...p, fim: somarDias(p.fim, parado), pausadoEm: undefined } });
      },
      zerarContador: () => {
        const p = get().perfil;
        if (p) set({ perfil: { ...p, fim: diaLocal(new Date()), pausadoEm: undefined } });
      },
      sortear: (sit, vars = {}) => {
        const { perfil, recentes, calmoAte, premium } = get();
        const pessoa = perfil?.pessoa ?? "Essa pessoa";
        if (emCalmo(calmoAte)) return calmo(diaLocal(new Date()));
        const r = sortearCom(sit, nivelEfetivo(perfil, premium), recentes[sit] ?? [], { nome: perfil?.apelido, ...vars });
        // Grava a memória fora do render atual.
        queueMicrotask(() => set({ recentes: { ...get().recentes, [sit]: r.recentes } }));
        return frase(r.texto, pessoa, { nome: perfil?.apelido, ...vars });
      },
      salvarMedida: (m) => {
        const outras = get().medidas.filter((x) => x.dia !== m.dia);
        set({ medidas: [...outras, m].sort((a, b) => a.dia.localeCompare(b.dia)) });
      },
      adicionarFoto: (f) => set({ fotos: [...get().fotos, f].sort((a, b) => a.dia.localeCompare(b.dia)) }),
      removerFoto: (uri) => set({ fotos: get().fotos.filter((f) => f.uri !== uri) }),
      marcarBackup: () => set({ ultimoBackup: new Date().toISOString() }),
      definirPremium: (premium) => set({ premium }),
      salvarDadosDieta: (dieta) => set({ dieta }),
      alternarRefeicao: (dia, id) => {
        const atual = get().refeicoes[dia] ?? { feitas: [], extras: [] };
        const feitas = atual.feitas.includes(id) ? atual.feitas.filter((x) => x !== id) : [...atual.feitas, id];
        set({ refeicoes: { ...get().refeicoes, [dia]: { ...atual, feitas } } });
      },
      registrarExtra: (dia, e) => {
        const atual = get().refeicoes[dia] ?? { feitas: [], extras: [] };
        set({ refeicoes: { ...get().refeicoes, [dia]: { ...atual, extras: [...atual.extras, e] } } });
      },
      removerExtra: (dia, i) => {
        const atual = get().refeicoes[dia];
        if (!atual) return;
        set({ refeicoes: { ...get().refeicoes, [dia]: { ...atual, extras: atual.extras.filter((_, k) => k !== i) } } });
      },
      restaurar: (dados) => {
        const limpo: Partial<Dados> = {};
        for (const k of CAMPOS) if (k in dados) (limpo as Record<string, unknown>)[k] = dados[k];
        set(limpo);
      },
    }),
    {
      name: "ex-ficha",
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (e) => dadosDe(e),
      migrate: (salvo, versao) => {
        const d = (salvo ?? {}) as Partial<Dados>;
        if (versao < 2 && d.perfil) {
          d.perfil = { zoeira: "M", avisos: { ativos: false, hora: 7 }, ...(d.perfil as object) } as Perfil;
        }
        return d as Estado;
      },
    }
  )
);

/** true quando os dados salvos no aparelho já foram carregados. */
export function useCarregado(): boolean {
  return useSyncExternalStore(
    (avisar) => useApp.persist.onFinishHydration(avisar),
    () => useApp.persist.hasHydrated(),
    () => false
  );
}

/** Dias (AAAA-MM-DD) em que houve treino. */
export function diasTreinados(historico: TreinoFeito[]): Set<string> {
  return new Set(historico.map((t) => diaLocal(t.data)));
}

/** Só os dados (sem as funções): o que vai pro aparelho e pro backup. */
export function dadosDe(e: Dados): Dados {
  const d = {} as Dados;
  for (const k of CAMPOS) (d as Record<string, unknown>)[k] = e[k];
  return d;
}

/** Dias desde o fim, hoje. */
export function diasDesdeOFim(perfil: Perfil, hoje = diaLocal(new Date())): number {
  return Math.max(0, diasEntre(perfil.fim, perfil.pausadoEm && perfil.pausadoEm < hoje ? perfil.pausadoEm : hoje));
}

export type { Perfil };
