import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { Platform } from "react-native";

import type { Situacao } from "./banco";
import { CALMO } from "./banco";
import { diaLocal, diasEntre, somarDias } from "./datas";
import { DIAS_DA_FICHA, proximoPlano } from "./ficha";
import { doDia, frase, marco, sortearCom } from "./frases";
import { emCalmo, useApp } from "../store";

/** Quantos dias à frente ficam agendados. O app reagenda a cada abertura e a cada treino. */
const DIAS = 7;
const HORA_COBRANCA = 19;

export const avisosDisponiveis = Platform.OS !== "web";

if (avisosDisponiveis) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
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
 * Cancela e reagenda os próximos dias de lembretes, sorteando frases sem repetir.
 * Manhã: acordar, marco do dia ou fim de semana. Noite: cobrança se não treinou.
 * Sexta e sábado: aviso de madrugada. Ficha vencendo: três dias antes.
 * No modo calmo: só um lembrete gentil de manhã.
 */
export async function reagendarAvisos(): Promise<number> {
  if (!avisosDisponiveis) return 0;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const { perfil, ficha, historico, calmoAte, recentes } = useApp.getState();
  if (!perfil?.avisos.ativos || !ficha) return 0;
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return 0;

  const agora = new Date();
  const hoje = diaLocal(agora);
  const treinouHoje = historico.some((t) => diaLocal(t.data) === hoje);
  const proximo = proximoPlano(ficha, historico).letra;
  const memoria: Partial<Record<Situacao, string[]>> = { ...recentes };
  const pedidos: { data: Date; corpo: string }[] = [];

  const sortear = (sit: Situacao, vars = {}) => {
    const r = sortearCom(sit, perfil.zoeira, memoria[sit] ?? [], { treino: proximo, nome: perfil.apelido, ...vars });
    memoria[sit] = r.recentes;
    return frase(r.texto, perfil.pessoa, { treino: proximo, nome: perfil.apelido, ...vars });
  };

  for (let i = 0; i < DIAS; i++) {
    const dia = somarDias(hoje, i);
    const calmo = emCalmo(calmoAte, dia);
    const semana = quando(dia, 12).getDay(); // 0 domingo, 5 sexta, 6 sábado

    // Manhã
    const manha = quando(dia, perfil.avisos.hora);
    if (manha > agora) {
      const dias = diasEntre(perfil.fim, dia);
      const corpo = calmo ? doDia(CALMO, dia) : (marco(dias, perfil.zoeira) && frase(marco(dias, perfil.zoeira)!, perfil.pessoa)) || sortear(semana === 0 || semana === 6 ? "fimDeSemana" : "acordar");
      pedidos.push({ data: manha, corpo });
    }
    if (calmo) continue;

    // Cobrança da noite (hoje só se ainda não treinou).
    const noite = quando(dia, HORA_COBRANCA);
    if (noite > agora && !(i === 0 && treinouHoje)) pedidos.push({ data: noite, corpo: sortear("faltou") });

    // Madrugada de sexta e sábado.
    if (semana === 5 || semana === 6) {
      const tarde = quando(dia, 23, 30);
      if (tarde > agora) pedidos.push({ data: tarde, corpo: sortear("noite") });
    }
  }

  // Ficha vencendo: três dias antes, ao meio-dia.
  const vence = somarDias(diaLocal(ficha.criadaEm), DIAS_DA_FICHA);
  const aviso = quando(somarDias(vence, -3), 12);
  if (aviso > agora && !emCalmo(calmoAte, diaLocal(aviso))) pedidos.push({ data: aviso, corpo: sortear("fichaVencendo", { dias: 3 }) });

  for (const p of pedidos) {
    await Notifications.scheduleNotificationAsync({
      content: { title: "Ex-Ficha", body: p.corpo },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.data, channelId: "lembretes" },
    });
  }
  useApp.setState({ recentes: memoria });
  return pedidos.length;
}
