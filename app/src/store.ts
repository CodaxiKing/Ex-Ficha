import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Ficha, ItemFicha, Objetivo, Pessoa, Plano, Sessao, SerieFeita, TreinoFeito } from "./data/tipos";
import { diaLocal } from "./lib/datas";
import { montarFicha, novoItem } from "./lib/ficha";

type Perfil = {
  pessoa: Pessoa;
  fim: string; // AAAA-MM-DD, o dia em que acabou
  objetivo: Objetivo;
  sofrencia: number; // 1 a 10
  inicio: string; // AAAA-MM-DD, o dia em que começou a usar o app
};

type Panico = { crises: number; enviadas: number; flexoes: number };

type Estado = {
  perfil: Perfil | null;
  ficha: Ficha | null;
  historico: TreinoFeito[];
  panico: Panico;
  sessao: Sessao | null;

  concluirOnboarding: (p: Omit<Perfil, "inicio">) => void;
  atualizarPerfil: (p: Partial<Perfil>) => void;
  novaFicha: (objetivo?: Objetivo) => void;
  ajustarItem: (letra: Plano["letra"], id: string, mudanca: Partial<ItemFicha>) => void;
  trocarItem: (letra: Plano["letra"], deId: string, paraId: string) => void;
  adicionarItem: (letra: Plano["letra"], id: string) => void;
  removerItem: (letra: Plano["letra"], id: string) => void;

  iniciarTreino: (letra: Plano["letra"]) => void;
  concluirSerie: (serie: SerieFeita) => void;
  pularDescanso: () => void;
  maisDescanso: (seg: number) => void;
  irParaExercicio: (i: number) => void;
  finalizarTreino: () => TreinoFeito | null;
  abandonarTreino: () => void;

  registrarCrise: (flexoes: number, enviou: boolean) => void;
  apagarTudo: () => void;
};

const PANICO_ZERO: Panico = { crises: 0, enviadas: 0, flexoes: 0 };

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

      concluirOnboarding: (p) => set({ perfil: { ...p, inicio: diaLocal(new Date()) }, ficha: montarFicha(p.objetivo) }),
      atualizarPerfil: (p) => {
        const atual = get().perfil;
        if (atual) set({ perfil: { ...atual, ...p } });
      },
      novaFicha: (objetivo) => {
        const obj = objetivo ?? get().perfil?.objetivo ?? "massa";
        set({ ficha: montarFicha(obj) });
        get().atualizarPerfil({ objetivo: obj });
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
        if (!ficha) return;
        set({
          ficha: mapaPlano(ficha, letra, (p) => ({
            ...p,
            itens: p.itens.map((it) => (it.id === deId ? { ...novoItem(paraId, ficha.objetivo), series: it.series } : it)),
          })),
        });
      },
      adicionarItem: (letra, id) => {
        const ficha = get().ficha;
        if (!ficha) return;
        set({
          ficha: mapaPlano(ficha, letra, (p) =>
            p.itens.some((it) => it.id === id) ? p : { ...p, itens: [...p.itens, novoItem(id, ficha.objetivo)] }
          ),
        });
      },
      removerItem: (letra, id) => {
        const ficha = get().ficha;
        if (!ficha) return;
        set({ ficha: mapaPlano(ficha, letra, (p) => ({ ...p, itens: p.itens.filter((it) => it.id !== id) })) });
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
      apagarTudo: () => set({ perfil: null, ficha: null, historico: [], panico: PANICO_ZERO, sessao: null }),
    }),
    {
      name: "ex-ficha",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ perfil, ficha, historico, panico, sessao }) => ({ perfil, ficha, historico, panico, sessao }),
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
