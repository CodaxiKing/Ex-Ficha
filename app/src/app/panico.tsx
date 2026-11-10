import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { diaLocal, inteiro } from "../lib/datas";
import { PANICO, doDia, frase } from "../lib/frases";
import { useApp } from "../store";
import { cor } from "../theme";
import { Barra, Botao, T, Tela, voltar } from "../ui/base";

const META = 20;
const R = 108;
const C = 2 * Math.PI * R;

export default function Panico() {
  const perfil = useApp((e) => e.perfil);
  const panico = useApp((e) => e.panico);
  const registrar = useApp((e) => e.registrarCrise);
  const [feitas, setFeitas] = useState(0);
  const [insistiu, setInsistiu] = useState(false);
  if (!perfil) return null;

  const faltam = Math.max(0, META - feitas);
  const fechar = (enviou: boolean) => {
    registrar(feitas, enviou);
    voltar();
  };

  const contar = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(feitas + 1 >= META ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setFeitas((f) => f + 1);
  };

  return (
    <Tela
      fundo={cor.panicoTela}
      rodape={
        insistiu ? (
          <>
            <Botao bloco onPress={() => setInsistiu(false)}>
              Tá bom, mais flexões
            </Botao>
            <Botao tipo="texto" onPress={() => fechar(true)}>
              Mandei. Pode me julgar.
            </Botao>
          </>
        ) : (
          <>
            <Botao bloco desativado={feitas === 0} onPress={() => fechar(false)}>
              {faltam === 0 ? "Terminei. Passou." : feitas === 0 ? "Faz pelo menos uma" : `Passou com ${feitas}`}
            </Botao>
            <Botao tipo="texto" onPress={() => setInsistiu(true)}>
              Ainda quero mandar
            </Botao>
          </>
        )
      }
    >
      <Barra
        titulo={<T v="meta">Modo crise</T>}
        onVoltar={() => (feitas > 0 ? fechar(false) : voltar())}
      />
      {insistiu ? (
        <View style={{ marginTop: 18 }}>
          <T v="pergunta">{frase("Antes de mandar, lê em voz alta.", perfil.pessoa)}</T>
          <T tam={18} style={{ marginTop: 18, lineHeight: 26 }}>
            {`“${{ Ela: "Oi, sumida.", Ele: "Oi, sumido.", "Essa pessoa": "Oi, tudo bem?" }[perfil.pessoa]}” `}
            {frase("Às duas da manhã. Depois de {ela} ter ido embora. Você leu e ainda acha uma boa ideia?", perfil.pessoa)}
          </T>
          <T v="sub" style={{ marginTop: 14 }}>
            {panico.crises > 0
              ? `Das ${panico.crises} vezes que você abriu esta tela, mandou ${panico.enviadas}. Mantém o placar.`
              : "Nenhuma mensagem até hoje. Não estraga o placar no primeiro dia."}
          </T>
        </View>
      ) : (
        <>
          <T v="pergunta" style={{ marginTop: 8 }}>
            Vai mandar mensagem? Antes, {META} flexões.
          </T>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Contar flexão. ${feitas} de ${META}`}
            onPress={contar}
            style={({ pressed }) => ({ alignItems: "center", justifyContent: "center", marginTop: 18, transform: [{ scale: pressed ? 0.97 : 1 }] })}
          >
            <Svg width={248} height={248} viewBox="0 0 248 248">
              <Circle cx={124} cy={124} r={R} stroke="#2a1012" strokeWidth={10} fill="none" />
              <Circle
                cx={124}
                cy={124}
                r={R}
                stroke={cor.vermelho}
                strokeWidth={10}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(C * Math.min(1, feitas / META)).toFixed(1)} ${C.toFixed(1)}`}
                transform="rotate(-90 124 124)"
              />
            </Svg>
            <View style={{ position: "absolute", alignItems: "center" }}>
              <T v="display" tam={96} style={{ lineHeight: 96 }}>
                {faltam === 0 ? feitas : faltam}
              </T>
              <T v="sub" tam={13}>
                {faltam === 0 ? "feitas" : "faltam"}
              </T>
            </View>
          </Pressable>
          <T v="meta" style={{ textAlign: "center", marginTop: 8 }}>
            Toca no anel a cada flexão
          </T>
          <T tam={16} c={cor.apagado} style={{ marginTop: 14, lineHeight: 23 }}>
            {faltam === 0 ? "Vinte. A vontade passou? Quase sempre passa na décima." : doDia(PANICO, diaLocal(new Date()), panico.crises)}
          </T>
          <View style={{ flexDirection: "row", marginTop: 18, backgroundColor: "#170b0d", borderRadius: 16 }}>
            {[
              [panico.crises, "crises"],
              [panico.enviadas, "enviadas"],
              [panico.flexoes, "flexões"],
            ].map(([v, r], i) => (
              <View key={r} style={{ flex: 1, padding: 12, paddingHorizontal: 14, borderLeftWidth: i ? 1 : 0, borderLeftColor: "#2a1012" }}>
                <T peso="semi" tam={20}>
                  {inteiro(v as number)}
                </T>
                <T tam={12} c={cor.panicoTexto}>
                  {r as string}
                </T>
              </View>
            ))}
          </View>
        </>
      )}
    </Tela>
  );
}
