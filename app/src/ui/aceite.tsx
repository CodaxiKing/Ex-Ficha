import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { cor } from "../theme";
import { T, toque } from "./base";
import { IcCheck } from "./icones";

/**
 * Consentimento destacado (LGPD art. 11): termos, privacidade e uso dos dados de saúde.
 * Os links abrem os textos completos.
 */
export function Aceite({ marcado, onMudar }: { marcado: boolean; onMudar: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: marcado }}
        accessibilityLabel="Concordo com os termos de uso, a política de privacidade e o uso dos meus dados de saúde"
        hitSlop={10}
        onPress={() => {
          toque();
          onMudar(!marcado);
        }}
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          marginTop: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: marcado ? cor.vermelho : "transparent",
          borderWidth: marcado ? 0 : 1.5,
          borderColor: cor.controle,
        }}
      >
        {marcado && <IcCheck cor="#fff" tamanho={14} />}
      </Pressable>
      <T tam={13} c={cor.apagado} style={{ flex: 1, lineHeight: 19 }}>
        Concordo com os{" "}
        <T tam={13} peso="semi" c={cor.texto} style={{ textDecorationLine: "underline" }} onPress={() => router.push("/termos")} accessibilityRole="link">
          Termos de uso
        </T>{" "}
        e a{" "}
        <T tam={13} peso="semi" c={cor.texto} style={{ textDecorationLine: "underline" }} onPress={() => router.push("/privacidade")} accessibilityRole="link">
          Política de privacidade
        </T>
        , tenho 18 anos ou mais e autorizo o app a usar os dados de saúde que eu registrar (humor, peso, medidas, fotos e dieta) só para funcionar. Eles ficam no meu aparelho.
      </T>
    </View>
  );
}
