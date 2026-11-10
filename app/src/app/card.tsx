import { Image } from "expo-image";
import * as Sharing from "expo-sharing";
import { useLocalSearchParams } from "expo-router";
import { type ComponentRef, useRef, useState } from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import { captureRef } from "react-native-view-shot";

import { curta, diaLocal, inteiro, somarDias } from "../lib/datas";
import { volume } from "../lib/ficha";
import { diasDesdeOFim, diasTreinados, useApp } from "../store";
import { cor } from "../theme";
import { Barra, Botao, T, Tela } from "../ui/base";
import { useFrase } from "../ui/frase";

/** O card tem 540×960 (9:16) e sai em 1080×1920. */
const W = 540;
const H = 960;

export default function Card() {
  const { data } = useLocalSearchParams<{ data?: string }>();
  const perfil = useApp((e) => e.perfil);
  const historico = useApp((e) => e.historico);
  const panico = useApp((e) => e.panico);
  const frase = useFrase("fim", {}, data ?? "card");
  const { width } = useWindowDimensions();
  const ref = useRef<ComponentRef<typeof View>>(null);
  const [estado, setEstado] = useState<"" | "gerando" | "pronto" | "erro">("");
  if (!perfil) return null;

  const hoje = data ? diaLocal(data) : diaLocal(new Date());
  const desde = diasDesdeOFim(perfil, hoje);
  const doFim = historico.filter((t) => diaLocal(t.data) >= perfil.fim && diaLocal(t.data) <= hoje);
  const treinados = diasTreinados(doFim);
  const toneladas = doFim.reduce((s, t) => s + volume(t), 0) / 1000;
  const n = Math.min(28, desde + 1);
  const faixa = Array.from({ length: n }, (_, i) => somarDias(hoje, i - n + 1));

  // A prévia cabe na tela; a imagem final é gerada em tamanho cheio.
  const escala = Math.min(1, (Math.min(width, 520) - 40) / W);

  const compartilhar = async () => {
    if (!ref.current) return;
    setEstado("gerando");
    try {
      if (Platform.OS === "web") {
        const uri = await captureRef(ref as Parameters<typeof captureRef>[0], { format: "png", result: "data-uri", width: W * 2, height: H * 2 });
        const a = document.createElement("a");
        a.href = uri;
        a.download = `ex-ficha-dia-${desde}.png`;
        a.click();
      } else {
        const uri = await captureRef(ref as Parameters<typeof captureRef>[0], { format: "png", quality: 1, width: W * 2, height: H * 2 });
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Compartilhar no Stories" });
      }
      setEstado("pronto");
    } catch {
      setEstado("erro");
    }
  };

  return (
    <Tela
      rodape={
        <>
          <Botao bloco desativado={estado === "gerando"} onPress={compartilhar}>
            {estado === "gerando" ? "Gerando…" : Platform.OS === "web" ? "Baixar imagem" : "Compartilhar"}
          </Botao>
          <T v="meta" style={{ textAlign: "center", marginTop: 4 }}>
            {estado === "erro" ? "Não deu pra gerar a imagem. Tenta de novo." : "Sem o nome de ninguém. Só os seus números."}
          </T>
        </>
      }
    >
      <Barra titulo="Card pro Stories" />
      <View style={{ alignItems: "center", marginTop: 10, height: H * escala }}>
        <View style={{ transform: [{ scale: escala }], transformOrigin: "top center" } as object}>
          <View ref={ref} collapsable={false} style={{ width: W, height: H, padding: 44, paddingTop: 48, backgroundColor: cor.chao, overflow: "hidden" }}>
            <Image
              source={require("../../assets/images/logo-mark-hd.png")}
              style={{ position: "absolute", top: -60, right: -220, width: 560, height: 560, opacity: 0.35 }}
              contentFit="contain"
            />
            <T v="gotica" tam={40}>
              Ex-Ficha
            </T>
            <T v="display" tam={300} style={{ lineHeight: 260, marginTop: 56 }}>
              {desde}
            </T>
            <T tam={26} c={cor.apagado} style={{ marginTop: 12 }}>
              {desde === 1 ? "dia desde o fim" : "dias desde o fim"}
            </T>
            <View style={{ flexDirection: "row", gap: 5, marginTop: 30 }}>
              {faixa.map((d) => (
                <View key={d} style={{ flex: 1, height: 34, borderRadius: 4, backgroundColor: treinados.has(d) ? cor.vermelho : cor.vazio }} />
              ))}
            </View>
            <View style={{ marginTop: 36 }}>
              {[
                ["Dias treinados", String(treinados.size)],
                ["Toneladas levantadas", toneladas >= 1 ? inteiro(toneladas) : toneladas.toFixed(1).replace(".", ",")],
                ["Mensagens não enviadas", String(panico.crises - panico.enviadas)],
              ].map(([r, v]) => (
                <View key={r} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#2a2324" }}>
                  <T tam={22}>{r}</T>
                  <T tam={22} peso="semi">
                    {v}
                  </T>
                </View>
              ))}
            </View>
            <T peso="semi" tam={34} style={{ marginTop: "auto", lineHeight: 40, letterSpacing: -0.4 }}>
              {frase}
            </T>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 18 }}>
              <T tam={18} c={cor.apagado}>
                {curta(hoje)}
              </T>
              <T tam={18} c={cor.apagado}>
                ex-ficha.app
              </T>
            </View>
          </View>
        </View>
      </View>
    </Tela>
  );
}
