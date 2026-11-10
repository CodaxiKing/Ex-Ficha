import { Anton_400Regular } from "@expo-google-fonts/anton";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from "@expo-google-fonts/inter";
import { UnifrakturCook_700Bold } from "@expo-google-fonts/unifrakturcook";
import { DarkTheme, ThemeProvider } from "expo-router";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useCarregado } from "../store";
import { cor } from "../theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

const tema = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: cor.chao, card: cor.chao, text: cor.texto, border: cor.borda, primary: cor.vermelho },
};

export default function Raiz() {
  const [fontes] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Anton_400Regular, UnifrakturCook_700Bold });
  const carregado = useCarregado();
  const pronto = fontes && carregado;

  useEffect(() => {
    if (pronto) SplashScreen.hideAsync().catch(() => {});
  }, [pronto]);

  if (!pronto) return <View style={{ flex: 1, backgroundColor: cor.chao }} />;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={tema}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cor.chao }, animation: "fade" }}>
          <Stack.Screen name="panico" options={{ presentation: "fullScreenModal", animation: "fade" }} />
          <Stack.Screen name="treino/[letra]" options={{ gestureEnabled: false }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
