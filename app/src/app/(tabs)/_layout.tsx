import { Tabs } from "expo-router/js-tabs";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cor } from "../../theme";
import { T, toque } from "../../ui/base";
import { IcCasa, IcGrafico, IcHalter, IcPessoa } from "../../ui/icones";

const ABAS = {
  hoje: { rotulo: "Hoje", Icone: IcCasa },
  treinos: { rotulo: "Treinos", Icone: IcHalter },
  evolucao: { rotulo: "Evolução", Icone: IcGrafico },
  perfil: { rotulo: "Perfil", Icone: IcPessoa },
} as const;

export default function LayoutAbas() {
  const baixo = useSafeAreaInsets().bottom;
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: cor.chao } }}
      tabBar={({ state, navigateToTab }) => (
        <View
          accessibilityRole="tablist"
          style={{
            flexDirection: "row",
            paddingTop: 8,
            paddingBottom: Math.max(baixo, 10),
            paddingHorizontal: 12,
            borderTopWidth: 1,
            borderTopColor: cor.borda,
            backgroundColor: cor.chao,
          }}
        >
          {state.routes.map((r, i) => {
            const aba = ABAS[r.name as keyof typeof ABAS];
            if (!aba) return null;
            const ativa = state.index === i;
            const c = ativa ? cor.texto : cor.apagado;
            return (
              <Pressable
                key={r.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: ativa }}
                onPress={() => {
                  toque();
                  if (!ativa) navigateToTab(r.key);
                }}
                style={{ flex: 1, alignItems: "center", gap: 4, paddingTop: 4 }}
              >
                <aba.Icone cor={c} />
                <T tam={11} c={c}>
                  {aba.rotulo}
                </T>
              </Pressable>
            );
          })}
        </View>
      )}
    >
      <Tabs.Screen name="hoje" />
      <Tabs.Screen name="treinos" />
      <Tabs.Screen name="evolucao" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
