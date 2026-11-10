import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { router } from "expo-router";
import { Linking, Platform } from "react-native";

import type { Nivel, Situacao } from "./banco";
import { CALMO } from "./banco";
import { diaLocal, diasEntre, somarDias } from "./datas";
import { DIAS_DA_FICHA, proximoPlano } from "./ficha";
import { doDia, frase, marco, sortearCom } from "./frases";
import { emCalmo, nivelEfetivo, useApp } from "../store";

/** Quantos dias à frente ficam agendados. O app reagenda a cada abertura e a cada treino. */
const DIAS = 7;
const HORA_COBRANCA = 19;

export const avisosDisponiveis = Platform.OS !== "web";

/** Como os botões aparecem na notificação (tela bloqueada e central). */
export type Categoria = "manha" | "treino" | "noite" | "calmo";
export type Acao = { id: string; titulo: string };
export const ACOES: Record<Categoria, Acao[]> = {
  manha: [
    { id: "treino", titulo: "Começar treino" },
    { id: "diario", titulo: "Como eu tô" },
  ],
  treino: [
    { id: "treino", titulo: "Começar treino" },
    { id: "panico", titulo: "Vou mandar mensagem" },
  ],
  noite: [
    { id: "panico", titulo: "Vou mandar mensagem" },
    { id: "diario", titulo: "Escrever no diário" },
  ],
  calmo: [
    { id: "cvv", titulo: "Ligar pro CVV · 188" },
    { id: "diario", titulo: "Como eu tô" },
  ],
};

export type Aviso = { data: Date; corpo: string; categoria: Categoria; url: string };

if (avisosDisponiveis) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
  for (const [id, acoes] of Object.entries(ACOES)) {
    Notifications.setNotificationCategoryAsync(
      id,
      acoes.map((a) => ({ identifier: a.id, buttonTitle: a.titulo, options: { opensAppToForeground: true } }))
    ).catch(() => {});
  }
}

export async function pedirPermissao(): Promise<boolean> {
  if (!avisosDisponiveis) return false;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("lembretes", {
      name: "Lembretes",
      importance: AndroidImportance.DEFAULT,
    });
  }
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}

function quando(dia: string, hora: number, minuto = 0): Date {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(a, m - 1, d, hora, minuto);
}

/**
 * Monta os lembretes dos próximos dias, sorteando frases sem repetir. Não agenda nada:
 * serve pro agendamento e pra prévia da tela bloqueada.
 * Manhã: bom dia, marco do dia ou fim de semana. Noite: cobrança se não treinou.
 * Hora perigosa (22:47): sexta e sábado, todas as noites ou nunca, como a pessoa escolher.
 * Ficha vencendo: três dias antes. No modo calmo: só um lembrete gentil de manhã.
 * No primeiro dia, nada de "Sem dó".
 */
export function planejarAvisos(agora = new Date()): { avisos: Aviso[]; memoria: Partial<Record<Situacao, string[]>> } {
  const { perfil, ficha, historico, calmoAte, recentes, premium } = useApp.getState();
  const memoria: Partial<Record<Situacao, string[]>> = { ...recentes };
  if (!perfil || !ficha) return { avisos: [], memoria };

  const hoje = diaLocal(agora);
  const treinouHoje = historico.some((t) => diaLocal(t.data) === hoje);
  const proximo = proximoPlano(ficha, historico).letra;
  const noiteModo = perfil.avisos.noite ?? "fds";
  const avisos: Aviso[] = [];

  const nivelDo = (dia: string): Nivel => {
    const n = nivelEfetivo(perfil, premium);
    return dia === perfil.inicio && n === "S" ? "M" : n;
  };
  const sortear = (sit: Situacao, dia: string, vars = {}) => {
    const r = sortearCom(sit, nivelDo(dia), memoria[sit] ?? [], { treino: proximo, nome: perfil.apelido, ...vars });
    memoria[sit] = r.recentes;
    return frase(r.texto, perfil.pessoa, { treino: proximo, nome: perfil.apelido, ...vars });
  };

  for (let i = 0; i < DIAS; i++) {
    const dia = somarDias(hoje, i);
    const calmo = emCalmo(calmoAte, dia);
    const semana = quando(dia, 12).getDay(); // 0 domingo, 5 sexta, 6 sábado

    const manha = quando(dia, perfil.avisos.hora);
    if (manha > agora) {
      const dias = perfil.pausadoEm ? -1 : diasEntre(perfil.fim, dia);
      const m = marco(dias, nivelDo(dia));
      const corpo = calmo ? doDia(CALMO, dia) : m ? frase(m, perfil.pessoa) : sortear(semana === 0 || semana === 6 ? "fimDeSemana" : "acordar", dia);
      avisos.push({ data: manha, corpo, categoria: calmo ? "calmo" : "manha", url: calmo ? "/hoje" : `/treino/${proximo}` });
    }
    if (calmo) continue;

    const noite = quando(dia, HORA_COBRANCA);
    if (noite > agora && !(i === 0 && treinouHoje)) avisos.push({ data: noite, corpo: sortear("faltou", dia), categoria: "treino", url: `/treino/${proximo}` });

    const perigosa = noiteModo === "todas" || (noiteModo === "fds" && (semana === 5 || semana === 6));
    const hora = quando(dia, 22, 47);
    if (perigosa && hora > agora) avisos.push({ data: hora, corpo: sortear("noite", dia), categoria: "noite", url: "/panico" });
  }

  const vence = somarDias(diaLocal(ficha.criadaEm), DIAS_DA_FICHA);
  const aviso = quando(somarDias(vence, -3), 12);
  if (aviso > agora && !emCalmo(calmoAte, diaLocal(aviso)))
    avisos.push({ data: aviso, corpo: sortear("fichaVencendo", diaLocal(aviso), { dias: 3 }), categoria: "treino", url: "/treinos" });

  avisos.sort((a, b) => a.data.getTime() - b.data.getTime());
  return { avisos, memoria };
}

/** Cancela e reagenda os lembretes. */
export async function reagendarAvisos(): Promise<number> {
  if (!avisosDisponiveis) return 0;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const { perfil } = useApp.getState();
  if (!perfil?.avisos.ativos) return 0;
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return 0;

  const { avisos, memoria } = planejarAvisos();
  for (const a of avisos) {
    await Notifications.scheduleNotificationAsync({
      content: { title: "Ex-Ficha", body: a.corpo, categoryIdentifier: a.categoria, data: { url: a.url } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: a.data, channelId: "lembretes" },
    });
  }
  useApp.setState({ recentes: memoria });
  return avisos.length;
}

/** Abre a tela certa quando a pessoa toca na notificação ou num botão dela. */
export function abrirResposta(r: Notifications.NotificationResponse) {
  const url = (r.notification.request.content.data?.url as string | undefined) ?? "/hoje";
  const acao = r.actionIdentifier;
  if (acao === "cvv") {
    Linking.openURL("tel:188").catch(() => {});
    return;
  }
  const destino =
    acao === "panico" ? "/panico" : acao === "diario" ? "/diario" : acao === "treino" ? (url.startsWith("/treino/") ? url : "/treinos") : url;
  router.push(destino as never);
}

/** Liga o tratamento das respostas, inclusive quando o app foi aberto pela notificação. */
export function ouvirRespostas(): () => void {
  if (!avisosDisponiveis) return () => {};
  const ultima = Notifications.getLastNotificationResponse();
  if (ultima) {
    abrirResposta(ultima);
    Notifications.clearLastNotificationResponse();
  }
  const sub = Notifications.addNotificationResponseReceivedListener((r) => {
    abrirResposta(r);
    Notifications.clearLastNotificationResponse();
  });
  return () => sub.remove();
}
