import { router } from "expo-router";
import { Linking, Pressable, View } from "react-native";

import { curta } from "../lib/datas";
import { DIAS_CALMO, useApp } from "../store";
import { cor } from "../theme";
import { Botao, T, Tela, toque } from "../ui/base";
import { IcSeta } from "../ui/icones";

/**
 * Modo sério. Abre quando o diário marca "Morto" três dias seguidos.
 * Sem zoeira, sem vermelho, sem gótica. Ajuda primeiro, escolha sempre da pessoa.
 */
const AJUDA: { titulo: string; sub: string; url: string }[] = [
  { titulo: "Ligar pro CVV · 188", sub: "24 horas, de graça, sem julgamento", url: "tel:188" },
  { titulo: "Conversar por chat", sub: "cvv.org.br, se falar for difícil agora", url: "https://cvv.org.br/chat/" },
  { titulo: "Mandar mensagem pra alguém de confiança", sub: "um amigo, alguém da família", url: "sms:" },
];


export default function Serio() {
  const calmoAte = useApp((e) => e.calmoAte);

  return (
    <Tela
      rodape={
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            toque();
            router.replace("/hoje");
          }}
          style={({ pressed }) => ({ height: 52, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: cor.texto, opacity: pressed ? 0.85 : 1 })}
        >
          <T peso="semi" tam={16} c={cor.chao}>
            Agora não, mas obrigado
          </T>
        </Pressable>
      }
    >
      <View style={{ height: 44, alignItems: "center", justifyContent: "center" }}>
        <T v="meta">a zoeira está pausada</T>
      </View>
      <T peso="semi" tam={30} style={{ lineHeight: 36, marginTop: 12 }} accessibilityRole="header">
        Ei. Os últimos três dias foram pesados.
      </T>
      <T tam={16} c={cor.apagado} style={{ marginTop: 12, lineHeight: 23 }}>
        Você marcou &quot;Morto&quot; no diário três vezes seguidas. A gente leva isso a sério. Você não precisa passar por isso sem ninguém.
      </T>

      <View style={{ marginTop: 20, gap: 8 }}>
        {AJUDA.map((a, i) => (
          <Pressable
            key={a.titulo}
            accessibilityRole="button"
            onPress={() => {
              toque();
              Linking.openURL(a.url).catch(() => {});
            }}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 16,
              borderRadius: 16,
              backgroundColor: pressed ? cor.elevado : i === 0 ? cor.elevado : cor.superficie,
              borderWidth: i === 0 ? 1 : 0,
              borderColor: cor.bordaCampo,
            })}
          >
            <View style={{ flex: 1 }}>
              <T peso="semi">{a.titulo}</T>
              <T v="meta">{a.sub}</T>
            </View>
            <IcSeta />
          </Pressable>
        ))}
      </View>

      <T v="meta" style={{ marginTop: 14 }}>
        Se você estiver em perigo agora, ligue 192 (SAMU).
      </T>
      <T v="sub" style={{ marginTop: 18 }}>
        {calmoAte
          ? `Até ${curta(calmoAte)} o app fica sem frases ácidas e sem cobrança de treino. Dá pra voltar antes no Perfil.`
          : `Por ${DIAS_CALMO} dias o app fica sem frases ácidas e sem cobrança de treino.`}
      </T>
      <Botao tipo="texto" style={{ alignSelf: "flex-start", paddingHorizontal: 0, marginTop: 4 }} onPress={() => router.push("/diario")}>
        Escrever no diário
      </Botao>
    </Tela>
  );
}
