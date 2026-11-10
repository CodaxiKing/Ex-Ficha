import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { StyleSheet, Switch, View } from "react-native";

import { ACOES, avisosDisponiveis, pedirPermissao, planejarAvisos } from "../lib/avisos";
import { diaLocal, somarDias } from "../lib/datas";
import { useApp } from "../store";
import { cor } from "../theme";
import { Barra, Opcao, Passo, T, Tela } from "../ui/base";

const SEMANA = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const hhmm = (d: Date) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;

function quandoTexto(d: Date, hoje: string): string {
  const dia = diaLocal(d);
  if (dia === hoje) return `hoje, ${hhmm(d)}`;
  if (dia === somarDias(hoje, 1)) return `amanhã, ${hhmm(d)}`;
  return `${SEMANA[d.getDay()].slice(0, 3)}, ${hhmm(d)}`;
}

/**
 * Lembretes: a prévia de como as frases chegam na tela bloqueada (as próximas de verdade)
 * e os ajustes. No canvas, a tela "Tela bloqueada".
 */
export default function Avisos() {
  const perfil = useApp((e) => e.perfil);
  const calmoAte = useApp((e) => e.calmoAte);
  const zoeira = useApp((e) => e.perfil?.zoeira);
  const atualizar = useApp((e) => e.atualizarPerfil);
  const [semPermissao, setSemPermissao] = useState(false);
  const [agora] = useState(() => new Date());
  const avisos = useMemo(
    () => planejarAvisos(agora).avisos.slice(0, 3),
    // A prévia muda quando muda o que entra nas frases.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agora, perfil?.avisos, perfil?.pessoa, zoeira, calmoAte]
  );
  if (!perfil) return null;

  const hoje = diaLocal(agora);
  const noite = perfil.avisos.noite ?? "fds";
  const ligar = async (ativos: boolean) => {
    if (ativos && avisosDisponiveis) {
      const ok = await pedirPermissao();
      setSemPermissao(!ok);
      if (!ok) return;
    }
    atualizar({ avisos: { ...perfil.avisos, ativos } });
  };

  return (
    <Tela>
      <Barra titulo="Lembretes" />

      {/* Prévia da tela bloqueada */}
      <View style={st.tela} accessibilityLabel="Prévia da tela bloqueada com as próximas notificações">
        <Image source={require("../../assets/photos/ob3.webp")} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={18} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(11,9,9,0.55)" }]} />
        <T tam={64} peso="semi" c="#f4f1ef" style={{ textAlign: "center", lineHeight: 70, marginTop: 18 }}>
          {hhmm(avisos[0]?.data ?? agora)}
        </T>
        <T tam={15} c="#e6e2e0" style={{ textAlign: "center" }}>
          {(() => {
            const d = avisos[0]?.data ?? agora;
            return `${SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
          })()}
        </T>
        <View style={{ gap: 8, marginTop: 22 }}>
          {avisos.length === 0 && (
            <View style={st.notif}>
              <T tam={14} c="#e6e2e0">
                Nenhum lembrete pros próximos dias.
              </T>
            </View>
          )}
          {avisos.map((a, i) => (
            <View key={`${a.data.toISOString()}-${i}`} style={st.notif}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Image source={require("../../assets/images/icon.png")} style={{ width: 20, height: 20, borderRadius: 5 }} />
                <T tam={13} peso="semi" c="#f4f1ef">
                  Ex-Ficha
                </T>
                <T tam={12} c="#b3a9a4" style={{ marginLeft: "auto" }}>
                  {quandoTexto(a.data, hoje)}
                </T>
              </View>
              <T tam={14} c="#f4f1ef" style={{ marginTop: 4, lineHeight: 20 }}>
                {a.corpo}
              </T>
              {i === 0 && (
                <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
                  {ACOES[a.categoria].map((ac) => (
                    <View key={ac.id} style={st.acao}>
                      <T tam={12} peso="semi" c="#f4f1ef">
                        {ac.titulo}
                      </T>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
      <T v="meta" style={{ marginTop: 8 }}>
        {avisosDisponiveis
          ? perfil.avisos.ativos
            ? "As próximas, do jeito que vão chegar. Segura a notificação pra ver os botões."
            : "Assim chegariam. Liga os lembretes pra valer."
          : "Prévia. No navegador não chega notificação; no celular, chega assim."}
      </T>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20 }}>
        <View style={{ flex: 1 }}>
          <T peso="semi">Lembretes ligados</T>
          <T v="meta">Frases sorteadas, sem repetir. No modo calmo, só um bom dia gentil.</T>
        </View>
        <Switch
          value={perfil.avisos.ativos}
          onValueChange={ligar}
          trackColor={{ true: cor.vermelho, false: cor.elevado }}
          thumbColor={cor.texto}
          accessibilityLabel="Lembretes ligados"
        />
      </View>
      {semPermissao && (
        <T v="meta" c={cor.pilulaTexto} style={{ marginTop: 6 }}>
          Sem permissão de notificação. Libera nos ajustes do celular.
        </T>
      )}

      <Passo
        rotulo="Bom dia às"
        valor={`${perfil.avisos.hora}h`}
        onMenos={() => atualizar({ avisos: { ...perfil.avisos, hora: Math.max(5, perfil.avisos.hora - 1) } })}
        onMais={() => atualizar({ avisos: { ...perfil.avisos, hora: Math.min(11, perfil.avisos.hora + 1) } })}
      />
      <T v="meta">Cobrança às 19h, só se você não treinou. Ficha vencendo, três dias antes.</T>

      <T peso="semi" style={{ marginTop: 20 }}>
        Hora perigosa (22:47)
      </T>
      <T v="meta">Um aviso antes de você abrir a conversa. Com o botão de pânico na notificação.</T>
      <View style={{ gap: 8, marginTop: 10 }} accessibilityRole="radiogroup">
        <Opcao rotulo="Sexta e sábado" marcada={noite === "fds"} onPress={() => atualizar({ avisos: { ...perfil.avisos, noite: "fds" } })} />
        <Opcao rotulo="Todas as noites" marcada={noite === "todas"} onPress={() => atualizar({ avisos: { ...perfil.avisos, noite: "todas" } })} />
        <Opcao rotulo="Nunca" marcada={noite === "nunca"} onPress={() => atualizar({ avisos: { ...perfil.avisos, noite: "nunca" } })} />
      </View>
      <T v="meta" style={{ marginTop: 12 }}>
        As frases respeitam o nível da zoeira do Perfil. No primeiro dia, nada de Sem dó.
      </T>
    </Tela>
  );
}

const st = StyleSheet.create({
  tela: { marginTop: 8, borderRadius: 28, overflow: "hidden", padding: 14, paddingBottom: 18, minHeight: 420, backgroundColor: "#0b0909" },
  notif: { padding: 12, paddingHorizontal: 14, borderRadius: 20, backgroundColor: "rgba(36,29,30,0.92)" },
  acao: { paddingHorizontal: 10, height: 30, borderRadius: 15, justifyContent: "center", backgroundColor: "rgba(74,63,64,0.9)" },
});
