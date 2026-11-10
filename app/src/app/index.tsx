import { Image } from "expo-image";
import { router } from "expo-router";
import { View } from "react-native";

import { useApp } from "../store";
import { cor } from "../theme";
import { Botao, T, Tela } from "../ui/base";
import { useEffect } from "react";

/** Splash: quem já tem perfil vai direto pro Hoje. */
export default function Splash() {
  const perfil = useApp((e) => e.perfil);

  useEffect(() => {
    if (perfil) router.replace("/hoje");
  }, [perfil]);

  if (perfil) return <View style={{ flex: 1, backgroundColor: cor.chao }} />;

  return (
    <Tela
      rolar={false}
      rodape={
        <>
          <Botao bloco onPress={() => router.push("/onboarding/1")}>
            Bora atualizar isso aí
          </Botao>
        </>
      }
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginHorizontal: -60 }}>
        <Image
          source={require("../../assets/images/logo-mark-hd.png")}
          style={{ width: 420, height: 420, maxWidth: "130%", aspectRatio: 1 }}
          contentFit="contain"
          accessibilityLabel="Logo do Ex-Ficha"
        />
      </View>
      <View>
        <T v="gotica" tam={62} accessibilityRole="header">
          Ela te trocou.
        </T>
        <T tam={20} style={{ marginTop: 14 }}>
          E você? <T tam={20} c={cor.apagado}>Nem a ficha de treino troca.</T>
        </T>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 22 }} accessibilityLabel="1 de 4">
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ width: i === 0 ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === 0 ? cor.texto : cor.elevado }} />
          ))}
        </View>
      </View>
    </Tela>
  );
}
