import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { cor, margem } from "../../theme";
import { Botao, T } from "../../ui/base";

const SLIDES = [
  {
    foto: require("../../../assets/photos/ob2.webp"),
    alt: "Halteres num suporte, no escuro",
    h1: "Trocou de vida?",
    h2: "Troca a ficha.",
    p: "Treino A, B e C montados pro seu objetivo. A cada quatro semanas, ficha nova.",
    cta: "Próximo",
  },
  {
    foto: require("../../../assets/photos/ob3.webp"),
    alt: "Homem de capuz sentado num banco de academia, cabeça baixa",
    h1: "Vai mandar mensagem?",
    h2: "Faz 20 flexões.",
    p: "O botão de pânico segura a recaída antes do envio. Quase sempre a vontade passa na décima.",
    cta: "Próximo",
  },
  {
    foto: require("../../../assets/photos/ob4.webp"),
    alt: "Homem levantando uma anilha numa academia escura",
    h1: "Daqui a 30 dias,",
    h2: "ela perdeu isso aqui.",
    p: "Carga, medidas e recordes contados a partir do dia do fim. Os números que ninguém leva embora.",
    cta: "Montar minha ficha",
  },
];

export default function Slide() {
  const { passo } = useLocalSearchParams<{ passo: string }>();
  const i = Math.min(Math.max(Number(passo) || 1, 1), SLIDES.length) - 1;
  const sl = SLIDES[i];
  const ultimo = i === SLIDES.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: cor.chao }}>
      <View style={st.foto}>
        <Image source={sl.foto} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={sl.alt} transition={200} />
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1 1">
          <Defs>
            <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.45" stopColor={cor.chao} stopOpacity={0} />
              <Stop offset="0.8" stopColor={cor.chao} stopOpacity={0.85} />
              <Stop offset="1" stopColor={cor.chao} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="1" height="1" fill="url(#g)" />
        </Svg>
      </View>
      <SafeAreaView style={st.texto} edges={["bottom", "left", "right"]}>
        <T peso="semi" tam={30} style={{ lineHeight: 33, letterSpacing: -0.6 }} accessibilityRole="header">
          {sl.h1}
          {"\n"}
          <T peso="semi" tam={30} c={cor.vermelho} style={{ lineHeight: 33 }}>
            {sl.h2}
          </T>
        </T>
        <T tam={16} c={cor.apagado} style={{ marginTop: 12, lineHeight: 23 }}>
          {sl.p}
        </T>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 22, marginBottom: 22 }} accessibilityLabel={`${i + 2} de 4`}>
          {[0, 1, 2, 3].map((k) => (
            <View key={k} style={{ width: k === i + 1 ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: k === i + 1 ? cor.texto : cor.elevado }} />
          ))}
        </View>
        <Botao bloco onPress={() => router.push(ultimo ? "/onboarding/objetivo" : `/onboarding/${i + 2}`)}>
          {sl.cta}
        </Botao>
        {!ultimo && (
          <Botao tipo="texto" onPress={() => router.push("/onboarding/objetivo")}>
            Pular
          </Botao>
        )}
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  foto: { position: "absolute", left: 0, right: 0, top: 0, height: "72%" },
  texto: { flex: 1, justifyContent: "flex-end", paddingHorizontal: margem, paddingBottom: 20, width: "100%", maxWidth: 520, alignSelf: "center" },
});
