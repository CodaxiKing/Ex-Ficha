import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { inteiro } from "../lib/datas";
import { doDia } from "../lib/frases";
import { useApp } from "../store";
import { cor } from "../theme";
import { Barra, Botao, T, Tela, voltar } from "../ui/base";
import { useFrase } from "../ui/frase";

/** Rascunhos que a pessoa estava prestes a mandar. */
const RASCUNHOS = {
  Ela: ["Oi, sumida.", "Tá acordada?", "Vi uma coisa e lembrei de você.", "Só queria saber se você tá bem.", "Podemos conversar?", "Ainda tá com aquela minha blusa?", "Saudade de você, sabia?"],
  Ele: ["Oi, sumido.", "Tá acordado?", "Vi uma coisa e lembrei de você.", "Só queria saber se você tá bem.", "Podemos conversar?", "Ainda tá com aquela minha blusa?", "Saudade de você, sabia?"],
  "Essa pessoa": ["Oi, tudo bem?", "Vi uma coisa e lembrei de você.", "Só queria saber se você tá bem.", "Podemos conversar?", "Ainda tá com aquela minha blusa?"],
};

const META = 20;
const R = 108;
const C = 2 * Math.PI * R;

export default function Panico() {
  const perfil = useApp((e) => e.perfil);
  const panico = useApp((e) => e.panico);
  const registrar = useApp((e) => e.registrarCrise);
  const [feitas, setFeitas] = useState(0);
  const [insistiu, setInsistiu] = useState(false);
  const [aberto] = useState(() => Date.now());
  const frasePanico = useFrase("panico");
  const fraseInsiste = useFrase("panicoInsiste", {}, insistiu ? "sim" : "nao");
  const fraseVenceu = useFrase("panicoVenceu");
  if (!perfil) return null;
  const rascunho = doDia(RASCUNHOS[perfil.pessoa], String(aberto), panico.crises);

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
          <T v="pergunta">Antes de mandar, lê em voz alta.</T>
          <T v="display" tam={40} style={{ marginTop: 18, lineHeight: 44 }}>
            {`“${rascunho}”`}
          </T>
          <T tam={18} style={{ marginTop: 14, lineHeight: 26 }}>
            {fraseInsiste}
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
            {faltam === 0 ? fraseVenceu : frasePanico}
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
